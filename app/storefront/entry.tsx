import ReactDOM from "react-dom/client";
import "../frontend/styles/tailwind.css";
import { StorefrontApp } from "./App";

let mounted = false;

function tryMount() {
  if (mounted) return true;
  const mount = document.getElementById("rt-b2b-root");
  if (!mount) return false;
  const proxyBase = mount.getAttribute("data-proxy-base") ?? "/apps/rt-auth";
  ReactDOM.createRoot(mount).render(<StorefrontApp proxyBase={proxyBase} />);
  mounted = true;
  return true;
}

if (!tryMount()) {
  const onReady = () => {
    if (tryMount()) return;
    const observer = new MutationObserver(() => {
      if (tryMount()) {
        observer.disconnect();
      }
    });
    observer.observe(document.documentElement, {
      childList: true,
      subtree: true,
    });
    window.setTimeout(() => observer.disconnect(), 10_000);
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", onReady, { once: true });
  } else {
    onReady();
  }
}
