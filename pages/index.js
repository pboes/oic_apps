import Link from "next/link";
import { useState, useEffect } from "react";

const APPS = [
  {
    id: "random-number",
    name: "Random Number Generator",
    description: "Pay 1 CRC to generate a random number between 1 and 1000",
    author: "OIC Team",
    version: "1.0",
  },
  {
    id: "database-monitor",
    name: "Database Monitor",
    description: "Pay 1 CRC to monitor live blockchain events for 60 seconds",
    author: "OIC Team",
    version: "1.0",
  },
];

export default function HomePage() {
  const [currentTime, setCurrentTime] = useState("");

  useEffect(() => {
    const updateTime = () => {
      setCurrentTime(new Date().toLocaleString());
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div>
      <div id="maincontent">
        <h2>Open Internet Club</h2>

        <p>
          Welcome to the Open Internet Club - a collection of experimental web
          apps that interact with blockchain technology in creative ways.
        </p>

        <p>
          Current time: <strong>{currentTime}</strong>
        </p>

        <h3>Available Apps</h3>
        <ul>
          {APPS.map((app) => (
            <li key={app.id}>
              <Link href={`/apps/${app.id}`}>
                <strong>{app.name}</strong>
              </Link>
              <br />
              {app.description}
              <br />
              <small>
                by {app.author} (v{app.version})
              </small>
            </li>
          ))}
        </ul>

        <h3>How it works</h3>
        <p>
          Each app generates QR codes that interact with the Circles protocol.
          Pay CRC tokens to trigger different app behaviors - from generating
          random numbers to monitoring live blockchain data. Scan the codes with
          a compatible wallet to participate!
        </p>

        <h3>Contributing</h3>
        <p>
          Want to add your own app? Check out the{" "}
          <a href="https://github.com/pboes/oic_apps" target="_blank">
            GitHub repository
          </a>{" "}
          and submit a pull request.
        </p>

        <hr />

        <p>
          <small>
            Built with curiosity and minimal dependencies.
            <br />
            Inspired by the early web when everything was an experiment.
            <br />
            Each app uses a unique identifier and amount to trigger different
            behaviors.
          </small>
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

        ul {
          margin: 20px 0;
        }

        li {
          margin: 15px 0;
          line-height: 1.6;
        }

        a {
          color: #0066cc;
          text-decoration: underline;
        }

        a:hover {
          color: #004499;
        }

        strong {
          font-weight: 600;
        }

        small {
          color: #666;
          font-size: 14px;
        }

        hr {
          border: none;
          border-top: 1px solid #eee;
          margin: 40px 0;
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
