import "@uppy/core/dist/style.min.css";
import "@uppy/dashboard/dist/style.min.css";
import "@uppy/image-editor/dist/style.min.css";

import { useEffect, useRef, useCallback } from "react";
import { useUppyContext, useAppContext, useWorker } from "../../hooks";
import czechLocale from "../../utils/locales/czechLocale";
import englishLocale from "../../utils/locales/englishLocale";
import { waitForElement, delay } from "../../utils/helpers";

import { debugLogger } from "@uppy/core";
import { DashboardModal } from "@uppy/react";
import en_US from "@uppy/locales/lib/en_US";
import cs_CZ from "@uppy/locales/lib/cs_CZ";

import PropTypes from "prop-types";

const UppyDashboardDialog = ({
  modalOpen,
  setModalOpen,
  modifyExistingFiles,
  allowedFileTypes,
  allowedMetaFields,
  autoExtractImagesFromPDFs,
  locale,
  extraUppyDashboardProps,
  extraUppyCoreSettings,
  startEvent,
  debug,
  onCompletedUpload,
}) => {
  /** @type {import("@uppy/core").Uppy} */
  const uppy = useUppyContext();
  const extractImageWorker = useWorker();
  const { record } = useAppContext().current;

  const isProcessing = useRef(false);

  // RecordFile object:
  // {
  //   key: "figure.png",
  //   updated: "2020-11-27 11:26:04.607831",
  //   created: "2020-11-27 11:17:10.998919",
  //   checksum: "md5:6ef4267f0e710357c895627e931f16cd",
  //   mimetype: "image/png",
  //   size: 89364.0,
  //   status: "completed",
  //   metadata: {
  //     caption: "Figure 1",
  //     featured: true,
  //     fileNote: "Reference image for the article.",
  //     fileType: "photo",
  //   },
  //   file_id: "2151fa94-6dc3-4965-8df9-ec73ceb9175c",
  //   version_id: "57ad8c66-b934-49c9-a46f-38bf5aa0374f",
  //   bucket_id: "90b5b318-114a-4b87-bc9d-0d018b9363d3",
  //   storage_class: "S",
  //   links: {
  //     content: `/api/records/${query.id}/draft/files/figure.png/content`,
  //     self: `/api/records/${query.id}/draft/files/figure.png`,
  //     commit: `/api/records/${query.id}/draft/files/figure.png/commit`,
  //   },
  // }
  const handleUploadClick = useCallback(
    async (file) => {
      if (window.Worker) {
        if (isProcessing.current) {
          uppy.info(uppy.i18n("Still processing previous file."), "info", 3000);
          return;
        }
        // TODO: Alert error only in Debug
        try {
          const data = await file.data.arrayBuffer();
          extractImageWorker.postMessage(
            {
              pdfFileName: file.name,
              data: data,
              debug: debug,
            },
            [data]
          );
          isProcessing.current = true;
        } catch (error) {
          isProcessing.current = false;
          uppy.info(
            `${uppy.i18n("There was an error when uploading file")}:\n ${error}`,
            "error",
            5000
          );
        }
      } else {
        uppy.info(uppy.i18n("Web Worker is not supported"), "info", 5000);
      }
    },
    [uppy, extractImageWorker, isProcessing]
  );

  useEffect(() => {
    // Extending Uppy's default locales with custom locales found in src/utils/locales
    const customLocale = locale?.startsWith("cs") ?
      {
        strings: Object.assign(cs_CZ.strings, czechLocale.strings)
      } : {
        strings: Object.assign(en_US.strings, englishLocale.strings)
      };
    
    uppy.setOptions({
      ...extraUppyCoreSettings,
      debug: debug,
      logger: debug
        ? debugLogger
        : { // Logging only errors in production
          debug: (...args) => { },
          warn: (...args) => { },
          error: (...args) => {
            console.error(...args);
          },
        },
      locale: customLocale,
      allowMultipleUploadBatches: startEvent?.event === "edit-file" ? false : true,
      restrictions: {
        allowedFileTypes: allowedFileTypes,
        maxNumberOfFiles: startEvent?.event === "edit-file" ? 1 : null,
      },
      onBeforeUpload: (files) => {
        const updatedFiles = {};
        // TODO: add required metadata fields (for certain fileTypes) to prop settings of this component
        Object.keys(files).forEach((fileID) => {
          const file = files[fileID];
          const fileNoteField = allowedMetaFields.find((field) => field.id === "fileNote");
          if (fileNoteField) {
            file.meta.fileNote = file.meta.fileNote ?? fileNoteField.defaultValue ?? "";
          }
          updatedFiles[fileID] = file.type.startsWith("image/")
            ? {
              ...file,
              meta: {
                ...file.meta,
                // Assign default values to input metaFields (if not already set)
                // Also assign default values to other (not rendered) metaFields
                ...Object.assign({}, ...allowedMetaFields.map((field) => ({
                  [field.id]: file.meta?.[field.id] ?? field.defaultValue,
                }))),
              },
            }
            : file;
        });
        return updatedFiles;
      },
      onBeforeFileAdded:
        !modifyExistingFiles && autoExtractImagesFromPDFs
          ? // eslint-disable-next-line no-unused-vars
          (currentFile, _files) => {
            if (currentFile.type === "application/pdf") {
              uppy.info(
                uppy.i18n("PDF image extraction processing, please wait..."),
                "info",
                3000
              );
              handleUploadClick(currentFile);
              return false;
            }
            return true;
          }
          : () => true,
    });

    uppy.on('complete', (result) => {
      onCompletedUpload && typeof onCompletedUpload === "function" && onCompletedUpload(result);
    });

    if (startEvent?.event == "edit-file") {
      uppy.on("dashboard:file-edit-start", async (file) => {
        const saveChangesButton = await waitForElement(".uppy-Dashboard-FileCard-actions > button[type=submit]");
        const uploadCallback = async () => {
          await delay(100); // Wait for the Uppy file.meta state to update
          uppy.upload();
        };
        saveChangesButton.addEventListener("click", uploadCallback);
        uppy.on("complete", (result) => {
          saveChangesButton.removeEventListener("click", uploadCallback);
        });
      });
    }
  }, [
    uppy,
    handleUploadClick,
    modifyExistingFiles,
    allowedFileTypes,
    autoExtractImagesFromPDFs,
    debug,
  ]);

  useEffect(() => {
    /* fileSources: 
    [
      {
        id: '2151fa94-6dc3-4935-8df9-ecafgeb9175c', // file.file_id ?? file.key
        name: 'article.pdf', // file.key
        mimeType: 'application/pdf', // file.mimetype
        data: **to be downloaded**,

        isFolder: false,
        icon: "file", // TODO: add icons
        thumbnail: null // TODO: add thumbnail URLs to preview images
        requestPath: "http://localhost:5173/api/records/8t29q-nfr77/files/figure.png/content", // file.links.content
        modifiedDate: "2020-11-27 11:26:04.607831", // file.updated ?? null
        author: null,
        size: 782683, file.size ?? null
        ...
      },
      ...
    ]
    */
    const setUpOARepoFileSourcePlugin = (fileSources) => {
      uppy.getPlugin("OARepoFileSource")?.setOptions({
        fileSources: fileSources,
        fileTypeFilter: !modifyExistingFiles ? ["application/pdf"] : null,
        locale: locale?.startsWith("cs") ? czechLocale : {},
      });
    };

    const mapFilesToFileSources = (fileEntries) => {
      return fileEntries.map((file) => ({
        id: file?.file_id,
        name: file?.key,
        mimeType: file?.mimetype,
        isFolder: false,
        icon: "file",
        thumbnail: null,
        requestPath: file?.links?.content,
        modifiedDate: file?.updated,
        author: null,
        size: file?.size,
        metadata: file?.metadata,
      }));
    };

    const getTagFile = (file) => ({
      id: file.id,
      source: "OARepo",
      data: null,
      name: file.name || file.id,
      type: file.mimeType,
      isRemote: false,
      meta: file.metadata || {},
      body: {
        fileId: file.id,
      },
    });

    const addUppyFileObj = (fileSources) => {
      const file = fileSources.find(file => file.name === startEvent?.data?.file_key);
      const uppyFileObj = getTagFile(fileSources.find(file => file.name === startEvent?.data?.file_key));
      fetch(file.requestPath)
        .then((response) => {
          if (!response.ok)
            throw new Error(response.statusText);
          return response.blob();
        })
        .then((fileData) => {
          uppyFileObj.data = fileData;
          uppy.addFile(uppyFileObj);
        })
        .catch((error) => {
          if (error instanceof Error && 
            error?.message === "Cannot add the file because onBeforeFileAdded returned false." &&
            error?.file?.type === "application/pdf") 
            return;
          uppy.info({
            message: uppy.i18n("Error loading file with key") + ` ${startEvent?.data?.file_key}.`,
            details: error.message,
          }, "error", 7000);
        });
    }

    const validEventSpecified =
      startEvent?.event === "edit-file" ||
      startEvent?.event === "upload-images-from-pdf" ||
      startEvent?.event === "upload-file-without-edit";
    let fileSources = [];
    if (record.files?.enabled) {
      if (!record.files.entries) {
        fetch(record.links.files)
          .then((response) => {
            if (!response.ok)
              throw new Error(response.statusText);
            return response.json();
          })
          .then((data) => {
            fileSources = mapFilesToFileSources(data?.entries ?? []);
          })
          .catch((error) => {
            uppy.info({
              message: uppy.i18n("Error loading files."),
              details: error.message,
            }, "error", 7000);
          })
          .finally(() => {
            if (validEventSpecified) {
              startEvent?.event !== "upload-file-without-edit" && addUppyFileObj(fileSources);
            } else {
              setUpOARepoFileSourcePlugin(fileSources);
            }
          });
      } else {
        fileSources = mapFilesToFileSources(record.files.entries);
        if (validEventSpecified) {
          startEvent?.event !== "upload-file-without-edit" && addUppyFileObj(fileSources);
        } else {
          setUpOARepoFileSourcePlugin(fileSources);
        }
      }
    } else {
      if (validEventSpecified) {
        startEvent?.event !== "upload-file-without-edit" && addUppyFileObj(fileSources);
      } else {
        setUpOARepoFileSourcePlugin(fileSources);
      }
    }
  }, [
    uppy,
    record.files,
    record.links?.files,
    modifyExistingFiles,
    locale,
  ]);

  useEffect(() => {
    uppy.getPlugin("OARepoUpload")?.setOptions({
      endpoint: record.files?.enabled ? record.links.files : record.files.links.self,
      allowedMetaFields: allowedMetaFields.map((field) => field.id),
      deleteBeforeUpload: (modifyExistingFiles || startEvent?.event === "edit-file") ? true : false,
      locale: locale?.startsWith("cs") ? czechLocale : {},
    });
  }, [
    uppy,
    record.files,
    record.links?.files,
    locale,
  ]);

  useEffect(() => {
    // after PDFImageExtractor Extract Images button is clicked, register onmessage callback
    if (window.Worker) {
      extractImageWorker.onmessage = (event) => {
        if (event.data?.type === "done") {
          isProcessing.current = false;
          uppy.info(`[${event.data.sourcePdf}] ${uppy.i18n("Image extraction completed")}. ${uppy.i18n("Image count")}: ${event.data.imageCount}`, "success", 5000);
          return;
        } else if (event.data?.type === "error") {
          isProcessing.current = false;
          uppy.info(
            {
              message: `${uppy.i18n("Error extracting images from")} ${event.data.sourcePdf}`,
              details: `${event.data.message}`,
            },
            "error",
            7000
          );
          return;
        }
        const imageObj = event.data;
        if (debug) console.log(imageObj);
        const blob = new Blob([imageObj.imageData], {
          type: `image/${imageObj.imageType}`,
        });
        uppy.addFile({
          name: `${imageObj.sourcePdf}_${crypto.randomUUID()}.${event.data.imageType
            }`,
          type: `image/${imageObj.imageType}`,
          data: blob,
          source: "PDFImageExtractor", // pdfimageextractor
          isRemote: false,
        });
      };
      // Handle errors (never fires ???)
      extractImageWorker.onerror = (event) => {
        isProcessing.current = false;
        alert("Error: " + event.message);
      };
    } else {
      uppy.info(uppy.i18n("Web Worker is not supported"), "error", 5000);
    }
  }, [extractImageWorker, uppy, debug]);

  const manualI18n = (key) => {
    const localeStrings = locale?.startsWith("cs") ? czechLocale.strings : englishLocale.strings;
    return localeStrings[key];
  }

  return (
    <>
      <DashboardModal
        {...extraUppyDashboardProps}
        uppy={uppy}
        open={modalOpen}
        onRequestClose={() => {
          isProcessing.current = false;
          uppy.cancelAll();
          setModalOpen(false);
        }}
        autoOpen={startEvent?.event === "edit-file" ? "metaEditor" : null}
        hideUploadButton={startEvent?.event === "edit-file" ? true : false}
        showProgressDetails
        note={
          modifyExistingFiles
            ? manualI18n("Select existing files to modify metadata.")
            : manualI18n("Select files to upload.")
        }
        disableLocalFiles={modifyExistingFiles}
        // TODO: Fix "Retry" button functionality
        hideRetryButton
        showSelectedFiles={startEvent?.event === "upload-file-without-edit" ? false : true}
        // closeAfterFinish={startEvent?.event === "upload-file-without-edit" ? true : false}
        hideCancelButton={startEvent?.event === "edit-file" ? true : false}
        // TODO: add custom metaFields renderers (for isUserInput=true metaFields) to prop settings of this component
        metaFields={(file) => {
          const fields = [];
          allowedMetaFields.some((field) => field.id === "fileNote") && fields.push({
            id: "fileNote",
            name: manualI18n("File Note"),
            placeholder: manualI18n("Set the file Note here"),
          });
          if (file.type.startsWith("image/")) {
            allowedMetaFields.some((field) => field.id === "caption") && fields.push({
              id: "caption",
              name: manualI18n("Caption"),
              placeholder: manualI18n("Set the Caption here"),
            });
            allowedMetaFields.some((field) => field.id === "featured") && fields.push({
              id: "featured",
              name: manualI18n("Feature Image"),
              render: ({ value, onChange, required, form }, h) => {
                return h("input", {
                  type: "checkbox",
                  onChange: (ev) => onChange(ev.target.checked),
                  checked: value,
                  defaultChecked: value,
                  required,
                  form,
                });
              },
            });
          }
          return fields;
        }}
        plugins={["ImageEditor"]}
      />
    </>
  );
};

UppyDashboardDialog.propTypes = {
  modalOpen: PropTypes.bool.isRequired,
  setModalOpen: PropTypes.func.isRequired,
  modifyExistingFiles: PropTypes.bool,
  allowedFileTypes: PropTypes.arrayOf(PropTypes.string),
  allowedMetaFields: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    defaultValue: PropTypes.any.isRequired,
    isUserInput: PropTypes.bool.isRequired,
  })),
  autoExtractImagesFromPDFs: PropTypes.bool,
  extraUppyCoreSettings: PropTypes.object,
  startEvent: PropTypes.shape({
    event: PropTypes.oneOf(["edit-file", "upload-file-without-edit", "upload-images-from-pdf"]).isRequired,
    data: PropTypes.object,
  }),
  locale: PropTypes.oneOf(["cs_CZ", "en_US"]),
  extraUppyDashboardProps: PropTypes.object,
  onCompletedUpload: PropTypes.func,
  debug: PropTypes.bool,
};

export default UppyDashboardDialog;
