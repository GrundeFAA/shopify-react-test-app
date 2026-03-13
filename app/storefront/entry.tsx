import ReactDOM from "react-dom/client";
import "../frontend/styles/tailwind.css";
import { StorefrontApp } from "./App";

let mounted = false;
type DebugWindow = Window & {
  __rtB2bBooted?: boolean;
  __rtB2bMounted?: boolean;
  __rtB2bError?: string;
};
const debugWindow = window as DebugWindow;
debugWindow.__rtB2bBooted = true;
// comment to trigger rebuild
function tryMount() {
  if (mounted) return true;
  const mount = document.getElementById("rt-b2b-root");
  if (!mount) return false;
  mount.innerHTML =
    '<div style="padding:12px;border:1px solid #e2e8f0;background:#f8fafc;font-size:14px">Laster B2B dashboard...</div>';
  const proxyBase = mount.getAttribute("data-proxy-base") ?? "/apps/rt-auth";
  try {
    ReactDOM.createRoot(mount).render(<StorefrontApp proxyBase={proxyBase} />);
    mounted = true;
    debugWindow.__rtB2bMounted = true;
    return true;
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown mount error";
    debugWindow.__rtB2bError = message;
    mount.innerHTML = `<div style="padding:12px;border:1px solid #fecaca;background:#fef2f2;color:#991b1b;font-size:14px">B2B mount feilet: ${message}</div>`;
    console.error("[rt-b2b] mount failed", error);
    return false;
  }
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
