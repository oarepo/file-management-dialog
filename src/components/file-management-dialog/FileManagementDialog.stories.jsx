import {
  waitFor,
  userEvent,
  within,
  expect
} from "@storybook/test";

import FileManagementDialog from "./FileManagementDialog";

import appConfig from "./__fixtures__/data-storybook";
import articlePdf from "./__fixtures__/article.pdf";
import invalidPdf from "./__fixtures__/invalid.pdf";

export default {
  title: "file-management-dialog/FileManagementDialog",
  component: FileManagementDialog,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  args: {
    config: appConfig,
    allowedFileTypes: ["image/*", "application/pdf"],
    allowedMetaFields: [
      { id: "caption", defaultValue: "", isUserInput: true },
      { id: "featured", defaultValue: false, isUserInput: true },
      { id: "fileNote", defaultValue: "", isUserInput: true },
      { id: "fileType", defaultValue: "", isUserInput: false },
    ],
    modifyExistingFiles: false,
    locale: "en_US",
    startEvent: null,
    onCompletedUpload: (...args) => {},
    debug: true,
  },
};

export const NewFilesUploader = {
  args: {
    modifyExistingFiles: false,
    autoExtractImagesFromPDFs: false,
  },
};

export const NewImageFilesUploader = {
  args: {
    modifyExistingFiles: false,
    autoExtractImagesFromPDFs: true,
  },
};

export const FileMetadataModifier = {
  args: {
    modifyExistingFiles: true,
    autoExtractImagesFromPDFs: false,
  },
};

export const WithExtraUppyDashboardProps = {
  args: {
    ...NewFilesUploader.args,
    extraUppyDashboardProps: {
      hideRetryButton: true,
      theme: "dark"
    },
  },
};

export const WithOnUploadCallbacksUploader = {
  args: {
    ...NewFilesUploader.args,
    onCompletedUpload: (result) => {
      console.log("Upload result:", result);
    },
  },
};

export const WithExtraUppyCoreSettings = {
  args: {
    ...NewFilesUploader.args,
    extraUppyCoreSettings: {
      restrictions: {
        maxFileSize: 1000000,
        maxNumberOfFiles: 2,
        minNumberOfFiles: 1,
        allowedFileTypes: ["image/*", "application/pdf"],
      },
    },
  },
};

export const UploadFileWithoutEditEvent = {
  args: {
    autoExtractImagesFromPDFs: false,
    startEvent: {
      event: "upload-file-without-edit",
    },
  },
};

