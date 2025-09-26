import { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";

const GAME_STATES = {
  LOGIN: "login",
  GAME: "game",
  WAITING_TIME: "waiting_time",
  GAME_OVER: "game_over",
};

export default function PingPongGame() {
  const canvasRef = useRef(null);
  const gameLoopRef = useRef(null);
  const [gameState, setGameState] = useState(GAME_STATES.LOGIN);
  const [loggedInUser, setLoggedInUser] = useState(null);
  const [timeLeft, setTimeLeft] = useState(30);
  const [qrCode, setQrCode] = useState("");
  const [qrData, setQrData] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState(1);
  const [events, setEvents] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [score, setScore] = useState(0);
  const [gameInitialized, setGameInitialized] = useState(false);

  // Game state
  const gameStateRef = useRef({
    ball: { x: 400, y: 300, dx: 4, dy: 4, radius: 10 },
    paddle: { x: 350, y: 550, width: 100, height: 10 },
    canvas: { width: 800, height: 600 },
  });

  // Socket connection
  useEffect(() => {
    const socket = io();

    socket.on("connect", () => {
      console.log("✅ SOCKET CONNECTED to server");
      setIsConnected(true);
    });

    socket.on("disconnect", () => {
      console.log("❌ SOCKET DISCONNECTED from server");
      setIsConnected(false);
    });

    socket.on("db-change", (data) => {
      console.log("🔥 SOCKET EVENT RECEIVED:", data);
      console.log("🎮 Current game state when event received:", gameState);
      console.log("👤 Current logged in user:", loggedInUser);
      handleNewEvent(data);
    });

    // Test socket connection
    socket.on("connect_error", (error) => {
      console.error("❌ SOCKET CONNECTION ERROR:", error);
    });

    return () => socket.disconnect();
  }, []);

  // Timer countdown
  useEffect(() => {
    let interval;
    if (gameState === GAME_STATES.GAME && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          const newTime = prev - 1;
          if (newTime <= 0) {
            setGameState(GAME_STATES.WAITING_TIME);
            return 0;
          }
          return newTime;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [gameState]);

  // Generate QR codes
  const generateQR = async (amount, dataType = "game") => {
    try {
      const response = await fetch("/api/qr", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          value: amount,
          data: dataType,
        }),
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

  // Handle new database events
  const handleNewEvent = (eventData) => {
    console.log("🚀 handleNewEvent called!");
    console.log("📊 Event data received:", JSON.stringify(eventData, null, 2));
    console.log("🎮 Game state at event time:", gameState);
    console.log("👤 Logged in user at event time:", loggedInUser);

    // Add to events list for debugging
    setEvents((prev) => [eventData, ...prev.slice(0, 9)]);

    console.log("=== TRANSACTION EVENT DEBUG ===");
    console.log("Received event:", JSON.stringify(eventData, null, 2));
    console.log("Current game state:", gameState);
    console.log("Logged in user:", loggedInUser);

    // For login
    console.log("🔍 Checking if we should process login...");
    console.log(
      "🔍 gameState === GAME_STATES.LOGIN?",
      gameState === GAME_STATES.LOGIN,
    );
    console.log("🔍 GAME_STATES.LOGIN =", GAME_STATES.LOGIN);
    console.log("🔍 gameState =", gameState);

    if (gameState === GAME_STATES.LOGIN) {
      console.log("🎯 PROCESSING LOGIN EVENT!");
      const expectedLoginAmount = "1000000000000000000"; // 1 token in 18 decimals

      console.log("=== LOGIN CHECK ===");
      console.log("Event recipient:", eventData.recipient);
      console.log(
        "Expected recipient:",
        "0xf48554937f18885c7f15c432c596b5843648231d",
      );
      console.log("Event amount:", eventData.amount);
      console.log("Expected amount:", expectedLoginAmount);
      console.log("Event data (raw):", eventData.data);
      console.log("Event data (typeof):", typeof eventData.data);
      console.log(
        "Event data (length):",
        eventData.data ? eventData.data.length : "null",
      );
      console.log("Expected data:", "game");

      // Check each criterion individually
      const recipientMatch =
        eventData.recipient === "0xf48554937f18885c7f15c432c596b5843648231d";
      const amountMatch = eventData.amount === expectedLoginAmount;
      const dataMatch =
        eventData.data === "game" ||
        (eventData.data && eventData.data.trim() === "game") ||
        (eventData.data && eventData.data.includes("game"));

      console.log("Recipient match:", recipientMatch);
      console.log("Amount match:", amountMatch);
      console.log("Data match:", dataMatch);

      // Log specific reasons for failure
      const rejectionReasons = [];
      if (!recipientMatch) {
        rejectionReasons.push(
          `Recipient mismatch: got ${eventData.recipient}, expected 0xf48554937f18885c7f15c432c596b5843648231d`,
        );
      }
      if (!amountMatch) {
        rejectionReasons.push(
          `Amount mismatch: got ${eventData.amount}, expected ${expectedLoginAmount}`,
        );
      }
      if (!dataMatch) {
        rejectionReasons.push(
          `Data mismatch: got "${eventData.data}", expected "game"`,
        );
      }

      if (recipientMatch && amountMatch && dataMatch) {
        console.log("✅ LOGIN SUCCESSFUL!");
        setLoggedInUser(eventData.sender);
        setTimeLeft(30); // Reset timer to 30 seconds
        setGameInitialized(true); // Mark as first time starting game
        setGameState(GAME_STATES.GAME);
      } else {
        console.log("❌ LOGIN FAILED - Rejection reasons:");
        rejectionReasons.forEach((reason) => console.log("  - " + reason));
      }
    } else {
      console.log("⏭️ SKIPPING LOGIN CHECK - not in login state");
    }

    // For adding time
    console.log("🔍 Checking if we should process payment...");
    console.log(
      "🔍 gameState === GAME_STATES.WAITING_TIME?",
      gameState === GAME_STATES.WAITING_TIME,
    );
    console.log("🔍 loggedInUser exists?", !!loggedInUser);

    if (gameState === GAME_STATES.WAITING_TIME && loggedInUser) {
      console.log("🎯 PROCESSING PAYMENT EVENT!");
      const expectedAmount = (
        BigInt(paymentAmount) * BigInt(10 ** 18)
      ).toString();

      console.log("=== PAYMENT CHECK ===");
      console.log("Expected amount:", expectedAmount);
      console.log("Event amount:", eventData.amount);
      console.log("Amount match:", eventData.amount === expectedAmount);
      console.log("Event sender:", eventData.sender);
      console.log("Logged in user:", loggedInUser);
      console.log("Sender match:", eventData.sender === loggedInUser);
      console.log("Event recipient:", eventData.recipient);
      console.log("Event data:", eventData.data);

      const recipientMatch =
        eventData.recipient === "0xf48554937f18885c7f15c432c596b5843648231d";
      const dataMatch =
        eventData.data === "game" ||
        (eventData.data && eventData.data.includes("game"));
      const senderMatch = eventData.sender === loggedInUser;
      const amountMatch = eventData.amount === expectedAmount;

      console.log("Recipient match:", recipientMatch);
      console.log("Data match:", dataMatch);
      console.log("Sender match:", senderMatch);
      console.log("Amount match:", amountMatch);

      // Log specific reasons for failure
      const rejectionReasons = [];
      if (!recipientMatch) {
        rejectionReasons.push(
          `Recipient mismatch: got ${eventData.recipient}, expected 0xf48554937f18885c7f15c432c596b5843648231d`,
        );
      }
      if (!dataMatch) {
        rejectionReasons.push(
          `Data mismatch: got "${eventData.data}", expected "game"`,
        );
      }
      if (!senderMatch) {
        rejectionReasons.push(
          `Sender mismatch: got ${eventData.sender}, expected ${loggedInUser}`,
        );
      }
      if (!amountMatch) {
        rejectionReasons.push(
          `Amount mismatch: got ${eventData.amount}, expected ${expectedAmount}`,
        );
      }

      if (recipientMatch && dataMatch && senderMatch && amountMatch) {
        console.log("✅ PAYMENT SUCCESSFUL!");
        const additionalTime = paymentAmount * 30;
        setTimeLeft(additionalTime);
        setGameState(GAME_STATES.GAME);
        // Don't reset gameInitialized - preserve ball position and score
      } else {
        console.log("❌ PAYMENT FAILED - Rejection reasons:");
        rejectionReasons.forEach((reason) => console.log("  - " + reason));
      }
    } else {
      console.log(
        "⏭️ SKIPPING PAYMENT CHECK - not in waiting_time state or no logged in user",
      );
    }

    console.log("✅ handleNewEvent completed");
    console.log("=== END TRANSACTION EVENT DEBUG ===");
  };

  // Test function to simulate transactions
  const simulateTransaction = (type) => {
    if (type === "login") {
      const mockEvent = {
        sender: "0x1234567890123456789012345678901234567890",
        recipient: "0xf48554937f18885c7f15c432c596b5843648231d",
        amount: "1000000000000000000",
        data: "game",
        transactionHash: "0xmock123",
        timestamp: new Date().toISOString(),
      };
      handleNewEvent(mockEvent);
    } else if (type === "payment" && loggedInUser) {
      const mockEvent = {
        sender: loggedInUser,
        recipient: "0xf48554937f18885c7f15c432c596b5843648231d",
        amount: (BigInt(paymentAmount) * BigInt(10 ** 18)).toString(),
        data: "game",
        transactionHash: "0xmockpay123",
        timestamp: new Date().toISOString(),
      };
      handleNewEvent(mockEvent);
    }
  };

  // Game logic
  const gameLoop = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    const game = gameStateRef.current;

    // Only run game loop if we're in GAME state and have time left
    if (gameState !== GAME_STATES.GAME || timeLeft <= 0) return;

    // Clear canvas
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, game.canvas.width, game.canvas.height);

    // Update ball position
    game.ball.x += game.ball.dx;
    game.ball.y += game.ball.dy;

    // Ball collision with walls
    if (
      game.ball.x + game.ball.radius > game.canvas.width ||
      game.ball.x - game.ball.radius < 0
    ) {
      game.ball.dx = -game.ball.dx;
    }
    if (game.ball.y - game.ball.radius < 0) {
      game.ball.dy = -game.ball.dy;
    }

    // Ball collision with paddle - improved detection
    if (
      game.ball.y + game.ball.radius >= game.paddle.y &&
      game.ball.y <= game.paddle.y + game.paddle.height &&
      game.ball.x + game.ball.radius >= game.paddle.x &&
      game.ball.x - game.ball.radius <= game.paddle.x + game.paddle.width &&
      game.ball.dy > 0 // Only bounce if ball is moving downward
    ) {
      // Move ball above paddle to prevent sticking
      game.ball.y = game.paddle.y - game.ball.radius - 1;
      game.ball.dy = -Math.abs(game.ball.dy); // Make sure ball bounces up
      setScore((prev) => prev + 1);

      // Add some angle based on where ball hits paddle
      const hitPos = (game.ball.x - game.paddle.x) / game.paddle.width;
      game.ball.dx = (hitPos - 0.5) * 6; // Adjust horizontal speed based on hit position

      console.log(
        "Paddle hit! Score:",
        score + 1,
        "Ball position:",
        game.ball.x,
        game.ball.y,
      );
    }

    // Ball out of bounds (game over)
    if (game.ball.y > game.canvas.height) {
      console.log("Ball went out of bounds! Resetting...");
      game.ball = { x: 400, y: 300, dx: 4, dy: 4, radius: 10 };
      setScore(0);
    }

    // Draw ball
    ctx.fillStyle = "#fff";
    ctx.beginPath();
    ctx.arc(game.ball.x, game.ball.y, game.ball.radius, 0, Math.PI * 2);
    ctx.fill();

    // Draw paddle
    ctx.fillStyle = "#fff";
    ctx.fillRect(
      game.paddle.x,
      game.paddle.y,
      game.paddle.width,
      game.paddle.height,
    );

    gameLoopRef.current = requestAnimationFrame(gameLoop);
  };

  // Start/stop game loop based on state
  useEffect(() => {
    if (gameState === GAME_STATES.GAME && timeLeft > 0) {
      // Only reset ball position on initial login (first time), not on top-ups
      if (gameInitialized) {
        console.log("Initializing new game - resetting ball position");
        gameStateRef.current.ball = {
          x: 400,
          y: 300,
          dx: 4,
          dy: 4,
          radius: 10,
        };
        setGameInitialized(false); // Reset flag after first initialization
      } else {
        console.log(
          "Resuming game - keeping ball position:",
          gameStateRef.current.ball,
        );
      }
      gameLoop();
    } else {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
        gameLoopRef.current = null;
      }
    }
    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, [gameState, timeLeft, gameInitialized]);

  // Mouse control for paddle
  const handleMouseMove = (e) => {
    if (gameState === GAME_STATES.GAME && timeLeft > 0) {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      gameStateRef.current.paddle.x = Math.max(0, Math.min(mouseX - 50, 700));
    }
  };

  // Initialize login QR
  useEffect(() => {
    if (gameState === GAME_STATES.LOGIN) {
      generateQR(1, "game");
    }
  }, [gameState]);

  // Generate payment QR when amount changes
  useEffect(() => {
    if (gameState === GAME_STATES.WAITING_TIME) {
      generateQR(paymentAmount, "game");
    }
  }, [paymentAmount, gameState]);

  const handleLogin = () => {
    // Login QR is already generated, just wait for transaction
    // No state change needed - stay in LOGIN state
  };

  const handlePaymentAmount = (amount) => {
    setPaymentAmount(amount);
    setGameState(GAME_STATES.WAITING_TIME);
  };

  const handleLogout = () => {
    setGameState(GAME_STATES.LOGIN);
    setLoggedInUser(null);
    setTimeLeft(30);
    setScore(0);
    setEvents([]);
    setGameInitialized(false);
    if (gameLoopRef.current) {
      cancelAnimationFrame(gameLoopRef.current);
    }
    // Reset ball position for next game
    gameStateRef.current.ball = { x: 400, y: 300, dx: 4, dy: 4, radius: 10 };
  };

  // Manual database check for debugging
  const triggerManualCheck = async () => {
    console.log("🔧 MANUAL DATABASE CHECK TRIGGERED");
    try {
      const response = await fetch("/api/manual-check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const result = await response.json();
      console.log("🔧 Manual check result:", result);
    } catch (error) {
      console.error("🔧 Manual check failed:", error);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div
      style={{
        padding: "20px",
        maxWidth: "1000px",
        margin: "0 auto",
        fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
        }}
      >
        <h1>🏓 Token Ping Pong</h1>
        <div style={{ display: "flex", gap: "20px", alignItems: "center" }}>
          {loggedInUser && (
            <div style={{ fontSize: "14px" }}>
              <strong>Logged in as:</strong> {loggedInUser.substring(0, 8)}...
            </div>
          )}
          {loggedInUser && (
            <button
              onClick={handleLogout}
              style={{
                padding: "5px 10px",
                fontSize: "12px",
                backgroundColor: "#dc3545",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              Logout
            </button>
          )}
          <div
            style={{
              color: isConnected ? "green" : "red",
              fontWeight: "bold",
              fontSize: "12px",
            }}
          >
            {isConnected ? "● Connected" : "● Disconnected"}
          </div>
        </div>
      </div>

      {gameState === GAME_STATES.LOGIN && (
        <div style={{ textAlign: "center", padding: "40px" }}>
          <h2>Welcome to Token Ping Pong!</h2>
          <p>Scan the QR code to log in and start playing</p>

          {qrCode && (
            <div style={{ marginBottom: "20px" }}>
              <img src={qrCode} alt="Login QR Code" />
              <p style={{ fontSize: "12px", color: "#666" }}>
                Login costs 1 token and gives you 30 seconds of play time
              </p>
            </div>
          )}

          <div style={{ marginTop: "20px" }}>
            <button
              onClick={() => simulateTransaction("login")}
              style={{
                padding: "10px 20px",
                fontSize: "14px",
                backgroundColor: "#28a745",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                marginRight: "10px",
              }}
            >
              🧪 Test Login (Simulate Transaction)
            </button>
            <button
              onClick={triggerManualCheck}
              style={{
                padding: "10px 20px",
                fontSize: "14px",
                backgroundColor: "#007bff",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              🔧 Check Database Manually
            </button>
          </div>
        </div>
      )}

      {(gameState === GAME_STATES.GAME ||
        gameState === GAME_STATES.WAITING_TIME) && (
        <div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "20px",
              padding: "10px",
              backgroundColor: "#f0f0f0",
              borderRadius: "8px",
            }}
          >
            <div>
              <strong>Score:</strong> {score}
            </div>
            <div
              style={{
                fontSize: "24px",
                fontWeight: "bold",
                color: timeLeft < 10 ? "red" : "black",
              }}
            >
              Time: {formatTime(timeLeft)}
            </div>
            <div>
              {gameState === GAME_STATES.GAME
                ? "🎮 Playing"
                : "⏳ Waiting for payment"}
            </div>
          </div>

          <div style={{ display: "flex", gap: "20px" }}>
            <div style={{ flex: 1 }}>
              <canvas
                ref={canvasRef}
                width={800}
                height={600}
                onMouseMove={handleMouseMove}
                style={{
                  border: "2px solid #333",
                  backgroundColor: "#000",
                  cursor: gameState === GAME_STATES.GAME ? "none" : "default",
                  opacity: gameState === GAME_STATES.GAME ? 1 : 0.5,
                }}
              />
              <p
                style={{
                  textAlign: "center",
                  marginTop: "10px",
                  fontSize: "14px",
                  color: "#666",
                }}
              >
                {gameState === GAME_STATES.GAME
                  ? "Move your mouse to control the paddle"
                  : "Game paused - add more time to continue"}
              </p>
            </div>

            {gameState === GAME_STATES.WAITING_TIME && (
              <div
                style={{
                  width: "300px",
                  padding: "20px",
                  backgroundColor: "#f9f9f9",
                  borderRadius: "8px",
                }}
              >
                <h3>Add More Time</h3>
                <p
                  style={{
                    fontSize: "14px",
                    color: "#666",
                    marginBottom: "20px",
                  }}
                >
                  Buy more playing time with tokens. Each token = 30 seconds.
                </p>

                <div style={{ marginBottom: "20px" }}>
                  <button
                    onClick={() => handlePaymentAmount(1)}
                    style={{
                      width: "100%",
                      padding: "15px",
                      margin: "5px 0",
                      backgroundColor:
                        paymentAmount === 1 ? "#007bff" : "#6c757d",
                      color: "white",
                      border: "none",
                      borderRadius: "4px",
                      cursor: "pointer",
                    }}
                  >
                    1 Token (+30 seconds)
                  </button>
                  <button
                    onClick={() => handlePaymentAmount(5)}
                    style={{
                      width: "100%",
                      padding: "15px",
                      margin: "5px 0",
                      backgroundColor:
                        paymentAmount === 5 ? "#007bff" : "#6c757d",
                      color: "white",
                      border: "none",
                      borderRadius: "4px",
                      cursor: "pointer",
                    }}
                  >
                    5 Tokens (+2.5 minutes)
                  </button>
                  <button
                    onClick={() => handlePaymentAmount(10)}
                    style={{
                      width: "100%",
                      padding: "15px",
                      margin: "5px 0",
                      backgroundColor:
                        paymentAmount === 10 ? "#007bff" : "#6c757d",
                      color: "white",
                      border: "none",
                      borderRadius: "4px",
                      cursor: "pointer",
                    }}
                  >
                    10 Tokens (+5 minutes)
                  </button>
                </div>

                {qrCode && (
                  <div style={{ textAlign: "center" }}>
                    <img
                      src={qrCode}
                      alt="Payment QR Code"
                      style={{ width: "200px" }}
                    />
                    <p style={{ fontSize: "12px", color: "#666" }}>
                      Pay {paymentAmount} tokens for {paymentAmount * 30}{" "}
                      seconds
                    </p>
                  </div>
                )}

                <div style={{ marginTop: "20px" }}>
                  <button
                    onClick={() => simulateTransaction("payment")}
                    style={{
                      width: "100%",
                      padding: "10px",
                      fontSize: "14px",
                      backgroundColor: "#28a745",
                      color: "white",
                      border: "none",
                      borderRadius: "4px",
                      cursor: "pointer",
                    }}
                  >
                    🧪 Test Payment (Simulate Transaction)
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Debug section */}
      <div
        style={{
          marginTop: "30px",
          padding: "15px",
          backgroundColor: "#f8f9fa",
          borderRadius: "8px",
          fontSize: "12px",
        }}
      >
        <h4>Debug Info & Expected Criteria</h4>

        <div
          style={{
            marginBottom: "15px",
            padding: "10px",
            backgroundColor: "#e7f3ff",
            borderRadius: "4px",
          }}
        >
          <strong>Expected Login Transaction:</strong>
          <div>• Recipient: 0xf48554937f18885c7f15c432c596b5843648231d</div>
          <div>• Data: game</div>
          <div>
            • Amount: 1000000000000000000 (exactly 1 token in 18 decimals)
          </div>
        </div>

        {loggedInUser && (
          <div
            style={{
              marginBottom: "15px",
              padding: "10px",
              backgroundColor: "#e7ffe7",
              borderRadius: "4px",
            }}
          >
            <strong>Expected Payment Transaction:</strong>
            <div>• Sender: {loggedInUser}</div>
            <div>• Recipient: 0xf48554937f18885c7f15c432c596b5843648231d</div>
            <div>• Data: game</div>
            <div>
              • Amount: {(BigInt(paymentAmount) * BigInt(10 ** 18)).toString()}
            </div>
          </div>
        )}

        <div style={{ marginBottom: "10px" }}>
          <strong>Current State:</strong>
          <div>Game State: {gameState}</div>
          <div>Time Left: {timeLeft}s</div>
          <div>Logged In User: {loggedInUser || "None"}</div>
          <div>Recent Events: {events.length}</div>
        </div>

        <div>
          <strong>Recent Transactions:</strong>
          {events.slice(0, 3).map((event, index) => (
            <div
              key={index}
              style={{
                margin: "5px 0",
                padding: "5px",
                backgroundColor: "#fff",
                border: "1px solid #ddd",
                borderRadius: "2px",
              }}
            >
              <div>
                <strong>Sender:</strong> {event.sender}
              </div>
              <div>
                <strong>Recipient:</strong> {event.recipient}
              </div>
              <div>
                <strong>Amount:</strong> {event.amount}
              </div>
              <div>
                <strong>Data:</strong> "{event.data}" (type: {typeof event.data}
                )
              </div>
              <div>
                <strong>Hash:</strong> {event.transactionHash}
              </div>
            </div>
          ))}
          {events.length === 0 && (
            <div style={{ fontStyle: "italic", color: "#666" }}>
              No transactions received yet
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}
