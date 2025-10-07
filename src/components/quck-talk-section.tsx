"use client";

import type React from "react";
import { CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, Phone, MapPin, Send, X } from "lucide-react";
import { useEffect, useState } from "react";
import { AnimatedDotsBackground } from "./animated-dots-background";
import { BsFillChatRightQuoteFill } from "react-icons/bs";
import { MdSupportAgent } from "react-icons/md";

// Farmers data
const farmers = [
  {
    name: "Kinyinya Farm",
    favoriteProduct: "Vegetables",
    image: [
      {
        url: "/farmers/farm1.jpg",
        title: "Kinyinya Farm - Vegetables",
      },
      {
        url: "/farmers/farm3.jpeg",
        title: "Kinyinya Farm - Vegetables",
      },
    ],
  },
  {
    name: "Musanze Farm",
    favoriteProduct: "Fresh Fruits",
    image: [
      {
        url: "/farmers/farm4.png",
        title: "Musanze Farm - Fresh Fruits",
      },
      {
        url: "/farmers/farm5.jpg",
        title: "Musanze Farm - Fresh Fruits",
      },
    ],
  },
  {
    name: "Ntasho Farm",
    favoriteProduct: "Vegetables",
    image: [
      {
        url: "/farmers/farm2.jpg",
        title: "Ntasho Farm - Vegetables",
      },
      {
        url: "/farmers/farm6.jpg",
        title: "Ntasho Farm - Vegetables",
      },
    ],
  },
];
// Dashboard photos data
const dashboardPhotos = [
  {
    url: "/dashboad/dash1.png",
    title: "Sales Overview",
  },
  {
    url: "/dashboad/dash2.png",
    title: "Order Analytics",
  },
  {
    url: "/dashboad/dash3.png",
    title: "Inventory Status",
  },
  {
    url: "/dashboad/dash4.png",
    title: "Customer Insights",
  },
  {
    url: "/dashboad/dash5.png",
    title: "Customer Insights",
  },
  {
    url: "/dashboad/dash6.png",
    title: "Customer Insights",
  },
];

type Message = {
  id: number;
  text: string;
  sender: "bot" | "user";
  time: string;
};

