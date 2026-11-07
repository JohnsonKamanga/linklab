import { ArrowLeft, Link2, ChartNoAxesCombined, QrCode } from "lucide-react";
import { Link } from "react-router-dom";
export function Guide() {
  return (
    <div className="guide">
      <Link className="back-link" to="/">
        <ArrowLeft size={14} />
        All links
      </Link>
      <h1>A shorter path to sharing.</h1>
      <p className="guide-intro">
        LinkLab brings your links and their activity into one focused workspace.
        Here’s how to make it yours.
      </p>
      <section>
        <Link2 />
        <h2>Create. Copy. Connect.</h2>
        <p>
          Paste a complete HTTP or HTTPS URL into the form on the Links page.
          LinkLab creates a unique seven-character short code. Copy it to your
          clipboard or open it in a new tab to visit the destination.
        </p>
      </section>
      <section>
        <ChartNoAxesCombined />
        <h2>Follow every click.</h2>
        <p>
          Open a link’s analytics to see total clicks, today’s activity, a
          seven-day history, and referring sources. The Analytics tab brings
          your whole workspace together. Dates in analytics use UTC.
        </p>
      </section>
      <section>
        <QrCode />
        <h2>Take your link offline.</h2>
        <p>
          Use the QR action beside any link to generate a scannable code.
          Download it as a PNG for your next presentation, poster, or printed
          handout.
        </p>
      </section>
      <section className="guide-note">
        <h2>A note about this demo</h2>
        <p>
          This frontend currently uses sample data and your browser’s local
          storage. Newly created links and recorded visits stay in this browser.
          Shared URLs and QR codes work only where those links are stored, and
          on the same app origin. The included sample click history is
          illustrative.
        </p>
        <p>
          The backend API is not connected yet. A production integration will
          provide shared persistence, server redirects, and real click
          collection. Clearing your browser’s site data clears this workspace.
        </p>
      </section>
    </div>
  );
}
