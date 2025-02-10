import React, { useRef } from "react";
/*import css file*/
import "../css/main-interface.css";
/*import icons from resources*/
//import qrImage from "../resources/qr-code-model.png"

// import ServerNotAvailable from "./server-not-available"

const createImage = (options) => {
  options = options || {};
  const img = document.createElement("img");
  if (options.src) {
    img.src = options.src;
  }
  return img;
};

const copyToClipboard = async (pngBlob) => {
  try {
    await navigator.clipboard.write([
      // eslint-disable-next-line no-undef
      new ClipboardItem({
        [pngBlob.type]: pngBlob,
      }),
    ]);
    console.log("Image copied");
  } catch (error) {
    console.error(error);
  }
};

const convertToPng = (imgBlob) => {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  const imageEl = createImage({ src: window.URL.createObjectURL(imgBlob) });
  imageEl.onload = (e) => {
    canvas.width = e.target.width;
    canvas.height = e.target.height;
    ctx.drawImage(e.target, 0, 0, e.target.width, e.target.height);
    canvas.toBlob(copyToClipboard, "image/png", 1);
  };
};

const copyImg = async (src) => {
  const img = await fetch(src);
  const imgBlob = await img.blob();
  const extension = src.split(".").pop();
  const supportedToBeConverted = ["jpeg", "jpg", "gif"];
  if (supportedToBeConverted.indexOf(extension.toLowerCase())) {
    return convertToPng(imgBlob);
  } else if (extension.toLowerCase() === "png") {
    return copyToClipboard(imgBlob);
  }
  console.error("Format unsupported");
  return;
};

const downloadImage = (src) => {
  const img = new Image();
  img.crossOrigin = "anonymous";
  img.src = src;
  img.onload = () => {
    // create Canvas
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    canvas.width = img.width;
    canvas.height = img.height;
    ctx.drawImage(img, 0, 0);
    // create <a> tag
    const a = document.createElement("a");
    a.download = "download.png";
    a.href = canvas.toDataURL("image/png");
    a.click();
  };
};
/*display-qr.js is the component that */
const DisplayQR = () => {
  const ref = useRef(null);
  console.log(ref);
  return (
    <section className="display-qr-section">
      <h3 className="form-title">Aperçu du code QR</h3>
      <div class="copy-icon">
        {" "}
        <button class="btn">
          <i class="fa fa-copy"></i>
        </button>
        <span class="tooltiptext">Copier</span>
      </div>
      {/* <img className="copy-icon" onClick={() => copyImg(ref.current.src)} src={copyIcon} alt=""/>*/}
      <hr className="first-qr-line" />
      {/* here where we will set a condition of api response */}
      {/* <img  className="qr-image" ref={ref} src={''} alt="" /> */}
      {/* <ServerNotAvailable/> */}
      <button
        className="download-button-disabled"
        type="submit"
        onClick={() => downloadImage("")}
      >
        Télécharger
      </button>
    </section>
  );
};

export default DisplayQR;
