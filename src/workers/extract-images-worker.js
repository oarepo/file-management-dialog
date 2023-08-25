const pdfExtractImages = import("../utils/pdf-extract-images.js");

self.onmessage = async (event) => {
  const { pdfFileName, data } = event.data;
  try {
    await (await pdfExtractImages).default(pdfFileName, data);
    // const extractedImages = await (await pdfExtractImages).default(buffer);
    //self.postMessage(extractedImages);
    self.postMessage({ type: "done" });
  } catch (error) {
    self.postMessage({ type: "error", message: error.message, sourcePdf: pdfFileName });
    console.error(error);
  }
};