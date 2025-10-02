import { useEffect, useState } from "react"
import { X, Settings, Eye, Bell, Globe } from "lucide-react"

interface SettingsDrawerProps {
  isOpen: boolean
  onClose: () => void
}

export default function SettingsDrawer({ isOpen, onClose }: SettingsDrawerProps) {
  const [settings, setSettings] = useState({
    seenSubmissions: true,
    deviceNotifications: false,
    darkMode: false,
    language: "en",
    smsNotifications: false,
  })

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) onClose()
    }
    document.addEventListener("keydown", handleEscape)
    return () => document.removeEventListener("keydown", handleEscape)
  }, [isOpen, onClose])

  useEffect(() => {
    document.documentElement.classList.toggle("dark", settings.darkMode)
  }, [settings.darkMode])

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : 'unset'
    return () => { document.body.style.overflow = 'unset' }
  }, [isOpen])

  const handleSettingChange = (key: string, value: boolean | string) => {
    setSettings((prev) => ({ ...prev, [key]: value }))
  }
  const Toggle = ({ checked, onChange }: { checked: boolean; onChange: () => void }) => (
    <button
      role="switch"
      aria-checked={checked}
      onClick={onChange}
      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-green-700 ${
        checked ? "bg-green-700" : "bg-gray-300 dark:bg-gray-600"
      }`}
    >
      <span className={`inline-block h-3 w-3 rounded-full bg-white transition-transform ${
        checked ? "translate-x-5" : "translate-x-1"
      }`} />
    </button>
  )

  return (
    <>
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
          onClick={onClose}
        />
      )}

      <div
        className={`fixed top-0 right-0 h-full w-full sm:w-96 bg-white dark:bg-gray-900 z-50 transform transition-transform duration-300 overflow-y-auto shadow-2xl ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-gray-500" />
            <span className="text-lg font-bold">Settings</span>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-900 dark:hover:text-gray-100 p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4 pb-20">
          {/* Submissions */}
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
            <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
              <Eye className="w-4 h-4 text-green-700 dark:text-green-500" />
              <h2 className="font-semibold text-sm">Submissions</h2>
            </div>
            <div className="p-3 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Mark as seen</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">Auto-mark when opened</p>
              </div>
              <Toggle checked={settings.seenSubmissions} onChange={() => handleSettingChange("seenSubmissions", !settings.seenSubmissions)} />
            </div>
          </div>

          {/* Notifications */}
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
            <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
              <Bell className="w-4 h-4 text-green-700 dark:text-green-500" />
              <h2 className="font-semibold text-sm">Notifications</h2>
            </div>
            <div className="p-3 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Device notifications</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Allow on device</p>
                </div>
                <Toggle checked={settings.deviceNotifications} onChange={() => handleSettingChange("deviceNotifications", !settings.deviceNotifications)} />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">SMS notifications</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Updates via text</p>
                </div>
                <Toggle checked={settings.smsNotifications} onChange={() => handleSettingChange("smsNotifications", !settings.smsNotifications)} />
              </div>
            </div>
          </div>

          {/* Language */}
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
            <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
              <Globe className="w-4 h-4 text-green-700 dark:text-green-500" />
              <h2 className="font-semibold text-sm">Language</h2>
            </div>
            <div className="p-3">
              <select
                value={settings.language}
                onChange={(e) => handleSettingChange("language", e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-700"
              >
                <option value="en">English</option>
                <option value="fr">Français</option>
              </select>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="fixed bottom-0 right-0 w-full sm:w-96 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 p-4">
          <button
            onClick={() => {
              console.log("Settings saved:", settings)
              onClose()
            }}
            className="w-full bg-green-700 hover:bg-green-800 text-white font-medium py-2.5 px-4 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-green-700 text-sm"
          >
            Save Settings
          </button>
        </div>
      </div>
    </>
  )
}