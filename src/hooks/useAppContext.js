import { useContext } from "preact/hooks";
import { AppContext } from "../contexts/AppContext";

const useAppContext = () => {
  const appData = useContext(AppContext);
  if (appData === null) {
    throw new Error("useWorker must be used within a WorkerProvider");
  }
  return appData;
};

export default useAppContext;
