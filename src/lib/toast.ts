import { toast } from "sonner";

const toastColors: Record<
  string,
  { bg: string; text: string; icon: React.ReactNode }
> = {
  success: { bg: "#16a34a", text: "white", icon: "✔︎" }, // green
  error: { bg: "#dc2626", text: "white", icon: "❌" }, // red
  info: { bg: "#2563eb", text: "white", icon: "ℹ️" }, // blue
  warning: { bg: "#f59e0b", text: "black", icon: "⚠️" }, // yellow
};

export const showToast = (
  type: "success" | "error" | "info" | "warning",
  message: string
) => {
  const color = toastColors[type] || toastColors.info;
  toast(message, {
    style: { background: color.bg, color: color.text },
    icon: color.icon,
  });
};
