import { Card, Image, Input, Label, Icon } from "semantic-ui-react";
import PropTypes from "prop-types";

const ImageCard = ({ image, setImages, ...props }) => {
  const handleImageSelect = () => {
    setImages((images) =>
      images.map((img) => {
        if (img.src === image.src) {
          return { ...img, isSelected: !img.isSelected };
        }
        return img;
      })
    );
  };

  // Check if the image there is only one image starred
  // If this is the only one starred, then do not unstar it
  // If another image is starred, then unstar the previous one and star this one
  // If no image is starred, then star it
  const handleImageStar = () => {
    setImages((images) => {
      const starredImages = images.filter((img) => img.isStarred);
      if (starredImages.length === 1 && starredImages[0].src === image.src) {
        return images;
      }
      return images.map((img) => {
        if (img.src === image.src) {
          return { ...img, isStarred: !img.isStarred };
        }
        return { ...img, isStarred: false };
      });
    });
  };

  const handleCaptionChange = (e) => {
    setImages((images) =>
      images.map((img) => {
        if (img.src === image.src) {
          return { ...img, caption: e.target.value };
        }
        return img;
      })
    );
  };

  return (
    <Card raised {...props}>
      <Image
        wrapped
        ui={false}
        label={
          <Label.Group>
            <Label
              as="a"
              size="large"
              corner="left"
              color={image.isSelected ? "green" : null}
              icon={<Icon name={image.isSelected ? "check square outline" : "square outline"} size="big" link />}
              onClick={handleImageSelect}
            />
            <Label
              as="a"
              size="large"
              corner="right"
              color={image.isStarred ? "yellow" : null}
              icon={<Icon name={image.isStarred ? "star" : "star outline"} size="big" link />}
              onClick={handleImageStar}
            />
          </Label.Group>
        }
        src={image.src}
      />
      <Card.Content>
        <Input fluid placeholder="Image Caption" onChange={handleCaptionChange} />
      </Card.Content>
    </Card>
  );
};

ImageCard.propTypes = {
  image: PropTypes.shape({
    src: PropTypes.string.isRequired,
    caption: PropTypes.string,
    isSelected: PropTypes.bool.isRequired,
    isStarred: PropTypes.bool.isRequired,
  }).isRequired,
  setImages: PropTypes.func.isRequired,
};

export default ImageCard;
