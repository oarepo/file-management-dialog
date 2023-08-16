/** @jsx h */
import { h } from 'preact'

// import SearchFilterInput from '@uppy/provider-views/src/SearchFilterInput'
import Browser from '@uppy/provider-views/src/Browser'
import CloseWrapper from '@uppy/provider-views/src/CloseWrapper'
import View from '@uppy/provider-views/src/View'

import packageJson from './package.json'

/**
 * SearchProviderView, used for Unsplash and future image search providers.
 * Extends generic View, shared with regular providers like Google Drive and Instagram.
 */
export default class OARepoViewProvider extends View {
  static VERSION = packageJson.version

  /**
   * @param {object} plugin instance of the plugin
   * @param {object} opts
   */
  constructor (plugin, opts) {
    super(plugin, opts)

    // set default options
    const defaultOptions = {
      viewType: 'grid',
      showTitles: false,
      showFilter: false,
      showBreadcrumbs: false,
      loadAllFiles: true,
    }

    // merge default options with the ones set by user
    this.opts = { ...defaultOptions, ...opts }

    // Logic
    // this.search = this.search.bind(this)
    // this.clearSearch = this.clearSearch.bind(this)
    this.resetPluginState = this.resetPluginState.bind(this)
    // this.handleScroll = this.handleScroll.bind(this)
    this.donePicking = this.donePicking.bind(this)

    // Visual
    this.render = this.render.bind(this)

    this.defaultState = {
      isInputMode: false,
      files: [],
      folders: [],
      breadcrumbs: [],
      filterInput: '',
      currentSelection: [],
    //   searchTerm: null,
    }

    // Set default state for the plugin
    this.plugin.setPluginState(this.defaultState)
  }

  // eslint-disable-next-line class-methods-use-this
  tearDown () {
    // Nothing.
  }

  resetPluginState () {
    this.plugin.setPluginState(this.defaultState)
  }

  #updateFilesAndInputMode (res, files) {
    this.nextPageQuery = res.nextPageQuery
    res.items.forEach((item) => { files.push(item) })
    this.plugin.setPluginState({
      currentSelection: [],
      isInputMode: false,
      files,
    //   searchTerm: res.searchedFor,
    })
  }

  async downloadFiles (fileSources) {
    // const { searchTerm } = this.plugin.getPluginState()
    // if (query && query === searchTerm) {
    //   // no need to search again as this is the same as the previous search
    //   return
    // }

    this.setLoading(true)
    try {
        // TODO: Implement download of files using fileSources
      const res = await this.provider.search(query)
      this.#updateFilesAndInputMode(res, [])
    } catch (err) {
      this.handleError(err)
    } finally {
      this.setLoading(false)
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

  // Call API
  donePicking () {
    const { currentSelection } = this.plugin.getPluginState()
    this.plugin.uppy.log('Adding remote search provider files')
    this.plugin.uppy.addFiles(currentSelection.map((file) => this.getTagFile(file)))
    this.resetPluginState()
  }

  render (state, viewOptions = {}) {
    const { didFirstRender, isInputMode, searchTerm } = this.plugin.getPluginState()
    const { i18n } = this.plugin.uppy

    if (!didFirstRender) {
      this.preFirstRender()
    }

    const targetViewOptions = { ...this.opts, ...viewOptions }
    const { files, folders, filterInput, loading, currentSelection } = this.plugin.getPluginState()
    const { isChecked, toggleCheckbox, filterItems, recordShiftKeyPress } = this
    const hasInput = filterInput !== ''

    const browserProps = {
      isChecked,
      toggleCheckbox,
      recordShiftKeyPress,
      currentSelection,
      files: hasInput ? filterItems(files) : files,
      folders: hasInput ? filterItems(folders) : folders,
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

      noResultsLabel: i18n('noSearchResults'),
      title: this.plugin.title,
      viewType: targetViewOptions.viewType,
      showTitles: targetViewOptions.showTitles,
      showFilter: targetViewOptions.showFilter,
      isLoading: loading,
      showBreadcrumbs: targetViewOptions.showBreadcrumbs,
      pluginIcon: this.plugin.icon,
      i18n,
      uppyFiles: this.plugin.uppy.getFiles(),
      validateRestrictions: (...args) => this.plugin.uppy.validateRestrictions(...args),
      loadAllFiles: this.opts.loadAllFiles,
    }

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
    )
  }
}