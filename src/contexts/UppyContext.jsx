import { useMemo } from "preact/hooks";
import { createContext } from "preact";
import Uppy from "@uppy/core";
import ImageEditor from "@uppy/image-editor";
import OARepoUpload from "../utils/uppy-plugins/oarepo-upload";
import OARepoFileSource from "../utils/uppy-plugins/oarepo-file-source";

export const UppyContext = createContext();

export const UppyProvider = ({ startEvent, children }) => {
  const uppy = useMemo(
    () => {
      let uppy = new Uppy()
        .use(OARepoUpload)
        .use(ImageEditor, {
          quality: 1.0,
        })
      startEvent ?? uppy.use(OARepoFileSource, {
        fileSources: [],
      });
      return uppy;
    },
    []
  );
  return <UppyContext.Provider value={uppy}>{children}</UppyContext.Provider>;
};
