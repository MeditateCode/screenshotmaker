import React, { useState, useRef } from "react";
import html2canvas from "html2canvas";
import { motion } from "framer-motion";
import Cropper from "react-easy-crop";
import './App.css';

function App() {
  const [image, setImage] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [bgImage, setBgImage] = useState(null);
  const [logo, setLogo] = useState(null);

  const [grad1, setGrad1] = useState("#ec4899");
  const [grad2, setGrad2] = useState("#ef4444");
  const [bgGradient, setBgGradient] = useState(
    `linear-gradient(to right, #ec4899, #ef4444)`
  );

  const [canvasSize, setCanvasSize] = useState({ w: 700, h: 400 });

  const captureRef = useRef(null);

  const [cropMode, setCropMode] = useState(false);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [cropZoom, setCropZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  // Upload screenshot
  const handleUploadScreenshot = (e) => {
    if (e.target.files && e.target.files[0]) {
      setImage(URL.createObjectURL(e.target.files[0]));
    }
  };

  // Upload background
  const handleUploadBackground = (e) => {
    if (e.target.files && e.target.files[0]) {
      setBgImage(URL.createObjectURL(e.target.files[0]));
      setBgGradient("");
    }
  };

  // Upload logo
  const handleUploadLogo = (e) => {
    if (e.target.files && e.target.files[0]) {
      setLogo(URL.createObjectURL(e.target.files[0]));
    }
  };

  const wallpapers = [
    "linear-gradient(to right, #ec4899, #ef4444, #eab308)",
    "linear-gradient(to right, #3b82f6, #8b5cf6, #ec4899)",
    "linear-gradient(to right, #4ade80, #14b8a6, #3b82f6)",
    "linear-gradient(to right, #6366f1, #0ea5e9, #06b6d4)",
    "linear-gradient(to right, #fb923c, #ec4899, #f43f5e)",
  ];

  const handleDownload = async () => {
    if (!captureRef.current) return;
    const element = captureRef.current;

    const canvas = await html2canvas(element, {
      backgroundColor: null,
      scale: 2,
    });

    const link = document.createElement("a");
    link.download = "screenshot.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  const dimensions = [
    { name: "Custom (700x400)", w: 700, h: 400 },
    { name: "Instagram Post (1080x1080)", w: 1080, h: 1080 },
    { name: "Instagram Story (1080x1920)", w: 1080, h: 1920 },
    { name: "Twitter Post (1600x900)", w: 1600, h: 900 },
    { name: "Facebook Post (1200x630)", w: 1200, h: 630 },
    { name: "LinkedIn Post (1200x627)", w: 1200, h: 627 },
    { name: "YouTube Thumbnail (1280x720)", w: 1280, h: 720 },
  ];

  const fixedHeight = 500;
  const previewWidth = (canvasSize.w / canvasSize.h) * fixedHeight;

  const updateCustomGradient = (c1, c2) => {
    setGrad1(c1);
    setGrad2(c2);
    setBgGradient(`linear-gradient(to right, ${c1}, ${c2})`);
    setBgImage(null);
  };

  const onCropComplete = (_, croppedPixels) => {
    const x1 = croppedPixels.x;
    const y1 = croppedPixels.y;
    const x2 = croppedPixels.x + croppedPixels.width;
    const y2 = croppedPixels.y + croppedPixels.height;

    const topRight = { x: x2, y: y1 };
    const bottomLeft = { x: x1, y: y2 };

    const forcedCrop = {
      x: bottomLeft.x,
      y: topRight.y,
      width: topRight.x - bottomLeft.x,
      height: bottomLeft.y - topRight.y,
    };

    setCroppedAreaPixels(forcedCrop);
  };

  const getCroppedImg = async (imageSrc, cropPixels) => {
    const img = document.createElement("img");
    img.src = imageSrc;
    await new Promise((resolve) => (img.onload = resolve));

    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.floor(cropPixels.width));
    canvas.height = Math.max(1, Math.floor(cropPixels.height));
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    ctx.drawImage(
      img,
      cropPixels.x,
      cropPixels.y,
      cropPixels.width,
      cropPixels.height,
      0,
      0,
      canvas.width,
      canvas.height
    );

    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        if (!blob) return;
        resolve(URL.createObjectURL(blob));
      }, "image/png");
    });
  };

  const finishCrop = async () => {
    if (image && croppedAreaPixels) {
      const croppedImg = await getCroppedImg(image, croppedAreaPixels);
      if (croppedImg) {
        setImage(croppedImg);
      }
    }
    setCropMode(false);
  };

  return (
    <div className="app">
      {/* Sidebar */}
      <aside className="sidebar">
        <img
          src="/screenshotmakerlogo.png"
          alt="Screenshot Maker Logo"
          className="logo"
        />

        <label className="btn">
          Upload Background
          <input
            type="file"
            accept="image/*"
            hidden
            onChange={handleUploadBackground}
          />
        </label>

        <div>
          <h2>Wallpapers</h2>
          <div className="wallpapers">
            {wallpapers.map((w, i) => (
              <div
                key={i}
                className="wallpaper"
                style={{ backgroundImage: w }}
                onClick={() => {
                  setBgGradient(w);
                  setBgImage(null);
                }}
              />
            ))}

            <motion.div
              layout
              className="wallpaper custom"
              style={{
                backgroundImage: `linear-gradient(to right, ${grad1}, ${grad2})`,
              }}
              onClick={() => {
                setBgGradient(`linear-gradient(to right, ${grad1}, ${grad2})`);
                setBgImage(null);
              }}
            >
              <div className="color-inputs">
                <input
                  type="color"
                  value={grad1}
                  onChange={(e) => updateCustomGradient(e.target.value, grad2)}
                />
                <input
                  type="color"
                  value={grad2}
                  onChange={(e) => updateCustomGradient(grad1, e.target.value)}
                />
              </div>
            </motion.div>
          </div>
        </div>

        <div>
          <h2>Zoom</h2>
          <input
            type="range"
            min="0.5"
            max="2"
            step="0.05"
            value={zoom}
            onChange={(e) => setZoom(parseFloat(e.target.value))}
          />
        </div>

        <button onClick={handleDownload} className="btn download">
          Download
        </button>
      </aside>

      {/* Preview Area */}
      <main className="main">
        <div className="toolbar">
          <select
            value={`${canvasSize.w}x${canvasSize.h}`}
            onChange={(e) => {
              const [w, h] = e.target.value.split("x").map(Number);
              setCanvasSize({ w, h });
            }}
          >
            {dimensions.map((d, i) => (
              <option key={i} value={`${d.w}x${d.h}`}>
                {d.name}
              </option>
            ))}
          </select>

          <label className="btn small">
            Upload Screenshot
            <input
              type="file"
              accept="image/*"
              hidden
              onChange={handleUploadScreenshot}
            />
          </label>

          <label className="btn small green">
            Upload Logo
            <input type="file" accept="image/*" hidden onChange={handleUploadLogo} />
          </label>

          {image && (
            <button onClick={() => setCropMode(true)} className="btn small yellow">
              Crop
            </button>
          )}
        </div>

        <div
          ref={captureRef}
          className="canvas"
          style={{
            width: `${previewWidth}px`,
            height: `${fixedHeight}px`,
            backgroundImage: bgImage ? `url(${bgImage})` : bgGradient,
          }}
        >
          {image ? (
            <img
              src={image}
              alt="Screenshot"
              className="screenshot"
              style={{ transform: `scale(${zoom})` }}
            />
          ) : (
            <span className="placeholder">Upload a screenshot</span>
          )}

          {logo && (
            <img
              src={logo}
              alt="Logo"
              className="logo-overlay"
            />
          )}
        </div>

        {cropMode && image && (
          <div className="crop-overlay">
            <div className="crop-container">
              <Cropper
                image={image}
                crop={crop}
                zoom={cropZoom}
                aspect={undefined}
                onCropChange={setCrop}
                onZoomChange={setCropZoom}
                onCropComplete={onCropComplete}
              />
            </div>

            <div className="crop-buttons">
              <button onClick={finishCrop} className="btn small green">Crop</button>
              <button onClick={() => setCropMode(false)} className="btn small red">Cancel</button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
