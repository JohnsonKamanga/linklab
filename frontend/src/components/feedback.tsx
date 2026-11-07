import { useState, type ReactNode } from "react";
import { CheckCircle2, CircleAlert, X } from "lucide-react";
import { FeedbackContext } from "@/lib/feedback-context";
export function FeedbackProvider({ children }: { children: ReactNode }) {
  const [notice, setNotice] = useState<{
    message: string;
    error: boolean;
  } | null>(null);
  function notify(message: string, error = false) {
    setNotice({ message, error });
  }
  return (
    <FeedbackContext.Provider value={notify}>
      {children}
      {notice && (
        <div
          className={`toast ${notice.error ? "toast-error" : ""}`}
          role={notice.error ? "alert" : "status"}
        >
          {notice.error ? (
            <CircleAlert size={18} />
          ) : (
            <CheckCircle2 size={18} />
          )}
          <span>{notice.message}</span>
          <button
            className="icon-button"
            aria-label="Dismiss notification"
            onClick={() => setNotice(null)}
          >
            <X size={16} />
          </button>
        </div>
      )}
    </FeedbackContext.Provider>
  );
}
