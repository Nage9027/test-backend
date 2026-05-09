import { useCallback } from "react";

function ensureContainer() {
  let container = document.getElementById("toast-container");
  if (!container) {
    container = document.createElement("div");
    container.id = "toast-container";
    document.body.appendChild(container);
  }
  return container;
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (ch) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[ch]);
}

export function useToast() {
  const showToast = useCallback((message, type = "info", duration = 4000) => {
    const safeType = ["info", "success", "error", "warning"].includes(type) ? type : "info";
    const container = ensureContainer();

    const toast = document.createElement("div");
    toast.className = `toast toast-${safeType}`;
    toast.setAttribute("role", "status");
    toast.setAttribute("aria-live", "polite");
    toast.innerHTML = `
      <div class="toast-content">
        <span class="toast-message">${escapeHtml(message)}</span>
        <button class="toast-close" aria-label="Close notification" type="button">&times;</button>
      </div>
    `;

    container.appendChild(toast);

    const removeToast = () => {
      toast.classList.add("toast-hide");
      setTimeout(() => toast.remove(), 240);
    };

    const timer = setTimeout(removeToast, duration);

    toast.querySelector(".toast-close")?.addEventListener("click", () => {
      clearTimeout(timer);
      removeToast();
    });
  }, []);

  return { showToast };
}
