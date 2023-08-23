import FileManagementDialog from "./FileManagementDialog";
import appConfig from "../../../data-storybook.json";

export default {
  title: 'file-management-dialog/FileManagementDialog',
  component: FileManagementDialog,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  args: {
    config: appConfig,
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
