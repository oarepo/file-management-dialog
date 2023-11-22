import type { PluginOptions, BasePlugin, UppyFile, Locale } from '@uppy/core'

export type Headers = {
   [name: string]: string | number
}

export interface OARepoUploadOptions extends PluginOptions {
    limit?: number
    headers?: Headers | ((file: UppyFile) => Headers)
    allowedMetaFields?: string[] | null
    fieldName?: string
    timeout?: number
    responseUrlFieldName?: string
    endpoint: string
    deleteBeforeUpload?: boolean
    method?: 'GET' | 'POST' | 'PUT' | 'HEAD' | 'get' | 'post' | 'put' | 'head'
    locale?: Locale
    responseType?: string
    withCredentials?: boolean
    validateStatus?: (statusCode: number, responseText: string, response: unknown) => boolean
    getResponseData?: (responseText: string, response: unknown) => any
    getResponseError?: (responseText: string, xhr: unknown) => Error
}

declare class OARepoUpload extends BasePlugin<OARepoUploadOptions> {}

export default OARepoUpload