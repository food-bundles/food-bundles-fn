"use client"

import type React from "react"
import { CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { MessageCircle, Mail, Phone, MapPin, Send, X, User } from "lucide-react"
import { useState } from "react"
import Image from "next/image"
import { AnimatedDotsBackground } from "./animated-dots-background"

function QuickTalkSection() {
  const [isChatOpen, setIsChatOpen] = useState(false)
  const [message, setMessage] = useState("")
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hi! I'm Sostene Assistant. How can I help you with your restaurant supply needs today?",
      sender: "bot",
      time: "10:30 AM",
    },
  ])

  const farmers = [
    {
      name: "Kinyinya Farmers",
      favoriteProduct: "Vegetables",
      image: "/farmers/kinyinya.jpg",
    },
    {
      name: "Musanze Farmers",
      phone: "+1 (555) 987-6543",
      favoriteProduct: "Fresh Fruits",
      image: "/farmers/Fruits-farmer.jpg",
    },
    {
      name: "Ntasho Farmers",
      phone: "+1 (555) 456-7890",
      favoriteProduct: "Vegetable and Fruits",
      image: "/farmers/Farmer-Gakuba_NAIZO-scaled.jpg",
    },
  ]

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (message.trim()) {
      const newMessage = {
        id: messages.length + 1,
        text: message,
        sender: "user" as const,
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      }
      setMessages([...messages, newMessage])
      setMessage("")

      // Simulate bot response
      setTimeout(() => {
        const botResponse = {
          id: messages.length + 2,
          text: "Thanks for your message! I'll help you find the best ingredients for your restaurant. What specific items are you looking for?",
          sender: "bot" as const,
          time: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        }
        setMessages((prev) => [...prev, botResponse])
      }, 1000)
    }
  }
  
  return (
    <>
      {/* Main Content - Side by Side Layout */}
      <div className="grid md:grid-cols-2 gap-8">
        {/* Our Farmers Section */}
        <div className="bg-white/90 backdrop-blur-sm p-6 rounded-xl shadow-lg">
          <h3 className="text-3xl font-bold text-gray-800 mb-6">Our Farmers</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
            {farmers.map((farmer, index) => (
              <div key={index} className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-shadow">
                <Image
                  src={farmer.image || "/placeholder.svg"}
                  alt={farmer.name}
                  width={300}
                  height={200}
                  className="w-full h-48 object-cover"
                />
                <div className="p-4 text-center">
                  <h4 className="text-xl font-bold text-gray-800 mb-2">{farmer.name}</h4>
                  <p className="text-lg text-green-600 font-semibold">{farmer.favoriteProduct}</p>
                </div>
              </div>
            ))}
          </div>
          
          {/* Simple Description */}
          <div className="bg-transparent rounded-lg p-4 border-l-4 border-green-500 ">
            <p className="text-gray-700 leading-relaxed">
              Our trusted network of local farmers provides fresh, high-quality produce directly to your restaurant. 
              Each farmer specializes in their area of expertise, ensuring you get the best ingredients for your culinary creations. 
              From crisp vegetables to juicy fruits, our farmers are committed to sustainable farming practices and delivering 
              exceptional products that meet your restaurant&apos;s standards.
            </p>
          </div>
        </div>

        {/* Let's Keep in Touch Card */}
        <div className="bg-white/90 backdrop-blur-sm p-6 rounded-xl shadow-lg">
          <CardHeader className="px-0 pb-4">
            <h3 className="text-2xl font-semibold text-gray-700 mb-2">Let&apos;s Keep in Touch</h3>
            <p className="text-gray-600">Multiple ways to reach us for your convenience</p>
          </CardHeader>
          <CardContent className="px-0 space-y-4">
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3  rounded-lg  transition-colors">
                <Mail className="h-5 w-5 text-green-500" />
                <div>
                  <p className="font-medium text-gray-800">Email Support</p>
                  <a
                    href="mailto:support@sostene.com"
                    className="text-sm text-gray-600 hover:text-green-600 transition-colors"
                  >
                    sales@gmail.com
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-lg  transition-colors">
                <Phone className="h-5 w-5 text-green-500" />
                <div>
                  <p className="font-medium text-gray-800">WhatsApp Number</p>
                  <p
                    className="text-sm text-gray-600 cursor-pointer hover:text-green-600 transition-colors"
                    onClick={() => window.open("https://wa.me/250796897823", "_blank")}
                  >
                    +250 796 897 823
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3  rounded-lg">
                <MapPin className="h-5 w-5 text-green-500" />
                <div>
                  <p className="font-medium text-gray-800">Company Location</p>
                  <p className="text-sm text-gray-600">KG 5 Ave, Kigali</p>
                </div>
              </div>
            </div>

            {/* WhatsApp Quick Action */}
            <div className="text-center py-4 border-t border-gray-200">
              <button
                onClick={() => window.open("https://wa.me/250796897823", "_blank")}
                className="inline-flex items-center gap-2 bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition-colors shadow-md hover:shadow-lg"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488" />
                </svg>
                Chat on WhatsApp
              </button>
            </div>

            {/* Additional Contact Options */}
            <div className="space-y-4 pt-4 border-t border-gray-200">
              <div className="flex items-center justify-center">
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open("https://linkedin.com/company/sostene", "_blank")}
                    className="hover:bg-blue-50 hover:border-blue-300 h-10 w-10 p-0"
                  >
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                    </svg>
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open("https://twitter.com/sostene", "_blank")}
                    className="hover:bg-blue-50 hover:border-blue-300 h-10 w-10 p-0"
                  >
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                    </svg>
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open("https://instagram.com/sostene", "_blank")}
                    className="hover:bg-blue-50 hover:border-pink-300 h-10 w-10 p-0"
                  >
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                    </svg>
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-blue-50 p-3 rounded-lg text-center">
                  <p className="text-sm font-medium text-gray-700">USSD Code</p>
                  <p className="text-xl font-bold text-blue-600">*833#</p>
                </div>
                <div className="bg-red-50 p-3 rounded-lg text-center">
                  <p className="text-sm font-medium text-gray-700">Emergency Call</p>
                  <a href="tel:+250796897823" className="text-sm font-bold text-red-600 hover:text-red-700">
                    +250 796 897 823
                  </a>
                </div>
              </div>
            </div>
          </CardContent>
        </div>
      </div>

      {/* Floating Chat Button */}
      {!isChatOpen && (
        <Button
          onClick={() => setIsChatOpen(true)}
          className="fixed bottom-6 right-6 w-12 h-12 rounded-full bg-green-500 hover:bg-green-600 text-white shadow-lg animate-bounce z-50"
        >
          <MessageCircle className="h-5 w-5" />
        </Button>
      )}

      {/* Chat Window */}
      {isChatOpen && (
        <div className="fixed bottom-6 right-6 w-72 h-80 bg-white border border-gray-200 rounded-xl shadow-2xl z-50 flex flex-col">
          {/* Chat Header */}
          <div className="flex items-center justify-between p-3 border-b border-gray-200 bg-green-500 text-white rounded-t-xl">
            <div className="flex items-center gap-2">
              <div className="relative">
                <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
                  <span className="font-semibold text-xs">S</span>
                </div>
                <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-green-300 rounded-full border border-white" />
              </div>
              <div>
                <h4 className="font-semibold text-sm">Quick Talk</h4>
                <p className="text-green-100 text-xs">Online</p>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setIsChatOpen(false)} className="text-white hover:bg-white/10 h-6 w-6 p-0">
              <X className="h-3 w-3" />
            </Button>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 p-3 overflow-y-auto space-y-2 bg-gray-50">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-xs px-2 py-1 rounded-lg text-xs ${
                    msg.sender === "user" 
                      ? "bg-green-500 text-white" 
                      : "bg-white text-gray-700 shadow-sm border border-gray-200"
                  }`}
                >
                  <p>{msg.text}</p>
                  <p className="text-xs opacity-70 mt-1">{msg.time}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Chat Input */}
          <form onSubmit={handleSendMessage} className="p-3 border-t border-gray-200 bg-white rounded-b-xl">
            <div className="flex gap-2">
              <Input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 h-8 text-sm"
              />
              <Button type="submit" size="sm" className="bg-green-500 hover:bg-green-600 text-white h-8 w-8 p-0">
                <Send className="h-3 w-3" />
              </Button>
            </div>
          </form>
        </div>
      )}
    </>
  )
}

export function QuickTalkWrapper() {
  return (
    <AnimatedDotsBackground className="py-12 bg-gradient-to-b from-gray-50 to-white">
      <section id="ai-assistant" className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className="text-3xl lg:text-4xl font-bold mb-3 text-gray-800">Ask for Help</h2>
        </div>

        <QuickTalkSection />
      </section>
    </AnimatedDotsBackground>
  )
}