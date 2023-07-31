import { useEffect, useMemo, useRef, useState } from "react";
import { Button, Card, Input, Label, Icon } from "semantic-ui-react";
import ImageCard from "./ImageCard";

const ImageExtractor = () => {
  const isProcessing = useRef(false);

  const [file, setFile] = useState(null);
  const [images, setImages] = useState([]);
  const [clickCount, setClickCount] = useState(0);

  const extractImageWorker = useMemo(
    () =>
      new Worker(
        new URL("../workers/extract-images-worker.js", import.meta.url)
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
          { ...imageObj, isStarred: images.length === 0 ? true : false },
        ]);
      };
    } else {
      console.log("Web Worker is not supported");
    }
  }, [extractImageWorker]);

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
      {/* <label htmlFor="file-upload">PDF UPLOAD</label> */}
      <Input
        type="file"
        accept=".pdf, .jpg, .jpeg, .png, .tiff"
        multiple
        name="file-upload"
        label={
          <Label basic>
            <Icon name="file pdf" /> File Upload (.png, .jpg, .jpeg, .png,
            .tiff)
          </Label>
        }
        onChange={handleFileChange}
      />
      <div>{file && `${file.name} - ${file.type}`}</div>
      <Button primary onClick={handleUploadClick}>
        Upload
      </Button>
      <Card.Group centered textAlign="center" doubling>
        {images.map((image) => {
          return (
            <ImageCard image={image} setImages={setImages} key={image.src} />
          );
        })}
      </Card.Group>
      <br />
      <Button
        primary
        value={clickCount}
        onClick={() => setClickCount(clickCount + 1)}
      >
        {clickCount}
      </Button>
    </>
  );
};

export default ImageExtractor;
