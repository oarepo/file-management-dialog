import { useState } from "react";
import ImageExtractor from "./ImageExtractor";
import ImageSelection from "./ImageSelection";

const MainForm = () => {
  const [step, setStep] = useState(1);

  const [images, setImages] = useState([]);

  const nextStep = () => setStep(step + 1);
  const prevStep = () => setStep(step - 1);

  switch (step) {
    case 1:
      return <ImageExtractor images={images} setImages={setImages} nextStep={nextStep} />;
    case 2:
      return <ImageSelection images={images} setImages={setImages} nextStep={nextStep} prevStep={prevStep} />;
  }
};

export default MainForm;