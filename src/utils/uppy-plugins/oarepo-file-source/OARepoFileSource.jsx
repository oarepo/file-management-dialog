import { h } from "preact";
import { UIPlugin } from "@uppy/core";
// import { SearchProvider, Provider } from '@uppy/companion-client'
// import { SearchProviderViews } from '@uppy/provider-views'
import OARepoViewProvider from "./OARepoViewProvider";

import packageJson from "./package.json";

/**
 * OARepoFileSource plugin
 *
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
    // Provider.initPlugin(this, opts, {})

    this.icon = () => {
      return (
        <svg
          className="uppy-DashboardTab-iconUnsplash"
          viewBox="0 0 32 32"
          height="32"
          width="32"
          aria-hidden="true"
        >
          <g fill="currentcolor">
            <path d="M46.575 10.883v-9h12v9zm12 5h10v18h-32v-18h10v9h12z" />
            <path d="M13 12.5V8h6v4.5zm6 2.5h5v9H8v-9h5v4.5h6z" />
          </g>
        </svg>
      );
      // return h(
      //   "svg",
      //   {
      //     className: "uppy-DashboardTab-iconUnsplash",
      //     viewBox: "0 0 32 32",
      //     height: "32",
      //     width: "32",
      //     "aria-hidden": "true",
      //   },
      //   h(
      //     "g",
      //     { fill: "currentcolor" },
      //     h("path", {
      //       d: "M46.575 10.883v-9h12v9zm12 5h10v18h-32v-18h10v9h12z",
      //     }),
      //     h("path", { d: "M13 12.5V8h6v4.5zm6 2.5h5v9H8v-9h5v4.5h6z" })
      //   )
      // );
    };

    this.onFirstRender = this.onFirstRender.bind(this);
    this.render = this.render.bind(this);

    // if (!this.opts.companionUrl) {
    //   throw new Error('Companion hostname is required, please consult https://uppy.io/docs/companion')
    // }

    // this.hostname = this.opts.companionUrl

    // this.provider = new SearchProvider(uppy, {
    //   companionUrl: this.opts.companionUrl,
    //   companionHeaders: this.opts.companionHeaders,
    //   companionCookiesRule: this.opts.companionCookiesRule,
    //   provider: 'unsplash',
    //   pluginId: this.id,
    // })
  }

  install() {
    this.view = new OARepoViewProvider(this, {
      // provider: this.provider,
      viewType: "list",
      showTitles: true,
      loadAllFiles: true,
    });

    this.fileSources = this.opts.fileSources;

    const { target } = this.opts;
    if (target) {
      this.mount(target, this);
    }
  }

  // eslint-disable-next-line class-methods-use-this
  onFirstRender() {
    this.fileSources = this.opts.fileSources;
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
    // this.fileSources = this.opts.fileSources;
    return this.view.render(state);
  }

  uninstall() {
    this.unmount();
  }
}
