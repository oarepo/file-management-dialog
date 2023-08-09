import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import 'semantic-ui-css/semantic.min.css'

const autoInitDataAttr = "data-detail-config";
const rootElement = document.getElementById('root');

const { ...config } = JSON.parse(
  rootElement.dataset[autoInitDataAttr] || '{}'
);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App config={config} />
  </React.StrictMode>,
)
