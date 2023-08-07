import { useState, useEffect } from "react";
import {
  Button,
  Input,
  Label,
  Icon,
  Grid,
  Divider,
  Dimmer,
  Loader,
  Header,
  List,
} from "semantic-ui-react";
import useWorker from "../../utils/useWorker";
import useRefContext from "../../utils/useRefContext";
import useAppContext from "../../utils/useAppContext";
import PropTypes from "prop-types";

const FileSelectDialog = ({ images, setImages, nextStep }) => {
  const extractImageWorker = useWorker();
  const isProcessing = useRefContext();
  const { baseUrl, recordId } = useAppContext().current;

  const [file, setFile] = useState(null);
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
  const [recordFiles, setRecordFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Load all .pdf files from the server and store them in recordFiles
  useEffect(() => {
    setIsLoading(true);
    fetch(`${baseUrl}/records/${recordId}/files`)
      .then((response) => response.json())
      .then((data) => {
        // Store only PDF files
        setRecordFiles(
          data.entries.filter((file) => file.mimetype === "application/pdf")
        );
        setIsLoading(false);
      })
      .catch((error) => {
        setIsLoading(false);
        alert("There was an error when loading file list: \n" + error);
      });
    return () => {
      setIsLoading(false);
    };
  }, [baseUrl, recordId]);

  useEffect(() => {
    if (window.Worker) {
      extractImageWorker.onmessage = (event) => {
        if (event.data === "done") {
          isProcessing.current = false;
          return;
        } else if (event.data === "error") {
          isProcessing.current = false;
          alert("There was an error when finding images.");
          return;
        }
        console.log(event.data);
        const imageSrc = URL.createObjectURL(
          new Blob([event.data.imageData], {
            type: `image/${event.data.imageType}`,
          })
        );
        const imageObj = {
          src: imageSrc,
          fileName: `${
            file.name.split(".")[0] ?? file.name
          }_${crypto.randomUUID()}.${event.data.imageType}`,
          imageType: event.data.imageType,
          caption: "",
          isSelected: false,
          isStarred: false,
        };
        setImages((images) => [...images, imageObj]);
        nextStep();
      };
      // Handle errors (never fires ???)
      extractImageWorker.onerror = (event) => {
        isProcessing.current = false;
        alert("Error: " + event.message);
      };
    } else {
      console.log("Web Worker is not supported");
    }
  }, [extractImageWorker, setImages, nextStep, isProcessing, file]);

  const handleFileChange = (e) => {
    // Revoke and Set
    if (images && images.length > 0) {
      images.forEach((image) => URL.revokeObjectURL(image.src));
      setImages([]);
    }
    // Handle (one) .pdf and multiple images (jpg, jpeg, png, tiff) only
    if (e.target.files.length === 0) return;
    else if (e.target.files.length === 1) {
      const file = e.target.files[0];
      if (file.type !== "application/pdf" && !file.type.startsWith("image/")) {
        alert("File is not a pdf or image, please try again.");
        return;
      }
    } else {
      for (let i = 0; i < e.target.files.length; i++) {
        if (!e.target.files[i].type.startsWith("image/")) {
          alert("Multiple files must be images, please try again.");
          return;
        }
      }
    }
    // Set .pdf or images
    const file = e.target.files[0];
    if (file.type === "application/pdf") {
      setFile(e.target.files[0]);
    } else {
      // If a .pdf file has been selected before, clear it
      setFile(null);
      const newImages = [];
      // For each image, create a new object and push it to newImages
      for (let i = 0; i < e.target.files.length; i++) {
        const imageSrc = URL.createObjectURL(e.target.files[i]);
        const imageType = e.target.files[i].type.split("/")[1] ?? "png";
        newImages.push({
          src: imageSrc,
          fileName: e.target.files[i].name ?? `image${i}.${imageType}`,
          imageType: imageType,
          caption: e.target.files[i].name.split(".")[0] ?? "",
          isSelected: true, // All images are selected by default
          isStarred: i === 0 ? true : false, // First image is starred by default
        });
      }
      setImages(newImages);
    }
  };

  const handleUploadClick = async () => {
    if (!file) {
      if (images.length === 0) {
        alert("No file selected.");
      } else {
        nextStep();
      }
      return;
    }
    if (window.Worker) {
      if (isProcessing.current) {
        console.log("Still processing previous file.");
        return;
      }
      // TODO: Alert error only in Debug
      try {
        const data = await file.arrayBuffer();
        extractImageWorker.postMessage(data, [data]);
        isProcessing.current = true;
      } catch (error) {
        isProcessing.current = false;
        alert("There was an error when uploading file: \n" + error);
      }
      // Revoke and Set
      images.forEach((image) => URL.revokeObjectURL(image.src));
      setImages([]);
    } else {
      console.log("Web Worker is not supported");
    }
  };

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
    try {
      const response = await fetch(
        `${baseUrl}/records/${recordId}/files/${file.key}/content`
      );
      // Same as file.arrayBuffer() from  but with fetch
      const data = await response.arrayBuffer();
      extractImageWorker.postMessage(data, [data]);
      isProcessing.current = true;
      setIsLoading(false);
    } catch (error) {
      isProcessing.current = false;
      setIsLoading(false);
      console.error(error);
    }
    // Revoke existing image URLs and set empty images
    images.forEach((image) => URL.revokeObjectURL(image.src));
    setImages([]);
  };

  return (
    <>
      <Grid.Column textAlign="center">
        <Dimmer.Dimmable dimmed={isLoading}>
          <Dimmer active={isLoading} page inverted>
            <Loader size="massive">Loading...</Loader>
          </Dimmer>
          {recordFiles.length > 0 && (
            <Grid.Row>
              <Header as="h4">Record PDF Files:</Header>
              <List verticalAlign="middle" animated>
                {recordFiles.map((file) => (
                  <List.Item key={file.key}>
                    <List horizontal>
                      <List.Item>{file.key}</List.Item>
                      <List.Item>
                        <Button
                          compact
                          secondary
                          size="small"
                          onClick={() => downloadPdfAndProcess(file)}
                        >
                          Select Images
                        </Button>
                      </List.Item>
                    </List>
                  </List.Item>
                ))}
              </List>
            </Grid.Row>
          )}
          <Divider hidden />
          <Grid.Row>
            <Input
              type="file"
              accept=".pdf, .jpg, .jpeg, .png, .tiff"
              multiple
              name="file-upload"
              size="small"
              onChange={handleFileChange}
              hidden
            >
              <Label attached="top">
                <Icon name="file pdf" /> File Upload (.pdf, .jpg, .jpeg, .png,
                .tiff)
              </Label>
              <input />
            </Input>
          </Grid.Row>
          {file && (
            <>
              <Divider hidden />
              <Grid.Row>{`${file.name} - ${file.type}`}</Grid.Row>
            </>
          )}
          <Divider hidden />
          <Grid.Row>
            <Button
              primary
              onClick={handleUploadClick}
              disabled={!file && images.length === 0}
            >
              Upload
            </Button>
          </Grid.Row>
        </Dimmer.Dimmable>
      </Grid.Column>
    </>
  );
};

FileSelectDialog.propTypes = {
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

export default FileSelectDialog;
