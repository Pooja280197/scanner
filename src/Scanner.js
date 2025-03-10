import React, { useState, useEffect, useRef } from "react";
import jsQR from "jsqr";

const QRScannerComponent = () => {
  const [qrData, setQrData] = useState(null);
  const [isScannerActive, setIsScannerActive] = useState(false); // State to control scanner visibility
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null); // Ref to hold the camera stream

  useEffect(() => {
    if (!isScannerActive) return; // Only start the scanner if it's active

    const startCamera = async () => {
      try {
        // Request camera access
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" }, // Use the rear camera
        });
        streamRef.current = stream; // Store the stream in a ref
        videoRef.current.srcObject = stream;

        // Wait for the video to be ready
        videoRef.current.onloadedmetadata = () => {
          videoRef.current.play();
          requestAnimationFrame(scanQR); // Start scanning
        };
      } catch (error) {
        console.error("Error accessing camera:", error);
        alert("Unable to access camera. Please ensure you have granted permissions.");
      }
    };

    const scanQR = () => {
      if (videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
        const canvas = canvasRef.current;
        const video = videoRef.current;

        // Set canvas dimensions to match video
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        // Draw the video frame on the canvas
        const context = canvas.getContext("2d");
        context.drawImage(video, 0, 0, canvas.width, canvas.height);

        // Extract image data from the canvas
        const imageData = context.getImageData(0, 0, canvas.width, canvas.height);

        // Decode QR code using jsQR
        const code = jsQR(imageData.data, imageData.width, imageData.height);

        if (code) {
          setQrData(code.data); // Set the scanned data
          sendQRCodeToAPI(code.data); // Send data to API
        } else {
          // Continue scanning if no QR code is found
          requestAnimationFrame(scanQR);
        }
      } else {
        // Continue scanning if video is not ready
        requestAnimationFrame(scanQR);
      }
    };

    startCamera();

    // Cleanup on component unmount or when scanner is deactivated
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop()); // Stop all camera tracks
      }
    };
  }, [isScannerActive]); // Re-run effect when isScannerActive changes

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

  const handleScanButtonClick = () => {
    setIsScannerActive(true); // Activate the scanner
  };

  return (
    <div className="flex flex-col items-center gap-4 p-4">
      {!isScannerActive && (
        <button
          onClick={handleScanButtonClick}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
        >
          Open QR Scanner
        </button>
      )}

      {isScannerActive && (
        <>
          <video ref={videoRef} className="w-full max-w-md rounded-lg border" muted playsInline />
          <canvas ref={canvasRef} style={{ display: "none" }} />
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