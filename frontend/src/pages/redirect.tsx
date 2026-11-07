import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { linksRepository } from "@/features/links/repository";
import { NotFound } from "./not-found";
export function RedirectLink() {
  const { code } = useParams();
  const started = useRef(false);
  const [status, setStatus] = useState("loading");
  useEffect(() => {
    if (started.current) return;
    started.current = true;
    linksRepository
      .visit(code || "")
      .then((link) => {
        if (!link) {
          setStatus("missing");
          return;
        }
        const url = new URL(link.url);
        if (!["https:", "http:"].includes(url.protocol)) {
          setStatus("missing");
          return;
        }
        window.location.replace(url.href);
      })
      .catch(() => setStatus("error"));
  }, [code]);
  return status === "missing" ? (
    <NotFound />
  ) : status === "error" ? (
    <div className="empty-state" role="alert">
      <h1>We couldn’t open this link.</h1>
      <p>Check browser storage and reload to try again.</p>
    </div>
  ) : (
    <div className="empty-state" role="status">
      <h1>Connecting you…</h1>
      <p>Opening your destination.</p>
    </div>
  );
}
