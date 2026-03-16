import ReactDOM from "react-dom/client";
import "./styles/storefront.css";
import { StorefrontApp } from "./App";

let mounted = false;
type DebugWindow = Window & {
  __rtB2bBooted?: boolean;
  __rtB2bMounted?: boolean;
  __rtB2bError?: string;
};

const debugWindow = window as DebugWindow;
debugWindow.__rtB2bBooted = true;

function createShadowRootMount(host: HTMLElement): HTMLDivElement {
  const shadowRoot = host.shadowRoot ?? host.attachShadow({ mode: "open" });
  shadowRoot.innerHTML = "";

  const stylesheetHref = host.getAttribute("data-storefront-style-url") ?? "/storefront.css";
  const stylesheet = document.createElement("link");
  stylesheet.rel = "stylesheet";
  stylesheet.href = stylesheetHref;
  shadowRoot.appendChild(stylesheet);

  const mount = document.createElement("div");
  shadowRoot.appendChild(mount);
  return mount;
}

function tryMount() {
  if (mounted) return true;

  const host = document.getElementById("rt-b2b-root");
  if (!host) return false;

  const proxyBase = host.getAttribute("data-proxy-base") ?? "/apps/rt-auth";

  try {
    const shadowMount = createShadowRootMount(host);
    ReactDOM.createRoot(shadowMount).render(<StorefrontApp proxyBase={proxyBase} />);
    mounted = true;
    debugWindow.__rtB2bMounted = true;
    return true;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown mount error";
    debugWindow.__rtB2bError = message;
    host.innerHTML = `<div style="padding:12px;border:1px solid #fecaca;background:#fef2f2;color:#991b1b;font-size:14px">B2B mount feilet: ${message}</div>`;
    console.error("[rt-b2b] mount failed", error);
    return false;
  }
}

if (!tryMount()) {
  const onReady = () => {
    if (tryMount()) return;

    const observer = new MutationObserver(() => {
      if (tryMount()) observer.disconnect();
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
