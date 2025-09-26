import { useState, useEffect } from "react";
import { io } from "socket.io-client";

// OIC Framework - Common utilities for building Open Internet Club apps
export class OICFramework {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.eventHandlers = new Map();
  }

  // Initialize socket connection
  initializeSocket() {
    if (this.socket) return this.socket;

    this.socket = io();

    this.socket.on("connect", () => {
      console.log("✅ OIC Framework connected to server");
      this.isConnected = true;
    });

    this.socket.on("disconnect", () => {
      console.log("❌ OIC Framework disconnected from server");
      this.isConnected = false;
    });

    this.socket.on("db-change", (eventData) => {
      console.log("🔥 OIC Framework received event:", eventData);
      this.handleDatabaseEvent(eventData);
    });

    return this.socket;
  }

  // Register an event handler for specific criteria
  registerEventHandler(name, criteria, callback) {
    this.eventHandlers.set(name, { criteria, callback });
    console.log(`📋 Registered event handler: ${name}`);
  }

  // Remove an event handler
  unregisterEventHandler(name) {
    this.eventHandlers.delete(name);
    console.log(`🗑️ Unregistered event handler: ${name}`);
  }

  // Handle incoming database events
  handleDatabaseEvent(eventData) {
    for (const [name, handler] of this.eventHandlers) {
      if (this.matchesCriteria(eventData, handler.criteria)) {
        console.log(`✅ Event matches criteria for handler: ${name}`);
        handler.callback(eventData);
      }
    }
  }

  // Check if event matches criteria
  matchesCriteria(eventData, criteria) {
    // Check recipient
    if (criteria.recipient && eventData.recipient !== criteria.recipient) {
      return false;
    }

    // Check sender (if specified)
    if (criteria.sender && eventData.sender !== criteria.sender) {
      return false;
    }

    // Check amount (if specified)
    if (criteria.amount && eventData.amount !== criteria.amount.toString()) {
      return false;
    }

    // Check data field
    if (criteria.data) {
      if (typeof criteria.data === "string") {
        // Exact match or contains check
        const dataMatch =
          eventData.data === criteria.data ||
          (eventData.data && eventData.data.includes(criteria.data));
        if (!dataMatch) return false;
      } else if (typeof criteria.data === "function") {
        // Custom data validation function
        if (!criteria.data(eventData.data)) return false;
      }
    }

    // Check custom validation function
    if (criteria.validator && !criteria.validator(eventData)) {
      return false;
    }

    return true;
  }

  // Generate QR code for app
  async generateQR(amount, appId, customData = "", recipient = null) {
    try {
      // Combine appId and customData if provided
      const dataField = customData ? `${appId}:${customData}` : appId;

      const response = await fetch("/api/qr", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          value: amount,
          data: dataField,
          recipient: recipient,
        }),
      });

      const result = await response.json();
      if (result.success) {
        return result;
      } else {
        throw new Error(result.error || "QR generation failed");
      }
    } catch (error) {
      console.error("❌ QR generation error:", error);
      throw error;
    }
  }

  // Cleanup connections
  cleanup() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.eventHandlers.clear();
    this.isConnected = false;
  }
}

// React hook for using OIC Framework
export function useOICFramework() {
  const [framework] = useState(() => new OICFramework());
  const [isConnected, setIsConnected] = useState(false);
  const [events, setEvents] = useState([]);

  useEffect(() => {
    const socket = framework.initializeSocket();

    const handleConnect = () => setIsConnected(true);
    const handleDisconnect = () => setIsConnected(false);
    const handleEvent = (data) => {
      setEvents((prev) => [data, ...prev.slice(0, 9)]); // Keep last 10 events
    };

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("db-change", handleEvent);

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("db-change", handleEvent);
      framework.cleanup();
    };
  }, [framework]);

  return {
    framework,
    isConnected,
    events,
    generateQR: (amount, appId, customData = "", recipient = null) =>
      framework.generateQR(amount, appId, customData, recipient),
    registerEventHandler: framework.registerEventHandler.bind(framework),
    unregisterEventHandler: framework.unregisterEventHandler.bind(framework),
  };
}

