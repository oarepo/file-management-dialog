import { h } from "preact";

// import SearchFilterInput from '@uppy/provider-views/src/SearchFilterInput'
import Browser from "./Browser";
import CloseWrapper from "@uppy/provider-views/src/CloseWrapper";
import View from "@uppy/provider-views/src/View";
import getFileType from '@uppy/utils/lib/getFileType'
import isPreviewSupported from '@uppy/utils/lib/isPreviewSupported'

import packageJson from "./package.json";

/**
 * SearchProviderView, used for Unsplash and future image search providers.
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
      viewType: "grid",
      showTitles: false,
      showFilter: false,
      showBreadcrumbs: false,
      loadAllFiles: true,
    };

    // merge default options with the ones set by user
    this.opts = { ...defaultOptions, ...opts };

    // Logic
    // this.search = this.search.bind(this)
    // this.clearSearch = this.clearSearch.bind(this)
    this.downloadFiles = this.downloadFiles.bind(this);
    this.resetPluginState = this.resetPluginState.bind(this);
    // this.handleScroll = this.handleScroll.bind(this)
    this.donePicking = this.donePicking.bind(this);
    this.getTagFile = this.getTagFile.bind(this);

    // Visual
    this.render = this.render.bind(this);

    this.defaultState = {
      didFirstRender: false,
      isInputMode: false,
      files: [],
      folders: [],
      breadcrumbs: [],
      filterInput: "",
      currentSelection: [],
      //   searchTerm: null,
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
    // this.nextPageQuery = res.nextPageQuery
    fileSources.forEach((item) => {
      files.push(item);
    });
    this.plugin.uppy.log(
      `[OARepoViewProvider] #updateFilesAndInputMode: files:\n${files}`
    );
    this.plugin.setPluginState({
      currentSelection: [],
      isInputMode: false,
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
    // const { searchTerm } = this.plugin.getPluginState()
    // if (query && query === searchTerm) {
    //   // no need to search again as this is the same as the previous search
    //   return
    // }
    console.log("downloadFiles", fileSources);
    this.setLoading(true);
    try {
      // TODO: Implement download of files using fileSources
      // const res = await this.provider.search(query)
      this.#updateFilesAndInputMode(fileSources, []);
    } catch (err) {
      this.handleError(err);
    } finally {
      this.setLoading(false);
    }
  }

  //   clearSearch () {
  //     this.plugin.setPluginState({
  //       currentSelection: [],
  //       files: [],
  //     //   searchTerm: null,
  //     })
  //   }

  //   async handleScroll (event) {
  //     const query = this.nextPageQuery || null

  //     if (this.shouldHandleScroll(event) && query) {
  //       this.isHandlingScroll = true

  //       try {
  //         const { files, searchTerm } = this.plugin.getPluginState()
  //         // const response = await this.provider.search(searchTerm, query)

  //         this.#updateFilesAndInputMode(response, files)
  //       } catch (error) {
  //         this.handleError(error)
  //       } finally {
  //         this.isHandlingScroll = false
  //       }
  //     }
  //   }

  getTagFile(file) {
    const tagFile = {
      id: file.id,
      source: this.plugin.id,
      data: file,
      name: file.name || file.id,
      type: file.mimeType,
      isRemote: false,
      meta: {},
      body: {
        fileId: file.id,
      },
      // remote: {
      //   companionUrl: this.plugin.opts.companionUrl,
      //   url: file.requestPath,
      //   body: {
      //     fileId: file.id,
      //   },
      //   providerOptions: this.provider.opts,
      //   providerName: this.provider.name,
      //   provider: this.provider.provider,
      // },
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
          return;
        }
        const tagFile = this.getTagFile(file);
        tagFile.data = data;
        filesToAdd.push(tagFile);
      })
    );

    this.plugin.uppy.addFiles(filesToAdd)
    this.resetPluginState();
  }

  render(state, viewOptions = {}) {
    const { didFirstRender, isInputMode, searchTerm } =
      this.plugin.getPluginState();
    const { i18n } = this.plugin.uppy;

    if (!didFirstRender) {
      this.preFirstRender();
    }

    const targetViewOptions = { ...this.opts, ...viewOptions };
    const { files, folders, filterInput, loading, currentSelection } =
      this.plugin.getPluginState();
    const { isChecked, toggleCheckbox, filterItems, recordShiftKeyPress } =
      this;
    const hasInput = filterInput !== "";

    console.log(files);

    const browserProps = {
      isChecked,
      toggleCheckbox,
      recordShiftKeyPress,
      currentSelection,
      files: files,
      folders: [],
      //   handleScroll: this.handleScroll,
      done: this.donePicking,
      cancel: this.cancelPicking,

      //   // For SearchFilterInput component
      //   showSearchFilter: targetViewOptions.showFilter,
      //   search: this.search,
      //   clearSearch: this.clearSearch,
      //   searchTerm,
      //   searchOnInput: false,
      //   searchInputLabel: i18n('search'),
      //   clearSearchLabel: i18n('resetSearch'),

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

    // if (isInputMode) {
    //   return (
    //     <CloseWrapper onUnmount={this.resetPluginState}>
    //       <div className="uppy-SearchProvider">
    //         <SearchFilterInput
    //           search={this.search}
    //           clearSelection={this.clearSelection}
    //           inputLabel={i18n('enterTextToSearch')}
    //           buttonLabel={i18n('searchImages')}
    //           inputClassName="uppy-c-textInput uppy-SearchProvider-input"
    //           buttonCSSClassName="uppy-SearchProvider-searchButton"
    //           showButton
    //         />
    //       </div>
    //     </CloseWrapper>
    //   )
    // }

    return (
      <CloseWrapper onUnmount={this.resetPluginState}>
        {/* eslint-disable-next-line react/jsx-props-no-spreading */}
        <Browser {...browserProps} />
      </CloseWrapper>
      // <CloseWrapper onUnmount={this.resetPluginState}>
      //   <div>TODO: Implement OARepoViewProvider</div>
      // </CloseWrapper>
    );
  }
}
