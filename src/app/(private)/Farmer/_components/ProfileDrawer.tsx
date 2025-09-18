"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { X, User, Camera, Edit3 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"

interface ProfileDrawerProps {
  isOpen: boolean
  onClose: () => void
  user?: {
    name?: string
    email?: string
    phone?: string
    location?: string
    profilePhoto?: string
  }
}

export default function ProfileDrawer({ isOpen, onClose, user }: ProfileDrawerProps) {
  const [isEditing, setIsEditing] = useState(false)

  const [name, setName] = useState(user?.name || "")
  const [email, setEmail] = useState(user?.email || "")
  const [phone, setPhone] = useState(user?.phone || "")
  const [location, setLocation] = useState("Rwanda")
  const [profilePhoto, setProfilePhoto] = useState<string | null>(user?.profilePhoto || null)

  const [originalName, setOriginalName] = useState(user?.name || "")
  const [originalEmail, setOriginalEmail] = useState(user?.email || "")
  const [originalPhone, setOriginalPhone] = useState(user?.phone || "")
  const [originalLocation, setOriginalLocation] = useState("Rwanda")

  useEffect(() => {
    setName(user?.name || "")
    setEmail(user?.email || "")
    setPhone(user?.phone || "")
    setProfilePhoto(user?.profilePhoto || null)
    setOriginalName(user?.name || "")
    setOriginalEmail(user?.email || "")
    setOriginalPhone(user?.phone || "")
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

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (isOpen && !target.closest("[data-drawer-content]")) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside)
    }

    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [isOpen, onClose])

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
      // TODO: Integrate with actual API
      toast.success("Profile updated successfully!")
      setIsEditing(false)
      // Update original values
      setOriginalName(name)
      setOriginalEmail(email)
      setOriginalPhone(phone)
      setOriginalLocation(location)
    } catch (error) {
      console.error(error)
      toast.error("Failed to update profile")
    }
  }

  const handleCancel = () => {
    setName(originalName)
    setEmail(originalEmail)
    setPhone(originalPhone)
    setLocation(originalLocation)
    setIsEditing(false)
  }

  const avatarLetter = (user?.name || "F").charAt(0).toUpperCase()

  return (
    <>
      {/* Backdrop */}
      {isOpen && <div className="fixed inset-0 bg-black/20 z-40" onClick={onClose} />}

      <div
        data-drawer-content
        className={`fixed top-0 right-0 h-full w-[540px] bg-background text-foreground z-50 transform transition-all duration-300 ease-in-out overflow-y-auto shadow-2xl border-l border-border scrollbar-hide ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="sticky top-0 z-10 bg-background border-b border-border flex justify-between items-center p-6">
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-muted-foreground" />
            <span className="text-xl font-bold text-foreground">User Profile</span>
          </div>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors hover:rotate-90 transform duration-200"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Profile Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <User className="w-5 h-5 text-primary" />
                Profile Photo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-16 h-16 rounded-full overflow-hidden bg-muted border-2 border-border">
                    {profilePhoto ? (
                      <img
                        src={profilePhoto || "/placeholder.svg"}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-primary/10 text-primary text-xl font-semibold">
                        {avatarLetter}
                      </div>
                    )}
                  </div>
                  <label className="absolute -bottom-1 -right-1 w-6 h-6 bg-primary rounded-full flex items-center justify-center cursor-pointer hover:bg-primary/90 transition-colors">
                    <Camera className="w-3 h-3 text-primary-foreground" />
                    <input type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
                  </label>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground">{name || "Your name"}</h3>
                  <p className="text-sm text-muted-foreground">{email || "yourname@gmail.com"}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between text-lg">
                <span className="flex items-center gap-2">
                  <Edit3 className="w-5 h-5 text-primary" />
                  Personal Details
                </span>
                {!isEditing && (
                  <Button
                    onClick={() => setIsEditing(true)}
                    variant="outline"
                    size="sm"
                    className="text-primary hover:bg-primary/10"
                  >
                    <Edit3 className="w-4 h-4 mr-1" />
                    Edit
                  </Button>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Name Field */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-foreground">Name</Label>
                {isEditing ? (
                  <Input value={name} onChange={(e) => setName(e.target.value)} className="w-full" />
                ) : (
                  <p className="text-sm text-muted-foreground bg-muted p-2 rounded-md">{name || "Your name"}</p>
                )}
              </div>

              {/* Email Field */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-foreground">Email account</Label>
                {isEditing ? (
                  <Input value={email} onChange={(e) => setEmail(e.target.value)} className="w-full" type="email" />
                ) : (
                  <p className="text-sm text-muted-foreground bg-muted p-2 rounded-md">
                    {email || "yourname@gmail.com"}
                  </p>
                )}
              </div>

              {/* Phone Field */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-foreground">Mobile number</Label>
                {isEditing ? (
                  <Input value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full" type="tel" />
                ) : (
                  <p className="text-sm text-muted-foreground bg-muted p-2 rounded-md">{phone || "Add number"}</p>
                )}
              </div>

              {/* Location Field */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-foreground">Location</Label>
                {isEditing ? (
                  <Input value={location} onChange={(e) => setLocation(e.target.value)} className="w-full" />
                ) : (
                  <p className="text-sm text-muted-foreground bg-muted p-2 rounded-md">{location}</p>
                )}
              </div>

              {isEditing && (
                <div className="flex gap-2 pt-4">
                  <Button
                    onClick={handleSaveAll}
                    className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
                  >
                    Save Changes
                  </Button>
                  <Button onClick={handleCancel} variant="outline" className="flex-1 bg-transparent">
                    Cancel
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="h-8"></div>
        </div>
      </div>
    </>
  )
}
