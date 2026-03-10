"use client";

/**
 * @fileoverview AuthenticatorManagementPageComponent
 * @description Full-featured 2FA management page with QR setup, backup codes,
 * disable flow, and regeneration. White/black/green design with Lucide icons.
 */

import {
  useState,
  useEffect,
  useCallback,
  useRef,
  ReactNode,
  JSX,
} from "react";
import {
  Shield,
  ShieldCheck,
  ShieldOff,
  KeyRound,
  RefreshCw,
  Copy,
  Check,
  ChevronRight,
  AlertTriangle,
  Info,
  Lock,
  Eye,
  EyeOff,
  Smartphone,
  RotateCcw,
  Loader2,
  X,
  CheckCircle2,
  ArrowLeft,
  Zap,
} from "lucide-react";
import createAxiosClient from "@/app/hooks/axiosClient";
import { AxiosError } from "axios";

const axiosClient = createAxiosClient();

// ─── Types ────────────────────────────────────────────────────────────────────

/** Shape of the /authenticator/status API response data field. */
interface TwoFAStatus {
  enabled: boolean;
  backupCodesCount: number;
}

/** Shape of the /authenticator/enable API response data field. */
interface SetupData {
  secret: string;
  qrCode: string;
  backupCodes: string[];
}

/** All possible page-level states. */
type PageState = "idle" | "loading" | "setup" | "enabled";

/** Which confirm-action panel is currently open. */
type ActionMode = "disable" | "regenerate" | null;

/** Alert banner variant. */
type AlertType = "error" | "info" | "success";

// ─── Constants ────────────────────────────────────────────────────────────────

/**
 * Fetches the current 2FA status for the authenticated user.
 * @returns Promise resolving to TwoFAStatus
 */
async function fetchStatus(): Promise<TwoFAStatus> {
  const res = await axiosClient.get("/authenticator/status");

  console.log("Received response data:", await res.data);

  const json = await res.data;
  return json.data as TwoFAStatus;
}

/**
 * Initiates 2FA setup, returning secret, QR code data URL, and backup codes.
 * @returns Promise resolving to SetupData
 */
async function initEnable(): Promise<SetupData> {
  const res = await axiosClient.post("/authenticator/enable");

  console.log("Received res:--", res);

  const json = await res.data;
  return json.data as SetupData;
}

/**
 * Verifies the first TOTP token after scanning the QR code, activating 2FA.
 * @param token - 6-digit code from authenticator app
 */
async function verifySetup(token: string): Promise<void> {
  await axiosClient.post("/authenticator/verify-setup", {
    token,
  });
}

/**
 * Disables 2FA for the current user. Requires a valid TOTP token.
 * @param token - 6-digit code from authenticator app
 */
async function postDisable(token: string): Promise<void> {
  await axiosClient.post("/authenticator/disable", { token });
}

/**
 * Regenerates backup codes. Requires a valid TOTP token.
 * @param token - 6-digit code from authenticator app
 * @returns New array of backup code strings
 */
async function postRegenerate(token: string): Promise<string[]> {
  const res = await axiosClient.post("/authenticator/regenerate-backup-codes", {
    token,
  });

  console.log("Received res:--", res);

  const json = await res.data;
  return json.data.backupCodes as string[];
}

// ─── Sub-components ───────────────────────────────────────────────────────────

interface SkeletonBlockProps {
  className?: string;
}

/**
 * Animated skeleton placeholder for loading states.
 */
function SkeletonBlock({ className = "" }: SkeletonBlockProps): JSX.Element {
  return (
    <div
      className={`bg-gray-100 rounded-lg ${className}`}
      style={{ animation: "skeletonPulse 1.6s ease-in-out infinite" }}
    />
  );
}

interface SpinnerProps {
  size?: number;
}

/**
 * Inline rotating loader using Lucide Loader2.
 */
function Spinner({ size = 16 }: SpinnerProps): JSX.Element {
  return (
    <Loader2 size={size} style={{ animation: "spin 0.8s linear infinite" }} />
  );
}

interface BackupCodeChipProps {
  code: string;
  used?: boolean;
}

