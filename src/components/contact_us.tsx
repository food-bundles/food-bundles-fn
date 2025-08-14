"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "./ui/textarea"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { MapPin, Mail, Phone, Clock, Send, User, MessageSquare } from "lucide-react"

export default function Contacts() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    setSuccess("")

    const formData = new FormData(e.currentTarget)
    const name = formData.get("name") as string
    const email = formData.get("email") as string
    const message = formData.get("message") as string

    try {
      // Simulate API call - replace with actual contact service
      await new Promise((resolve) => setTimeout(resolve, 2000))

      console.log("Contact form submitted:", { name, email, message })
      setSuccess("Thank you for your message! We'll get back to you within 24 hours.")

      // Reset form
      e.currentTarget.reset()
    } catch (error: unknown) {
      console.error("Contact form error:", error)
      if (typeof error === "object" && error !== null && "message" in error) {
        setError((error as { message?: string }).message || "Failed to send message. Please try again.")
      } else {
        setError("Failed to send message. Please try again.")
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <section className="relative z-10 px-8 py-16 bg-white-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16">
          {/* Left Column - Contact Form */}
          <div className="space-y-8">
            <div>
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">Contact Us</h2>
              <p className="text-base text-gray-600 leading-relaxed">
                Have questions or feedback? We are here to help! Fill out the form below and our team will get back to
                you soon.
              </p>
            </div>

            <Card className="w-full shadow-xl border-0">
              <CardHeader className="text-center pb-2">
                <h3 className="text-xl font-bold text-gray-900">Get in Touch</h3>
                <p className="text-gray-600 text-sm">Send us a message and we will respond promptly</p>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
                    {error}
                  </div>
                )}
                {success && (
                  <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-md text-sm">
                    {success}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Name Field */}
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      type="text"
                      name="name"
                      placeholder="Your Name"
                      className="pl-10 h-12 border-gray-300 focus:border-green-500 focus:ring-green-500"
                      required
                      disabled={isLoading}
                    />
                  </div>

                  {/* Email Field */}
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      type="email"
                      name="email"
                      placeholder="Email Address"
                      className="pl-10 h-12 border-gray-300 focus:border-green-500 focus:ring-green-500"
                      required
                      disabled={isLoading}
                    />
                  </div>

                  {/* Message Field */}
                  <div className="relative">
                    <MessageSquare className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Textarea
                      name="message"
                      placeholder="How can we help you?"
                      rows={5}
                      className="pl-10 pt-3 border-gray-300 focus:border-green-500 focus:ring-green-500 resize-none"
                      required
                      disabled={isLoading}
                    />
                  </div>

                  {/* Submit Button */}
                  <Button type="submit" className="w-full h-12 bg-green-600 hover:bg-green-700" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Sending...
                      </>
                    ) : (
                      <>
                        Send Message
                        <Send className="w-4 h-4 ml-2" />
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Contact Information */}
          <div className="bg-green-50/50 rounded-2xl p-8 lg:p-10 border border-green-100/50">
            <h3 className="text-2xl font-bold text-gray-900 mb-8">Contact Information</h3>

            <div className="space-y-6">
              {/* Address */}
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Address</h4>
                  <p className="text-gray-600 text-sm leading-relaxed">123 Market Street, Farmville, CA 94123</p>
                </div>
              </div>

              {/* Email */}
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Mail className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Email</h4>
                  <a
                    href="mailto:info@foodbundle.com"
                    className="text-green-600 hover:text-green-700 text-sm transition-colors"
                  >
                    info@foodbundle.com
                  </a>
                </div>
              </div>

              {/* Phone */}
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Phone className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Phone</h4>
                  <a href="tel:+15551234567" className="text-gray-600 hover:text-green-600 text-sm transition-colors">
                    (555) 123-4567
                  </a>
                </div>
              </div>

              {/* Hours */}
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Clock className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Hours</h4>
                  <p className="text-gray-600 text-sm leading-relaxed">Monday - Friday, 9am - 5pm PST</p>
                </div>
              </div>
            </div>

            {/* Additional Info */}
            <div className="mt-8 pt-6 border-t border-green-200/50">
              <div className="bg-white/50 rounded-lg p-4">
                <h5 className="font-semibold text-gray-900 mb-2">Quick Response</h5>
                <p className="text-sm text-gray-600 leading-relaxed">
                  We typically respond to all inquiries within 24 hours during business days. For urgent matters, please
                  call us directly.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
