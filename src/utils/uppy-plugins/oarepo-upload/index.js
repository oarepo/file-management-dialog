import { BasePlugin } from '@uppy/core'
import { nanoid } from 'nanoid/non-secure'
import EventManager from '@uppy/utils/lib/EventManager'
import ProgressTimeout from '@uppy/utils/lib/ProgressTimeout'
import { RateLimitedQueue, internalRateLimitedQueue } from '@uppy/utils/lib/RateLimitedQueue'
import NetworkError from '@uppy/utils/lib/NetworkError'
import isNetworkError from '@uppy/utils/lib/isNetworkError'
import { filterNonFailedFiles, filterFilesToEmitUploadStarted } from '@uppy/utils/lib/fileFilters'

import packageJson from './package.json'
import locale from './locale.js'

function buildResponseError (xhr, err) {
  let error = err
  // No error message
  if (!error) error = new Error('Upload error')
  // Got an error message string
  if (typeof error === 'string') error = new Error(error)
  // Got something else
  if (!(error instanceof Error)) {
    error = Object.assign(new Error('Upload error'), { data: error })
  }

  if (isNetworkError(xhr)) {
    error = new NetworkError(error, xhr)
    return error
  }

  error.request = xhr
  return error
}

/**
 * Set `data.type` in the blob to `file.meta.type`,
 * because we might have detected a more accurate file type in Uppy
 * https://stackoverflow.com/a/50875615
 *
 * @param {object} file File object with `data`, `size` and `meta` properties
 * @returns {object} blob updated with the new `type` set from `file.meta.type`
 */
function setTypeInBlob (file) {
  const dataWithUpdatedType = file.data.slice(0, file.data.size, file.meta.type)
  return dataWithUpdatedType
}

export default class OARepoUpload extends BasePlugin {
  // eslint-disable-next-line global-require
  static VERSION = packageJson.version

  constructor (uppy, opts) {
    super(uppy, opts)
    this.type = 'uploader'
    this.id = this.opts.id || 'OARepoUpload'
    this.title = 'OARepoUpload'

    this.defaultLocale = locale

    // Default options
    const defaultOptions = {
      // formData: true,
      // fieldName: opts.bundle ? 'files[]' : 'file',
      method: 'PUT',
      allowedMetaFields: null,
      responseUrlFieldName: 'links.self',
      // bundle: false,
      headers: {},
      timeout: 30 * 1000,
      limit: 5,
      withCredentials: false,
      responseType: '',
      /**
       * @param {string} responseText the response body string
       */
      getResponseData (responseText) {
        let parsedResponse = {}
        try {
          parsedResponse = JSON.parse(responseText)
        } catch (err) {
          uppy.log(err)
        }

        return parsedResponse
      },
      /**
       *
       * @param {string} _ the response body string
       * @param {XMLHttpRequest | respObj} response the response object (XHR or similar)
       */
      getResponseError (_, response) {
        let error = new Error('Upload error')

        if (isNetworkError(response)) {
          error = new NetworkError(error, response)
        }

        return error
      },
      /**
       * Check if the response from the upload endpoint indicates that the upload was successful.
       *
       * @param {number} status the response status code
       */
      validateStatus (status) {
        return status >= 200 && status < 300
      },
    }

    this.opts = { ...defaultOptions, ...opts }
    this.i18nInit()

    // Simultaneous upload limiting is shared across all uploads with this plugin.
    if (internalRateLimitedQueue in this.opts) {
      this.requests = this.opts[internalRateLimitedQueue]
    } else {
      this.requests = new RateLimitedQueue(this.opts.limit)
    }

    if (opts?.allowedMetaFields === undefined && 'metaFields' in this.opts) {
      throw new Error('The `metaFields` option has been renamed to `allowedMetaFields`.')
    }

    this.uploaderEvents = Object.create(null)
    // this.setQueueRequestSocketToken(this.requests.wrapPromiseFunction(this.#requestSocketToken, { priority: -1 }))
  }

  getOptions (file) {
    const overrides = this.uppy.getState().OARepoUpload
    const { headers } = this.opts

    const opts = {
      ...this.opts,
      ...(overrides || {}),
      ...(file.OARepoUpload || {}),
      headers: {},
    }
    // Support for `headers` as a function, only in the OARepoUpload settings.
    // Options set by other plugins in Uppy state or on the files themselves are still merged in afterward.
    //
    // ```js
    // headers: (file) => ({ expires: file.meta.expires })
    // ```
    if (typeof headers === 'function') {
      opts.headers = headers(file)
    } else {
      Object.assign(opts.headers, this.opts.headers)
    }

    if (overrides) {
      Object.assign(opts.headers, overrides.headers)
    }
    if (file.OARepoUpload) {
      Object.assign(opts.headers, file.OARepoUpload.headers)
    }

    return opts
  }

