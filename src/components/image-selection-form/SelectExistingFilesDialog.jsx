// This component renders the ImageSelection component
// Component call useEffect to get all the images from the server and store them in images state
// The Save Changes button is disabled if no images are selected

import { useEffect } from "react";
import ImageSelection from "./ImageSelection";
import useAppContext from "../../utils/useAppContext";
import PropTypes from "prop-types";
import { Grid, Dimmer, Loader, Header, List, Button } from "semantic-ui-react";

const SelectExistingFilesDialog = ({ images, setImages, prevStep }) => {
  const { baseUrl, recordId } = useAppContext().current;

  const [recordFiles, setRecordFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Load all image files from the server and store them in images
  useEffect(() => {
    setIsLoading(true);
    fetch(`${baseUrl}/records/${recordId}/files`)
      .then((response) => response.json())
      .then((data) => {
        // Store only PDF files
        setRecordFiles(
          data.entries.filter((file) => file.mimetype.startsWith("image/"))
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

  return (
    <Grid.Column textAlign="center">
      <Dimmer active={isLoading} page inverted>
        <Loader size="massive">Loading...</Loader>
      </Dimmer>
      {recordFiles.length > 0 && (
        <Grid.Row>
          <Header as="h4">Record PDF Files:</Header>
          <List verticalAlign="middle" animated>
            {recordFiles.map((file) => (
              <List.Item key={file.key}>{file.key}</List.Item>
            ))}
          </List>
        </Grid.Row>
      )}
    </Grid.Column>
  );
};

SelectExistingFilesDialog.propTypes = {
  images: PropTypes.array.isRequired,
  setImages: PropTypes.func.isRequired,
  prevStep: PropTypes.func.isRequired,
};

export default SelectExistingFilesDialog;
