import { useState } from "preact/hooks";
import { Suspense, lazy, createPortal } from 'preact/compat';
import { WorkerProvider } from "../../contexts/WorkerContext";
import { UppyProvider } from "../../contexts/UppyContext";
import { AppContextProvider } from "../../contexts/AppContext";
import PropTypes from "prop-types";

const UppyDashboardDialog = lazy(() => import("./UppyDashboardDialog"));

const FileManagementDialog = ({
  config,
  modifyExistingFiles = false,
  allowedFileTypes = [
    "image/*",
    "application/pdf",
  ],
  allowedMetaFields = [
    { id: "caption", defaultValue: "", isUserInput: true },
    { id: "featured", defaultValue: false, isUserInput: true },
    { id: "fileNote", defaultValue: "", isUserInput: true },
    { id: "fileType", defaultValue: "", isUserInput: false },
  ],
  autoExtractImagesFromPDFs = true,
  locale = "en_US",
  extraUppyDashboardProps = {},
  extraUppyCoreSettings = {},
  startEvent = null,
  debug = false,
  onCompletedUpload = (...args) => { },
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
                {createPortal(
                  <UppyDashboardDialog
                    modalOpen={modalOpen}
                    setModalOpen={setModalOpen}
                    modifyExistingFiles={modifyExistingFiles}
                    allowedFileTypes={allowedFileTypes}
                    allowedMetaFields={allowedMetaFields}
                    autoExtractImagesFromPDFs={autoExtractImagesFromPDFs}
                    extraUppyCoreSettings={extraUppyCoreSettings}
                    startEvent={startEvent}
                    locale={locale}
                    extraUppyDashboardProps={extraUppyDashboardProps}
                    debug={debug}
                    onCompletedUpload={onCompletedUpload}
                  />,
                  document.body
                )}
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
  allowedMetaFields: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    defaultValue: PropTypes.any.isRequired,
    isUserInput: PropTypes.bool.isRequired,
  })),
  autoExtractImagesFromPDFs: PropTypes.bool,
  locale: PropTypes.oneOf(["cs_CZ", "en_US"]),
  extraUppyDashboardProps: PropTypes.object,
  extraUppyCoreSettings: PropTypes.object,
  startEvent: PropTypes.shape({
    event: PropTypes.oneOf(["edit-file", "upload-file-without-edit", "upload-images-from-pdf"]).isRequired,
    data: PropTypes.object,
  }),
  debug: PropTypes.bool,
  onCompletedUpload: PropTypes.func,
  TriggerComponent: PropTypes.elementType,
};

export default FileManagementDialog;
