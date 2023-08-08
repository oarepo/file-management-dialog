import { useState } from "react";
import PDFSelectDialog from "./PDFSelectDialog";
import ImageSelection from "./ImageSelection";
import ChooseFileActionDialog from "./ChooseFileActionDialog";

const MainForm = () => {
  const [step, setStep] = useState(1);
  const [images, setImages] = useState([]);

  const nextStep = () => setStep(step + 1);
  const prevStep = () => {
    setStep(step - 1);
    images.forEach((image) => URL.revokeObjectURL(image.src));
    setImages([]);
  };

  switch (step) {
    // case 0: Button to open dialog (Set Images)
    case 1:
      return (
        <ChooseFileActionDialog
          toPDFSelectDialog={() => setStep(2)}
          toImageSelection={() => setStep(3)}
        />
      );
    case 2:
      return (
        <PDFSelectDialog
          images={images}
          setImages={setImages}
          nextStep={nextStep}
        />
      );
    case 3:
      return (
        <ImageSelection
          images={images}
          setImages={setImages}
          nextStep={nextStep}
          prevStep={prevStep}
        />
      );
  }
};

export default MainForm;
