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