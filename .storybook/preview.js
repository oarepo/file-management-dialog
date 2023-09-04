import "@uppy/core/dist/style.min.css";
import "@uppy/dashboard/dist/style.min.css";
import "@uppy/image-editor/dist/style.min.css";

import { initialize, mswLoader } from "msw-storybook-addon";

import handlers from "./msw-mock";

// Initialize MSW
initialize({
  onUnhandledRequest: 'bypass'
});

/** @type { import('@storybook/react').Preview } */
const preview = {
  parameters: {
    actions: { argTypesRegex: "^on[A-Z].*" },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
    msw: {
      handlers: {
        oarepo: handlers,
      },
    },
  },
  loaders: [mswLoader],
};

export default preview;
