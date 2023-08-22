import FileManagementDialog from './components/file-management-dialog';
import PropTypes from "prop-types";

function App({ config }) {
  return (
    <FileManagementDialog config={config} />
  );
}

App.propTypes = {
  config: PropTypes.object.isRequired,
};

export default App;
