import Browser from "./Browser";
import CloseWrapper from "@uppy/provider-views/src/CloseWrapper";
import View from "@uppy/provider-views/src/View";
import getFileType from "@uppy/utils/lib/getFileType";
import isPreviewSupported from "@uppy/utils/lib/isPreviewSupported";

import packageJson from "./package.json";

/**
 * OARepoViewProvider forked from SearchProviderView, used for Unsplash and future image search providers.
 * Extends generic View, shared with regular providers like Google Drive and Instagram.
 */
export default class OARepoViewProvider extends View {
  static VERSION = packageJson.version;

  /**
   * @param {object} plugin instance of the plugin
   * @param {object} opts
   */
  constructor(plugin, opts) {
    super(plugin, opts);

    // set default options
    const defaultOptions = {
      viewType: "list",
      showTitles: true,
      showFilter: false,
      showBreadcrumbs: false,
      loadAllFiles: true,
    };

    // merge default options with the ones set by user
    this.opts = { ...defaultOptions, ...opts };

    // Logic
    this.downloadFiles = this.downloadFiles.bind(this);
    this.resetPluginState = this.resetPluginState.bind(this);
    this.donePicking = this.donePicking.bind(this);
    this.getTagFile = this.getTagFile.bind(this);

    // Visual
    this.render = this.render.bind(this);

    this.defaultState = {
      didFirstRender: false,
      files: [],
      folders: [],
      currentSelection: [],
    };

    // Set default state for the plugin
    this.plugin.setPluginState(this.defaultState);
  }

  // eslint-disable-next-line class-methods-use-this
  tearDown() {
    // Nothing.
  }

  resetPluginState() {
    this.plugin.setPluginState(this.defaultState);
  }

  #updateFilesAndInputMode(fileSources, files) {
    fileSources.forEach((item) => {
      files.push(item);
    });
    this.plugin.uppy.log(
      `[OARepoViewProvider] #updateFilesAndInputMode: files:\n${files}`
    );
    this.plugin.setPluginState({
      currentSelection: [],
      files,
    });
  }

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
        icon: "file"
        ...
      },
      ...
    ]
  */
  downloadFiles(fileSources) {
    console.log("downloadFiles", fileSources);
    this.setLoading(true);
    try {
      this.#updateFilesAndInputMode(fileSources, []);
    } catch (err) {
      this.handleError(err);
    } finally {
      this.setLoading(false);
    }
  }

  // Forked from View.js
  getTagFile(file) {
    const tagFile = {
      id: file.id,
      source: this.plugin.id,
      data: file,
      name: file.name || file.id,
      type: file.mimeType,
      isRemote: false,
      meta: file.metadata || {},
      body: {
        fileId: file.id,
      },
    };

    const fileType = getFileType(tagFile);

    // TODO Should we just always use the thumbnail URL if it exists?
    if (fileType && isPreviewSupported(fileType)) {
      tagFile.preview = file.thumbnail;
    }

    if (file.author) {
      if (file.author.name != null)
        tagFile.meta.authorName = String(file.author.name);
      if (file.author.url) tagFile.meta.authorUrl = file.author.url;
    }

    // add relativePath similar to non-remote files: https://github.com/transloadit/uppy/pull/4486#issuecomment-1579203717
    if (file.relDirPath != null)
      tagFile.meta.relativePath = file.relDirPath
        ? `${file.relDirPath}/${tagFile.name}`
        : null;
    // and absolutePath (with leading slash) https://github.com/transloadit/uppy/pull/4537#issuecomment-1614236655
    if (file.absDirPath != null)
      tagFile.meta.absolutePath = file.absDirPath
        ? `/${file.absDirPath}/${tagFile.name}`
        : `/${tagFile.name}`;

    return tagFile;
  }

  // Call API
  async donePicking() {
    const { currentSelection } = this.plugin.getPluginState();
    this.plugin.uppy.log("Adding remote search provider files");

    const filesToAdd = [];
    await Promise.allSettled(
      currentSelection.map(async (file) => {
        let data;
        try {
          const response = await fetch(file.requestPath);
          data = await response.blob();
        } catch (error) {
          this.plugin.uppy.log(error, "error");
          this.plugin.uppy.info(
            "Could not fetch files from remote provider",
            "error",
            5000
          );
          return;
        }
        const tagFile = this.getTagFile(file);
        tagFile.data = data;
        filesToAdd.push(tagFile);
      })
    );

    this.plugin.uppy.addFiles(filesToAdd);
    this.resetPluginState();
  }

  render(state, viewOptions = {}) {
    const { didFirstRender } = this.plugin.getPluginState();
    const { i18n } = this.plugin.uppy;

    if (!didFirstRender) {
      this.preFirstRender();
    }

    const targetViewOptions = { ...this.opts, ...viewOptions };
    const { files, loading, currentSelection } = this.plugin.getPluginState();
    const { isChecked, toggleCheckbox, recordShiftKeyPress } = this;

    console.log(files);

    const browserProps = {
      isChecked,
      toggleCheckbox,
      recordShiftKeyPress,
      currentSelection,
      files: files,
      folders: [],
      done: this.donePicking,
      cancel: this.cancelPicking,

      headerComponent: "Select PDF(s) to extract images from.",
      noResultsLabel: i18n("noSearchResults"),
      title: this.plugin.title,
      viewType: targetViewOptions.viewType,
      showTitles: targetViewOptions.showTitles,
      showFilter: targetViewOptions.showFilter,
      isLoading: loading,
      showBreadcrumbs: targetViewOptions.showBreadcrumbs,
      pluginIcon: this.plugin.icon,
      i18n,
      uppyFiles: this.plugin.uppy.getFiles(),
      validateRestrictions: (...args) =>
        this.plugin.uppy.validateRestrictions(...args),
      loadAllFiles: this.opts.loadAllFiles,
    };

    return (
      <CloseWrapper onUnmount={this.resetPluginState}>
        {/* eslint-disable-next-line react/jsx-props-no-spreading */}
        <Browser {...browserProps} />
      </CloseWrapper>
    );
  }
}
