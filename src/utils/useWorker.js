import { useContext } from "preact/hooks";
import { WorkerContext } from "../contexts/WorkerContext";

const useWorker = () => {
  const worker = useContext(WorkerContext);
  if (worker === null) {
    throw new Error("useWorker must be used within a WorkerProvider");
  }
  return worker;
};

export default useWorker;
