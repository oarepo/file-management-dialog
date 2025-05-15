import * as React from 'react';
import { useState, Suspense, lazy } from "react";
import { createPortal } from "react-dom";
import { WorkerProvider } from "../../contexts/WorkerProvider";
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
  suspenseFallbackComponent = null,
  TriggerComponent = ({ onClick, ...props }) => (
    <button onClick={onClick} {...props}>
      {locale.startsWith("cs") ? "Vybrat Obrázky" : "Set Images"}
    </button>
  ),
}) => {
  const [modalOpen, setModalOpen] = useState(false);

  // TODO: this is a hacky approach to make pdf extraction worker toggleable
  // a bigger refactor is needed
  const UppyWrapper = autoExtractImagesFromPDFs ? WorkerProvider : React.Fragment;

  return (
    <>
      <TriggerComponent onClick={() => setModalOpen(!modalOpen)} />
      <AppContextProvider value={config}>
        <UppyWrapper>
          <Suspense
            fallback={suspenseFallbackComponent}
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
        </UppyWrapper>
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
  suspenseFallbackComponent: PropTypes.element,
  TriggerComponent: PropTypes.elementType,
};

export default FileManagementDialog;
