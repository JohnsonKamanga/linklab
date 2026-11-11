/** The geometric LinkLab mark follows the interface color in either theme. */
export function Brand() {
  return (
    <span className="brand-wordmark" aria-hidden="true">
      <svg viewBox="0 0 42 40" fill="currentColor">
        <path d="M3 2h7a2 2 0 0 1 2 2v23L2 37V4a2 2 0 0 1 1-2Zm11 28h5v8H5l9-8ZM24 2h7a2 2 0 0 1 2 2v23L23 37V4a2 2 0 0 1 1-2Zm11 28h5v8H26l9-8Z" />
      </svg>
      Linklab
    </span>
  );
}
