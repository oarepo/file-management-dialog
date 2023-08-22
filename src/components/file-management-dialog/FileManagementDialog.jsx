import { useState, lazy, Suspense } from "react";
import { WorkerProvider } from "../../contexts/WorkerContext";
import { UppyProvider } from "../../contexts/UppyContext";
import { AppContextProvider } from "../../contexts/AppContext";
import PropTypes from "prop-types";

const UppyDashboardDialog = lazy(() => import("./UppyDashboardDialog"));

// eslint-disable-next-line react/prop-types
const FileManagementDialog = ({
  config,
  TriggerComponent = ({ onClick, ...props }) => (
    <button onClick={onClick} {...props}>
      Set images
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
  TriggerComponent: PropTypes.elementType,
};

export default FileManagementDialog;
