import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

/**
 * Success message sent by the previous screen in `navigate(path, { state: { notice } })`.
 * Shown only once: it is cleared from the history so it does not reappear on reload.
 */
export function useFlashNotice() {
  const location = useLocation();
  const navigate = useNavigate();
  const state: unknown = location.state;
  const incoming =
    typeof state === "object" && state !== null && "notice" in state && typeof state.notice === "string"
      ? state.notice
      : null;
  const [notice, setNotice] = useState(incoming);

  // A new notice arrives without the page unmounting: it is picked up during render.
  if (incoming && incoming !== notice) setNotice(incoming);

  useEffect(() => {
    if (incoming) navigate(location.pathname + location.search, { replace: true, state: null });
  }, [incoming, navigate, location.pathname, location.search]);

  return { notice, dismiss: () => setNotice(null) };
}
