import { useContext } from "react";
import { RefContext } from "../contexts/RefContext";

const useRefContext = () => {
  const ref = useContext(RefContext);
  if (ref === null) {
    throw new Error("useRefContext must be used within a RefProvider");
  }
  return ref;
};

export default useRefContext;
