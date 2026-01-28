"use client";

import type React from "react";
import { useState } from "react";
import {
  Mail,
  ChevronDown,
  ChevronRight,
  PhoneOutgoing,
  Send,
  X,
  CircleChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { faqData, chatbotContext } from "@/data/faqData";


type ContactInfo = {
  phone: string;
  email: string;
  whatsapp: string;
  hours: string;
  responseTime: string;
};

type FAQ = {
  id: string;
  question: string;
  answer: string;
  category: string;
};

type Props = {
  contactInfo: ContactInfo;
  faqs: FAQ[];
};

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || "");
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export function HelpContent({ contactInfo, faqs }: Props) {
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  // chat state
  const [messages, setMessages] = useState<
    { id: number; text: string; sender: "user" | "bot"; time: string }[]
  >([{
    id: 1,
    text: "Hello! I'm Food Bundle Support Online. I'm here to help you with questions about our services, vouchers, subscriptions, and more. How can I assist you today?",
    sender: "bot",
    time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }]);
  const [message, setMessage] = useState("");

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    const userMessage = {
      id: Date.now(),
      text: message,
      sender: "user" as const,
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    setMessages((prev) => [...prev, userMessage]);
    const currentMessage = message;
    setMessage("");
    setIsTyping(true);

    try {
      let reply: string;

      // Check FAQ first for exact matches
      const faqMatch = Object.keys(faqData).find(key => 
        key.toLowerCase().includes(currentMessage.toLowerCase()) ||
        currentMessage.toLowerCase().includes(key.toLowerCase())
      );

      if (faqMatch) {
        reply = faqData[faqMatch as keyof typeof faqData];
      } else {
        // Use Gemini AI with context
        const prompt = `${chatbotContext}

FAQ Database: ${JSON.stringify(faqData)}

User Question: ${currentMessage}

Please provide a helpful response based on the FAQ data and context. If the question isn't covered in the FAQ, provide general assistance and direct them to contact support.`;
        
        const result = await model.generateContent(prompt);
        reply = result.response.text();
      }

      const botMessage = {
        id: Date.now() + 1,
        text: reply,
        sender: "bot" as const,
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error('Chatbot error:', error);
      const errorMessage = {
        id: Date.now() + 1,
        text: "I'm having trouble right now. Please contact our support team at +250 796 897 823 or sales@food.rw for immediate assistance.",
        sender: "bot" as const,
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const toggleFAQ = (id: string) => {
    setExpandedFAQ(expandedFAQ === id ? null : id);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-xl font-bold text-gray-900 mb-4">
          How can we help you today?
        </h1>
      </div>

      {/* Emergency Issue */}
      <Card className="relative overflow-hidden border rounded-none shadow-none">
        <CardContent className="relative z-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3 ">
              <div>
                <h3 className="text-[14px] font-bold text-red-900 tracking-wide uppercase">
                  Emergency Issue
                </h3>
                <p className="text-[13px] text-red-700 mt-1 max-w-sm">
                  Our support team is available right now to assist you. Don’t
                  wait get immediate help.
                </p>
              </div>
              <span className="text-2xl ml-5">👉</span>
            </div>

            <div className="flex items-center gap-2">
              <Button
                size="lg"
                className="relative bg-red-600 hover:bg-red-700 text-white font-bold shadow-xl rounded-full px-6 py-3 hover:scale-105 transition-transform duration-300 "
              >
                <PhoneOutgoing className="font-bold" /> 0796 897 823
              </Button>
              {/* Animated Hand */}
            </div>
          </div>
        </CardContent>
      </Card>

      <CardHeader>
        <CardTitle className="text-[16px] font-medium">
          Contact Information
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Phone Support */}
          {/* <div className="flex flex-col items-center justify-center space-y-4 ">
            <div className=" flex items-center justify-center bg-blue-100 p-2 rounded-full">
              <Phone className="h-5 w-5 text-blue-600" />
            </div>
            <h4 className="font-semibold text-gray-900 mb-1">Phone Support</h4>
            <p className="text-sm text-gray-600 mb-1">{contactInfo.phone}</p>
            <p className="text-xs text-gray-500">{contactInfo.hours}</p>
          </div> */}

          {/* Email Support */}
          <div className="flex flex-col items-center justify-center space-y-4 hover:bg-green-100 p-4 rounded-lg transition-colors duration-200 cursor-pointer">
            <div className="flex items-center justify-center ">
              <Mail className="h-10 w-10 text-green-600" />
            </div>
            <div className="flex flex-col items-center">
              <h4 className="font-medium text-[14px] text-black mb-1">
                Email Support
              </h4>
              <p className="text-[13px] text-gray-700 ">{contactInfo.email}</p>
              <p className="text-[12px] text-gray-700">
                {contactInfo.responseTime}
              </p>
            </div>
          </div>

          {/* WhatsApp Support */}
          <div className="flex flex-col items-center justify-center space-y-4 hover:bg-green-100 p-4 rounded-lg transition-colors duration-200 cursor-pointer" onClick={() => window.open("https://wa.me/250796897823", "_blank")}>
            <div className="flex flex-col items-center justify-center p-2 rounded-full">
              <svg
                className="h-6 w-6 sm:h-8 sm:w-8 text-green-600"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488" />
              </svg>
            </div>
            <div className="flex flex-col items-center">
              <h4 className="font-medium text-[14px] text-gray-900 mb-1">
                WhatsApp Support
              </h4>
              <p className="text-[13px] text-gray-700 mb-1">
                {contactInfo.whatsapp}
              </p>
              <p className="text-[12px] text-gray-600">24/7 chat support</p>
            </div>
          </div>
       
          {/* Live Chat */}
          <div className="flex flex-col items-center justify-center space-y-4 hover:bg-green-100 p-4 rounded-lg transition-colors duration-200 cursor-pointer" onClick={() => { if (window.chatbase) { window.chatbase('open'); } }}>
            <div className="flex flex-col itmes-center justify-center bg-purple-100 p-2 rounded-full">
              <CircleChevronRight className="h-5 w-5 text-purple-600" />
            </div>
            <div className="flex flex-col items-center">
              <h4 className="font-semibold text-gray-900 mb-1">For More</h4>
              <p className="text-sm text-gray-600 mb-1">Chat With Our Agent</p>
              <p className="text-xs text-green-500">Available now</p>
            </div>
          </div>
        </div>
      </CardContent>

      {/* Send us a message */}
      {/* <Card>
        <CardHeader>
          <CardTitle className="text-xl font-bold">Send us a message</CardTitle>
          <p className="text-gray-600">
            Your message will be sent to our support team and you will receive
            responses via email, WhatsApp, and notifications in your dashboard.
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <Input
                  placeholder="Enter your name"
                  value={formData.fullName}
                  onChange={(e) =>
                    handleInputChange("fullName", e.target.value)
                  }
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number (optional - for WhatsApp)
              </label>
              <Input
                type="tel"
                placeholder="Enter your phone number"
                value={formData.phone}
                onChange={(e) => handleInputChange("phone", e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Subject
              </label>
              <Select
                onValueChange={(value) => handleInputChange("subject", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="orders">Order Issues</SelectItem>
                  <SelectItem value="payments">Payment Problems</SelectItem>
                  <SelectItem value="delivery">Delivery Questions</SelectItem>
                  <SelectItem value="account">Account Settings</SelectItem>
                  <SelectItem value="technical">Technical Support</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Message
              </label>
              <Textarea
                placeholder="Describe your issue or question in detail"
                rows={5}
                value={formData.message}
                onChange={(e) => handleInputChange("message", e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Attachment (optional)
              </label>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="flex items-center gap-2 bg-transparent"
                >
                  <Paperclip className="h-4 w-4" />
                  Browse
                </Button>
                <span className="text-sm text-gray-500">
                  Drag and drop files here or browse
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="notifications"
                checked={formData.notifications}
                onCheckedChange={(checked) =>
                  handleInputChange("notifications", checked as boolean)
                }
              />
              <label htmlFor="notifications" className="text-sm text-gray-700">
                I would like to receive notifications about my support request
                via email and WhatsApp
              </label>
            </div>

            <Button
              type="submit"
              className="bg-green-500 hover:bg-green-600 text-white"
            >
              Send Message
            </Button>
          </form>
        </CardContent>
      </Card> */}

      {/* FAQ Section */}
      {/* <Card> */}
      {/* FAQ Section */}
      <CardHeader>
        <CardTitle className="text-[18px] font-bold">
          Frequently Asked Questions
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {faqs.map((faq) => (
            <div key={faq.id}>
              <button
                onClick={() => toggleFAQ(faq.id)}
                className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors"
              >
                <span className="text-[14px] text-gray-900">
                  {faq.question}
                </span>
                {expandedFAQ === faq.id ? (
                  <ChevronDown className="h-5 w-5 text-gray-500" />
                ) : (
                  <ChevronRight className="h-5 w-5 text-gray-500" />
                )}
              </button>
              {expandedFAQ === faq.id && (
                <div className="px-4 pb-4 text-[13px] text-gray-600">
                  <p className="pt-3">{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>

      {/* Chat Window */}
      {isChatOpen && (
        <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 w-[calc(100vw-2rem)] max-w-sm sm:w-80 h-[70vh] sm:h-96 bg-background border border-border rounded-lg shadow-xl z-50 flex flex-col">
          {/* Chat Header */}
          <div className="flex items-center justify-between p-3 sm:p-4 border-b border-border">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="relative">
                <div className="w-7 h-7 sm:w-8 sm:h-8 bg-primary rounded-full flex items-center justify-center">
                  <span className="text-primary-foreground font-semibold text-xs sm:text-sm">
                    S
                  </span>
                </div>
                <div className="absolute -bottom-1 -right-1 w-2.5 h-2.5 sm:w-3 sm:h-3 bg-green-500 rounded-full border border-background" />
              </div>
              <div>
                <h4 className="font-semibold text-xs sm:text-sm">Quick Talk</h4>
                <p className="text-green-500 text-xs">Online</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsChatOpen(false)}
              className="h-7 w-7 sm:h-8 sm:w-8 p-0"
            >
              <X className="h-3 w-3 sm:h-4 sm:w-4" />
            </Button>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 p-3 sm:p-4 overflow-y-auto space-y-2 sm:space-y-3">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${
                  msg.sender === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-xs px-3 py-2 rounded-lg text-xs sm:text-sm ${
                    msg.sender === "user"
                      ? "bg-green-500 text-white"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  <p>{msg.text}</p>
                  <p className="text-xs opacity-70 mt-1">{msg.time}</p>
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-gray-100 text-gray-800 px-3 py-2 rounded-lg text-xs sm:text-sm">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Chat Input */}
          <form
            onSubmit={handleSendMessage}
            className="p-3 sm:p-4 border-t border-border"
          >
            <div className="flex gap-2">
              <Input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 text-sm h-8 sm:h-10"
              />
              <Button
                type="submit"
                size="sm"
                className="bg-primary hover:bg-primary/90 text-primary-foreground h-8 w-8 sm:h-10 sm:w-10 p-0"
              >
                <Send className="h-3 w-3 sm:h-4 sm:w-4" />
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}