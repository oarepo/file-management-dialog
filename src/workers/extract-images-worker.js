const pdfExtractImages = import("../utils/pdf-extract-images.js");

self.onmessage = async (event) => {
  const buffer = event.data;
  await (await pdfExtractImages).default(buffer);
  // const extractedImages = await (await pdfExtractImages).default(buffer);
  //self.postMessage(extractedImages);
  self.postMessage("done");
};
