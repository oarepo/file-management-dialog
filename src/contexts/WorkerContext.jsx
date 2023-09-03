/* eslint-disable react/prop-types */
import { useMemo, createContext } from "react";
import ExtractImagesWorker from "../workers/extract-images-worker?worker";

export const WorkerContext = createContext(null);

export const WorkerProvider = ({ children }) => {
  const worker = useMemo(() => {
    const extractImagesWorker = new ExtractImagesWorker();
    return extractImagesWorker;
  }, []);
  return (
    <WorkerContext.Provider value={worker}>{children}</WorkerContext.Provider>
  );
};
