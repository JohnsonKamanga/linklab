import { useEffect, useRef } from "react";
import { useParams } from "react-router-dom";

function getBackendRedirectUrl(code: string | undefined) {
  if (!code) return null;

  try {
    const backendOrigin =
      import.meta.env.VITE_BACKEND_URL || "http://localhost:5029";
    const backendUrl = new URL(`/${encodeURIComponent(code)}`, backendOrigin);
    if (document.referrer) {
      const referrerHost = new URL(document.referrer).hostname;
      if (referrerHost) {
        backendUrl.searchParams.set("referrer", referrerHost);
      }
    }
    return backendUrl.href;
  } catch {
    return null;
  }
}

export function RedirectLink() {
  const { code } = useParams();
  const started = useRef<string | null>(null);
  const backendUrl = getBackendRedirectUrl(code);
  useEffect(() => {
    if (!code || !backendUrl || started.current === code) return;
    started.current = code;
    window.location.replace(backendUrl);
  }, [backendUrl, code]);
  return !backendUrl ? (
    <div className="empty-state" role="alert">
      <h1>We couldn’t open this link.</h1>
      <p>Check the backend URL configuration and try again.</p>
    </div>
  ) : (
    <div className="empty-state" role="status">
      <h1>Connecting you…</h1>
      <p>Opening your destination.</p>
    </div>
  );
}
