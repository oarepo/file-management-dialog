import MainForm from "./components/image-selection-form/MainForm";
import { Grid } from "semantic-ui-react";
import { WorkerProvider } from "./contexts/WorkerContext";
import { RefProvider } from "./contexts/RefContext";

function App() {
  return (
    <Grid verticalAlign="middle" style={{ height: "100vh" }}>
      <WorkerProvider>
        <RefProvider>
          <MainForm />
        </RefProvider>
      </WorkerProvider>
    </Grid>
  );
}

export default App;
