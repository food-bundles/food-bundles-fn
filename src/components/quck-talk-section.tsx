"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, Phone, MapPin, Send, X } from "lucide-react";
import { BsFillChatRightQuoteFill } from "react-icons/bs";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import { OptimizedImage } from "@/components/OptimizedImage";
import { Textarea } from "./ui/textarea";

const farmers = [
  {
    name: "Kinyinya Farm",
    product: "Vegetables",
    images: ["/farmers/farm5.jpg", "/farmers/farm6.jpg"],
  },
  {
    name: "Musanze Farm",
    product: "Fresh Fruits",
    images: ["/farmers/farm3.jpeg", "/farmers/farm4.png"],
  },
  {
    name: "Ntasho Farm",
    product: "Vegetables",
    images: ["/farmers/farm1.jpg", "/farmers/farm2.jpg"],
  },
];

function ContactInfo() {
  return (
    <div className="flex justify-center lg:justify-start">
      <div className="space-y-3  ">
        <div className="flex items-start  gap-3">
          <Mail className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-sm">Email Support</p>
            <a
              href="https://mail.google.com/mail/?view=cm&to=sales@food.rw"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-gray-600 hover:text-green-600 transition-colors block"
            >
              sales@food.rw
            </a>
            <a
              href="https://mail.google.com/mail/?view=cm&to=info@food.rw"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-gray-600 hover:text-green-600 transition-colors block"
            >
              info@food.rw
            </a>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <Phone className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-sm">Phone Support</p>
            <a
              href="tel:+250796897823"
              className="text-xs text-gray-600 hover:text-green-600 transition-colors"
            >
              +250 796 897 823
            </a>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <MapPin className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-sm">Company Location</p>
            <p className="text-xs text-gray-600">KG 5 Ave, Kigali</p>
          </div>
        </div>

        <div className="pt-1 border-t space-y-2">
          <p className="text-xs font-bold">
            Call center: <span className="text-green-600">*#</span>
          </p>
          <p className="text-xs font-bold">
            Emergency:{" "}
            <a
              href="tel:+250796897823"
              className="text-red-600 hover:text-green-600 transition-colors"
            >
              +250 796 897 823
            </a>
          </p>
        </div>
        <div className=" gap-2 flex items-center">
          <p className="text-xs font-medium mb-2">Connect with us</p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-9 w-9 p-0 hover:bg-green-50"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
              </svg>
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-9 w-9 p-0 hover:bg-green-50"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
              </svg>
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-9 w-9 p-0 hover:bg-green-50"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
              </svg>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ContactForm({
  setIsChatOpen,
}: {
  setIsChatOpen: (open: boolean) => void;
}) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const handleSubmit = (e: any) => {
    e.preventDefault();
    // console.log("Form submitted:", formData);
    setFormData({ name: "", email: "", message: "" });
  };

  return (
    <div className="space-y-4">
      <Input
        placeholder="Your Name"
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        className="text-[13px] bg-white placeholder:text-[12px] rounded"
      />
      <Input
        type="email"
        placeholder="Your Email"
        value={formData.email}
        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        className="text-[13px] bg-white placeholder:text-[12px] rounded"
      />
      <textarea
        placeholder="Your Message"
        value={formData.message}
        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
        className="w-full min-h-[60px] px-3 py-2 text-sm bg-white border border-gray-300 rounded  resize-none"
      />
      <div className="flex items-center gap-4">
        <Button
          onClick={handleSubmit}
          className="bg-green-600 hover:bg-green-700 flex items-center gap-2 rounded"
        >
          Send
          <Send className="h-4 w-4" />
        </Button>
        <p className="text-xs font-medium text-gray-600">
          Or chat with our Agent
        </p>
        <button
          onClick={() => setIsChatOpen(true)}
          className="group flex items-center gap-2 hover:scale-110 transition-transform"
        >
          <BsFillChatRightQuoteFill className="h-10 w-10 md:h-12 md:w-12 text-green-600 hover:text-green-700" />
        </button>
      </div>
    </div>
  );
}

function FarmCarousel() {
  const autoplayRef = useRef(
    Autoplay({ delay: 3000, stopOnInteraction: true })
  );

  // Flatten all images into a single array with farm info
  const allImages = farmers.flatMap((farmer) =>
    farmer.images.map((image) => ({
      image,
      name: farmer.name,
      product: farmer.product,
    }))
  );

  return (
    <div className="space-y-4">
      <div className="bg-transparent px-4 py-2">
        <h3 className="font-bold text-gray-900">Our Farms</h3>
      </div>

      <Carousel
        opts={{ align: "start", loop: true }}
        plugins={[autoplayRef.current]}
        className="w-full"
      >
        <CarouselContent className="-ml-2">
          {allImages.map((item, idx) => (
            <CarouselItem key={idx} className="pl-2 basis-1/2">
              <div className="relative h-40 rounded-lg overflow-hidden group">
                <OptimizedImage
                  width={200}
                  height={160}
                  src={item.image}
                  alt={`${item.name} - ${idx + 1}`}
                  className="w-full h-full rounded-lg object-cover transition-transform duration-300 group-hover:scale-105"
                  transformation={[
                    { width: 400, height: 320, crop: "fill", quality: "80" }
                  ]}
                />
                <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-2 left-2 text-left">
                  <h4 className="font-bold text-white text-sm">{item.name}</h4>
                  <p className="text-green-300 text-xs">{item.product}</p>
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="left-2" />
        <CarouselNext className="right-2" />
      </Carousel>
    </div>
  );
}

interface ChatWindowProps {
  isOpen: boolean;
  onClose: () => void;
}

function ChatWindow({ isOpen, onClose }: ChatWindowProps) {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hi! I'm Food Bundle Assistant. How can I help you today?",
      sender: "bot",
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    },
  ]);

  const handleSend = (e: any) => {
    e.preventDefault();
    if (!message.trim()) return;

    const newMessage = {
      id: messages.length + 1,
      text: message,
      sender: "user",
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
    setMessages([...messages, newMessage]);
    setMessage("");

    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: prev.length + 1,
          text: "Thanks for your message! How can I assist you further?",
          sender: "bot",
          time: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        },
      ]);
    }, 600);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-4 right-4 w-[calc(100vw-2rem)] max-w-md sm:w-96 h-[75vh] max-h-[600px] bg-white border rounded shadow-2xl z-50 flex flex-col">
      <div className="flex items-center justify-between p-2 bg-green-600 text-white rounded">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
              <span className="text-green-600 text-[14px] font-bold">F</span>
            </div>
            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-green-600" />
          </div>
          <div>
            <h4 className="font-semibold text-[14px]">Food Bundle Support</h4>
            <p className="text-green-100 text-[12px]">Online</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="h-8 w-8 p-0 text-white hover:bg-green-700"
        >
          <X className="h-5 w-5" />
        </Button>
      </div>

      <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-gray-50">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${
              msg.sender === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[80%] px-4 py-2 rounded-2xl text-[12px] ${
                msg.sender === "user"
                  ? "bg-green-600 text-white rounded-br-none"
                  : "bg-white text-gray-800 rounded-bl-none shadow"
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

      <div className="p-4 border-t bg-white rounded-b-xl">
        <div className="flex gap-2">
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend(e);
              }
            }}
            placeholder="Type your message..."
            className="flex-1 text-sm rounded placeholder:text-[12px] resize-none h-[60px] overflow-y-auto scrollbar-hide"
          />

          <Button
            onClick={handleSend}
            size="sm"
            className="bg-green-600 hover:bg-green-700 h-10 w-10 p-0 rounded-full"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function QuickTalkSection() {
  const [isChatOpen, setIsChatOpen] = useState(false);

  return (
    <div className="bg-transparent py-6 md:py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-6">
          <h2 className="text-xl md:text-2xl font-bold text-gray-800">
            Get Support
          </h2>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex-1 bg-transparent p-4 md:p-6">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex-1">
                <ContactInfo />
              </div>
              <div className="flex-1">
                <ContactForm setIsChatOpen={setIsChatOpen} />
              </div>
            </div>
          </div>

          <div className="flex-1 flex flex-col gap-6">
            <div className="flex-1 bg-transparent overflow-hidden">
              <FarmCarousel />

              <div className="flex items-center gap-4 mt-6">
                <p className="text-[13px] flex-1">
                  Are you a farmer? This is big market, Join our farmers
                  community
                </p>
                <a href="/signup" rel="noopener noreferrer">
                  <button className="bg-green-600 hover:bg-green-700 text-white text-[13px] px-4 py-2 rounded whitespace-nowrap">
                    Join Now
                  </button>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {!isChatOpen && (
        <button
          onClick={() => window.open("https://wa.me/250796897823", "_blank")}
          className="fixed bottom-12 right-6 w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-full bg-green-500 hover:bg-green-600 text-white shadow-lg hover:scale-110 transition-transform z-40"
        >
          <svg
            className="h-6 w-6 md:h-7 md:w-7"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488" />
          </svg>
        </button>
      )}

      <ChatWindow isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
    </div>
  );
}
