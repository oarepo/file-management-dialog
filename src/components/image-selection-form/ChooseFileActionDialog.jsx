// Chooses between the two actions: Upload new images and Select from Library

import { Grid, Button, Divider } from "semantic-ui-react";
import PropTypes from "prop-types";

const ChooseFileActionDialog = ({ toPDFSelectDialog, toImageSelection }) => {
  return (
    <Grid.Column textAlign="center">
      <Grid.Row>
        <Button primary onClick={toImageSelection}>
          Select from Library
        </Button>
      </Grid.Row>
      <Divider horizontal>Or</Divider>
      <Grid.Row>
        <Button primary onClick={toPDFSelectDialog}>
          Upload New Images
        </Button>
      </Grid.Row>
    </Grid.Column>
  );
};

ChooseFileActionDialog.propTypes = {
  toPDFSelectDialog: PropTypes.func.isRequired,
  toImageSelection: PropTypes.func.isRequired,
};

export default ChooseFileActionDialog;
