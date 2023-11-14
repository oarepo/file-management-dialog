import { UIPlugin } from "@uppy/core";
import OARepoViewProvider from "./OARepoViewProvider";
import locale from "./locale";

import packageJson from "./package.json";

/**
 * OARepoFileSource plugin
 * @class
 * @extends UIPlugin
 * @param {object} opts plugin options
 * @param {string} opts.id id of the plugin
 * @param {string} opts.title title shown in the UI
 * @param {string} opts.target DOM element to mount the plugin on
 * @param {string} opts.fileSources array of files to be processed
 * @param {string} opts.fileTypeFilter array of file types to be processed
 */
export default class OARepoFileSource extends UIPlugin {
  static VERSION = packageJson.version;

  constructor(uppy, opts) {
    super(uppy, opts);
    this.id = this.opts.id || "OARepoFileSource";
    this.title = this.opts.title || "OARepo";
    this.type = "acquirer";
    /* fileSources: 
    https://github.com/transloadit/uppy/blob/cf84af718e717030ae87f3edfc99a208ca30750a/packages/%40uppy/companion/src/server/provider/unsplash/adapter.js
    https://github.com/transloadit/uppy/blob/cf84af718e717030ae87f3edfc99a208ca30750a/packages/%40uppy/companion/src/server/provider/box/adapter.js
    [
      {
        id: '2151fa94-6dc3-4935-8df9-ecafgeb9175c', // file.file_id ?? file.key
        name: 'article.pdf', // file.key
        mimeType: 'application/pdf', // file.mimetype
        data: **to be downloaded**,

        isFolder: false,
        icon: null, // TODO: add icons
        thumbnail: null // TODO: add thumbnail URLs to preview images
        requestPath: "http://localhost:5173/api/records/8t29q-nfr77/files/figure.png/content", // file.links.content
        modifiedDate: "2020-11-27 11:26:04.607831", // file.updated ?? null
        author: null,
        size: 782683, file.size ?? null
        ...
      },
      ...
    ]
    */

    if (!this.opts.fileSources) {
      throw new Error(
        "File sources option is required to process files from OARepo."
      );
    }
    this.fileSources = this.opts.fileSources;

    this.fileTypeFilter = this.opts.fileTypeFilter;

    this.icon = () => {
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 384 512"
          aria-hidden="true"
          height="2em"
        >
          <path d="M64 0C28.7 0 0 28.7 0 64V448c0 35.3 28.7 64 64 64H320c35.3 0 64-28.7 64-64V160H256c-17.7 0-32-14.3-32-32V0H64zM256 0V128H384L256 0zM216 232V334.1l31-31c9.4-9.4 24.6-9.4 33.9 0s9.4 24.6 0 33.9l-72 72c-9.4 9.4-24.6 9.4-33.9 0l-72-72c-9.4-9.4-9.4-24.6 0-33.9s24.6-9.4 33.9 0l31 31V232c0-13.3 10.7-24 24-24s24 10.7 24 24z" />
        </svg>
      );
    };

    this.defaultLocale = locale;
    this.i18nInit();

    this.onFirstRender = this.onFirstRender.bind(this);
    this.render = this.render.bind(this);
  }

  #filterFilesByType(files) {
    this.uppy.log(`[OARepoFileSource] filtering files by type: ${this.fileTypeFilter}`);
    if (!this.fileTypeFilter) {
      return files;
    }
    return files.filter((file) => {
      return this.fileTypeFilter.includes(file.mimeType);
    });
  }

  install() {
    this.view = new OARepoViewProvider(this, {
      viewType: "list",
      showTitles: true,
      loadAllFiles: true,
    });

    const { target } = this.opts;
    if (target) {
      this.mount(target, this);
    }
  }

  // eslint-disable-next-line class-methods-use-this
  onFirstRender() {
    this.fileTypeFilter = this.opts.fileTypeFilter;
    this.fileSources = this.#filterFilesByType(this.opts.fileSources);
    this.uppy.log(
      `[OARepoFileSource] onFirstRender. downloading files:\n${JSON.stringify(
        this.fileSources,
        null,
        2
      )}`
    );
    this.view.downloadFiles(this.fileSources);
  }

  render(state) {
    return this.view.render(state);
  }

  uninstall() {
    this.unmount();
  }
}
