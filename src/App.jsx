import MainForm from "./components/image-selection-form/MainForm";
import { Grid } from "semantic-ui-react";
import { WorkerProvider } from "./contexts/WorkerContext";
import { RefProvider } from "./contexts/RefContext";
import { AppContextProvider } from "./contexts/AppContext";
import PropTypes from "prop-types";

function App({ config }) {
  return (
    <AppContextProvider value={config}>
      <WorkerProvider>
        <RefProvider>
          <Grid verticalAlign="middle" style={{ height: "100vh" }}>
            <MainForm />
          </Grid>
        </RefProvider>
      </WorkerProvider>
    </AppContextProvider>
  );
}

App.propTypes = {
  config: PropTypes.object.isRequired,
};

export default App;
