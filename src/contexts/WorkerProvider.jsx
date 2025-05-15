import * as React from 'react';
import { WorkerContext } from "./WorkerContext";

export const WorkerProvider = ({ children }) => {
  const [worker, setWorker] = React.useState();

  React.useEffect(() => {
    const installWorker = async () => {
        const worker = await import("../workers/extract-images-worker?worker&inline");
        setWorker(worker.default);
    }

    installWorker();
  }, [])

  return (
    <WorkerContext.Provider value={worker}>{children}</WorkerContext.Provider>
  );
};
