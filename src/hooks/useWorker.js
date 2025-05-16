import { useContext } from "react";
import { WorkerContext } from "../contexts/WorkerContext";

const useWorker = () => {
  const worker = useContext(WorkerContext);
  // TODO: Extraction worker context shouldn't be there when
  // autoExtract feature is disabled
  //
  // if (worker === null) {
  //   throw new Error("useWorker must be used within a WorkerProvider");
  // }
  return worker;
};

export default useWorker;
