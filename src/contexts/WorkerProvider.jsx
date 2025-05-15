import { useMemo } from "react";
import ExtractImagesWorker from "../workers/extract-images-worker?worker&inline";
import { WorkerContext } from "./WorkerContext";

export const WorkerProvider = ({ children }) => {
  const worker = useMemo(() => ExtractImagesWorker(), []);
  return (
    <WorkerContext.Provider value={worker}>{children}</WorkerContext.Provider>
  );
};
