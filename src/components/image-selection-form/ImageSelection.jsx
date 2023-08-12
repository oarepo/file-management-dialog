import { useState } from "react";
import {
  Card,
  Grid,
  Segment,
  Button,
  Progress,
  Dimmer,
  Image,
  Header,
  Label,
  Icon,
} from "semantic-ui-react";
import PropTypes from "prop-types";
import ImageCard from "./ImageCard";
import useAppContext from "../../utils/useAppContext";

// TODO:
// onUploadError: handle error
// onUploadSuccess: handle success and closing of dialog (toast, random event)
// 
const ImageSelection = ({ images, setImages, prevStep }) => {
  const { baseUrl, id: recordId } = useAppContext().current;

  // failedUploads with uploadProgress in one state
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [failedUploads, setFailedUploads] = useState([]);

  const selectedImages = images.filter((image) => image.isSelected);

  const upload = async () => {
    setIsUploading(true);
    setUploadProgress(0);
    setFailedUploads([]);

    try {
      await startFilesUpload(selectedImages);
    } catch (error) {
      setIsUploading(false);
      alert("Error uploading images. Please try again.");
      console.error(error);
      return;
    }

    for (let i = 0; i < selectedImages.length; i++) {
      const image = selectedImages[i];
      // Upload file metadata
      const metadata = {
        caption: image.caption,
        featureImage: image.isStarred,
      };
      try {
        await uploadFileMetadata(image.fileName, metadata);
        // Upload file content
        const imageData = await fetch(image.src);
        const processedImageData = await imageData.blob();
        await uploadFileContent(image.fileName, processedImageData);
        // Complete file upload
        // console.log("Completing file upload...");
        await completeFileUpload(image.fileName);
      } catch (error) {
        setFailedUploads((failedUploads) => [...failedUploads, image]);
        console.error(error);
      }
      setUploadProgress((progress) => progress + 1);
    }

    setTimeout(() => setIsUploading(false), 2000);
  };

  const startFilesUpload = async (selectedImages) => {
    return fetch(`${baseUrl}/records/${recordId}/files`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(
        selectedImages.map((image) => ({
          key: image.fileName,
        }))
      ),
    })
      .then((response) => {
        if (!response.status.toString().startsWith("2")) {
          throw new Error(
            `[${response.status} ${response.statusText}] Error starting files upload.")`
          );
        }
        return response.json();
      })
      .then((data) => {
        console.log(data);
      });
  };

  const uploadFileMetadata = async (fileName, metadata) => {
    return fetch(`${baseUrl}/records/${recordId}/files/${fileName}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ metadata: metadata }),
    })
      .then((response) => {
        if (!response.status.toString().startsWith("2")) {
          throw new Error(
            `[${response.status} ${response.statusText}] Error uploading file metadata.")`
          );
        }
        return response.json();
      })
      .then((data) => {
        console.log(data);
      });
  };

  const uploadFileContent = async (fileName, content) => {
    return fetch(`${baseUrl}/records/${recordId}/files/${fileName}/content`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/octet-stream",
      },
      body: content,
    })
      .then((response) => {
        if (!response.status.toString().startsWith("2")) {
          throw new Error(
            `[${response.status} ${response.statusText}] Error uploading file content.")`
          );
        }
        return response.json();
      })
      .then((data) => {
        console.log(data);
      });
  };

  const completeFileUpload = async (fileName) => {
    return fetch(`${baseUrl}/records/${recordId}/files/${fileName}/commit`, {
      method: "POST",
    })
      .then((response) => {
        if (!response.status.toString().startsWith("2")) {
          throw new Error(
            `[${response.status} ${response.statusText}] Error completing file upload.")`
          );
        }
        return response.json();
      })
      .then((data) => {
        console.log(data);
      });
  };

  return (
    images.length > 0 && (
      <Grid.Column textAlign="center">
        <Dimmer.Dimmable as={Segment} blurring>
          {/* Extract to FileUploader */}
          <Dimmer active={isUploading} page inverted simple>
            <Progress
              progress="ratio"
              value={uploadProgress}
              total={selectedImages.length}
              indicating
              autoSuccess
              size="large"
              label={
                uploadProgress !== selectedImages.length
                  ? "Uploading images..."
                  : "Upload complete!"
              }
              style={{ width: "70vw" }}
            />
            {failedUploads.length > 0 && (
              <Segment basic>
                <Header size="medium">Failed uploads</Header>
                <Image.Group size="medium">
                  {failedUploads.map((image) => {
                    return (
                      <Image
                        src={image.src}
                        key={image.src}
                        label={
                          <Label attached="top" basic size="medium">
                            {image.fileName}
                          </Label>
                        }
                        wrapped
                      />
                      // <Card key={image.src} color="red">
                      //   <Image
                      //     src={image.src}
                      //     label={image.fileName}
                      //     wrapped
                      //     ui={false}
                      //     size="tiny"
                      //   />
                      // </Card>
                      // <Item key={image.src}>
                      //   <Item.Image size="medium" src={image.src} />
                      //   <Item.Content verticalAlign="middle" content={image.fileName} />
                      // </Item>
                    );
                  })}
                </Image.Group>
              </Segment>
            )}
          </Dimmer>

          {images.length > 0 ? (
            <Segment.Group>
              <Segment>
                <Card.Group centered textAlign="center" doubling>
                  {images.map((image) => {
                    return (
                      <ImageCard
                        image={image}
                        setImages={setImages}
                        key={image.src}
                        color={failedUploads.includes(image) ? "red" : null}
                      />
                    );
                  })}
                </Card.Group>
              </Segment>
              <Segment>
                <Button.Group>
                  <Button secondary onClick={prevStep}>
                    Back
                  </Button>
                  {/* FileUploader with upload logic */}
                  <Button
                    primary
                    loading={isUploading}
                    onClick={upload}
                    disabled={selectedImages.length === 0}
                  >
                    {selectedImages.length === 0
                      ? "No images selected"
                      : `Upload ${selectedImages.length} image${
                          selectedImages.length > 1 ? "s" : ""
                        }`}
                  </Button>
                </Button.Group>
              </Segment>
            </Segment.Group>
          ) : (
            <Segment placeholder>
              <Header icon>
                <Icon name="images outline" />
                No images found
              </Header>
              <Button primary onClick={prevStep}>
                Back
              </Button>
            </Segment>
          )}
        </Dimmer.Dimmable>
      </Grid.Column>
    )
  );
};

ImageSelection.propTypes = {
  images: PropTypes.arrayOf(
    PropTypes.shape({
      src: PropTypes.string.isRequired,
      caption: PropTypes.string.isRequired,
      isSelected: PropTypes.bool.isRequired,
      isStarred: PropTypes.bool.isRequired,
    })
  ).isRequired,
  setImages: PropTypes.func.isRequired,
  prevStep: PropTypes.func.isRequired,
};

export default ImageSelection;
