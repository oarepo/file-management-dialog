import { useState, useEffect } from "react";
import { Button, Input, Label, Icon, Grid, Divider } from "semantic-ui-react";
import useWorker from "../../utils/useWorker";
import useRefContext from "../../utils/useRefContext";
import PropTypes from "prop-types";

const FileSelectDialog = ({ images, setImages, nextStep }) => {
  const extractImageWorker = useWorker();
  const isProcessing = useRefContext();

  const [file, setFile] = useState(null);

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
          fileName: `${file.name.split(".")[0] ?? file.name}_${crypto.randomUUID()}.${event.data.imageType}`,
          imageType: event.data.imageType,
          caption: "",
          isSelected: false,
          isStarred: false,
        };
        setImages((images) => [
          ...images,
          {
            ...imageObj,
            // should the first image be selected and starred by default???
            isSelected: images.length === 0 ? true : false,
            isStarred: images.length === 0 ? true : false,
          },
        ]);
        nextStep();
      };
      // Handle errors (never fires)
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
      const newImages = [];
      for (let i = 0; i < e.target.files.length; i++) {
        const imageSrc = URL.createObjectURL(e.target.files[i]);
        const imageType = e.target.files[i].type.split("/")[1] ?? "png";
        newImages.push({
          src: imageSrc,
          fileName: e.target.files[i].name ?? `image${i}.${imageType}`,
          imageType: imageType,
          caption: e.target.files[i].name.split(".")[0] ?? "", // Default caption is file name??? or empty
          isSelected: true,
          isStarred: i === 0 ? true : false,
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
      const data = await file.arrayBuffer();
      extractImageWorker.postMessage(data, [data]);
      isProcessing.current = true;
      // Revoke and Set
      images.forEach((image) => URL.revokeObjectURL(image.src));
      setImages([]);
    } else {
      console.log("Web Worker is not supported");
    }
  };

  return (
    <>
      <Grid.Column textAlign="center">
        <Grid.Row>
          <Input
            type="file"
            accept=".pdf, .jpg, .jpeg, .png, .tiff"
            multiple
            name="file-upload"
            label={
              <Label basic>
                <Icon name="file pdf" /> File Upload (.pdf, .jpg, .jpeg, .png,
                .tiff)
              </Label>
            }
            onChange={handleFileChange}
          />
        </Grid.Row>
        {file && (
          <>
            <Divider hidden />
            <Grid.Row>{`${file.name} - ${file.type}`}</Grid.Row>
          </>
        )}
        <Grid.Row>
          <Divider hidden />
          <Button primary onClick={handleUploadClick}>
            Upload
          </Button>
        </Grid.Row>
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
