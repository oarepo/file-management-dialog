/* eslint-disable react/prop-types */
import { createContext, useMemo } from "react";
import Uppy from "@uppy/core";
import ImageEditor from "@uppy/image-editor";
import OARepoUpload from "../utils/uppy-plugins/oarepo-upload";
import OARepoFileSource from "../utils/uppy-plugins/oarepo-file-source";
// import Unsplash from "../utils/uppy-plugins/oarepo-file-source/Unsplash";

export const UppyContext = createContext();

export const UppyProvider = ({ children }) => {
  const uppy = useMemo(
    () =>
      new Uppy()
        .use(OARepoFileSource, {
          fileSources: [],
        })
        .use(OARepoUpload)
        .use(ImageEditor, {
          quality: 1.0,
        }),
    []
  );
  return <UppyContext.Provider value={uppy}>{children}</UppyContext.Provider>;
};
