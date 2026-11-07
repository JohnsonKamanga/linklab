import { Link } from "react-router-dom";
import { ArrowLeft, ArrowUpRight, Unlink } from "lucide-react";
export function NotFound() {
  return (
    <section className="not-found">
      <div className="error-art" aria-hidden="true">
        <span className="error-code">404</span>
        <div className="broken-link">
          <Unlink size={38} strokeWidth={1.4} />
        </div>
        <span className="error-orbit orbit-one" />
        <span className="error-orbit orbit-two" />
      </div>
      <h1>This link took a wrong turn.</h1>
      <p>
        It may have been removed, or the address might be a little off. Let’s
        get you back to something that connects.
      </p>
      <Link className="primary-link" to="/">
        <ArrowLeft size={16} />
        Back to your links
      </Link>
      <div className="error-tip">
        Looking for a shared demo link?
        <br />
        Local links are available in the browser where they were created.
      </div>
      <Link className="text-link" to="/guide">
        How LinkLab works
        <ArrowUpRight size={14} />
      </Link>
    </section>
  );
}
