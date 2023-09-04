import extractPdfImages from "../utils/pdf-extract-images.js";

addEventListener("message", async (event) => {
  const { pdfFileName, data } = event.data;
  try {
    await extractPdfImages(pdfFileName, data);
    postMessage({ type: "done" });
  } catch (error) {
    postMessage({ type: "error", message: error.message, sourcePdf: pdfFileName });
    console.error(error);
  }
});