// Function to emulate pausing between interactions
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export const UploadImagesFromPDFEvent = {
  args: {
    autoExtractImagesFromPDFs: true,
    startEvent: {
      event: "upload-images-from-pdf",
      data: {
        file_key: "article.pdf",
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(document.body);

    await userEvent.click(canvas.getByRole("button", { name: /set images/i }));

    // wait for the file to be processed
    await canvas.findByText(
      /image extraction completed/i,
      {},
      { timeout: 20000 },
    );

    const uploadButton = await canvas.findByLabelText(/Upload [0-9]+ files/i);
    await userEvent.click(uploadButton);

    // wait for the files to be uploaded
    await waitFor(
      () => {
        expect(
          canvas.getByRole("status", { name: /complete/i }),
        ).toBeInTheDocument();
      },
      { timeout: 20000 },
    );
  },
};

export const ExistingFileModifierEvent = {
  args: {
    autoExtractImagesFromPDFs: false,
    startEvent: {
      event: "edit-file",
      data: {
        file_key: "figure.png",
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(document.body);

    await userEvent.click(canvas.getByRole("button", { name: /set images/i }));

    await sleep(1000);

    await userEvent.click(
      canvas.getByRole("button", { name: /save changes/i }),
    );

    await canvas.findByRole("button", { name: /done/i });
  },
};

export const UploadInvalidPdfFromDevice = {
  args: {
    ...NewImageFilesUploader.args,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(document.body);

    await userEvent.click(canvas.getByRole("button", { name: /set images/i }));

    await sleep(1000);

    const fileInput = document.querySelector("input[type=file]");
    const file = new File(["article"], "article.pdf", {
      type: "application/pdf",
    });
    await userEvent.upload(fileInput, file);

    await waitFor(() => {
      expect(
        canvas.getByText(/error extracting images from article.pdf/i),
      ).toBeInTheDocument();
    });
  },
};

export const UploadValidPdfFromDevice = {
  args: {
    ...NewImageFilesUploader.args,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(document.body);

    await userEvent.click(canvas.getByRole("button", { name: /set images/i }));

    await sleep(3000);

    const fileInput = document.querySelector("input[type=file]");
    const fileData = await fetch(articlePdf).then((r) => r.blob());
    const file = new File([fileData], "article.pdf", {
      type: "application/pdf",
    });
    await userEvent.upload(fileInput, file);

    // wait for the file to be processed
    await canvas.findByText(
      /image extraction completed/i,
      {},
      { timeout: 20000 },
    );

    const uploadButton = await canvas.findByLabelText(/Upload [0-9]+ files/i);
    await userEvent.click(uploadButton);

    // wait for the files to be uploaded
    await waitFor(
      () => {
        expect(
          canvas.getByRole("status", { name: /complete/i }),
        ).toBeInTheDocument();
      },
      { timeout: 20000 },
    );

    await sleep(1000);

    await userEvent.click(canvas.getByRole("button", { name: /done/i }));
  },
};

export const FailedUpload = {
  args: {
    ...NewFilesUploader.args,
    onCompletedUpload: (result) => {
      console.log("Upload result:", result);
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(document.body);

    await userEvent.click(canvas.getByRole("button", { name: /set images/i }));

    await sleep(3000);

    const fileInput = document.querySelector("input[type=file]");
    const fileData = await fetch(invalidPdf).then((r) => r.blob());
    const file = new File([fileData], "invalid.pdf", {
      type: "application/pdf",
    });
    await userEvent.upload(fileInput, file);

    const uploadButton = await canvas.findByLabelText(/Upload 1 file/i);
    await userEvent.click(uploadButton);

    await canvas.findByTitle(/upload failed/i);
  },
};

export const RetryFailedUpload = {
  args: {
    ...NewFilesUploader.args,
    onCompletedUpload: (result) => {
      console.log("Upload result:", result);
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(document.body);

    await userEvent.click(canvas.getByRole("button", { name: /set images/i }));

    await sleep(3000);

    const fileInput = document.querySelector("input[type=file]");
    const fileData = await fetch(invalidPdf).then((r) => r.blob());
    const file = new File([fileData], "invalid.pdf", {
      type: "application/pdf",
    });
    await userEvent.upload(fileInput, file);

    const uploadButton = await canvas.findByLabelText(/Upload 1 file/i);
    await userEvent.click(uploadButton);

    await canvas.findByTitle(/upload failed/i);

    const statusBarActionsElem = document.querySelector("div.uppy-StatusBar-actions")
    const retryButton = await within(statusBarActionsElem).findByRole("button", { name: /retry upload/i })
    await userEvent.click(retryButton);

    await canvas.findByTitle(/upload failed/i);
  },
};

export const RetryWithNewFileAfterFailedUpload = {
  args: {
    ...NewFilesUploader.args,
    onCompletedUpload: (result) => {
      console.log("Upload result:", result);
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(document.body);

    await userEvent.click(canvas.getByRole("button", { name: /set images/i }));

    await sleep(3000);

    let fileInput = document.querySelector("input[type=file]");
    let fileData = await fetch(invalidPdf).then((r) => r.blob());
    let file = new File([fileData], "invalid.pdf", {
      type: "application/pdf",
    });
    await userEvent.upload(fileInput, file);

    let uploadButton = await canvas.findByLabelText(/Upload 1 file/i);
    await userEvent.click(uploadButton);

    await canvas.findByTitle(/upload failed/i);

    const addMoreFilesButton = canvas.getByRole("button", { name: /add more files/i });
    await userEvent.click(addMoreFilesButton);

    await sleep(1000);

    fileInput = document.querySelector("input[type=file]");
    fileData = await fetch(articlePdf).then((r) => r.blob());
    file = new File([fileData], "valid.pdf", {
      type: "application/pdf",
    });
    await userEvent.upload(fileInput, file);

    const removeFailedFileButton = canvas.getAllByRole("button", { name: /remove file/i })[0];
    await userEvent.click(removeFailedFileButton);

    const statusBarActionsElem = document.querySelector("div.uppy-StatusBar-actions")
    const retryButton = await within(statusBarActionsElem).findByRole("button", { name: /retry upload/i })
    await userEvent.click(retryButton);

    uploadButton = await canvas.findByLabelText(/Upload 1 file/i);
    await userEvent.click(uploadButton);

    await canvas.findByRole("button", { name: /done/i });
  },
};

// NOTE: Current version does not support uploading files from OA Repo in Uppy Dashboard
// export const UploadFromOARepo = {
//   args: {
//     ...NewImageFilesUploader.args,
//   },
//   play: async ({ canvasElement }) => {
//     const canvas = within(canvasElement);

//     await userEvent.click(canvas.getByRole("button", { name: /set images/i }));

//     await sleep(1000); // to wait for files being loaded from API

//     await userEvent.click(await canvas.findByRole("tab", { name: /oarepo/i }));

//     await sleep(1000);

//     // Select 2 files
//     await userEvent.click(
//       canvas.getByRole("checkbox", { name: /article.pdf/i })
//     );

//     await sleep(1000);

//     await userEvent.click(
//       canvas.getByRole("checkbox", { name: /article2.pdf/i })
//     );

//     await sleep(1000);

//     await userEvent.click(canvas.getByRole("button", { name: /select 2/i }));

//     // wait for the 2 files to be downloaded and processed
//     await canvas.findByText(/article\.pdf.*image extraction completed/i, {}, { timeout: 10000 });
//     await waitForElementToBeRemoved(
//       () => canvas.queryByText(/article2\.pdf.*image extraction completed/i),
//       { timeout: 10000 }
//     );

//     const uploadButton = await canvas.findByLabelText(/Upload [0-9]+ files/i);
//     await userEvent.click(uploadButton);

//     // wait for the files to be uploaded
//     await waitFor(
//       () => {
//         expect(
//           canvas.getByRole("status", { name: /complete/i })
//         ).toBeInTheDocument();
//       },
//       { timeout: 20000 }
//     );
//   },
// };
