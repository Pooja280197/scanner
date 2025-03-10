import React, { useState } from 'react'
import {QrReader} from "react-qr-reader"; // No curly braces in this version



function Scanner() {
    const [scanResult, setScanResult] = useState(null);
    const [scanning, setScanning] = useState(false);

    const handleScan = async (data) => {
        if (data) {
            setScanResult(data);
            setScanning(false); // Scanner close kare

            // API ko hit kare
            try {
                const response = await fetch("https://your-api-url.com/scan", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ qrCode: data }),
                });

                const result = await response.json();
                console.log("API Response:", result);
                alert("API Response: " + JSON.stringify(result));
            } catch (error) {
                console.error("API Error:", error);
                alert("Error hitting API!");
            }
        }
    };

    const handleError = (err) => {
        console.error("QR Scanner Error:", err);
    };

    return (
        <div style={{ textAlign: "center", padding: "20px" }}>
            <h2>QR Code Scanner</h2>

            {/* Button to start scanning */}
            {!scanning && (
                <button onClick={() => setScanning(true)} style={{ padding: "10px", fontSize: "16px" }}>
                    Start Scanner
                </button>
            )}

            {/* QR Scanner */}
            {scanning && (
                <div style={{ marginTop: "20px" }}>
                    <QrReader
  constraints={{
    video: { facingMode: "environment" },
  }}
  delay={300}
  onError={handleError}
  onScan={handleScan}
  style={{ width: "100%" }}
/>
                </div>
            )}

            {/* Show scanned result */}
            {scanResult && <p>Scanned Data: {scanResult}</p>}
        </div>
    );

}

export default Scanner
