import { useState, useEffect } from "react";
import { io } from "socket.io-client";

export default function Home() {
  const [sliderValue, setSliderValue] = useState(50);
  const [qrCode, setQrCode] = useState("");
  const [qrData, setQrData] = useState(null);
  const [events, setEvents] = useState([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const socket = io();

    socket.on("connect", () => {
      console.log("Connected to server");
      setIsConnected(true);
    });

    socket.on("disconnect", () => {
      console.log("Disconnected from server");
      setIsConnected(false);
    });

    socket.on("db-change", (data) => {
      console.log("Database change:", data);
      setEvents((prev) => [
        {
          ...data,
          timestamp: new Date().toLocaleTimeString(),
        },
        ...prev.slice(0, 9),
      ]); // Keep last 10 events
    });

    return () => socket.disconnect();
  }, []);

  const generateQR = async () => {
    try {
      const response = await fetch("/api/qr", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ value: sliderValue }),
      });

      const data = await response.json();
      if (data.success) {
        setQrCode(data.qrCode);
        setQrData(data);
      }
    } catch (error) {
      console.error("Error generating QR code:", error);
    }
  };

  useEffect(() => {
    generateQR();
  }, [sliderValue]);

  return (
    <div
      style={{
        padding: "20px",
        maxWidth: "800px",
        margin: "0 auto",
        fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif",
      }}
    >
      <h1>OIC Simple App</h1>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          marginBottom: "20px",
        }}
      >
        <span>Connection:</span>
        <span
          style={{
            color: isConnected ? "green" : "red",
            fontWeight: "bold",
          }}
        >
          {isConnected ? "● Connected" : "● Disconnected"}
        </span>
      </div>

      <div
        style={{
          background: "#f5f5f5",
          padding: "20px",
          borderRadius: "8px",
          marginBottom: "30px",
        }}
      >
        <h2>Number Slider</h2>
        <div style={{ marginBottom: "20px" }}>
          <input
            type="range"
            min="1"
            max="100"
            value={sliderValue}
            onChange={(e) => setSliderValue(parseInt(e.target.value))}
            style={{ width: "100%" }}
          />
          <div
            style={{
              textAlign: "center",
              marginTop: "10px",
              fontSize: "24px",
              fontWeight: "bold",
            }}
          >
            {sliderValue}
          </div>
        </div>

        {qrCode && qrData && (
          <div style={{ textAlign: "center" }}>
            <h3>Generated QR Code</h3>
            <img
              src={qrCode}
              alt="QR Code"
              style={{ border: "1px solid #ddd", borderRadius: "4px" }}
            />
            <div
              style={{
                marginTop: "15px",
                textAlign: "left",
                fontSize: "14px",
                color: "#333",
              }}
            >
              <div style={{ marginBottom: "10px" }}>
                <strong>Kitchen URL:</strong>
                <div
                  style={{
                    background: "#fff",
                    padding: "8px",
                    border: "1px solid #ddd",
                    borderRadius: "4px",
                    marginTop: "5px",
                    wordBreak: "break-all",
                    fontSize: "12px",
                  }}
                >
                  {qrData.url}
                </div>
              </div>
              <div style={{ marginBottom: "10px" }}>
                <strong>Slider Value:</strong> {sliderValue}
              </div>
              <div>
                <strong>Packed Data:</strong>
                <div
                  style={{
                    background: "#fff",
                    padding: "8px",
                    border: "1px solid #ddd",
                    borderRadius: "4px",
                    marginTop: "5px",
                    wordBreak: "break-all",
                    fontSize: "10px",
                    fontFamily: "monospace",
                  }}
                >
                  {qrData.packedData}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div
        style={{
          background: "#f0f8ff",
          padding: "20px",
          borderRadius: "8px",
        }}
      >
        <h2>Database Events (CrcV2_OIC_OpenMiddlewareTransfer)</h2>
        {events.length === 0 ? (
          <p style={{ color: "#666", fontStyle: "italic" }}>
            Waiting for database events...
          </p>
        ) : (
          <div>
            {events.map((event, index) => (
              <div
                key={index}
                style={{
                  background: "white",
                  padding: "10px",
                  margin: "10px 0",
                  borderRadius: "4px",
                  border: "1px solid #ddd",
                }}
              >
                <div style={{ fontWeight: "bold" }}>{event.table}</div>
                <div style={{ fontSize: "14px", color: "#666" }}>
                  {event.newRows} new rows added at {event.timestamp}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
