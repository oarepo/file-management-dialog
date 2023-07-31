import { Card, Image, Input, Label, Icon } from "semantic-ui-react";
import PropTypes from "prop-types";

const ImageCard = ({ src, ...props }) => {
  return (
    <Card raised {...props}>
      <Image
        // as="a"
        // onClick={() => console.log("Image Clicked!")}
        wrapped
        ui={false}
        label={
          <Label.Group>
            <Label
              as="a"
              size="large"
              corner="left"
              icon={<Icon name="check square outline" size="big" link />}
              onClick={() => console.log("Image Selected!")}
            />
            <Label
              as="a"
              size="large"
              corner="right"
              color="yellow"
              icon={<Icon name="star outline" size="big" link />}
              onClick={() => console.log("Star Clicked!")}
            />
          </Label.Group>
        }
        src={src}
      />
      <Card.Content>
        <Input fluid placeholder="Image Caption" />
      </Card.Content>
    </Card>
  );
};

ImageCard.propTypes = {
  src: PropTypes.string.isRequired,
};

export default ImageCard;
