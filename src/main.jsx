import React from "react";
import ReactDOM from "react-dom";
import App from "./App.jsx";
import "@uppy/core/dist/style.min.css";
import "@uppy/dashboard/dist/style.min.css";
import "@uppy/image-editor/dist/style.min.css";

const autoInitDataAttr = "detailConfig";
const rootElement = document.getElementById("root");

const { ...config } = JSON.parse(rootElement.dataset[autoInitDataAttr]);

ReactDOM.render(<App config={config} />, rootElement);
