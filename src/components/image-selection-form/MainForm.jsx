import { useState } from "react";
import FileSelectDialog from "./FileSelectDialog";
import ImageSelection from "./ImageSelection";

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
    case 1:
      return (
        <FileSelectDialog
          images={images}
          setImages={setImages}
          nextStep={nextStep}
        />
      );
    case 2:
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
