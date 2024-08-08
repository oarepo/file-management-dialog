import { useContext } from "preact/hooks";
import { UppyContext } from "../contexts/UppyContext";

const useUppyContext = () => {
  const uppy = useContext(UppyContext);
  if (uppy === null) {
    throw new Error("useUppyContext must be used within a UppyProvider");
  }
  return uppy;
};

export default useUppyContext;
