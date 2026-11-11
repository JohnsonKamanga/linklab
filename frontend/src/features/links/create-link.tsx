import { useRef, useState, useEffect, type FormEvent } from "react";
import { ArrowRight, CheckCircle2, Link2, LoaderCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useFeedback } from "@/lib/feedback-context";
import { useCreateLink } from "./queries";
import { CopyButton } from "./link-actions";
import { displayUrl, type LinkRecord } from "./repository";
export function CreateLink() {
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");
  const [created, setCreated] = useState<LinkRecord | null>(null);
  const input = useRef<HTMLInputElement>(null);
  const create = useCreateLink();
  const notify = useFeedback();
  useEffect(() => {
    function shortcut(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        input.current?.focus();
      }
    }
    window.addEventListener("keydown", shortcut);
    return () => window.removeEventListener("keydown", shortcut);
  }, []);
  function submit(e: FormEvent) {
    e.preventDefault();
    setError("");
    let parsed: URL;
    try {
      parsed = new URL(url.trim());
      if (
        !["http:", "https:"].includes(parsed.protocol) ||
        !parsed.hostname ||
        parsed.username ||
        parsed.password
      )
        throw new Error();
    } catch {
      setError("Enter a valid URL starting with https:// or http://.");
      input.current?.focus();
      return;
    }
    create.mutate(parsed.href, {
      onSuccess: (link) => {
        setCreated(link);
        setUrl("");
        notify("Your short link is ready to share.");
      },
      onError: (error) =>
        setError(
          error instanceof Error
            ? error.message
            : "Could not save your link. Check the backend connection and try again.",
        ),
    });
  }
  return (
    <section className="create-panel" aria-labelledby="create-heading">
      <div className="create-heading">
        <div className="create-icon">
          <Link2 size={19} />
        </div>
        <div>
          <h2 id="create-heading">Make room for a shorter link.</h2>
          <p>Paste a destination. We’ll take care of the rest.</p>
        </div>
      </div>
      <form noValidate onSubmit={submit}>
        <div className={`create-input ${error ? "invalid" : ""}`}>
          <Link2 size={19} />
          <input
            ref={input}
            aria-label="Destination URL"
            aria-describedby={error ? "url-error" : "url-hint"}
            aria-invalid={!!error}
            type="url"
            placeholder="https://example.com/something-worth-sharing"
            value={url}
            onChange={(e) => {
              setUrl(e.target.value);
              if (error) setError("");
            }}
            required
          />
          <kbd>⌘ K</kbd>
        </div>
        <Button
          className="shorten-button"
          type="submit"
          disabled={create.isPending}
        >
          {create.isPending ? <LoaderCircle className="animate-spin" /> : null}
          {create.isPending ? "Creating…" : "Shorten link"}
          {!create.isPending && <ArrowRight size={16} />}
        </Button>
      </form>
      {error ? (
        <p id="url-error" className="form-error" role="alert">
          {error}
        </p>
      ) : (
        <p id="url-hint" className="input-hint">
          No sign-up. No extra steps. Just a link that fits.
        </p>
      )}
      {created && (
        <div className="created-result" role="status">
          <CheckCircle2 size={17} />
          <span>Ready to share</span>
          <a href={shortPath(created)} target="_blank" rel="noreferrer">
            {displayUrl(created)}
          </a>
          <div className="ml-auto flex items-center gap-2">
            <CopyButton link={created} label />
            <Link
              className="text-sm underline underline-offset-4"
              to={`/links/${created.id}`}
            >
              View link
            </Link>
          </div>
        </div>
      )}
    </section>
  );
}
function shortPath(link: LinkRecord) {
  return `/${link.code}`;
}