/**
 * A single backup code chip that copies itself to the clipboard on click.
 */
function BackupCodeChip({
  code,
  used = false,
}: BackupCodeChipProps): JSX.Element {
  const [copied, setCopied] = useState(false);

  /** Copies this backup code to the system clipboard. */
  const handleCopy = useCallback(async (): Promise<void> => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard access denied — silently ignore */
    }
  }, [code]);

  return (
    <button
      onClick={handleCopy}
      disabled={used}
      aria-label={`Copy backup code ${code}`}
      className={`group relative flex items-center justify-between gap-2 px-3 py-2 rounded-lg border font-mono text-xs transition-all duration-150 select-none
        ${
          used
            ? "border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed line-through"
            : "border-gray-200 bg-white text-gray-800 hover:border-green-400 hover:bg-green-50 cursor-pointer"
        }`}
    >
      <span className="tracking-wider">{code}</span>
      {!used && (
        <span className="text-gray-400 group-hover:text-green-500 transition-colors">
          {copied ? <Check size={12} /> : <Copy size={12} />}
        </span>
      )}
    </button>
  );
}

interface PinInputProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  error?: boolean;
}

/**
 * Six separate digit input boxes forming a PIN / OTP entry field.
 * Auto-advances focus on entry; supports backspace navigation.
 */
