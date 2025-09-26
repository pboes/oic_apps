import Link from "next/link";

export default function ContributingPage() {
  return (
    <div>
      <div id="maincontent">
        <div style={{ textAlign: "center", marginBottom: "30px" }}>
          <img
            src="/OIC_Logo_Black_2x.png"
            alt="Open Internet Club"
            style={{ maxWidth: "200px", height: "auto" }}
          />
        </div>
        <h2>Contributing to Open Internet Club</h2>

        <p>
          <Link
            href="/"
            style={{ color: "#0066cc", textDecoration: "underline" }}
          >
            ← Back to home
          </Link>
        </p>

        <h3>How it works</h3>
        <p>
          Each app generates QR codes that interact with the Circles protocol.
          Users scan QR codes with a compatible wallet to send CRC tokens to a
          specific contract address. When the transaction is detected, the app
          performs its designated function.
        </p>

        <h3>Technical Details</h3>
        <ul>
          <li>Contract Address: 0xf48554937f18885c7f15c432c596b5843648231d</li>
          <li>Each app has a unique identifier (e.g., "random-number")</li>
          <li>Apps can specify custom amounts and additional data</li>
          <li>Real-time database monitoring via WebSocket connection</li>
        </ul>

        <h3>Adding Your Own App</h3>
        <p>Want to contribute a new app? Here's how:</p>
        <ol>
          <li>
            Fork the{" "}
            <a
              href="https://github.com/pboes/oic_apps"
              target="_blank"
              style={{ color: "#0066cc", textDecoration: "underline" }}
            >
              GitHub repository
            </a>
          </li>
          <li>
            Create a new file in <code>/pages/apps/your-app-id.js</code>
          </li>
          <li>Use the OIC Framework hooks and utilities</li>
          <li>Follow the existing app patterns</li>
          <li>Test your app locally</li>
          <li>Submit a pull request</li>
        </ol>

        <h3>App Structure</h3>
        <p>Each app should follow this basic structure:</p>
        <pre
          style={{
            backgroundColor: "#f5f5f5",
            padding: "10px",
            fontSize: "12px",
            fontFamily: "monospace",
          }}
        >{`import { useOICFramework, OICStyles } from '../../lib/oic-framework';

const APP_ID = 'your-app-name';

export default function YourApp() {
  const { isConnected, generateQR, registerEventHandler } = useOICFramework();

  // Set up event handling
  useEffect(() => {
    const criteria = {
      recipient: '0xf48554937f18885c7f15c432c596b5843648231d',
      amount: '1000000000000000000', // 1 CRC
      data: APP_ID,
    };

    registerEventHandler('your-handler', criteria, (eventData) => {
      // Do something when payment is received
    });
  }, []);

  return (
    <div style={OICStyles.container}>
      {/* Your app UI */}
    </div>
  );
}`}</pre>

        <h3>Design Guidelines</h3>
        <ul>
          <li>Keep the retro, minimal aesthetic</li>
          <li>Use the provided OICStyles for consistency</li>
          <li>No emojis or colorful buttons</li>
          <li>Only show connection warnings when disconnected</li>
          <li>Avoid verbose debug information</li>
          <li>Focus on the core functionality</li>
        </ul>

        <h3>Questions?</h3>
        <p>
          Open an issue on GitHub or check the existing apps for examples. The
          framework is designed to be simple and self-explanatory.
        </p>
      </div>

      <style jsx>{`
        body {
          line-height: 1.4;
          font-size: 16px;
          padding: 0 10px;
          margin: 50px auto;
          max-width: 650px;
          font-family:
            -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        }

        #maincontent {
          max-width: 42em;
          margin: 15px auto;
          margin-top: 70px;
        }

        h2 {
          color: #333;
          border-bottom: 1px solid #eee;
          padding-bottom: 10px;
        }

        h3 {
          color: #555;
          margin-top: 30px;
        }

        ul,
        ol {
          margin: 20px 0;
        }

        li {
          margin: 10px 0;
        }

        a {
          color: #0066cc;
          text-decoration: underline;
        }

        a:hover {
          color: #004499;
        }

        code {
          background-color: #f5f5f5;
          padding: 2px 4px;
          font-family: monospace;
          font-size: 14px;
        }

        pre {
          overflow-x: auto;
        }

        @media (max-width: 600px) {
          #maincontent {
            margin-top: 30px;
            margin-left: 10px;
            margin-right: 10px;
          }

          body {
            margin: 20px auto;
          }
        }
      `}</style>
    </div>
  );
}
