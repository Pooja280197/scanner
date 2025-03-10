import { Html5QrcodeScanner } from "html5-qrcode";
import { useEffect } from "react";



function Scanner() {
    useEffect(() => {
        const scanner = new Html5QrcodeScanner("reader", {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        });
    
        scanner.render(
          (decodedText) => {
            alert(`Scanned: ${decodedText}`);
          },
          (errorMessage) => {
            console.warn(`QR Error: ${errorMessage}`);
          }
        );
    
        return () => scanner.clear();
      }, []);
    
      return <div id="reader"></div>;
    };
export default Scanner
