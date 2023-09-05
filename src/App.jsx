import FileManagementDialog from "./components/file-management-dialog";
import PropTypes from "prop-types";

function App({
  config,
  modifyExistingFiles = false,
  allowedFileTypes = [
    "image/jpg",
    "image/jpeg",
    "image/png",
    "image/tiff",
    "application/pdf",
  ],
  autoExtractImagesFromPDFs = true,
  extraUppyDashboardProps = {},
  debug = true,
}) {
  return (
    <FileManagementDialog
      config={config}
      modifyExistingFiles={modifyExistingFiles}
      allowedFileTypes={allowedFileTypes}
      autoExtractImagesFromPDFs={autoExtractImagesFromPDFs}
      extraUppyDashboardProps={extraUppyDashboardProps}
      debug={debug}
    />
  );
}

App.propTypes = {
  config: PropTypes.object.isRequired,
  modifyExistingFiles: PropTypes.bool,
  allowedFileTypes: PropTypes.arrayOf(PropTypes.string),
  autoExtractImagesFromPDFs: PropTypes.bool,
  extraUppyDashboardProps: PropTypes.object,
  debug: PropTypes.bool,
};

export default App;
