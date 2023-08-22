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
          <UppyProvider>
            <Suspense fallback={<div>Loading...</div>}>
              {modalOpen && (
                <UppyDashboardDialog
                  modalOpen={modalOpen}
                  setModalOpen={setModalOpen}
                />
              )}
            </Suspense>
          </UppyProvider>
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
