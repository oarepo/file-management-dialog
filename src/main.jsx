import "preact/debug";
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import '@uppy/core/dist/style.min.css';
import '@uppy/dashboard/dist/style.min.css';
import '@uppy/image-editor/dist/style.min.css';

const autoInitDataAttr = "detailConfig";
const rootElement = document.getElementById('root');

const { ...config } = JSON.parse(
  rootElement.dataset[autoInitDataAttr]
);

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <App config={config} />
  </React.StrictMode>,
)
