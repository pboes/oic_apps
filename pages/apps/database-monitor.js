import Link from "next/link";
import { useOICFramework, OICStyles } from "../../lib/oic-framework";
import { useState, useEffect } from "react";

const APP_ID = "database-monitor";

export default function DatabaseMonitorApp() {
  const {
    isConnected,
    generateQR,
    registerEventHandler,
    unregisterEventHandler,
  } = useOICFramework();
  const [qrCode, setQrCode] = useState("");
  const [monitoringActive, setMonitoringActive] = useState(false);

  // Generate QR code on mount
  useEffect(() => {
    generateQRCode();
  }, []);

  // Set up event handler for monitoring activation
  useEffect(() => {
    const criteria = {
      recipient: "0xf48554937f18885c7f15c432c596b5843648231d",
      amount: "1000000000000000000", // 1 CRC in 18 decimals
      data: APP_ID,
    };

    const handleMonitorEvent = (eventData) => {
      console.log("Monitor activation event received:", eventData);
      setMonitoringActive(true);

      // Start monitoring for 60 seconds
      setTimeout(() => {
        setMonitoringActive(false);
      }, 60000);
    };

    registerEventHandler("database-monitor", criteria, handleMonitorEvent);

    return () => {
      unregisterEventHandler("database-monitor");
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

  return (
    <div style={OICStyles.container}>
      <div style={OICStyles.content}>
        <h2 style={OICStyles.h2}>Database Monitor</h2>

        <p>
          <Link href="/" style={OICStyles.link}>
            ← Back to home
          </Link>
        </p>

        <p>
          Pay 1 CRC to activate real-time database monitoring for 60 seconds.
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

        {monitoringActive && (
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
            disabled={monitoringActive}
          >
            {monitoringActive ? "Monitoring Active..." : "Pay 1 CRC to Monitor"}
          </button>
        </div>

        {qrCode && !monitoringActive && (
          <div style={OICStyles.qrContainer}>
            <h3 style={{ ...OICStyles.h3, marginTop: 0 }}>
              Scan to Activate Monitoring
            </h3>
            <img
              src={qrCode}
              alt="Database Monitor QR Code"
              style={{ maxWidth: "250px" }}
            />
            <p style={{ margin: "10px 0", fontSize: "14px", color: "#666" }}>
              Cost: 1 CRC • Duration: 60 seconds
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
