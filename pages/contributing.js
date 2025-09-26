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
          specific recipient address. When the transaction is detected, the app
          performs its designated function. The CRC tokens are forwarded as
          ERC20 tokens to the recipient address specified by the app developer.
        </p>

        <h3>Technical Details</h3>
        <ul>
          <li>
            Default OIC Contract: 0xf48554937f18885c7f15c432c596b5843648231d
          </li>
          <li>Each app has a unique identifier (e.g., "random-number")</li>
          <li>Apps can specify custom amounts and additional data</li>
          <li>
            Apps can set custom recipient addresses for CRC token forwarding
          </li>
          <li>
            CRC tokens are forwarded as ERC20 tokens to the specified recipient
          </li>
          <li>Real-time database monitoring via WebSocket connection</li>
        </ul>

        <h3>Recipient Addresses</h3>
        <p>
          Each app can specify where CRC tokens should be sent by setting the{" "}
          <code>recipient</code> field in their metadata. This is the Ethereum
          address that will receive the CRC tokens as ERC20 tokens when users
          interact with your app.
        </p>
        <ul>
          <li>
            If no recipient is specified, tokens go to the default OIC address
          </li>
          <li>
            App developers can set their own address to receive payments
            directly
          </li>
          <li>Useful for monetizing apps or funding specific projects</li>
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
        <p>
          Apps now use a simple metadata-based structure. The framework
          automatically handles the layout, logo, navigation, and event
          handling:
        </p>
        <pre
          style={{
            backgroundColor: "#f5f5f5",
            padding: "10px",
            fontSize: "12px",
            fontFamily: "monospace",
          }}
        >{`import { createOICApp, OICStyles } from '../../lib/oic-framework';

const metadata = {
  appId: 'your-app-name',
  title: 'Your App Title',
  description: 'Brief description of what your app does.',
  amount: 1, // Cost in CRC tokens
  recipient: '0xYourAddressHere', // Where CRC tokens are sent (optional, defaults to OIC)
  initialState: {
    // Your app's initial state
  },
  onPayment: (eventData, appState, setAppState) => {
    // What happens when payment is received
    setAppState(prev => ({ ...prev, /* update state */ }));
  },
};

const appContent = ({ appState, setAppState, generateQR, metadata }) => {
  return (
    <>
      {/* Your app's UI content goes here */}
      {/* The framework handles logo, title, navigation automatically */}
    </>
  );
};

export default createOICApp(metadata, appContent);`}</pre>

        <h3>Design Guidelines</h3>
        <ul>
          <li>
            Focus only on your app's core content - the framework handles the
            layout
          </li>
          <li>Use the provided OICStyles for consistency</li>
          <li>No emojis or colorful buttons</li>
          <li>
            The framework automatically handles logo, navigation, and connection
            status
          </li>
          <li>Keep your app content minimal and focused</li>
          <li>Define your app behavior in the metadata object</li>
        </ul>

        <h3>Metadata Options</h3>
        <ul>
          <li>
            <code>appId</code>: Unique identifier for your app
          </li>
          <li>
            <code>title</code>: Display name of your app
          </li>
          <li>
            <code>description</code>: Brief description shown to users
          </li>
          <li>
            <code>amount</code>: Cost in CRC tokens (defaults to 1)
          </li>
          <li>
            <code>recipient</code>: Ethereum address where CRC tokens are
            forwarded as ERC20 tokens (optional, defaults to OIC address)
          </li>
          <li>
            <code>initialState</code>: Your app's initial state object
          </li>
          <li>
            <code>onPayment</code>: Function called when payment is received
          </li>
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
