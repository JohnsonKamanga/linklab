import { createContext, useContext } from "react";
export const FeedbackContext = createContext<
  (message: string, error?: boolean) => void
>(() => {});
export function useFeedback() {
  return useContext(FeedbackContext);
}
