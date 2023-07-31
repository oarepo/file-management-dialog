import { Card, Grid, Segment, Button } from "semantic-ui-react";
import PropTypes from "prop-types";
import ImageCard from "./ImageCard";

const ImageSelection = ({ images, setImages, prevStep }) => {
  return (
    images &&
    images.length > 0 && (
      <Grid.Column textAlign="center">
        <Segment.Group>
          <Segment>
            <Card.Group centered textAlign="center" doubling>
              {images.map((image) => {
                return (
                  <ImageCard
                    image={image}
                    setImages={setImages}
                    key={image.src}
                  />
                );
              })}
            </Card.Group>
          </Segment>
          <Segment>
            <Button onClick={prevStep}>Back</Button>
          </Segment>
        </Segment.Group>
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
