import { useEffect, useMemo, useRef, useState } from "react";

const ImageExtractor = () => {
  const isProcessing = useRef(false);

  const [file, setFile] = useState(null);
  const [images, setImages] = useState([]);
  const [clickCount, setClickCount] = useState(0);

  const extractImageWorker = useMemo(
    () =>
      new Worker(
        new URL("../workers/extract-images-worker.js", import.meta.url)
      ),
    []
  );

  useEffect(() => {
    if (window.Worker) {
      extractImageWorker.onmessage = (event) => {
        if (event.data === "done") {
          isProcessing.current = false;
          return;
        }
        console.log(event.data);
        const imageSrc = URL.createObjectURL(
          new Blob([event.data.imageData], { type: `image/${event.data.imageType}` })
        );
        setImages((images) => [...images, imageSrc]);
      };
    } else {
      console.log("Web Worker is not supported");
    }
  }, [extractImageWorker]);

  const handleFileChange = (e) => {
    if (e.target.files.length === 0) return;
    setFile(e.target.files[0]);
  };

  const handleUploadClick = async () => {
    if (!file) return;
    if (window.Worker) {
      if (isProcessing.current) {
        console.log("Still processing previous file.");
        return;
      }
      const data = await file.arrayBuffer();
      extractImageWorker.postMessage(data, [data]);
      isProcessing.current = true;
      // Revoke and Set
      images.forEach((imageSrc) => URL.revokeObjectURL(imageSrc));
      setImages([]);
    } else {
      console.log("Web Worker is not supported");
    }
  };

  return (
    <>
      <input type="file" onChange={handleFileChange} />
      <div>{file && `${file.name} - ${file.type}`}</div>
      <button onClick={handleUploadClick}>Upload</button>
      <div
        style={{
          display: "grid",
          gridColumnGap: "10px",
          gridRowGap: "10px",
        }}
      >
        {images.map((imageSrc) => {
          // const imageSrc = URL.createObjectURL(
          //   new Blob([image.imageData], { type: `image/${image.imageType}` })
          // );
          // const onLoad = (img) => {
          //   if (!img) return;
          //   img.onload = () => URL.revokeObjectURL(imageSrc);
          //   if (img.complete) URL.revokeObjectURL(imageSrc);
          // };
          return (
            <img
              src={imageSrc}
              key={imageSrc}
              width="50%"
              style={{ display: "inline-block" }}
            />
          );
        })}
      </div>
      <button value={clickCount} onClick={() => setClickCount(clickCount + 1)}>
        {clickCount}
      </button>
    </>
  );
};

export default ImageExtractor;
