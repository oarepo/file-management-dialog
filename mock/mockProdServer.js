import { createProdMockServer } from 'vite-plugin-mock/es/createProdMockServer';

import testModule from './mock';

export function setupProdMockServer() {
  createProdMockServer([...testModule])
}