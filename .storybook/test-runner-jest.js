import { getJestConfig } from '@storybook/test-runner';

/**
 * @type {import('@jest/types').Config.InitialOptions}
 */
export default {
  // The default configuration comes from @storybook/test-runner
  ...getJestConfig(),
  /** Add your own overrides below
   * @see https://jestjs.io/docs/configuration
   */
  testTimeout: 50000,
};