import type { PluginTarget, UIPlugin, UIPluginOptions } from "@uppy/core";

interface OARepoFileSourceOptions extends UIPluginOptions {
  target?: PluginTarget;
  title?: string;
  fileSources: string[];
  fileTypeFilter?: string[];
}

declare class OARepoFileSource extends UIPlugin<OARepoFileSourceOptions> {}

export default OARepoFileSource;
