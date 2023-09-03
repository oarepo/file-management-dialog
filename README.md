# OARepo File Manager

![Version](https://img.shields.io/github/package-json/v/oarepo/file-management-dialog) [![License](https://img.shields.io/github/license/oarepo/file-management-dialog)](https://github.com/oarepo/file-management-dialog/blob/main/LICENSE) ![Build Status](https://github.com/oarepo/file-management-dialog/actions/workflows/chromatic.yml/badge.svg
)

This package provides a file management dialog for OARepo. It allows users to upload new files and modify existing files (change metadata). It also allows users to extract images from PDF files.
It uses [Uppy](https://uppy.io/) package to render uploader Dashboard, import files from local storage and from external sources (OARepo), add/edit file metadata, edit images and most importantly, to upload files to OARepo.

## Installation

1. Create a new [React](https://react.dev/)/[Preact](https://preactjs.com/) app using [Vite](https://vitejs.dev/) or [Create React App](https://create-react-app.dev/).
2. Install the package:

    ```bash
    npm install @oarepo/file-manager

    # or

    yarn add @oarepo/file-manager
    ```

3. Since this package uses Uppy, which includes Preact as its internal dependency, you have to install compatible Preact individually and, if using React in your existing project, you also [need to set aliases](https://preactjs.com/guide/v8/switching-to-preact/#how-to-alias-preact-compat) for React in your Vite/Webpack config:

    ```bash
    npm install preact@10.5.13

    # or

    yarn add preact@10.5.13
    ```

    Vite:
    ```js
    // vite.config.js
    export default defineConfig({
      resolve: {
        alias: {
          "react": "preact/compat",
          "react-dom": "preact/compat",
          "react/jsx-runtime": "preact/jsx-runtime",
        },
      },
    })
    ```

    Webpack:
    ```js
    // webpack.config.js
    module.exports = {
      resolve: {
        alias: {
          "react": "preact/compat",
          "react-dom": "preact/compat",
          "react/jsx-runtime": "preact/jsx-runtime",
        },
      },
    }
    ```

## Usage

```jsx
import FileManagementDialog from '@oarepo/file-manager'

const MyComponent = () => {
  /* ... */
  return (
      {/* ... */}
      <FileManagementDialog
        config = {
          "record": {
            /* ... */
          },
        },
        modifyExistingFiles = false,
        allowedFileTypes = [
          "image/jpg",
          "image/jpeg",
          "image/png",
          "image/tiff",
          "application/pdf",
        ],
        autoExtractImagesFromPDFs = true,
        TriggerComponent = ({ onClick, ...props }) => (
          <button onClick={onClick} {...props}>
            Set images
          </button>
        ),
      />
      {/* ... */}
  )
}
```

## Props

| Name                        | Type                  | Default                                                                               | Description                                                                    |
| :-------------------------- | :-------------------- | :------------------------------------------------------------------------------------ | :----------------------------------------------------------------------------- |
| `config`                    | `object`              | *Required Prop*                                                                       | Record data (details below).                                                   |
| `modifyExistingFiles`       | `boolean`             | `false`                                                                               | Whether to allow modification of existing files (to modify existing metadata). |
| `allowedFileTypes`          | `string[]`            | `["image/jpg", "image/jpeg", "image/png", "image/tiff", "application/pdf"]`           | Allowed file types (accepts * wildcards, e.g. "image/*").                      |
| `autoExtractImagesFromPDFs` | `boolean`             | `true`                                                                                | Whether to automatically extract images from selected PDFs.                    |
| `TriggerComponent`          | `React.ComponentType` | `({ onClick, ...props }) => <button onClick={onClick} {...props}>Set images</button>` | Triggers FileManagement modal.                                                 |

### `config` object

Example data: (for full reference check mocked data in [data.json](data.json))
```json
{
  "record": {
    "created": "2022-10-18T10:22:35.153753+00:00",
    "id": "8t29q-nfr77",
    "links": {
      "files": "http://localhost:5173/general/datasets/8t29q-nfr77/files/",
      "self": "http://localhost:5173/general/datasets/8t29q-nfr77",
      "transitions": {}
    },
    "files": {
      "default_preview": null,
      "enabled": true,
      "entries": [
        {
          "key": "figure.png",
          "updated": "2020-11-27 11:26:04.607831",
          "created": "2020-11-27 11:17:10.998919",
          "checksum": "md5:6ef4267f0e710357c895627e931f16cd",
          "mimetype": "image/png",
          "size": 89364.0,
          "status": "completed",
          "metadata": {
            "caption": "Figure 1",
            "featureImage": true
          },
          "file_id": "2151fa94-6dc3-4965-8df9-ec73ceb91T5c",
          "version_id": "57ad8c66-b934-49c9-a46f-38bf5aa0374f",
          "bucket_id": "90b5b318-114a-4b87-bc9d-0d018b9363d3",
          "storage_class": "S",
          "links": {
            "content": "http://localhost:5173/api/records/8t29q-nfr77/files/figure.png/content",
            "self": "http://localhost:5173/api/records/8t29q-nfr77/files/figure.png",
            "commit": "http://localhost:5173/api/records/8t29q-nfr77/files/figure.png/commit"
          }
        },
        {
          "key": "article.pdf",
          "updated": "2020-11-27 11:26:04.607831",
          "created": "2020-11-27 11:17:10.998919",
          "checksum": "md5:6ef4267f0e710357c895627e931f16cd",
          "mimetype": "application/pdf",
          "size": 89364546.0,
          "status": "completed",
          "metadata": null,
          "file_id": "2151fa94-6dc3-4935-8df9-efafgeb9175c",
          "version_id": "57ad8c66-b934-49c9-a46f-38bfsda0374f",
          "bucket_id": "90b5b318-114a-4b87-bc9d-0d0f439363d3",
          "storage_class": "S",
          "links": {
            "content": "http://localhost:5173/api/records/8t29q-nfr77/files/article.pdf/content",
            "self": "http://localhost:5173/api/records/8t29q-nfr77/files/article.pdf",
            "commit": "http://localhost:5173/api/records/8t29q-nfr77/files/article.pdf/commit"
          }
        },
      ],
      "links": {
        "self": "http://localhost:5173/api/records/8t29q-nfr77/files"
      },
      "order": []
    },
    /* ... */
  }
}
```

Check [Invenio API](https://inveniordm.docs.cern.ch/reference/rest_api_drafts_records/#draft-files) for similar reference.

## License

OARepo File Management Dialog is released under the MIT License. See the [LICENSE](./LICENSE) file for details.
