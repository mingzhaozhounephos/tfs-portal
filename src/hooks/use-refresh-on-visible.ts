import { useEffect } from "react";

export function useRefreshOnVisible(refresh: () => Promise<void>) {
  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === "visible") {
        refresh();
      }
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [refresh]);
}
