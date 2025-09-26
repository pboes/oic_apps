import { createOICApp, OICStyles } from "../../lib/oic-framework";
import { useState, useEffect } from "react";

const metadata = {
  appId: "database-monitor",
  title: "Database Monitor",
  description:
    "Pay 1 $OPEN to activate real-time database monitoring for 60 seconds.",
  amount: 1,
  recipient: "0xf48554937f18885c7f15c432c596b5843648231d", // Required recipient address
  initialState: {
    qrCode: "",
    monitoringActive: false,
  },
  onPayment: (eventData, appState, setAppState) => {
    console.log("Monitor activation event received:", eventData);

    setAppState((prev) => ({
      ...prev,
      monitoringActive: true,
    }));

    // Start monitoring for 60 seconds
    setTimeout(() => {
      setAppState((prev) => ({
        ...prev,
        monitoringActive: false,
      }));
    }, 60000);
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

  return (
    <>
      {appState.monitoringActive && (
        <div
          style={{
            margin: "20px 0",
            padding: "15px",
            backgroundColor: "#f0f8f0",
            border: "2px solid #4CAF50",
            borderRadius: "5px",
          }}
        >
          <h3 style={{ ...OICStyles.h3, marginTop: 0, color: "#4CAF50" }}>
            Monitoring Active
          </h3>
          <p style={{ margin: "5px 0", fontSize: "14px" }}>
            Watching for database events in real-time...
          </p>
        </div>
      )}

      <div
        style={{
          textAlign: "center",
          margin: "30px 0",
        }}
      >
        <button
          onClick={generateQRCode}
          style={{
            ...OICStyles.button,
            ...OICStyles.buttonPrimary,
            padding: "12px 24px",
            fontSize: "16px",
          }}
          disabled={appState.monitoringActive}
        >
          {appState.monitoringActive
            ? "Monitoring Active..."
            : "Pay 1 CRC to Monitor"}
        </button>
      </div>

      {appState.qrCode && !appState.monitoringActive && (
        <div style={OICStyles.qrContainer}>
          <h3 style={{ ...OICStyles.h3, marginTop: 0 }}>
            Scan to Activate Monitoring
          </h3>
          <img
            src={appState.qrCode}
            alt="Database Monitor QR Code"
            style={{ maxWidth: "250px" }}
          />
          <p style={{ margin: "10px 0", fontSize: "14px", color: "#666" }}>
            Cost: {metadata.amount} $OPEN • Duration: 60 seconds
          </p>
        </div>
      )}
    </>
  );
};

export default createOICApp(metadata, appContent);
