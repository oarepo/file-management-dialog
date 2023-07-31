import { useEffect, useMemo, useRef, useState } from "react";
import { Button, Input, Label, Icon, Grid, Divider } from "semantic-ui-react";
import PropTypes from "prop-types";

const ImageExtractor = ({ images, setImages, nextStep }) => {
  const isProcessing = useRef(false);

  const [file, setFile] = useState(null);

  const extractImageWorker = useMemo(
    () =>
      new Worker(
        new URL("/src/workers/extract-images-worker.js", import.meta.url)
      ),
    []
  );

  useEffect(() => {
    if (window.Worker) {
      extractImageWorker.onmessage = (event) => {
        if (event.data === "done") {
          isProcessing.current = false;
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
          caption: "",
          isSelected: false,
          isStarred: false,
        };
        setImages((images) => [
          ...images,
          {
            ...imageObj,
            isSelected: images.length === 0 ? true : false,
            isStarred: images.length === 0 ? true : false,
          },
        ]);
        nextStep();
      };
    } else {
      console.log("Web Worker is not supported");
    }
  }, [extractImageWorker, setImages, nextStep]);

  const handleFileChange = (e) => {
    if (e.target.files.length === 0) return;
    setFile(e.target.files[0]);
  };

  const handleUploadClick = async () => {
    if (!file) return;
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

ImageExtractor.propTypes = {
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

export default ImageExtractor;
