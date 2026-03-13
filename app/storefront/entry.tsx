import ReactDOM from "react-dom/client";
import "../frontend/styles/tailwind.css";
import { StorefrontApp } from "./App";

const mount = document.getElementById("rt-b2b-root");

if (mount) {
  const proxyBase = mount.getAttribute("data-proxy-base") ?? "/apps/rt-auth";

  ReactDOM.createRoot(mount).render(<StorefrontApp proxyBase={proxyBase} />);
}
