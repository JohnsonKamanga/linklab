import { RouterProvider } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { FeedbackProvider } from "@/components/feedback";
import { router } from "@/app/router";
const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 0, retry: false, refetchOnWindowFocus: true },
  },
});
export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <FeedbackProvider>
        <RouterProvider router={router} />
      </FeedbackProvider>
    </QueryClientProvider>
  );
}