function PinInput({
  value,
  onChange,
  disabled = false,
  error = false,
}: PinInputProps): JSX.Element {
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  /**
   * Handles a single character input at the given box index.
   * @param idx - Box index (0–5)
   * @param rawValue - The raw input string from the event
   */
  const handleInput = (idx: number, rawValue: string): void => {
    const char = rawValue.replace(/\D/g, "").slice(-1);
    const arr = value.padEnd(6, " ").split("");
    arr[idx] = char || " ";
    const next = arr.join("").replace(/ /g, "");
    onChange(next);
    if (char && idx < 5) refs.current[idx + 1]?.focus();
  };

  /**
   * Moves focus backwards on Backspace if the current box is already empty.
   * @param idx - Box index (0–5)
   * @param key - Keyboard key string
   */
  const handleKeyDown = (idx: number, key: string): void => {
    if (key === "Backspace" && !value[idx] && idx > 0) {
      refs.current[idx - 1]?.focus();
    }
  };

  return (
    <div
      className="flex gap-2 justify-center"
      role="group"
      aria-label="6-digit verification code"
    >
      {Array.from({ length: 6 }).map((_, i) => (
        <input
          key={i}
          ref={(el) => {
            refs.current[i] = el;
          }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={value[i] ?? ""}
          onChange={(e) => handleInput(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e.key)}
          disabled={disabled}
          aria-label={`Digit ${i + 1}`}
          className={`w-10 h-12 text-center text-lg font-mono font-semibold border-2 rounded-xl outline-none transition-all duration-150
            ${error ? "border-red-400 bg-red-50 text-red-700" : "border-gray-200 focus:border-green-500 bg-white text-gray-900"}
            ${disabled ? "opacity-50 cursor-not-allowed" : ""}
          `}
        />
      ))}
    </div>
  );
}

interface AlertBannerProps {
  type: AlertType;
  message: string;
  onDismiss?: () => void;
}

/** Config map keyed strictly by AlertType. */
const ALERT_CONFIG: Record<
  AlertType,
  { bg: string; text: string; icon: ReactNode }
> = {
  error: {
    bg: "bg-red-50 border-red-200",
    text: "text-red-700",
    icon: <AlertTriangle size={14} />,
  },
  info: {
    bg: "bg-blue-50 border-blue-200",
    text: "text-blue-700",
    icon: <Info size={14} />,
  },
  success: {
    bg: "bg-green-50 border-green-200",
    text: "text-green-700",
    icon: <CheckCircle2 size={14} />,
  },
};

/**
 * Dismissable inline alert banner for errors, info, and success messages.
 */
function AlertBanner({
  type,
  message,
  onDismiss,
}: AlertBannerProps): JSX.Element {
  const config = ALERT_CONFIG[type];

  return (
    <div
      className={`flex items-start gap-2 px-3 py-2.5 rounded-lg border text-xs ${config.bg} ${config.text}`}
      role="alert"
    >
      <span className="mt-0.5 shrink-0">{config.icon}</span>
      <span className="flex-1">{message}</span>
      {onDismiss && (
        <button
          onClick={onDismiss}
          aria-label="Dismiss alert"
          className="ml-auto shrink-0 hover:opacity-70"
        >
          <X size={12} />
        </button>
      )}
    </div>
  );
}

interface SetupStepsProps {
  step: number;
}

/** Labels for the three setup wizard steps. */
const SETUP_STEP_LABELS = [
  "Scan QR Code",
  "Save Backup Codes",
  "Verify & Activate",
] as const;

/**
 * Visual step progress indicator for the 2FA setup wizard.
 */
function SetupSteps({ step }: SetupStepsProps): JSX.Element {
  return (
    <div className="flex items-center gap-0 mb-6">
      {SETUP_STEP_LABELS.map((label, i) => {
        const active = i === step;
        const done = i < step;
        return (
          <div key={label} className="flex items-center flex-1">
            <div className="flex flex-col items-center gap-1">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold border-2 transition-all duration-300
                  ${done ? "bg-green-500 border-green-500 text-white" : active ? "bg-white border-green-500 text-green-600" : "bg-white border-gray-200 text-gray-400"}`}
              >
                {done ? <Check size={12} /> : i + 1}
              </div>
              <span
                className={`text-[10px] font-medium whitespace-nowrap hidden sm:block ${active ? "text-green-600" : done ? "text-green-500" : "text-gray-400"}`}
              >
                {label}
              </span>
            </div>
            {i < SETUP_STEP_LABELS.length - 1 && (
              <div
                className={`flex-1 h-0.5 mx-1 mt-[-10px] sm:mt-[-20px] transition-all duration-500 ${done ? "bg-green-400" : "bg-gray-200"}`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Main Page Component ──────────────────────────────────────────────────────

/**
 * AuthenticatorManagementPageComponent
 *
 * Full 2FA management page. Handles:
 * - Status loading with skeleton
 * - Enable flow (3-step wizard: QR → backup codes → verify)
 * - Active status display with backup code count
 * - Disable with TOTP confirmation
 * - Backup code regeneration with TOTP confirmation
 * - New backup codes reveal after regeneration
 */
export default function AuthenticatorManagement(): JSX.Element {
  const [status, setStatus] = useState<TwoFAStatus | null>(null);
  const [pageState, setPageState] = useState<PageState>("loading");
  const [setupData, setSetupData] = useState<SetupData | null>(null);
  const [setupStep, setSetupStep] = useState<number>(0);
  const [verifyCode, setVerifyCode] = useState<string>("");
  const [actionCode, setActionCode] = useState<string>("");
  const [actionMode, setActionMode] = useState<ActionMode>(null);
  const [error, setError] = useState<string>("");
  const [successMsg, setSuccessMsg] = useState<string>("");
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [newBackupCodes, setNewBackupCodes] = useState<string[]>([]);
  const [secretVisible, setSecretVisible] = useState<boolean>(false);
  const [copiedAll, setCopiedAll] = useState<boolean>(false);

  useEffect(() => {
    loadStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /** Loads 2FA status from the API and sets the appropriate page state. */
  const loadStatus = async (): Promise<void> => {
    setPageState("loading");
    setError("");
    try {
      const s = await fetchStatus();
      setStatus(s);
      setPageState(s.enabled ? "enabled" : "idle");
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to load 2FA status.";
      setError(message);
      setPageState("idle");
    }
  };

  /** Initiates the 2FA enable flow by fetching setup data from the API. */
  const handleStartEnable = async (): Promise<void> => {
    setError("");
    setSubmitting(true);
    try {
      const data = await initEnable();
      setSetupData(data);
      setSetupStep(0);
      setPageState("setup");
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Could not start 2FA setup.";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  /** Advances the setup wizard to the next step. */
  const handleNextStep = (): void => {
    setSetupStep((s) => Math.min(s + 1, 2));
  };

  /** Submits the TOTP token to finalise 2FA activation. */
  const handleVerifySetup = async (): Promise<void> => {
    if (verifyCode.length < 6) {
      setError("Please enter the full 6-digit code.");
      return;
    }
    setError("");
    setSubmitting(true);
    try {
      await verifySetup(verifyCode);
      console.log("Setup verified successfully.");
      setSuccessMsg("Two-factor authentication is now active on your account.");
      setSetupData(null);
      setVerifyCode("");
      await loadStatus();
    } catch (err: unknown) {
      console.log("Received error:", err);

      if (err instanceof AxiosError) {
        if (err.response?.status === 400) {
          setError("Invalid code. Please try again.");
          return;
        }
      }

      const message =
        err instanceof Error ? err.message : "Invalid code. Please try again.";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  /** Submits the disable request after TOTP confirmation. */
  const handleDisable = async (): Promise<void> => {
    if (actionCode.length < 6) {
      setError("Enter your 6-digit authenticator code.");
      return;
    }
    setError("");
    setSubmitting(true);
    try {
      await postDisable(actionCode);
      setSuccessMsg("Two-factor authentication has been disabled.");
      setActionMode(null);
      setActionCode("");
      await loadStatus();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Invalid code.";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  /** Submits the regenerate backup codes request after TOTP confirmation. */
  const handleRegenerate = async (): Promise<void> => {
    if (actionCode.length < 6) {
      setError("Enter your 6-digit authenticator code.");
      return;
    }
    setError("");
    setSubmitting(true);
    try {
      const codes = await postRegenerate(actionCode);
      setNewBackupCodes(codes);
      setActionMode(null);
      setActionCode("");
      setSuccessMsg("Backup codes regenerated. Save them somewhere safe!");
      await loadStatus();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Invalid code.";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  /**
   * Copies all provided codes to the system clipboard as newline-separated text.
   * @param codes - Array of backup code strings to copy
   */
  const copyAllCodes = async (codes: string[]): Promise<void> => {
    try {
      await navigator.clipboard.writeText(codes.join("\n"));
      setCopiedAll(true);
      setTimeout(() => setCopiedAll(false), 2000);
    } catch {
      /* clipboard access denied — silently ignore */
    }
  };

  /** Closes any open action panel and resets related state. */
  const handleCancel = (): void => {
    setActionMode(null);
    setActionCode("");
    setError("");
  };

  // ─── Render helpers ───────────────────────────────────────────────────────

  /** Renders stacked skeleton blocks while status is loading. */
  const renderSkeleton = (): JSX.Element => (
    <div className="space-y-4">
      <SkeletonBlock className="h-32 w-full" />
      <SkeletonBlock className="h-20 w-full" />
      <SkeletonBlock className="h-20 w-3/4" />
    </div>
  );

  /** Renders the green "Active" or grey "Inactive" pill badge. */
  const renderStatusBadge = (): JSX.Element =>
    status?.enabled ? (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-green-50 text-green-700 border border-green-200 rounded-full text-xs font-medium">
        <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
        Active
      </span>
    ) : (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-gray-100 text-gray-500 border border-gray-200 rounded-full text-xs font-medium">
        <span className="w-1.5 h-1.5 bg-gray-400 rounded-full" />
        Inactive
      </span>
    );

  /** Renders the three-step 2FA setup wizard. */
  const renderSetup = (): JSX.Element => (
    <div className="space-y-5">
      <button
        onClick={() => {
          setPageState("idle");
          setSetupData(null);
          setError("");
        }}
        className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-800 transition-colors mb-2"
        aria-label="Cancel setup and go back"
      >
        <ArrowLeft size={14} /> Cancel
      </button>

      <SetupSteps step={setupStep} />

      {/* Step 0 — Scan QR Code */}
      {setupStep === 0 && (
        <div
          className="space-y-4"
          style={{ animation: "fadeSlideIn 0.3s ease" }}
        >
          <div className="text-center space-y-1">
            <p className="text-sm font-semibold text-gray-900">
              Scan this QR Code
            </p>
            <p className="text-xs text-gray-500">
              Open Google Authenticator or any TOTP app and scan the code below.
            </p>
          </div>

          <div className="flex justify-center">
            <div className="p-3 bg-white border-2 border-gray-200 rounded-2xl shadow-sm">
              {setupData?.qrCode ? (
                <img
                  src={setupData.qrCode}
                  alt="2FA QR Code"
                  className="w-44 h-44 rounded-lg"
                />
              ) : (
                <SkeletonBlock className="w-44 h-44 rounded-lg" />
              )}
            </div>
          </div>

          <div className="border border-gray-200 rounded-xl p-3 bg-gray-50 space-y-1">
            <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">
              Manual Entry Key
            </p>
            <div className="flex items-center gap-2">
              <code
                className={`flex-1 text-xs font-mono text-gray-800 tracking-widest break-all transition-all ${
                  !secretVisible ? "blur-[4px] select-none" : ""
                }`}
              >
                {setupData?.secret ?? "—"}
              </code>
              <button
                onClick={() => setSecretVisible((v) => !v)}
                className="text-gray-400 hover:text-gray-700 transition-colors"
                aria-label={
                  secretVisible ? "Hide secret key" : "Show secret key"
                }
              >
                {secretVisible ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>

          <button
            onClick={handleNextStep}
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-black text-white text-sm font-medium rounded-xl hover:bg-gray-800 transition-colors"
          >
            I&apos;ve scanned it <ChevronRight size={14} />
          </button>
        </div>
      )}

      {/* Step 1 — Save Backup Codes */}
      {setupStep === 1 && (
        <div
          className="space-y-4"
          style={{ animation: "fadeSlideIn 0.3s ease" }}
        >
          <div className="text-center space-y-1">
            <p className="text-sm font-semibold text-gray-900">
              Save Your Backup Codes
            </p>
            <p className="text-xs text-gray-500">
              Store these codes securely. Each can be used once if you lose
              access to your authenticator.
            </p>
          </div>

          <div className="border border-amber-200 bg-amber-50 rounded-xl p-3 flex gap-2">
            <AlertTriangle
              size={14}
              className="text-amber-600 shrink-0 mt-0.5"
            />
            <p className="text-xs text-amber-700">
              You will not be able to see these codes again. Save them before
              continuing.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {(setupData?.backupCodes ?? []).map((code) => (
              <BackupCodeChip key={code} code={code} />
            ))}
          </div>

          <button
            onClick={() => copyAllCodes(setupData?.backupCodes ?? [])}
            className="w-full flex items-center justify-center gap-2 py-2 border border-gray-200 text-gray-700 text-xs font-medium rounded-xl hover:bg-gray-50 transition-colors"
          >
            {copiedAll ? (
              <Check size={13} className="text-green-600" />
            ) : (
              <Copy size={13} />
            )}
            {copiedAll ? "Copied!" : "Copy all codes"}
          </button>

          <button
            onClick={handleNextStep}
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-black text-white text-sm font-medium rounded-xl hover:bg-gray-800 transition-colors"
          >
            I&apos;ve saved the codes <ChevronRight size={14} />
          </button>
        </div>
      )}

      {/* Step 2 — Verify & Activate */}
      {setupStep === 2 && (
        <div
          className="space-y-4"
          style={{ animation: "fadeSlideIn 0.3s ease" }}
        >
          <div className="text-center space-y-1">
            <p className="text-sm font-semibold text-gray-900">
              Enter Verification Code
            </p>
            <p className="text-xs text-gray-500">
              Enter the 6-digit code shown in your authenticator app to confirm
              setup.
            </p>
          </div>

          <PinInput
            value={verifyCode}
            onChange={setVerifyCode}
            disabled={submitting}
            error={!!error}
          />

          {error && (
            <AlertBanner
              type="error"
              message={error}
              onDismiss={() => setError("")}
            />
          )}

          <button
            onClick={handleVerifySetup}
            disabled={submitting || verifyCode.length < 6}
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-green-600 text-white text-sm font-semibold rounded-xl hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {submitting ? <Spinner size={14} /> : <ShieldCheck size={14} />}
            {submitting ? "Verifying…" : "Activate 2FA"}
          </button>
        </div>
      )}
    </div>
  );

  /** Renders the inline confirmation panel for disable or regenerate actions. */
  const renderActionPanel = (): JSX.Element => {
    const isDisable = actionMode === "disable";
    return (
      <div
        className="mt-4 border border-gray-200 rounded-2xl p-4 space-y-4 bg-gray-50"
        style={{ animation: "fadeSlideIn 0.25s ease" }}
      >
        <div className="flex items-start justify-between">
          <div className="space-y-0.5">
            <p className="text-sm font-semibold text-gray-900">
              {isDisable
                ? "Disable Two-Factor Authentication"
                : "Regenerate Backup Codes"}
            </p>
            <p className="text-xs text-gray-500">
              {isDisable
                ? "This will remove 2FA from your account. Enter your current authenticator code to proceed."
                : "All existing backup codes will be invalidated. Enter your authenticator code to generate new ones."}
            </p>
          </div>
          <button
            onClick={handleCancel}
            className="text-gray-400 hover:text-gray-700 ml-2 shrink-0"
            aria-label="Cancel action"
          >
            <X size={16} />
          </button>
        </div>

        {isDisable && (
          <AlertBanner
            type="error"
            message="Disabling 2FA reduces your account security significantly."
          />
        )}

        <div className="space-y-2">
          <label className="text-xs font-medium text-gray-700">
            Authenticator Code
          </label>
          <PinInput
            value={actionCode}
            onChange={setActionCode}
            disabled={submitting}
            error={!!error}
          />
        </div>

        {error && (
          <AlertBanner
            type="error"
            message={error}
            onDismiss={() => setError("")}
          />
        )}

        <div className="flex gap-2">
          <button
            onClick={handleCancel}
            className="flex-1 py-2 border border-gray-200 text-gray-600 text-xs font-medium rounded-xl hover:bg-gray-100 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={isDisable ? handleDisable : handleRegenerate}
            disabled={submitting || actionCode.length < 6}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-semibold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-colors
              ${isDisable ? "bg-red-600 hover:bg-red-700 text-white" : "bg-green-600 hover:bg-green-700 text-white"}`}
          >
            {submitting ? (
              <Spinner size={12} />
            ) : isDisable ? (
              <ShieldOff size={12} />
            ) : (
              <RefreshCw size={12} />
            )}
            {submitting
              ? "Processing…"
              : isDisable
                ? "Disable 2FA"
                : "Regenerate"}
          </button>
        </div>
      </div>
    );
  };

  /** Renders the newly generated backup codes after a successful regeneration. */
  const renderNewCodes = (): JSX.Element => (
    <div
      className="border border-green-200 bg-green-50 rounded-2xl p-4 space-y-3"
      style={{ animation: "fadeSlideIn 0.3s ease" }}
    >
      <div className="flex items-center gap-2">
        <KeyRound size={14} className="text-green-700" />
        <p className="text-sm font-semibold text-green-800">
          New Backup Codes Generated
        </p>
      </div>
      <p className="text-xs text-green-700">
        Save these codes immediately. Your old codes are no longer valid.
      </p>
      <div className="grid grid-cols-2 gap-2">
        {newBackupCodes.map((code) => (
          <BackupCodeChip key={code} code={code} />
        ))}
      </div>
      <button
        onClick={() => copyAllCodes(newBackupCodes)}
        className="w-full flex items-center justify-center gap-2 py-2 border border-green-300 text-green-700 text-xs font-medium rounded-xl hover:bg-green-100 transition-colors"
      >
        {copiedAll ? <Check size={12} /> : <Copy size={12} />}
        {copiedAll ? "Copied!" : "Copy all"}
      </button>
      <button
        onClick={() => setNewBackupCodes([])}
        className="w-full py-2 text-xs text-gray-500 hover:text-gray-700 transition-colors"
      >
        Dismiss
      </button>
    </div>
  );

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <>
      <style>{`
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes skeletonPulse {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.4; }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes successPop {
          0%   { opacity: 0; transform: scale(0.9); }
          60%  { transform: scale(1.05); }
          100% { opacity: 1; transform: scale(1); }
        }
      `}</style>

      <div className="min-h-screen bg-white font-sans">
        {/* ── Page Header ── */}
        <div className="border-b border-gray-200 px-4 sm:px-6 lg:px-8 py-4">
          <div className="max-w-2xl mx-auto flex items-center justify-between">
            <div>
              <h1 className="text-sm font-semibold text-gray-900">
                Authenticator Management
              </h1>
              <p className="text-xs text-gray-500 mt-0.5">
                Manage two-factor authentication for your account
              </p>
            </div>
            <div className="hidden lg:flex items-center gap-1.5 text-xs text-gray-500">
              <Lock size={11} />
              <span>Account Security</span>
            </div>
          </div>
        </div>

        {/* ── Main Content ── */}
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-5">
          {/* Success banner */}
          {successMsg && (
            <div style={{ animation: "successPop 0.35s ease" }}>
              <AlertBanner
                type="success"
                message={successMsg}
                onDismiss={() => setSuccessMsg("")}
              />
            </div>
          )}

          {/* Top-level error banner (outside setup wizard) */}
          {error && pageState !== "setup" && (
            <AlertBanner
              type="error"
              message={error}
              onDismiss={() => setError("")}
            />
          )}

          {/* Loading skeleton */}
          {pageState === "loading" && renderSkeleton()}

          {/* Setup wizard */}
          {pageState === "setup" && (
            <div
              className="border border-gray-200 rounded-2xl p-5 bg-white shadow-sm"
              style={{ animation: "fadeSlideIn 0.3s ease" }}
            >
              {renderSetup()}
            </div>
          )}

          {/* Idle — 2FA not yet enabled */}
          {pageState === "idle" && (
            <div
              className="space-y-4"
              style={{ animation: "fadeSlideIn 0.3s ease" }}
            >
              {/* Hero card */}
              <div className="border-2 border-dashed border-gray-200 rounded-2xl p-6 text-center space-y-3">
                <div className="inline-flex items-center justify-center w-14 h-14 bg-gray-100 rounded-2xl mx-auto">
                  <Shield size={26} className="text-gray-400" />
                </div>
                <div>
                  <p className="text-base font-semibold text-gray-900">
                    Two-Factor Authentication
                  </p>
                  <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
                    Add an extra layer of security to your account by requiring
                    a one-time code from your phone when you log in or other
                    services requiring additional verification.
                  </p>
                </div>
                <div className="flex justify-center">{renderStatusBadge()}</div>
              </div>

              {/* Feature list */}
              <div className="border border-gray-200 rounded-2xl p-4 space-y-3">
                <p className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  What you get
                </p>
                {[
                  {
                    icon: <Smartphone size={13} />,
                    title: "App-based TOTP codes",
                    desc: "Works with Google Authenticator, Authy, and any TOTP-compatible app.",
                  },
                  {
                    icon: <KeyRound size={13} />,
                    title: "10 one-time backup codes",
                    desc: "Use these if you lose access to your authenticator device.",
                  },
                  {
                    icon: <Zap size={13} />,
                    title: "Instant revocation",
                    desc: "Disable 2FA at any time with your current authenticator code.",
                  },
                ].map((f) => (
                  <div key={f.title} className="flex gap-3 items-start">
                    <div className="w-7 h-7 bg-green-50 text-green-600 rounded-lg flex items-center justify-center shrink-0">
                      {f.icon}
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-900">
                        {f.title}
                      </p>
                      <p className="text-[11px] text-gray-500">{f.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Enable CTA */}
              <button
                onClick={handleStartEnable}
                disabled={submitting}
                className="w-full flex items-center justify-center gap-2 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold text-sm rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
                aria-label="Enable two-factor authentication"
              >
                {submitting ? <Spinner size={14} /> : <ShieldCheck size={14} />}
                {submitting
                  ? "Setting up…"
                  : "Enable Two-Factor Authentication"}
              </button>
            </div>
          )}

          {/* Enabled — 2FA active, no action panel open */}
          {pageState === "enabled" && !actionMode && (
            <div
              className="space-y-4"
              style={{ animation: "fadeSlideIn 0.3s ease" }}
            >
              {/* Status hero */}
              <div className="border border-green-200 bg-green-50 rounded-2xl p-5 flex items-start gap-4">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center shrink-0">
                  <ShieldCheck size={22} className="text-green-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-semibold text-gray-900">
                      Two-Factor Authentication
                    </p>
                    {renderStatusBadge()}
                  </div>
                  <p className="text-xs text-gray-600 mt-1">
                    Your account is protected. You&apos;ll be prompted for a
                    code when logging in from new devices.
                  </p>
                </div>
              </div>

              {/* Backup codes status */}
              <div className="border border-gray-200 rounded-2xl p-4 flex items-center gap-4">
                <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center shrink-0">
                  <KeyRound size={17} className="text-gray-600" />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-semibold text-gray-900">
                    Backup Codes
                  </p>
                  <p
                    className={`text-xs mt-0.5 ${
                      (status?.backupCodesCount ?? 0) <= 3
                        ? "text-amber-600"
                        : "text-gray-500"
                    }`}
                  >
                    {status?.backupCodesCount ?? 0} code
                    {status?.backupCodesCount !== 1 ? "s" : ""} remaining
                    {(status?.backupCodesCount ?? 0) <= 3 &&
                      " — consider regenerating"}
                  </p>
                </div>
                {(status?.backupCodesCount ?? 0) <= 3 && (
                  <AlertTriangle
                    size={14}
                    className="text-amber-500 shrink-0"
                  />
                )}
              </div>

              {/* Action buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  onClick={() => {
                    setActionMode("regenerate");
                    setError("");
                  }}
                  className="flex items-center justify-center gap-2 py-2.5 border border-gray-200 text-gray-700 text-xs font-semibold rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-colors"
                  aria-label="Regenerate backup codes"
                >
                  <RefreshCw size={13} /> Regenerate Backup Codes
                </button>
                <button
                  onClick={() => {
                    setActionMode("disable");
                    setError("");
                  }}
                  className="flex items-center justify-center gap-2 py-2.5 border border-red-200 text-red-600 text-xs font-semibold rounded-xl hover:bg-red-50 transition-colors"
                  aria-label="Disable two-factor authentication"
                >
                  <ShieldOff size={13} /> Disable 2FA
                </button>
              </div>

              {/* How it works */}
              <div className="border border-gray-200 rounded-2xl p-4 space-y-2">
                <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">
                  How it works
                </p>
                {[
                  {
                    n: "1",
                    text: "Open your authenticator app when prompted during login.",
                  },
                  {
                    n: "2",
                    text: "Enter the 6-digit rotating code shown in the app.",
                  },
                  {
                    n: "3",
                    text: "Use a backup code if your device is unavailable.",
                  },
                ].map((s) => (
                  <div key={s.n} className="flex gap-2.5 items-start">
                    <span className="w-5 h-5 bg-gray-900 text-white text-[10px] font-bold rounded-full flex items-center justify-center shrink-0 mt-0.5">
                      {s.n}
                    </span>
                    <p className="text-xs text-gray-600">{s.text}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Enabled — action confirmation panel open */}
          {pageState === "enabled" && actionMode && (
            <div style={{ animation: "fadeSlideIn 0.25s ease" }}>
              <div className="border border-green-100 bg-green-50 rounded-2xl p-3 flex items-center gap-3 mb-4">
                <ShieldCheck size={16} className="text-green-600" />
                <p className="text-xs font-medium text-green-800">
                  2FA is currently active on your account.
                </p>
                <div className="ml-auto">{renderStatusBadge()}</div>
              </div>
              {renderActionPanel()}
            </div>
          )}

          {/* Newly regenerated backup codes */}
          {newBackupCodes.length > 0 && renderNewCodes()}

          {/* Footer */}
          {pageState !== "setup" && pageState !== "loading" && (
            <div className="flex items-center justify-between pt-2 border-t border-gray-100">
              <button
                onClick={loadStatus}
                className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-700 transition-colors"
                aria-label="Refresh 2FA status"
              >
                <RotateCcw size={11} /> Refresh status
              </button>
              <a
                href="https://support.google.com/accounts/answer/1066447"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-700 transition-colors"
              >
                <Info size={11} /> Authenticator app help
              </a>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
