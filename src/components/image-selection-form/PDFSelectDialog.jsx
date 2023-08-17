import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import {
  Button,
  Grid,
  Divider,
  Dimmer,
  Loader,
  Header,
  List,
} from "semantic-ui-react";
import useWorker from "../../utils/useWorker";
import useUppyContext from "../../utils/useUppyContext";
import useAppContext from "../../utils/useAppContext";
import PropTypes from "prop-types";
import { debugLogger } from "@uppy/core";
import { DashboardModal } from "@uppy/react";

const PDFSelectDialog = () => {
  // oneMessage and postMessage in on component
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
  const [isLoading, setIsLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  const PDFRecordFiles = useMemo(
    () =>
      record.files.entries.filter(
        (fileObj) => fileObj.mimetype === "application/pdf"
      ),
    [record]
  );

  const handleUploadClick = useCallback(
    async (file) => {
      if (window.Worker) {
        if (isProcessing.current) {
          console.log("Still processing previous file.");
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
          alert("There was an error when uploading file:\n" + error);
        }
      } else {
        console.log("Web Worker is not supported");
      }
    },
    [extractImageWorker, isProcessing]
  );

  useEffect(() => {
    uppy.setOptions({
      debug: true,
      logger: debugLogger,
      restrictions: {
        allowedFileTypes: [
          "image/jpg",
          "image/jpeg",
          "image/png",
          "image/tiff",
          "application/pdf",
        ],
      },
      onBeforeFileAdded: (currentFile, _files) => {
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
      },
    });
  }, [uppy, handleUploadClick]);

  useEffect(() => {
    uppy.getPlugin("OARepoUpload")?.setOptions({
      endpoint: record.files.links.self,
    });
    /* fileSources: 
    [
      {
        id: '2151fa94-6dc3-4935-8df9-ecafgeb9175c', // file.file_id ?? file.key
        name: 'article.pdf', // file.key
        mimeType: 'application/pdf', // file.mimetype
        data: **to be downloaded**,

        isFolder: false,
        icon: null, // TODO: add icons
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
    const fileSources = record.files.entries.map((file) => ({
      id: file.file_id,
      name: file.key,
      mimeType: file.mimetype,
      isFolder: false,
      icon: "file",
      thumbnail: null,
      requestPath: file.links.content,
      modifiedDate: file.updated,
      author: null,
      size: file.size,
    }));
    console.log(fileSources, "error");
    uppy.getPlugin("OARepoFileSource")?.setOptions({
      fileSources: fileSources,
      fileTypeFilter: ["application/pdf"],
    });
  }, [uppy, record.files.entries, record.files.links.self]);

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
              message: "Oh no, something bad happened!",
              details: "There was an error when extracting images.",
            },
            "error",
            5000
          );
          return;
        }
        const imageObj = event.data;
        console.log(imageObj);
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
      console.log("Web Worker is not supported");
    }
  }, [extractImageWorker, uppy]);

  // Call an API to download the pdf file and process it using the worker
  // TODO: Needs to handle errors, tested with real API
  const downloadPdfAndProcess = async (file) => {
    setIsLoading(true);
    if (!window.Worker) {
      console.log("Web Worker is not supported");
      return;
    }
    if (isProcessing.current) {
      console.log("Still processing previous file.");
      return;
    }
    // Extract to plugin
    try {
      const response = await fetch(file.links.content);
      const data = await response.blob();
      setIsLoading(false);
      setModalOpen(true);
      uppy.addFile({
        name: file.key,
        type: data.type,
        data: data,
        source: "OARepo",
        isRemote: true,
      });
    } catch (error) {
      isProcessing.current = false;
      setIsLoading(false);
      console.log(file.key, error);
    }
  };

  return (
    <>
      <Grid.Column textAlign="center">
        <Dimmer.Dimmable dimmed={isLoading}>
          <Dimmer active={isLoading} page inverted>
            <Loader size="massive">Loading...</Loader>
          </Dimmer>
          {/* Extract to new Component = RecordFilePicker */}
          {PDFRecordFiles.length > 0 && (
            <>
              <Grid.Row>
                <Header as="h3">Choose from existing PDF Files:</Header>
                <List verticalAlign="middle" animated>
                  {PDFRecordFiles.map((file) => (
                    <List.Item key={file.key}>
                      <List horizontal>
                        <List.Item>{file.key}</List.Item>
                        <List.Item>
                          {/* RecordFilePickerItem */}
                          <Button
                            compact
                            primary
                            size="small"
                            onClick={() => downloadPdfAndProcess(file)}
                          >
                            Extract Images
                          </Button>
                        </List.Item>
                      </List>
                    </List.Item>
                  ))}
                </List>
              </Grid.Row>
              <Divider as={Grid.Row} horizontal section>
                Or
              </Divider>
            </>
          )}
          <Grid.Row>
            <Header as="h3">Upload new PDF or images:</Header>
            <DashboardModal
              uppy={uppy}
              proudlyDisplayPoweredByUppy={false}
              open={modalOpen}
              onRequestClose={() => setModalOpen(false)}
              showProgressDetails
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
              // plugins={["ImageEditor", "Unsplash", "OARepoFileSource"]}
            />
          </Grid.Row>
          <Grid.Row>
            {/* Extract to PDFImageExtractor */}
            <Button primary onClick={() => setModalOpen(true)}>
              Upload file(s)
            </Button>
          </Grid.Row>
        </Dimmer.Dimmable>
      </Grid.Column>
    </>
  );
};

PDFSelectDialog.propTypes = {
  images: PropTypes.arrayOf(
    PropTypes.shape({
      src: PropTypes.string.isRequired,
      caption: PropTypes.string.isRequired,
      isSelected: PropTypes.bool.isRequired,
      isStarred: PropTypes.bool.isRequired,
    })
  ).isRequired,
  setImages: PropTypes.func.isRequired,
  nextStep: PropTypes.func.isRequired,
};

export default PDFSelectDialog;
