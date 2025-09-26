import { createOICApp, OICStyles } from "../../lib/oic-framework";
import { useState, useEffect } from "react";

const metadata = {
  appId: "random-number",
  title: "Random Number Generator",
  description:
    "Send exactly 1 CRC to generate a random number between 1 and 1000.",
  amount: 1,
  initialState: {
    qrCode: "",
    randomNumber: null,
    isWaiting: false,
    lastTransaction: null,
  },
  onPayment: (eventData, appState, setAppState) => {
    console.log("Random number event received:", eventData);

    // Generate a random number between 1 and 1000
    const newRandomNumber = Math.floor(Math.random() * 1000) + 1;

    setAppState((prev) => ({
      ...prev,
      randomNumber: newRandomNumber,
      isWaiting: false,
      lastTransaction: eventData,
    }));
  },
};

const appContent = ({ appState, setAppState, generateQR, metadata }) => {
  // Generate QR code on mount
  useEffect(() => {
    generateQRCode();
  }, []);

  const generateQRCode = async () => {
    try {
      const result = await generateQR(metadata.amount, metadata.appId);
      setAppState((prev) => ({ ...prev, qrCode: result.qrCode }));
    } catch (error) {
      console.error("Failed to generate QR code:", error);
    }
  };

  const handleGenerateClick = () => {
    setAppState((prev) => ({
      ...prev,
      isWaiting: true,
      randomNumber: null,
    }));
    generateQRCode();
  };

  return (
    <>
      {appState.randomNumber && (
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
          <h3 style={{ ...OICStyles.h3, marginTop: 0 }}>Your Random Number</h3>
          <div
            style={{
              fontSize: "48px",
              fontWeight: "bold",
              color: "#4CAF50",
              margin: "10px 0",
            }}
          >
            {appState.randomNumber}
          </div>
          {appState.lastTransaction && (
            <small style={{ color: "#666" }}>
              Generated from transaction:{" "}
              {appState.lastTransaction.transactionHash?.substring(0, 10)}...
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
          disabled={appState.isWaiting}
        >
          {appState.isWaiting
            ? "Waiting for payment..."
            : "Generate New QR Code"}
        </button>
      </div>

      {appState.qrCode && (
        <div style={OICStyles.qrContainer}>
          <h3 style={{ ...OICStyles.h3, marginTop: 0 }}>
            {appState.isWaiting
              ? "Scan to Generate Random Number"
              : "Scan QR Code"}
          </h3>
          <img
            src={appState.qrCode}
            alt="Random Number QR Code"
            style={{ maxWidth: "250px" }}
          />
          <p style={{ margin: "10px 0", fontSize: "14px", color: "#666" }}>
            Cost: {metadata.amount} CRC
          </p>
        </div>
      )}
    </>
  );
};

export default createOICApp(metadata, appContent);
