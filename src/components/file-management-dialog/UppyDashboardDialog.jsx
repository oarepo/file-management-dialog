import "@uppy/core/dist/style.min.css";
import "@uppy/dashboard/dist/style.min.css";
import "@uppy/image-editor/dist/style.min.css";

import { useEffect, useRef, useCallback } from "preact/hooks";
import useWorker from "../../utils/useWorker";
import useUppyContext from "../../utils/useUppyContext";
import useAppContext from "../../utils/useAppContext";
import { debugLogger } from "@uppy/core";
import { DashboardModal } from "@uppy/react";
import PropTypes from "prop-types";

const UppyDashboardDialog = ({
  modalOpen,
  setModalOpen,
  modifyExistingFiles,
  allowedFileTypes,
  autoExtractImagesFromPDFs,
  extraUppyDashboardProps,
  debug,
}) => {
  const extractImageWorker = useWorker();
  const uppy = useUppyContext();
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
  //     featureImage: true,
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
          this.uppy.info("Still processing previous file.", "info", 3000);
          return;
        }
        // TODO: Alert error only in Debug
        try {
          const data = await file.data.arrayBuffer();
          extractImageWorker.postMessage(
            {
              pdfFileName: file.name,
              data: data,
            },
            [data]
          );
          isProcessing.current = true;
        } catch (error) {
          isProcessing.current = false;
          uppy.info(
            "There was an error when uploading file:\n" + error,
            "error",
            5000
          );
        }
      } else {
        uppy.info("Web Worker is not supported", "info", 5000);
      }
    },
    [uppy, extractImageWorker, isProcessing]
  );

  useEffect(() => {
    uppy.setOptions({
      debug: debug,
      logger: debug
        ? debugLogger
        : {
            debug: (...args) => {},
            warn: (...args) => {},
            error: (...args) => {
              console.error(...args);
            },
          },
      restrictions: {
        allowedFileTypes: allowedFileTypes,
      },
      onBeforeUpload: (files) => {
        const updatedFiles = {};
        // TODO: add required metadata fields (for certain fileTypes) to prop settings of this component
        Object.keys(files).forEach((fileID) => {
          const file = files[fileID];
          updatedFiles[fileID] = file.type.startsWith("image/")
            ? {
                ...file,
                meta: {
                  ...file.meta,
                  caption: file.meta?.caption ?? "",
                  featureImage: file.meta?.featureImage ?? false,
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
                  "PDF image extraction processing, please wait...",
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
  }, [
    uppy,
    handleUploadClick,
    modifyExistingFiles,
    allowedFileTypes,
    autoExtractImagesFromPDFs,
    debug,
  ]);

  useEffect(() => {
    uppy.getPlugin("OARepoUpload")?.setOptions({
      endpoint: record.files.enabled ? record.files.links.self : record.links.files,
      allowedMetaFields: ["caption", "featureImage"],
    });
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
    const fileSources = record?.files?.enabled ? record?.files?.entries.map((file) => ({
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
    })) : [];
    uppy.getPlugin("OARepoFileSource")?.setOptions({
      fileSources: fileSources,
      fileTypeFilter: !modifyExistingFiles ? ["application/pdf"] : null,
    });
  }, [
    uppy,
    record.files?.entries,
    record.files?.links?.self,
    modifyExistingFiles,
  ]);

  useEffect(() => {
    // after PDFImageExtractor Extract Images button is clicked, register onmessage callback
    if (window.Worker) {
      extractImageWorker.onmessage = (event) => {
        if (event.data?.type === "done") {
          isProcessing.current = false;
          uppy.info("Image extraction completed.", "success", 3000);
          return;
        } else if (event.data?.type === "error") {
          isProcessing.current = false;
          uppy.info(
            {
              message: `Error extracting images from ${event.data.sourcePdf}`,
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
          name: `${imageObj.sourcePdf}_${crypto.randomUUID()}.${
            event.data.imageType
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
      uppy.info("Web Worker is not supported.", "error", 5000);
    }
  }, [extractImageWorker, uppy, debug]);

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
        closeModalOnClickOutside
        showProgressDetails
        note={
          modifyExistingFiles
            ? "Select existing files to modify metadata."
            : "Select files to upload."
        }
        disableLocalFiles={modifyExistingFiles}
        metaFields={(file) => {
          const fields = [];
          if (file.type.startsWith("image/")) {
            fields.push({
              id: "caption",
              name: "Caption",
              placeholder: "Set the Caption here",
            });
            fields.push({
              id: "featureImage",
              name: "Feature Image",
              render: ({ value, onChange, required, form }, h) => {
                return h("input", {
                  type: "checkbox",
                  onChange: (ev) => onChange(ev.target.checked),
                  defaultChecked: value === "on",
                  required,
                  form,
                });
              },
            });
          }
          return fields;
        }}
        plugins={["ImageEditor", "OARepoFileSource"]}
      />
    </>
  );
};

UppyDashboardDialog.propTypes = {
  modalOpen: PropTypes.bool.isRequired,
  setModalOpen: PropTypes.func.isRequired,
  modifyExistingFiles: PropTypes.bool,
  allowedFileTypes: PropTypes.arrayOf(PropTypes.string),
  autoExtractImagesFromPDFs: PropTypes.bool,
  extraUppyDashboardProps: PropTypes.object,
  debug: PropTypes.bool,
};

export default UppyDashboardDialog;
