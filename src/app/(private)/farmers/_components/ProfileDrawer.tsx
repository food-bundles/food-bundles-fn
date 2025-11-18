import { useEffect, useState } from "react"
import { X, User, Camera, Edit3 } from "lucide-react"

interface ProfileDrawerProps {
  isOpen: boolean
  onClose: () => void
  user?: {
    name?: string
    email?: string
    phone?: string
    location?: string
    profilePhoto?: string
    profileImage?: string
  }
}

export default function ProfileDrawer({
  isOpen,
  onClose,
  user,
}: ProfileDrawerProps) {
  const [isEditing, setIsEditing] = useState(false)

  // Use same display name logic as DashboardHeader
  const displayName = user?.name || user?.phone || "Farmer"
  
  const [name, setName] = useState(displayName)
  const [email, setEmail] = useState(user?.email || "")
  const [phone, setPhone] = useState(user?.phone || "")
  const [location, setLocation] = useState(user?.location || "Rwanda")
  const [profilePhoto, setProfilePhoto] = useState<string | null>(
    user?.profileImage || user?.profilePhoto || null
  )

  const [originalName, setOriginalName] = useState(displayName)
  const [originalEmail, setOriginalEmail] = useState(user?.email || "")
  const [originalPhone, setOriginalPhone] = useState(user?.phone || "")
  const [originalLocation, setOriginalLocation] = useState(user?.location || "Rwanda")

  useEffect(() => {
    const currentDisplayName = user?.name || user?.phone || "Farmer"
    setName(currentDisplayName)
    setEmail(user?.email || "")
    setPhone(user?.phone || "")
    setLocation(user?.location || "Rwanda")
    setProfilePhoto(user?.profileImage || user?.profilePhoto || null)
    setOriginalName(currentDisplayName)
    setOriginalEmail(user?.email || "")
    setOriginalPhone(user?.phone || "")
    setOriginalLocation(user?.location || "Rwanda")
  }, [user])

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose()
      }
    }

    document.addEventListener("keydown", handleEscape)
    return () => document.removeEventListener("keydown", handleEscape)
  }, [isOpen, onClose])

  // Prevent body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = () => setProfilePhoto(reader.result as string)
      reader.readAsDataURL(file)
    }
  }

  const handleSaveAll = async () => {
    try {
     
      setIsEditing(false)
      setOriginalName(name)
      setOriginalEmail(email)
      setOriginalPhone(phone)
      setOriginalLocation(location)
    } catch (error) {
      console.error("Failed to save profile:", error)
    }
  }

  const handleCancel = () => {
    setName(originalName)
    setEmail(originalEmail)
    setPhone(originalPhone)
    setLocation(originalLocation)
    setIsEditing(false)
  }

  // Get avatar letter - same logic as header
  const avatarLetter = displayName.substring(0, 2).toUpperCase()

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0  backdrop-blur-sm z-40 transition-opacity duration-300"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <div
        className={`fixed top-0 right-0  w-[85%] sm:w-[340px] md:w-[380px] bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 z-50 transform transition-transform duration-300 ease-out overflow-y-auto shadow-2xl border-l border-gray-200 dark:border-gray-800 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="profile-title"
      >
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white  border-b border-gray-200 flex justify-between items-center p-3 sm:p-4">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-gray-500 " />
            <span id="profile-title" className="text-[16px] sm:text-lg font-bold text-black-900 ">
              User Profile
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-all hover:rotate-90 transform duration-200 p-1"
            aria-label="Close profile"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 pb-6">
          {/* Profile Photo Card */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-gray-200 dark:border-gray-700">
              <h2 className="flex items-center gap-2 text-[14px] sm:text-[16px] font-semibold text-gray-900 dark:text-gray-100">
                <User className="w-4 h-4 sm:w-5 sm:h-5 text-green-700  flex-shrink-0" />
                Profile Photo
              </h2>
            </div>
            <div className="p-4 sm:p-5">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="relative flex-shrink-0">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-600">
                    {profilePhoto ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={profilePhoto}
                        alt="Profile"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          target.parentElement!.innerHTML = `<div class="w-full h-full flex items-center justify-center bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 text-lg sm:text-xl font-semibold">${avatarLetter}</div>`;
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 text-lg sm:text-xl font-semibold">
                        {avatarLetter}
                      </div>
                    )}
                  </div>
                  <label className="absolute -bottom-1 -right-1 w-6 h-6 sm:w-7 sm:h-7 bg-green-700 rounded-full flex items-center justify-center cursor-pointer hover:bg-green-800 transition-colors shadow-md">
                    <Camera className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-white" />
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handlePhotoChange}
                    />
                  </label>
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100 truncate">
                    {name || "Farmer"}
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 truncate">
                    {email || (phone ? `Phone: ${phone}` : "No email provided")}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Personal Details Card */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="p-3 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h2 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-gray-100">
                  Personal Details
                </h2>
                {!isEditing && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="text-xs px-2.5 py-1 border border-green-700 dark:border-green-600 text-green-700 dark:text-green-500 rounded-md hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors flex items-center gap-1"
                  >
                    <Edit3 className="w-3 h-3" />
                    Edit
                  </button>
                )}
              </div>
            </div>
            <div className="p-3 space-y-3">
              {/* Name Field */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-900 dark:text-gray-100 block">
                  Name
                </label>
                {isEditing ? (
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-green-700 focus:border-transparent"
                    placeholder="Enter your name"
                  />
                ) : (
                  <p className="text-xs text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 p-2 rounded-md">
                    {name || "Farmer"}
                  </p>
                )}
              </div>

              {/* Email Field */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-900 dark:text-gray-100 block">
                  Email account
                </label>
                {isEditing ? (
                  <input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-green-700 focus:border-transparent"
                    type="email"
                    placeholder="Enter your email"
                  />
                ) : (
                  <p className="text-xs text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 p-2 rounded-md break-all">
                    {email || "No email provided"}
                  </p>
                )}
              </div>

              {/* Phone Field */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-900 dark:text-gray-100 block">
                  Mobile number
                </label>
                {isEditing ? (
                  <input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-green-700 focus:border-transparent"
                    type="tel"
                    placeholder="Enter your phone number"
                  />
                ) : (
                  <p className="text-xs text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 p-2 rounded-md">
                    {phone || "No phone number"}
                  </p>
                )}
              </div>

              {/* Location Field */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-900 dark:text-gray-100 block">
                  Location
                </label>
                {isEditing ? (
                  <input
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-green-700 focus:border-transparent"
                    placeholder="Enter your location"
                  />
                ) : (
                  <p className="text-xs text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 p-2 rounded-md">
                    {location}
                  </p>
                )}
              </div>

              {isEditing && (
                <div className="flex gap-2 pt-1">
                  <button
                    onClick={handleSaveAll}
                    className="flex-1 bg-green-700 hover:bg-green-800 active:bg-green-900 text-white font-medium py-2 px-3 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-green-700 focus:ring-offset-2 text-xs"
                  >
                    Save Changes
                  </button>
                  <button
                    onClick={handleCancel}
                    className="flex-1 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 font-medium py-2 px-3 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 text-xs"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}