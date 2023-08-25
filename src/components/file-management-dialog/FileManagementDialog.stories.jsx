import {
  waitFor,
  userEvent,
  within,
  waitForElementToBeRemoved,
} from "@storybook/testing-library";
import { expect } from "@storybook/jest";

import FileManagementDialog from "./FileManagementDialog";
import appConfig from "./__fixtures__/data-storybook.json";
import articlePdf from "./__fixtures__/article.pdf";

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

export const ExistingFilesModifier = {
  args: {
    modifyExistingFiles: true,
    autoExtractImagesFromPDFs: false,
  },
};

// Function to emulate pausing between interactions
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export const UploadInvalidPdfFromDevice = {
  args: {
    ...NewImageFilesUploader.args,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(canvas.getByRole("button", { name: /set images/i }));

    await sleep(1000);

    const fileInput = document.querySelector("input[type=file]");
    const file = new File(["article"], "article.pdf", {
      type: "application/pdf",
    });
    await userEvent.upload(fileInput, file);

    await waitFor(() => {
      expect(
        canvas.getByText(/error extracting images from article.pdf/i)
      ).toBeInTheDocument();
    });
  },
};

export const UploadValidPdfFromDevice = {
  args: {
    ...NewImageFilesUploader.args,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(canvas.getByRole("button", { name: /set images/i }));

    await sleep(1000);

    const fileInput = document.querySelector("input[type=file]");
    const fileData = await fetch(articlePdf).then((r) => r.blob());
    const file = new File([fileData], "article.pdf", {
      type: "application/pdf",
    });
    await userEvent.upload(fileInput, file);

    // wait for the file to be processed
    await canvas.findByText(/image extraction completed/i);

    const uploadButton = await canvas.findByLabelText(/Upload [0-9]+ files/i);
    await userEvent.click(uploadButton);

    // wait for the files to be uploaded
    await waitFor(
      () => {
        expect(
          canvas.getByRole("status", { name: /complete/i })
        ).toBeInTheDocument();
      },
      { timeout: 20000 }
    );

    await sleep(1000);

    await userEvent.click(canvas.getByRole("button", { name: /done/i }));
  },
};

export const UploadFromOARepo = {
  args: {
    ...NewImageFilesUploader.args,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(canvas.getByRole("button", { name: /set images/i }));

    await userEvent.click(await canvas.findByRole("tab", { name: /oarepo/i }));

    await sleep(1000);

    // Select 2 files
    await userEvent.click(
      canvas.getByRole("checkbox", { name: /article.pdf/i })
    );

    await sleep(1000);

    await userEvent.click(
      canvas.getByRole("checkbox", { name: /article2.pdf/i })
    );

    await sleep(1000);

    await userEvent.click(canvas.getByRole("button", { name: /select 2/i }));

    // wait for the 2 files to be downloaded and processed
    await canvas.findByText(/image extraction completed/i);
    await waitForElementToBeRemoved(
      () => canvas.queryByText(/image extraction completed/i),
      { timeout: 10000 }
    );

    const uploadButton = await canvas.findByLabelText(/Upload [0-9]+ files/i);
    await userEvent.click(uploadButton);

    // wait for the files to be uploaded
    await waitFor(
      () => {
        expect(
          canvas.getByRole("status", { name: /complete/i })
        ).toBeInTheDocument();
      },
      { timeout: 20000 }
    );
  },
};
