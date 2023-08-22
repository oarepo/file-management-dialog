import FileManagementDialog from './components/file-management-dialog';
import PropTypes from "prop-types";

function App({ config, modifyExistingFiles = false }) {
  return (
    <FileManagementDialog config={config} modifyExistingFiles={modifyExistingFiles} />
  );
}

App.propTypes = {
  config: PropTypes.object.isRequired,
  modifyExistingFiles: PropTypes.bool,
};

export default App;
