import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { setActionStatus } from "../features/removeBackground";
import loadImage from "blueimp-load-image";
import ColorFromImage from "color-from-image";
import * as htmlToImage from "html-to-image";
import * as download from "downloadjs";

export default function RemoveBackground() {
  const status = useSelector((state) => state.status.bgRemoved);
  const dispatch = useDispatch();

  let blob = null;

  const [image, setImage] = useState(null);
  const [PreviewImage, setPreviewImage] = useState(null);
  const [colorCode, setColorCode] = useState(null);

  useEffect(() => {
    const image = document.getElementById("imageResult");
    if (image) {
      image.style.backgroundColor = colorCode;
    }
  }, [colorCode]);

  const imgUpload = (e) => {
    const img = e.target.files[0];
    let input = document.getElementById("upload");
    let infoArea = document.getElementById("upload-label");
    let fileName = input.files[0].name;
    infoArea.textContent = "File name: " + fileName;
    setPreviewImage(URL.createObjectURL(img));

    setImage(img);
    setColorCode(null);
  };

  const uploadImage = async () => {
    dispatch(setActionStatus(false));

    const resizedImage = await loadImage(image, {
      // resize before sending to Remove.bg for performance
      maxWidth: 1500,
      maxHeight: 1500,
      canvas: true,
    });

    resizedImage.image.toBlob(async function (inputBlob) {
      const formData = new FormData();
      formData.append("image_file", inputBlob);

      const response = await fetch("https://api.remove.bg/v1.0/removebg", {
        method: "POST",
        headers: {
          "X-Api-Key": "WfaYr9xo8P2fTevdEvYqXvCH",
        },
        body: formData,
      });

      if (response.status === 200) {
        dispatch(setActionStatus(true));
      } else {
        dispatch(setActionStatus(false));
      }

      const outputBlob = await response.blob();

      blob = URL.createObjectURL(outputBlob);
      let image = document.getElementById("imageResult");
      image.style.backgroundColor = colorCode;
      const down = document.getElementById("down");
      image.src = blob;
    });
  };

  const downloadConvertedImage = () => {
    const node = document.getElementById("image-cont");
    if (node) {
      htmlToImage
        .toPng(node)
        .then(function (dataUrl) {
          download(dataUrl, "my-image.png");
        })
        .catch(function (error) {
          console.error("oops, something went wrong!", error);
        });
    }
  };

  return (
    <div className="row py-4">
      <div className="col-lg-6 mx-auto text-center">
        <div className="input-group mb-3 px-2 py-2 rounded-pill bg-white shadow-sm">
          <input
            id="upload"
            type="file"
            onChange={imgUpload}
            className="form-control border-0"
            accept="image/x-png,image/jpeg"
          />
          <label
            id="upload-label"
            for="upload"
            className="font-weight-light text-muted"
          >
            Choose file
          </label>
          <div className="input-group-append">
            <label for="upload" className="btn btn-light m-0 rounded-pill px-4">
              {" "}
              <i className="fa fa-cloud-upload mr-2 text-muted"></i>
              <small className="text-uppercase font-weight-bold text-muted">
                Choose file
              </small>
            </label>
            <label
              className="btn btn-light m-0 rounded-pill px-4"
              onClick={() => {
                setImage(null);
                setPreviewImage(null);
                setColorCode(null);
                let infoArea = document.getElementById("upload-label");
                infoArea.textContent = "Choose file";
              }}
            >
              {" "}
              <i className="fa fa-refresh mr-2 text-muted"></i>
              <small className="text-uppercase font-weight-bold text-muted">
                Reset
              </small>
            </label>
          </div>
        </div>
        {PreviewImage && (
          <>
            <div>
              <header className="text-white text-center">
                <h4 className="3">
                  Please click on the image to select the color
                </h4>
              </header>
            </div>
            <div className="row">
              <div className="col">
                <ColorFromImage
                  src={PreviewImage}
                  onChooseColor={(val) => setColorCode(val)}
                  hideColor={PreviewImage ? false : true}
                />
              </div>
              <div className="col">
                <div className="input-group mb-3 px-2 py-2 rounded-pill bg-white shadow-sm">
                  <input type="text" className="form-control border-0" />
                  <label
                    id="upload-label"
                    for="upload"
                    className="font-weight-light text-muted"
                  >
                    {colorCode ? colorCode : "Color"}
                  </label>
                </div>
              </div>
            </div>
          </>
        )}
        {colorCode && (
          <>
            <button
              className="btn btn-outline-light remove-button"
              onClick={uploadImage}
            >
              Replace Background Color
            </button>
            <div>
              <div className="row py-4">
                <div className="col-lg-6 mx-auto text-center">
                  <p className="font-italic text-white text-center">
                    The result will be rendered inside the box below.
                  </p>
                  <div className="image-area mt-4 justify-content-center">
                    {status === false ? (
                      <div class="lds-roller mb-3">
                        <div></div>
                        <div></div>
                        <div></div>
                        <div></div>
                        <div></div>
                        <div></div>
                        <div></div>
                        <div></div>
                      </div>
                    ) : (
                      <>
                        <div id="image-cont">
                          <img
                            id="imageResult"
                            src="#"
                            alt=""
                            className="img-fluid rounded shadow-sm mx-auto d-block"
                          />
                        </div>
                      </>
                    )}{" "}
                  </div>
                  {status ? (
                    <button
                      className="btn btn-light down-button"
                      onClick={downloadConvertedImage}
                    >
                      {" "}
                      <i className="fas fa-download" /> Download
                    </button>
                  ) :
                    null}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