// Predefined criteria builders for common use cases
export const OICCriteria = {
  // App activation criteria (1 token to specific recipient with app ID)
  appPayment: (
    appId,
    amount = 1,
    recipient = "0xf48554937f18885c7f15c432c596b5843648231d",
  ) => ({
    recipient: recipient,
    amount: (BigInt(amount) * BigInt(10 ** 18)).toString(), // Convert to 18 decimals string
    data: appId,
  }),

  // Payment criteria with sender validation (specific amount from specific sender)
  userPayment: (
    sender,
    amount,
    appId,
    recipient = "0xf48554937f18885c7f15c432c596b5843648231d",
  ) => ({
    recipient: recipient,
    sender: sender,
    amount: (BigInt(amount) * BigInt(10 ** 18)).toString(),
    data: appId,
  }),

  // Any payment to the OIC contract with specific app ID
  anyAppPayment: (
    appId,
    recipient = "0xf48554937f18885c7f15c432c596b5843648231d",
  ) => ({
    recipient: recipient,
    data: appId,
  }),

  // Custom validation function for complex criteria
  custom: (validatorFunction) => ({
    recipient: "0xf48554937f18885c7f15c432c596b5843648231d",
    validator: validatorFunction,
  }),
};

// Common OIC styles following the retro aesthetic
export const OICStyles = {
  // Main container styles
  container: {
    lineHeight: 1.4,
    fontSize: "16px",
    padding: "0 10px",
    margin: "50px auto",
    maxWidth: "650px",
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  },

  // Content wrapper
  content: {
    maxWidth: "42em",
    margin: "15px auto",
    marginTop: "70px",
  },

  // Headers
  h1: {
    color: "#333",
    borderBottom: "1px solid #eee",
    paddingBottom: "10px",
    fontSize: "24px",
  },

  h2: {
    color: "#333",
    borderBottom: "1px solid #eee",
    paddingBottom: "10px",
    fontSize: "20px",
  },

  h3: {
    color: "#555",
    marginTop: "30px",
    fontSize: "18px",
  },

  // Links
  link: {
    color: "#0066cc",
    textDecoration: "underline",
    cursor: "pointer",
  },

  linkHover: {
    color: "#004499",
  },

  // Buttons (old-school style)
  button: {
    padding: "4px 8px",
    fontSize: "14px",
    backgroundColor: "#ffffff",
    border: "1px solid #000000",
    borderRadius: "0",
    cursor: "pointer",
    fontFamily: "inherit",
    boxShadow: "none",
  },

  buttonPrimary: {
    backgroundColor: "#ffffff",
    color: "#000000",
    border: "1px solid #000000",
  },

  buttonHover: {
    backgroundColor: "#eeeeee",
  },

  // Status indicators (only show when disconnected)
  status: {
    fontSize: "12px",
    fontWeight: "bold",
    padding: "4px 8px",
    border: "1px solid red",
    backgroundColor: "#ffe6e6",
  },

  statusDisconnected: {
    color: "red",
  },

  // QR code container
  qrContainer: {
    textAlign: "center",
    margin: "20px 0",
    padding: "20px",
  },

  // Debug info
  debug: {
    fontSize: "12px",
    color: "#666",
    backgroundColor: "#f9f9f9",
    padding: "10px",
    border: "1px solid #eee",
    borderRadius: "3px",
    marginTop: "20px",
  },

  // Mobile responsive adjustments
  "@media (max-width: 600px)": {
    container: {
      margin: "20px auto",
    },
    content: {
      marginTop: "30px",
      marginLeft: "10px",
      marginRight: "10px",
    },
  },
};

// Helper function to create an OIC app component with automatic layout
export function createOICApp(metadata, appContent) {
  return function OICApp() {
    const {
      isConnected,
      generateQR,
      registerEventHandler,
      unregisterEventHandler,
    } = useOICFramework();
    const [appState, setAppState] = useState(metadata.initialState || {});

    // Automatically register event handler for this app
    useEffect(() => {
      if (metadata.appId) {
        const criteria = {
          recipient:
            metadata.recipient || "0xf48554937f18885c7f15c432c596b5843648231d",
          amount: metadata.amount
            ? (BigInt(metadata.amount) * BigInt(10 ** 18)).toString()
            : "1000000000000000000",
          data: metadata.appId,
        };

        const handleEvent = (eventData) => {
          if (metadata.onPayment) {
            metadata.onPayment(eventData, appState, setAppState);
          }
        };

        registerEventHandler(
          `${metadata.appId}-handler`,
          criteria,
          handleEvent,
        );

        return () => {
          unregisterEventHandler(`${metadata.appId}-handler`);
        };
      }
    }, [registerEventHandler, unregisterEventHandler]);

    // Import the layout component dynamically
    const OICAppLayout = require("../components/OICAppLayout").default;

    return (
      <OICAppLayout
        title={metadata.title}
        description={metadata.description}
        isConnected={isConnected}
      >
        {appContent({
          appState,
          setAppState,
          isConnected,
          generateQR: (amount, appId, customData = "") =>
            generateQR(amount, appId, customData, metadata.recipient),
          metadata,
        })}
      </OICAppLayout>
    );
  };
}

export default OICFramework;
