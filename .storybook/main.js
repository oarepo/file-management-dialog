/** @type { import('@storybook/react-vite').StorybookConfig } */
const config = {
  stories: ["../src/**/*.stories.@(js|jsx|mjs|ts|tsx)"],
  staticDirs: ['../public'],
  addons: [
    "@storybook/addon-links",
    "@storybook/addon-essentials",
    "@storybook/addon-interactions",
    '@storybook/addon-storysource',
    "@chromatic-com/storybook"
  ],
  framework: {
    name: "@storybook/react-vite",
    options: {},
  },
  docs: {},
  core: {
    disableTelemetry: true
  },
  // Uncomment this to test in production-like CSP environment
  // previewHead: (head) => `
  //   ${head}
  //   <meta   http-equiv=\"Content-Security-Policy\" content=\"default-src 'self'; style-src 'unsafe-inline'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; img-src 'self' blob:; media-src 'self'; connect-src 'self'\" />
  // `,
  async viteFinal (config, options) {
    return config;
  },
};
export default config;
