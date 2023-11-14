import { useState } from "preact/hooks";
import { Suspense, lazy } from 'preact/compat';
import { WorkerProvider } from "../../contexts/WorkerContext";
import { UppyProvider } from "../../contexts/UppyContext";
import { AppContextProvider } from "../../contexts/AppContext";
import PropTypes from "prop-types";

const UppyDashboardDialog = lazy(() => import("./UppyDashboardDialog"));

const FileManagementDialog = ({
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
  locale = "en_US",
  extraUppyDashboardProps = {},
  debug = false,
  TriggerComponent = ({ onClick, ...props }) => (
    <button onClick={onClick} {...props}>
      {locale.startsWith("cs") ? "Vybrat Obrázky" : "Set Images"}
    </button>
  ),
}) => {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <TriggerComponent onClick={() => setModalOpen(!modalOpen)} />
      <AppContextProvider value={config}>
        <WorkerProvider>
          <Suspense
            fallback={
              <div>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  height="1em"
                  viewBox="0 0 512 512"
                >
                  <path d="M304 48a48 48 0 1 0 -96 0 48 48 0 1 0 96 0zm0 416a48 48 0 1 0 -96 0 48 48 0 1 0 96 0zM48 304a48 48 0 1 0 0-96 48 48 0 1 0 0 96zm464-48a48 48 0 1 0 -96 0 48 48 0 1 0 96 0zM142.9 437A48 48 0 1 0 75 369.1 48 48 0 1 0 142.9 437zm0-294.2A48 48 0 1 0 75 75a48 48 0 1 0 67.9 67.9zM369.1 437A48 48 0 1 0 437 369.1 48 48 0 1 0 369.1 437z" />
                </svg>
              </div>
            }
          >
            {modalOpen && (
              <UppyProvider>
                <UppyDashboardDialog
                  modalOpen={modalOpen}
                  setModalOpen={setModalOpen}
                  modifyExistingFiles={modifyExistingFiles}
                  allowedFileTypes={allowedFileTypes}
                  autoExtractImagesFromPDFs={autoExtractImagesFromPDFs}
                  locale={locale}
                  extraUppyDashboardProps={extraUppyDashboardProps}
                  debug={debug}
                />
              </UppyProvider>
            )}
          </Suspense>
        </WorkerProvider>
      </AppContextProvider>
    </>
  );
};

FileManagementDialog.propTypes = {
  config: PropTypes.object.isRequired,
  modifyExistingFiles: PropTypes.bool,
  allowedFileTypes: PropTypes.arrayOf(PropTypes.string),
  autoExtractImagesFromPDFs: PropTypes.bool,
  locale: PropTypes.oneOf(["cs_CZ", "en_US"]),
  extraUppyDashboardProps: PropTypes.object,
  debug: PropTypes.bool,
  TriggerComponent: PropTypes.elementType,
};

export default FileManagementDialog;
