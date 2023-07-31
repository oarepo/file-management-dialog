import MainForm from "./components/image-selection-form/MainForm"
import { Grid } from "semantic-ui-react"

function App() {
  return (
    <>
      <Grid verticalAlign="middle" style={{ height: "100vh" }}>
        <MainForm />
      </Grid>
    </>
  )
}

export default App
