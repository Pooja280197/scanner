import React, { useState, useEffect, useRef } from "react";
import jsQR from "jsqr";

const QRScannerComponent = () => {
  const [qrData, setQrData] = useState(null);
  const [scanning, setScanning] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" }, // Use back camera on mobile
      });
      streamRef.current = stream;
      videoRef.current.srcObject = stream;

      videoRef.current.onloadedmetadata = () => {
        videoRef.current.play();
        requestAnimationFrame(scanQR);
      };

      setScanning(true);
    } catch (error) {
      console.error("Error accessing camera:", error);
      alert("Unable to access camera. Please ensure you have granted permissions.");
    }
  };

  const scanQR = () => {
    if (videoRef.current?.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      const context = canvas.getContext("2d");
      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(imageData.data, imageData.width, imageData.height);

      if (code) {
        setQrData(code.data);
        sendQRCodeToAPI(code.data);
        stopCamera();
      } else {
        requestAnimationFrame(scanQR);
      }
    } else {
      requestAnimationFrame(scanQR);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setScanning(false);
  };

  const sendQRCodeToAPI = async (data) => {
    try {
      const response = await fetch("https://your-api-endpoint.com/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ qrCode: data }),
      });
      if (response.ok) {
        alert("Read Successfully");
      } else {
        alert("Failed to send QR data");
      }
    } catch (error) {
      console.error("Error sending QR data:", error);
      alert("Error occurred while sending QR data");
    }
  };

  return (
    <div className="flex flex-col items-center gap-4 p-4">
      {!scanning ? (
        <button onClick={startCamera} className="px-4 py-2 bg-blue-500 text-white rounded-lg">
          Start QR Scanner
        </button>
      ) : (
        <>
          <video ref={videoRef} className="w-full max-w-md rounded-lg border" muted playsInline />
          <canvas ref={canvasRef} style={{ display: "none" }} />
          <button onClick={stopCamera} className="mt-2 px-4 py-2 bg-red-500 text-white rounded-lg">
            Stop Scanner
          </button>
        </>
      )}
      {qrData && (
        <div className="mt-4">
          <p>Scanned QR Code Data:</p>
          <p className="font-bold text-lg">{qrData}</p>
        </div>
      )}
    </div>
  );
};

export default QRScannerComponent;