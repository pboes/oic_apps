import Link from "next/link";
import {
  useOICFramework,
  OICCriteria,
  OICStyles,
} from "../../lib/oic-framework";
import { useState, useEffect } from "react";

const APP_ID = "random-number";

export default function RandomNumberApp() {
  const {
    isConnected,
    generateQR,
    registerEventHandler,
    unregisterEventHandler,
  } = useOICFramework();
  const [qrCode, setQrCode] = useState("");
  const [randomNumber, setRandomNumber] = useState(null);
  const [isWaiting, setIsWaiting] = useState(false);
  const [lastTransaction, setLastTransaction] = useState(null);

  // Generate QR code on mount
  useEffect(() => {
    generateQRCode();
  }, []);

  // Set up event handler
  useEffect(() => {
    const criteria = {
      recipient: "0xf48554937f18885c7f15c432c596b5843648231d",
      amount: "1000000000000000000", // 1 CRC in 18 decimals
      data: APP_ID,
    };

    const handleRandomEvent = (eventData) => {
      console.log("Random number event received:", eventData);

      // Generate a random number between 1 and 1000
      const newRandomNumber = Math.floor(Math.random() * 1000) + 1;
      setRandomNumber(newRandomNumber);
      setIsWaiting(false);
      setLastTransaction(eventData);
    };

    registerEventHandler("random-generator", criteria, handleRandomEvent);

    return () => {
      unregisterEventHandler("random-generator");
    };
  }, [registerEventHandler, unregisterEventHandler]);

  const generateQRCode = async () => {
    try {
      const result = await generateQR(1, APP_ID);
      setQrCode(result.qrCode);
    } catch (error) {
      console.error("Failed to generate QR code:", error);
    }
  };

  const handleGenerateClick = () => {
    setIsWaiting(true);
    setRandomNumber(null);
    generateQRCode();
  };

  return (
    <div style={OICStyles.container}>
      <div style={OICStyles.content}>
        <h2 style={OICStyles.h2}>Random Number Generator</h2>

        <p>
          <Link href="/" style={OICStyles.link}>
            ← Back to home
          </Link>
        </p>

        <p>
          Send exactly 1 CRC to generate a random number between 1 and 1000.
        </p>

        {!isConnected && (
          <div
            style={{
              ...OICStyles.status,
              ...OICStyles.statusDisconnected,
            }}
          >
            WARNING: Database connection lost
          </div>
        )}

        {randomNumber && (
          <div
            style={{
              textAlign: "center",
              margin: "30px 0",
              padding: "20px",
              backgroundColor: "#f0f8f0",
              border: "2px solid #4CAF50",
              borderRadius: "5px",
            }}
          >
            <h3 style={{ ...OICStyles.h3, marginTop: 0 }}>
              Your Random Number
            </h3>
            <div
              style={{
                fontSize: "48px",
                fontWeight: "bold",
                color: "#4CAF50",
                margin: "10px 0",
              }}
            >
              {randomNumber}
            </div>
            {lastTransaction && (
              <small style={{ color: "#666" }}>
                Generated from transaction:{" "}
                {lastTransaction.transactionHash?.substring(0, 10)}...
              </small>
            )}
          </div>
        )}

        <div
          style={{
            textAlign: "center",
            margin: "30px 0",
          }}
        >
          <button
            onClick={handleGenerateClick}
            style={{
              ...OICStyles.button,
              ...OICStyles.buttonPrimary,
              padding: "12px 24px",
              fontSize: "16px",
            }}
            disabled={isWaiting}
          >
            {isWaiting ? "Waiting for payment..." : "Generate New QR Code"}
          </button>
        </div>

        {qrCode && (
          <div style={OICStyles.qrContainer}>
            <h3 style={{ ...OICStyles.h3, marginTop: 0 }}>
              {isWaiting ? "Scan to Generate Random Number" : "Scan QR Code"}
            </h3>
            <img
              src={qrCode}
              alt="Random Number QR Code"
              style={{ maxWidth: "250px" }}
            />
            <p style={{ margin: "10px 0", fontSize: "14px", color: "#666" }}>
              Cost: 1 CRC
            </p>
          </div>
        )}
      </div>

      <style jsx>{`
        @media (max-width: 600px) {
          img {
            max-width: 200px !important;
          }
        }
      `}</style>
    </div>
  );
}
