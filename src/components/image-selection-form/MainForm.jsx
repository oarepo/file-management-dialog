import React from 'react'
import { useState } from "react";
import PDFSelectDialog from "./PDFSelectDialog";
import ImageSelection from "./ImageSelection";
import DefaultDialogTriggerButton from "./DefaultDialogTriggerButton";

const MainForm = () => {
  const [step, setStep] = useState(0);
  const [images, setImages] = useState([]);

  const nextStep = () => setStep(step + 1);
  const prevStep = () => {
    setStep(step - 1);
  };

  switch (step) {
    // case 0: Button to open dialog (Set Images)
    case 1:
      return (
        <PDFSelectDialog
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
          prevStep={() => {
            images.forEach((image) => URL.revokeObjectURL(image.src));
            setImages([]);
            prevStep();
          }}
        />
      );
    default:
      return (
        <DefaultDialogTriggerButton toPDFSelectDialog={() => setStep(1)} />
      );
  }
};

export default MainForm;
