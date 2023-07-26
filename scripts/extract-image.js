import fs from "fs";
import { convert } from "pdf-img-convert";

const convertImages = async (file) => {
  const images = await convert(file);
  console.log("saving");
  for (let i = 0; i < images.length; i++){
    fs.writeFile("out/output"+i+".png", images[i], function (error) {
      if (error) { console.error("Error: " + error); }
    });
  }
  return images;
};

convertImages("./../src/extract-images/existing2.pdf");