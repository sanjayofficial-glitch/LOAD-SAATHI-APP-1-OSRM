import React from "react";
import ReactDOM from "react-dom/client";
import "./globals.css";

async function mountApp() {
  try {
    const { default: App } = await import("./App");
    const rootElement = document.getElementById("root");
    if (!rootElement) throw new Error("Failed to find the root element");
    const root = ReactDOM.createRoot(rootElement);
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[LoadSaathi] App failed to mount:", err);
    const rootElement = document.getElementById("root");
    if (rootElement) {
      rootElement.innerHTML = `
        <div style="min-height:100vh;display:flex;align-items:center;justify-content:center;background:#f9fafb;padding:24px;font-family:system-ui,-apple-system,sans-serif;">
          <div style="max-width:480px;background:white;padding:32px;border-radius:12px;box-shadow:0 4px 24px rgba(0,0,0,0.12);text-align:center;">
            <div style="font-size:48px;margin-bottom:16px;">⚠️</div>
            <h1 style="font-size:20px;font-weight:700;color:#dc2626;margin:0 0 8px;">Failed to Load App</h1>
            <p style="color:#6b7280;font-size:14px;margin:0 0 16px;line-height:1.5;">${message}</p>
            <button onclick="location.reload()" style="background:#ea580c;color:white;border:none;padding:10px 24px;border-radius:8px;font-size:14px;font-weight:600;cursor:pointer;">Reload Page</button>
          </div>
        </div>`;
    }
  }
}

mountApp();