function QuickTalkSection() {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: "Hi! I'm Food bundle Assistant. How can I help you with your restaurant supply needs today?",
      sender: "bot",
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    },
  ]);

  // State for current farm and image
  const [currentFarmIndex, setCurrentFarmIndex] = useState(0);
  const [currentFarmImageIndex, setCurrentFarmImageIndex] = useState(0);

  // State for dashboard photo
  const [currentDashboardIndex, setCurrentDashboardIndex] = useState(0);

  // Auto-rotate farm card every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFarmIndex((prev) => (prev + 1) % farmers.length);
      setCurrentFarmImageIndex(0);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // Auto-rotate farm images every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFarmImageIndex(
        (prev) => (prev + 1) % farmers[currentFarmIndex].image.length
      );
    }, 3000);

    return () => clearInterval(interval);
  }, [currentFarmIndex]);

  // Auto-rotate dashboard photos every 4 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentDashboardIndex((prev) => (prev + 1) % dashboardPhotos.length);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      const newMessage = {
        id: messages.length + 1,
        text: message,
        sender: "user" as const,
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
      setMessages([...messages, newMessage]);
      setMessage("");

      setTimeout(() => {
        const botResponse = {
          id: messages.length + 2,
          text: "Thanks for your message! I'll help you find the best ingredients for your restaurant. What specific items are you looking for?",
          sender: "bot" as const,
          time: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        };
        setMessages((prev) => [...prev, botResponse]);
      }, 600);
    }
  };

  const currentFarmer = farmers[currentFarmIndex];
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const currentDashboard = dashboardPhotos[currentDashboardIndex];

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3 lg:gap-0 max-w-7xl mx-auto px-2">
        {/* Farm Card */}
        <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg overflow-hidden min-h-[350px] sm:min-h-[400px]">
          <div
            className="relative flex flex-col flex-1 h-full overflow-hidden cursor-pointer transition-all duration-500"
            style={{
              backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.3), rgba(0,0,0,0.4)), url(${currentFarmer.image[currentFarmImageIndex].url})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
            }}
          >
            <div className="absolute top-4 left-4 right-4">
              <div className="backdrop-blur-md px-4 py-2 rounded-lg inline-block">
                <h3 className="font-bold text-[17px] text-white">Our Farms</h3>
              </div>
            </div>
            <div className="absolute inset-0 flex flex-col justify-end p-6">
              <div className="text-center space-y-2 mb-8">
                <h4 className="font-bold text-[15px] text-white">
                  {currentFarmer.name}
                </h4>
                <p className="text-[14px] text-green-300 font-medium">
                  {currentFarmer.favoriteProduct}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Dashboard Card */}
        <div
          className="bg-white rounded-[1.8rem] shadow-2xl overflow-hidden flex flex-col items-center justify-center lg:ml-15  
    h-[420px] sm:h-[460px] md:h-[500px] w-[220px] sm:w-[250px] md:w-[270px] p-2"
        >
          <div className="relative flex-1 w-full bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl overflow-hidden shadow-2xl">
            <div className="absolute inset-0">
              {dashboardPhotos.map((dashboard, index) => (
                <div
                  key={index}
                  className="absolute inset-0 transition-all duration-400 ease-in-out"
                  style={{
                    transform: `translateX(${
                      (index - currentDashboardIndex) * 100
                    }%)`,
                    opacity: index === currentDashboardIndex ? 1 : 0,
                    backgroundImage: `url(${dashboard.url})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    backgroundRepeat: "no-repeat",
                  }}
                />
              ))}
            </div>
          </div>
        </div>
        {/* Contact Section */}
        <div className="bg-white/90 backdrop-blur-sm p-2 sm:p-3 rounded-lg mb-2 flex-1 h-full ">
          <CardHeader className="px-0 pb-4 flex flex-row items-center gap-3">
            <MdSupportAgent className="text-green-600 w-8 h-8" />
            <p className="text-[16px] font-semibold text-black">Get Support</p>
          </CardHeader>
          <CardContent className="px-0 space-y-4">
            {/* Contact Info and Chat Button */}
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
              {/* Contact Information */}
              <div className="w-full lg:w-auto space-y-3">
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-green-600 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="font-medium text-[14px]">Email Support</p>
                    <a
                      href="https://mail.google.com/mail/?view=cm&to=sales@food.rw"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[13px]  hover:text-green-600 break-all transition-colors"
                    >
                      sales@food.rw
                    </a>
                    <p>
                      <a
                        href="https://mail.google.com/mail/?view=cm&to=info@food.rw"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[13px]  hover:text-green-600 break-all transition-colors"
                      >
                        info@food.rw
                      </a>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-green-600 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="font-medium text-[14px]">Phone Support</p>
                    <a
                      href="tel:+250796897823"
                      className="text-[13px]  hover:text-green-600 transition-colors"
                    >
                      +250 796 897 823
                    </a>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <MapPin className="h-5 w-5 text-green-600 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="font-medium text-[14px]">Company Location</p>
                    <p className="text-[13px] ">KG 5 Ave, Kigali</p>
                  </div>
                </div>
              </div>

              {/* Chat Button */}
              <div className="group flex flex-col items-center gap-2 p-2">
                <button
                  onClick={() => setIsChatOpen(true)}
                  className="flex items-center justify-center rounded-full transition-all cursor-pointer hover:scale-110 transform duration-200"
                >
                  <BsFillChatRightQuoteFill className="h-10 w-10 text-green-600 hover:text-green-700" />
                </button>
                <p className="text-[13px] font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  What&apos;s Up
                </p>
              </div>
            </div>

            {/* USSD and Emergency */}
            <div className="flex flex-col sm:flex-row items-center gap-4 pt-3 border-t">
              <div className="text-center sm:text-left">
                <p className="text-sm font-bold">
                  Call center:{" "}
                  <span className="text-green-600 text-base font-bold">
                    795
                  </span>
                </p>
              </div>

              <div className="text-center sm:text-left">
                <p className="text-sm font-bold">
                  Emergency Call:{" "}
                  <span className="text-red-600 text-base font-bold ">
                    <a
                      href="tel:+250796897823"
                      className="hover:text-green-600 transition-colors"
                    >
                      +250 796 897 823
                    </a>
                  </span>
                </p>
              </div>
            </div>

            {/* Social Media */}
            <div className="pt-4 border-t">
              <p className="text-sm font-medium mb-3">Connect with us</p>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-10 w-10 p-0 hover:bg-green-50 transition-colors"
                  onClick={() => window.open("", "_blank")}
                >
                  <svg
                    className="h-4 w-4"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                  </svg>
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  className="h-10 w-10 p-0 hover:bg-green-50 transition-colors"
                  onClick={() => window.open("", "_blank")}
                >
                  <svg
                    className="h-4 w-4"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                  </svg>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-10 w-10 p-0 hover:bg-green-50 transition-colors"
                  onClick={() => window.open("", "_blank")}
                >
                  <svg
                    className="h-4 w-4"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                </Button>
              </div>
            </div>
          </CardContent>
        </div>
      </div>

      {/* Floating WhatsApp Button */}
      {!isChatOpen && (
        <button
          onClick={() => window.open("https://wa.me/250796897823", "_blank")}
          className="fixed bottom-6 right-6 w-14 h-14 flex items-center justify-center cursor-pointer rounded-full bg-green-500 hover:bg-green-600 text-white shadow-lg animate-bounce z-50 hover:scale-110 transition-transform"
        >
          <svg
            className="h-8 w-8 text-white"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488" />
          </svg>
        </button>
      )}

      {/* Chat Window */}
      {isChatOpen && (
        <div className="fixed bottom-6 right-6 w-[calc(100vw-2rem)] max-w-md sm:w-96 h-[75vh] max-h-[600px] bg-white border border-gray-200 rounded-xl shadow-2xl z-50 flex flex-col overflow-hidden">
          {/* Chat Header */}
          <div className="flex items-center justify-between p-4 bg-green-600 text-white">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                  <span className="text-green-600 font-bold text-lg">F</span>
                </div>
                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-green-600" />
              </div>
              <div>
                <h4 className="font-semibold text-base">Food Bundle Support</h4>
                <p className="text-green-100 text-xs">Online</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsChatOpen(false)}
              className="h-8 w-8 p-0 text-white hover:bg-green-700"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-gray-50">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${
                  msg.sender === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[80%] px-4 py-2 rounded-2xl text-sm shadow-sm ${
                    msg.sender === "user"
                      ? "bg-green-600 text-white rounded-br-none"
                      : "bg-white text-gray-800 rounded-bl-none"
                  }`}
                >
                  <p>{msg.text}</p>
                  <p
                    className={`text-xs mt-1 ${
                      msg.sender === "user" ? "text-green-100" : "text-gray-500"
                    }`}
                  >
                    {msg.time}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Chat Input */}
          <div className="p-4 border-t bg-white">
            <div className="flex gap-2">
              <Input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    handleSendMessage(e);
                  }
                }}
                placeholder="Type your message..."
                className="flex-1 text-sm h-10 rounded-full border-gray-300 focus:border-green-500 focus:ring-green-500"
              />
              <Button
                onClick={handleSendMessage}
                size="sm"
                className="bg-green-600 hover:bg-green-700 text-white h-10 w-10 p-0 rounded-full"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export function QuickTalkWrapper() {
  return (
    <div className="flex flex-col mt-2 md:mt-8 lg:mt-0">
      <AnimatedDotsBackground className="flex-1 bg-gray-50">
        <section
          id="ai-assistant"
          className="container mx-auto px-4 sm:px-6 lg:px-8 pb-6 pt-2"
        >
          <div className="text-center mb-2">
            <h2 className="text-[18px] font-bold text-gray-800">Ask Help</h2>
          </div>
          <QuickTalkSection />
        </section>
      </AnimatedDotsBackground>
    </div>
  );
}
