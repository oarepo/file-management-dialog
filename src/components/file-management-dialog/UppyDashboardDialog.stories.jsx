import UppyDashboardDialog from "./UppyDashboardDialog";
import { WorkerProvider } from "../../contexts/WorkerContext";
import { UppyProvider } from "../../contexts/UppyContext";
import { AppContextProvider } from "../../contexts/AppContext";

import appConfig from "./__fixtures__/data-storybook";

export default {
  title: "file-management-dialog/UppyDashboardDialog",
  component: UppyDashboardDialog,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <AppContextProvider value={appConfig}>
        <WorkerProvider>
          <UppyProvider>
            <Story />
          </UppyProvider>
        </WorkerProvider>
      </AppContextProvider>
    ),
  ],
  args: {
    modalOpen: true,
    setModalOpen: () => {},
    allowedFileTypes: ["image/*", "application/pdf"],
    extraUppyDashboardProps: {},
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

export const ExistingFilesModifier = {
  args: {
    modifyExistingFiles: true,
    autoExtractImagesFromPDFs: false,
  },
};
