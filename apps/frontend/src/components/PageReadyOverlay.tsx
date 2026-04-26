"use client";

import { useEffect, useState } from "react";

export function PageReadyOverlay() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const showPage = () => setReady(true);
    const fallback = window.setTimeout(showPage, 1400);

    if (document.readyState === "complete") {
      showPage();
    } else {
      window.addEventListener("load", showPage, { once: true });
    }

    return () => {
      window.clearTimeout(fallback);
      window.removeEventListener("load", showPage);
    };
  }, []);

  return <div className={`pageReadyOverlay${ready ? " pageReadyOverlayHidden" : ""}`} />;
}
