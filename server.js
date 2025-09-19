require("dotenv").config({ path: ".env.local" });
const { createServer } = require("http");
const { parse } = require("url");
const next = require("next");
const { Server } = require("socket.io");
const { Pool } = require("pg");

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = process.env.PORT || 3000;

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: false,
});

let lastRowCount = 0;

app.prepare().then(() => {
  const server = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error("Error occurred handling", req.url, err);
      res.statusCode = 500;
      res.end("internal server error");
    }
  });

  const io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log("Client connected:", socket.id);

    socket.on("disconnect", () => {
      console.log("Client disconnected:", socket.id);
    });
  });

  // Database monitoring
  const checkForChanges = async () => {
    try {
      const result = await pool.query(
        'SELECT COUNT(*) as count FROM "CrcV2_OIC_OpenMiddlewareTransfer"',
      );
      const currentCount = parseInt(result.rows[0].count);

      if (lastRowCount === 0) {
        lastRowCount = currentCount;
        console.log(`Initial row count: ${currentCount}`);
      } else if (currentCount > lastRowCount) {
        const newRows = currentCount - lastRowCount;
        console.log(`New rows detected: ${newRows}`);

        io.emit("db-change", {
          table: "CrcV2_OIC_OpenMiddlewareTransfer",
          newRows: newRows,
          totalRows: currentCount,
          timestamp: new Date().toISOString(),
        });

        lastRowCount = currentCount;
      }
    } catch (error) {
      console.error("Database monitoring error:", error);
    }
  };

  // Check every 5 seconds
  setInterval(checkForChanges, 5000);

  server.listen(port, (err) => {
    if (err) throw err;
    console.log(`🚀 Server ready on http://${hostname}:${port}`);
    console.log(`📊 Monitoring CrcV2_OIC_OpenMiddlewareTransfer table`);

    // Initial check
    checkForChanges();
  });
});
