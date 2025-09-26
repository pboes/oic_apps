import Link from "next/link";

const APPS = [
  {
    id: "random-number",
    name: "Random Number Generator",
  },
  {
    id: "database-monitor",
    name: "Database Monitor",
  },
];

export default function HomePage() {
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
        <h2>Open Internet Club</h2>

        <p>
          Welcome to the Open Internet Club - a collection of experimental web
          apps that interact with blockchain technology in creative ways.
        </p>

        <h3>Apps</h3>
        <ul>
          {APPS.map((app) => (
            <li key={app.id}>
              <Link href={`/apps/${app.id}`}>{app.name}</Link>
            </li>
          ))}
        </ul>

        <p>
          <Link href="/contributing">Contributing</Link>
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
          margin: 10px 0;
        }

        a {
          color: #0066cc;
          text-decoration: underline;
        }

        a:hover {
          color: #004499;
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
