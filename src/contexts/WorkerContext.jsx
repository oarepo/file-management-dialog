import { useMemo, createContext } from "react";
import ExtractImagesWorker from "../workers/extract-images-worker?worker&inline";

export const WorkerContext = createContext(null);

export const WorkerProvider = ({ children }) => {
  const worker = useMemo(() => ExtractImagesWorker(), []);
  return (
    <WorkerContext.Provider value={worker}>{children}</WorkerContext.Provider>
  );
};
