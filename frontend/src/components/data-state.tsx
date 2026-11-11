import { Button } from "./ui/button";
export function DataState({
  query,
}: {
  query: { isError: boolean; refetch: () => unknown };
}) {
  return query.isError ? (
    <div className="empty-state" role="alert">
      <h2>We couldn’t load your workspace.</h2>
      <p>Check that the backend is running and the API URL is configured.</p>
      <Button onClick={() => query.refetch()}>Try again</Button>
    </div>
  ) : (
    <div className="loading-state" role="status">
      <div className="skeleton h-10 w-64" />
      <div className="skeleton h-40" />
      <div className="skeleton h-80" />
      <span className="sr-only">Loading your links…</span>
    </div>
  );
}
