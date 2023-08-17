import React from 'react'
import MainForm from "./components/image-selection-form/MainForm";
import { Grid } from "semantic-ui-react";
import { WorkerProvider } from "./contexts/WorkerContext";
import { UppyProvider } from "./contexts/UppyContext";
import { AppContextProvider } from "./contexts/AppContext";
import PropTypes from "prop-types";

function App({ config }) {
  return (
    <AppContextProvider value={config}>
      <WorkerProvider>
        <UppyProvider>
          <Grid verticalAlign="middle" style={{ height: "100vh" }}>
            <MainForm />
          </Grid>
        </UppyProvider>
      </WorkerProvider>
    </AppContextProvider>
  );
}

App.propTypes = {
  config: PropTypes.object.isRequired,
};

export default App;
