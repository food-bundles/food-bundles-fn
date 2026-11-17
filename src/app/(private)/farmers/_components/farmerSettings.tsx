"use client"

import { useEffect, useState } from "react"
import { X, Settings, Bell, Globe, Loader2 } from "lucide-react"
import { useAuth } from "@/app/contexts/auth-context"
import { farmersService } from "@/app/services/farmersService"
import { showToast } from "@/lib/toast"

interface SettingsDrawerProps {
  isOpen: boolean
  onClose: () => void
}

interface FarmerSettingsState {
  smsNotifications: boolean
  notificationFrequency: string
  preferredLanguage: string
}

const DEFAULT_SETTINGS: FarmerSettingsState = {
  smsNotifications: false,
  notificationFrequency: "DAILY",
  preferredLanguage: "en",
}

export default function SettingsDrawer({ isOpen, onClose }: SettingsDrawerProps) {
  const { user } = useAuth()
  const [settings, setSettings] = useState<FarmerSettingsState>(DEFAULT_SETTINGS)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) onClose()
    }
    document.addEventListener("keydown", handleEscape)
    return () => document.removeEventListener("keydown", handleEscape)
  }, [isOpen, onClose])

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : 'unset'
    return () => { document.body.style.overflow = 'unset' }
  }, [isOpen])

  useEffect(() => {
    if (!isOpen || !user?.id) return

    const loadSettings = async () => {
      setLoading(true)
      try {
        const response = await farmersService.getFarmerById(user.id)
        const farmer = response.data
        setSettings({
          smsNotifications: farmer.smsNotifications ?? false,
          notificationFrequency: farmer.notificationFrequency || "DAILY",
          preferredLanguage: farmer.preferredLanguage || "en",
        })
      } catch (error) {
        console.error("Failed to load settings:", error)
        showToast("error", "Failed to load your settings.")
      } finally {
        setLoading(false)
      }
    }

    loadSettings()
  }, [isOpen, user?.id])

  const handleSettingChange = (key: keyof FarmerSettingsState, value: boolean | string) => {
    setSettings((prev) => ({ ...prev, [key]: value }))
  }

  const handleSave = async () => {
    if (!user?.id) return

    setSaving(true)
    try {
      await farmersService.updateFarmer(user.id, settings)
      showToast("success", "Settings saved successfully!")
      onClose()
    } catch (error) {
      console.error("Failed to save settings:", error)
      showToast("error", "Failed to save settings. Please try again.")
    } finally {
      setSaving(false)
    }
  }

  const Toggle = ({ checked, onChange }: { checked: boolean; onChange: () => void }) => (
    <button
      role="switch"
      aria-checked={checked}
      onClick={onChange}
      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-green-700 ${
        checked ? "bg-green-700" : "bg-gray-300"
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
        className={`fixed top-0 right-0 h-full w-full sm:w-96 bg-white z-50 transform transition-transform duration-300 overflow-y-auto shadow-2xl ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-[#DCE6DF]">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-[#4A6358]" />
            <span className="text-lg font-bold">Settings</span>
          </div>
          <button onClick={onClose} className="text-[#4A6358] hover:text-gray-900 p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4 pb-20">
          {loading ? (
            <p className="text-sm text-[#4A6358] text-center py-8">Loading settings...</p>
          ) : (
            <>
              {/* Notifications */}
              <div className="border border-[#DCE6DF] rounded-lg overflow-hidden">
                <div className="flex items-center gap-2 p-3 bg-[#F6F9F7] border-b border-[#DCE6DF]">
                  <Bell className="w-4 h-4 text-[#007A35]" />
                  <h2 className="font-semibold text-sm">Notifications</h2>
                </div>
                <div className="p-3 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">SMS notifications</p>
                      <p className="text-xs text-[#4A6358]">Updates via text</p>
                    </div>
                    <Toggle
                      checked={settings.smsNotifications}
                      onChange={() => handleSettingChange("smsNotifications", !settings.smsNotifications)}
                    />
                  </div>
                  <div>
                    <p className="text-sm font-medium mb-1">Notification frequency</p>
                    <select
                      value={settings.notificationFrequency}
                      onChange={(e) => handleSettingChange("notificationFrequency", e.target.value)}
                      className="w-full px-3 py-2 text-sm bg-white border border-[#DCE6DF] rounded-md focus:outline-none focus:ring-2 focus:ring-green-700"
                    >
                      <option value="IMMEDIATE">Immediate</option>
                      <option value="DAILY">Daily</option>
                      <option value="WEEKLY">Weekly</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Language */}
              <div className="border border-[#DCE6DF] rounded-lg overflow-hidden">
                <div className="flex items-center gap-2 p-3 bg-[#F6F9F7] border-b border-[#DCE6DF]">
                  <Globe className="w-4 h-4 text-[#007A35]" />
                  <h2 className="font-semibold text-sm">Language</h2>
                </div>
                <div className="p-3">
                  <select
                    value={settings.preferredLanguage}
                    onChange={(e) => handleSettingChange("preferredLanguage", e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-white border border-[#DCE6DF] rounded-md focus:outline-none focus:ring-2 focus:ring-green-700"
                  >
                    <option value="en">English</option>
                    <option value="fr">Français</option>
                    <option value="rw">Kinyarwanda</option>
                  </select>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Save Button */}
        <div className="fixed bottom-0 right-0 w-full sm:w-96 bg-white border-t border-[#DCE6DF] p-4">
          <button
            onClick={handleSave}
            disabled={saving || loading}
            className="w-full bg-[#0B2E1F] hover:bg-[#0F5C36] text-white font-medium py-2.5 px-4 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-green-700 text-sm disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
            {saving ? "Saving..." : "Save Settings"}
          </button>
        </div>
      </div>
    </>
  )
}