  async #uploadFileMetadata (file, metadata, opts, uploadId) {
    return fetch(`${opts.endpoint}/${file.name}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        metadata: Object.keys(metadata).reduce((acc, key) => {
          if (opts.allowedMetaFields.includes(key)) {
            acc[key] = metadata[key];
          }
          return acc;
        }, {}),
      }),
    })
      .then(async (response) => {
        if (!this.opts.validateStatus(response.status)) {
          const error = buildResponseError(response, opts.getResponseError(await response.text(), response));
          this.uppy.emit('upload-error', file, error);
          throw error;
        }
        return response.json();
      })
      .then((data) => {
        this.uppy.log(`[OARepoUpload] ${uploadId} file metadata uploaded. Server response:\n${JSON.stringify(data, null, 2)}`);
      })
  }

  async #completeFileUpload (file, opts, uploadId) {
    return fetch(`${opts.endpoint}/${file.name}/commit`, {
      method: "POST",
    })
      .then(async (response) => {
        if (!this.opts.validateStatus(response.status)) {
          const error = buildResponseError(response, opts.getResponseError(await response.text(), response));
          this.uppy.emit('upload-error', file, error);
          throw error;
        }
        return [response, await response.json()];
      })
      .then(([response, data]) => {
        const body = data
        const uploadURLFromResp = opts.responseUrlFieldName.split('.').reduce((o,i)=> o[i], body)
        const uploadURL = uploadURLFromResp ? uploadURLFromResp : body[opts.responseUrlFieldName]

        const uploadResp = {
          status: response.status,
          body,
          uploadURL,
        }

        this.uppy.emit('upload-success', file, uploadResp)

        if (uploadURL) {
          this.uppy.log(`Download ${file.name} from ${uploadURL}`)
        }
        this.uppy.log(`[OARepoUpload] ${uploadId} file upload successful. Server response:\n${JSON.stringify(data, null, 2)}`);
      })
  }

  async #upload (file, current, total) {
    const opts = this.getOptions(file)
    const uploadId = nanoid()
    
    const xhrContentPromise = new Promise((resolve, reject) => {
      const data = file.data

      const xhr = new XMLHttpRequest()
      this.uploaderEvents[file.id] = new EventManager(this.uppy)
      let queuedRequest

      const timer = new ProgressTimeout(opts.timeout, () => {
        const error = new Error(this.i18n('uploadStalled', { seconds: Math.ceil(opts.timeout / 1000) }))
        this.uppy.emit('upload-stalled', error, [file])
      })

      xhr.upload.addEventListener('loadstart', () => {
        this.uppy.log(`[OARepoUpload] ${uploadId} content load started`)
      })

      xhr.upload.addEventListener('progress', (ev) => {
        this.uppy.log(`[OARepoUpload] ${uploadId} content load progress: ${ev.loaded} / ${ev.total}`)
        // Begin checking for timeouts when progress starts, instead of loading,
        // to avoid timing out requests on browser concurrency queue
        timer.progress()

        if (ev.lengthComputable) {
          this.uppy.emit('upload-progress', file, {
            uploader: this,
            bytesUploaded: ev.loaded,
            bytesTotal: ev.total,
          })
        }
      })

      xhr.addEventListener('load', () => {
        this.uppy.log(`[OARepoUpload] ${uploadId} content load finished`)
        timer.done()
        queuedRequest.done()
        if (this.uploaderEvents[file.id]) {
          this.uploaderEvents[file.id].remove()
          this.uploaderEvents[file.id] = null
        }

        if (opts.validateStatus(xhr.status, xhr.responseText, xhr)) {
          return resolve(file)
        }
        const body = opts.getResponseData(xhr.responseText, xhr)
        const error = buildResponseError(xhr, opts.getResponseError(xhr.responseText, xhr))

        const response = {
          status: xhr.status,
          body,
        }

        this.uppy.emit('upload-error', file, error, response)
        
        return reject(error)
      })

      xhr.addEventListener('error', () => {
        this.uppy.log(`[OARepoUpload] ${uploadId} content load errored`)
        timer.done()
        queuedRequest.done()
        if (this.uploaderEvents[file.id]) {
          this.uploaderEvents[file.id].remove()
          this.uploaderEvents[file.id] = null
        }

        const error = buildResponseError(xhr, opts.getResponseError(xhr.responseText, xhr))
        this.uppy.emit('upload-error', file, error)
        return reject(error)
      })

      const uppercasedMethod = opts.method?.toUpperCase()
      xhr.open(uppercasedMethod ?? "PUT", `${opts.endpoint}/${file.name}/content`, true)
      // IE10 does not allow setting `withCredentials` and `responseType`
      // before `open()` is called.
      xhr.withCredentials = opts.withCredentials
      if (opts.responseType !== '') {
        xhr.responseType = opts.responseType
      }

      queuedRequest = this.requests.run(() => {
        // When using an authentication system like JWT, the bearer token goes as a header. This
        // header needs to be fresh each time the token is refreshed so computing and setting the
        // headers just before the upload starts enables this kind of authentication to work properly.
        // Otherwise, half-way through the list of uploads the token could be stale and the upload would fail.
        const currentOpts = this.getOptions(file)

        Object.keys(currentOpts.headers).forEach((header) => {
          xhr.setRequestHeader(header, currentOpts.headers[header])
        })

        xhr.send(data)

        return () => {
          timer.done()
          xhr.abort()
        }
      })

      this.onFileRemove(file.id, () => {
        queuedRequest.abort()
        reject(new Error('File removed'))
      })

      this.onCancelAll(file.id, ({ reason }) => {
        if (reason === 'user') {
          queuedRequest.abort()
        }
        reject(new Error('Upload cancelled'))
      })
    })

    this.uppy.log(`uploading ${current} of ${total}`)

    const chainedRequests = async () => {
      try {
        await this.#uploadFileMetadata(file, file.meta, opts, uploadId)
        await xhrContentPromise
        await this.#completeFileUpload(file, opts, uploadId)
        return file
      } catch (error) {
        return error;
      }
    }

    // return file
    return chainedRequests() 
  }

  async #startFilesUpload (files) {
    return fetch(this.opts.endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(
        files.map((file) => ({
          key: file.name,
        }))
      ),
    })
      .then(async (response) => {
        if (!this.opts.validateStatus(response.status)) {
          // throw new Error(
          //   `[${response.status} ${response.statusText}] Error starting files upload.")`
          // );
          this.uppy.emit('error')
          throw buildResponseError(response, this.opts.getResponseError(await response.text(), response))
        }
        return response.json();
      })
      .then((data) => {
        this.uppy.log(data);
      })
  }

  async #uploadFiles (files) {
    await this.#startFilesUpload(files)
    await Promise.allSettled(files.map((file, i) => {
      const current = parseInt(i, 10) + 1
      const total = files.length

    //   if (file.isRemote) {
    //     const controller = new AbortController()

    //     const removedHandler = (removedFile) => {
    //       if (removedFile.id === file.id) controller.abort()
    //     }
    //     this.uppy.on('file-removed', removedHandler)

    //     const uploadPromise = this.uploadRemoteFile(file, { signal: controller.signal })

    //     this.requests.wrapSyncFunction(() => {
    //       this.uppy.off('file-removed', removedHandler)
    //     }, { priority: -1 })()

    //     return uploadPromise
    //   }
      return this.#upload(file, current, total)
    }))
  }

  onFileRemove (fileID, cb) {
    this.uploaderEvents[fileID].on('file-removed', (file) => {
      if (fileID === file.id) cb(file.id)
    })
  }

  onRetry (fileID, cb) {
    this.uploaderEvents[fileID].on('upload-retry', (targetFileID) => {
      if (fileID === targetFileID) {
        cb()
      }
    })
  }

  onRetryAll (fileID, cb) {
    this.uploaderEvents[fileID].on('retry-all', () => {
      if (!this.uppy.getFile(fileID)) return
      cb()
    })
  }

  onCancelAll (fileID, eventHandler) {
    this.uploaderEvents[fileID].on('cancel-all', (...args) => {
      if (!this.uppy.getFile(fileID)) return
      eventHandler(...args)
    })
  }

  #handleUpload = async (fileIDs) => {
    if (fileIDs.length === 0) {
      this.uppy.log('[OARepoUpload] No files to upload!')
      return
    }

    // No limit configured by the user, and no RateLimitedQueue passed in by a "parent" plugin
    // (basically just AwsS3) using the internal symbol
    if (this.opts.limit === 0 && !this.opts[internalRateLimitedQueue]) {
      this.uppy.log(
        '[OARepoUpload] When uploading multiple files at once, consider setting the `limit` option (to `10` for example), to limit the number of concurrent uploads, which helps prevent memory and network issues: https://uppy.io/docs/xhr-upload/#limit-0',
        'warning',
      )
    }

    this.uppy.log('[OARepoUpload] Uploading...')
    const files = this.uppy.getFilesByIds(fileIDs)

    const filesFiltered = filterNonFailedFiles(files)
    const filesToEmit = filterFilesToEmitUploadStarted(filesFiltered)
    this.uppy.emit('upload-start', filesToEmit)

    await this.#uploadFiles(filesFiltered)
  }

  install () {
    this.uppy.addUploader(this.#handleUpload)
  }

  uninstall () {
    this.uppy.removeUploader(this.#handleUpload)
  }
}