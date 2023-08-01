/* eslint-disable react/prop-types */
import { useMemo, createContext } from "react";

export const WorkerContext = createContext(null);

export const WorkerProvider = ({ children }) => {
  const worker = useMemo(
    () =>
      new Worker(
        new URL("/src/workers/extract-images-worker.js", import.meta.url)
      ),
    []
  );
  return (
    <WorkerContext.Provider value={worker}>{children}</WorkerContext.Provider>
  );
};
