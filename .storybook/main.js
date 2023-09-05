/** @type { import('@storybook/preact-vite').StorybookConfig } */
const config = {
  stories: ["../src/**/*.stories.@(js|jsx|mjs|ts|tsx)"],
  staticDirs: ['../public'],
  addons: [
    "@storybook/addon-links",
    "@storybook/addon-essentials",
    "@storybook/addon-interactions",
    '@storybook/addon-storysource',
  ],
  framework: {
    name: "@storybook/preact-vite",
    options: {},
  },
  docs: {
    autodocs: "tag",
  },
  core: {
    builder: "@storybook/builder-vite",
    disableTelemetry: true,
  },
  async viteFinal (config, options) {
    return config;
  },
};
export default config;
