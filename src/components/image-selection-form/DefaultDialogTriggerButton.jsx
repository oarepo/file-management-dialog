// Chooses between the two actions: Upload new images and Select from Library

import { Grid, Button } from "semantic-ui-react";
import PropTypes from "prop-types";

const DefaultDialogTriggerButton = ({ toPDFSelectDialog }) => {
  return (
    <Grid.Column textAlign="center">
      <Grid.Row>
        <Button primary onClick={toPDFSelectDialog}>
          Set Images
        </Button>
      </Grid.Row>
    </Grid.Column>
  );
};

DefaultDialogTriggerButton.propTypes = {
  toPDFSelectDialog: PropTypes.func.isRequired,
};

export default DefaultDialogTriggerButton;
