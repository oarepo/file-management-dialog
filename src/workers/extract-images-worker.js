const pdfExtractImages = import("../utils/pdf-extract-images.js");

self.onmessage = async (event) => {
  try {
    const { pdfFileName, data } = event.data;
    await (await pdfExtractImages).default(pdfFileName, data);
    // const extractedImages = await (await pdfExtractImages).default(buffer);
    //self.postMessage(extractedImages);
    self.postMessage({ type: "done" });
  } catch (error) {
    self.postMessage({ type: "error", message: error.message });
    console.error(error);
  }
};