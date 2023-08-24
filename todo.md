Issue:

Implement React file-input based component, that:
- displays a button that allows user to pick a PDF file
- scans the file for any web-compatible embedded images/graphics (JPG, PNG, SVG, TIFF?)
- extract found images data (optionally/where possible, also extract image captions)
- displays a grid of images found in a file:
    - only with images larger than a configurable threshold of a few pixels
    - grouped by PDF page on which they appeared
    - each grid item shows editable caption with extracted caption value (user can also provide his own caption here)
- lets user select, which images should be uploaded, the rest will be ignored
- when user clicks "Upload {n} images" submit button, it calls the (mocked) upload function passing selected image data & metadata

- For PDF scanning, use PDF.js library or similar.
- Account for displaying processing & error states.
- Consider using webworkers to optimize for possibly long running tasks (scanning & extraction).

1. How to extract image captions from .pdf?
    - Metadata?
    - OCR?
    - Under-image text?
2. What's the policy about external libraries?
    - PDF.js is a big library
        - must handle different file types, alpha channels, svg, buffers manually
        - base64 encoding
    - https://www.npmjs.com/package/pdf-img-convert
    - https://www.npmjs.com/package/pdf-extractor
3. What's the metadata of a image? (caption, page, size, type, name, ...)
    - caption, page

Bugs:
Computer-organization-and-design.pdf:
```
Uncaught (in promise) TypeError: Cannot read properties of undefined (reading '0')
    at pdf-extract-images.js:146:49
    at new Promise (<anonymous>)
    at savePng (pdf-extract-images.js:106:5)
    at Module.extractPdfImages (pdf-extract-images.js:189:27)
    at async self.onmessage (extract-images-worker.js?type=classic&worker_file:6:3)
```


## TODO
1. key that already exist - update
    - for images
2. Upload process:
    - New images:
        - Upload photos btn
    - change metadata:
        - deselected
            - modal: do you want to delete the image?
            - when clicked on image
        - save changes
        - IIIF - smaller images for preview

### 8.8.2023
- ImageSelection outputs only selected images
- alert with semantic ui alerts
- FullScreen preview for ImageCard component


## 17.8.2023
- Add Metadata modifier.
- NPM package - create react library
- Functional decomposition for FileManagementDialog component
  - extract based props

## 24.8.2023
- BUG: handle metadata upload from OARepoUpload plugin
  - revise key-value pairs
```json
{
  "key": "test_pattern.png",
  "updated": "2020-11-27 11:17:11.002624",
  "created": "2020-11-27 11:17:10.998919",
  "metadata": {
    "relativePath": null, // should be removed
    "name": "test_pattern.png", // should be removed
    "type": "image/png", // should be removed
    "caption": "test pattern",
    "featureImage": true
  },
  "status": "pending",
  "links": {
    "content": "/api/records/8t29q-nfr77/draft/files/test_pattern.png/content",
    "self": "/api/records/8t29q-nfr77/draft/files/test_pattern.png",
    "commit": "/api/records/8t29q-nfr77/draft/files/test_pattern.png/commit"
  }
}
```