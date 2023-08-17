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
      new Uppy({
        // debug: true,
        // restrictions: {
        //   allowedFileTypes: [
        //     "image/jpg",
        //     "image/jpeg",
        //     "image/png",
        //     "image/tiff",
        //     "application/pdf",
        //   ],
        // },
        // onBeforeFileAdded: (currentFile, files) => {
        //   // Handle (one) .pdf and multiple images (jpg, jpeg, png, tiff) only
        //   // const filesArr = Object.values(files);
        //   // if (filesArr.length > 1) {
        //   //   for (let i = 0; i < filesArr.length; i++) {
        //   //     if (!filesArr[i].type.startsWith("image/")) {
        //   //       uppy.info(
        //   //         "Multiple files must be images, please try again.",
        //   //         "error",
        //   //         5000
        //   //       );
        //   //       return false;
        //   //     }
        //   //   }
        //   // }
        //   if (currentFile.type === "application/pdf") {
        //     uppy.info(
        //       "PDF image extraction processing, please wait...",
        //       "info",
        //       5000
        //     );
        //     return false;
        //   }
        //   return true;
        // },
      })
        .use(OARepoFileSource, {
          fileSources: [],
        })
        // .use(Unsplash, {
        //   companionUrl: "http://localhost:5000",
        // })
        .use(OARepoUpload)
        .use(ImageEditor, {
          quality: 1.0,
        }),
    []
  );
  return <UppyContext.Provider value={uppy}>{children}</UppyContext.Provider>;
};
