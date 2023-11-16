import extractPdfImages from "../utils/pdf-extract-images.js";

addEventListener("message", async (event) => {
  const { pdfFileName, data } = event.data;
  try {
    const imageCount = await extractPdfImages(pdfFileName, data);
    postMessage({ type: "done", imageCount: imageCount, sourcePdf: pdfFileName });
  } catch (error) {
    postMessage({ type: "error", message: error.message, sourcePdf: pdfFileName });
    console.error(error);
  }
});