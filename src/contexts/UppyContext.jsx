import { useMemo } from "preact/hooks";
import { createContext } from "preact";
import Uppy from "@uppy/core";
import ImageEditor from "@uppy/image-editor";
import OARepoUpload from "../utils/uppy-plugins/oarepo-upload";

export const UppyContext = createContext();

export const UppyProvider = ({ children }) => {
  const uppy = useMemo(
    () => {
      let uppy = new Uppy()
        .use(OARepoUpload)
        .use(ImageEditor, {
          quality: 1.0,
        })
      // NOTE: Future development
      // startEvent ?? uppy.use(OARepoFileSource, {
      //   fileSources: [],
      // });
      return uppy;
    },
    []
  );
  return <UppyContext.Provider value={uppy}>{children}</UppyContext.Provider>;
};
