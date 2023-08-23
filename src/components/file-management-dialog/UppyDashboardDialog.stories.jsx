import UppyDashboardDialog from "./UppyDashboardDialog";
import { WorkerProvider } from "../../contexts/WorkerContext";
import { UppyProvider } from "../../contexts/UppyContext";
import { AppContextProvider } from "../../contexts/AppContext";
import appConfig from "../../../data-storybook.json";

export default {
  title: 'file-management-dialog/UppyDashboardDialog',
  component: UppyDashboardDialog,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
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
  },
};

export const NewFilesUploader = {
  args: {
    modifyExistingFiles: false,
  },
};

export const ExistingFilesModifier = {
  args: {
    modifyExistingFiles: true,
  },
};
