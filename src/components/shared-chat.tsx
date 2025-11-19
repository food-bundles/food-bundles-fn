'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, X } from 'lucide-react';

interface Message {
  id: number;
  text: string;
  sender: 'user' | 'bot';
  time: string;
}

interface SharedChatProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  className?: string;
}

const faqData = {
  // About FoodBundles
  "What is FoodBundles?": "Food Bundles is a digital platform that connects farmers, distributors, and restaurants to make food supply, ordering, and payments easier and more efficient.",
  "What services do you offer?": "We provide farm-to-restaurant ingredient delivery, inventory management, real-time order tracking, supplier network access, and sustainable supply chain solutions.",
  "How does FoodBundles work?": "Restaurants browse our network of local suppliers, place orders through our platform, and receive fresh ingredients with real-time tracking and direct communication with suppliers.",
  "Who can use Food Bundles?": "The platform is designed for three main users: Farmers, Food Bundles (Distributors), and Restaurants. Each user type has specific access methods and features.",
  
  // Contact Information
  "How can I contact support?": "You can reach us via phone at +250 796 897 823, email at sales@food.rw, or WhatsApp at +250 796 897 823. Our business hours are Mon-Fri 9am-6pm EST.",
  "What is your phone number?": "+250 796 897 823. We're available Mon-Fri 9am-6pm EST for phone support.",
  "What is your email address?": "sales@food.rw - We respond within 24 hours to all email inquiries.",
  "What are your business hours?": "Monday to Friday, 9am-6pm EST. We're closed on weekends and public holidays.",
  
  // Orders & Purchasing
  "How do I place an order?": "Navigate to the Shop section, search for your desired supplier, browse their products, and add items to your cart. Once ready, proceed to checkout and follow the prompts to complete your order.",
  "Can I modify my order?": "Orders can be modified within 2 hours of placement. Contact support at +250 796 897 823 or use the 'Modify Order' option in your dashboard.",
  "What is the minimum order amount?": "Minimum order varies by supplier, typically ranging from 10,000 RWF to 50,000 RWF. Check individual supplier requirements.",
  "How do I cancel an order?": "Orders can be cancelled within 2 hours of placement without penalty. After this window, cancellation fees may apply. Contact support for assistance.",
  
  // Payment & Billing
  "What payment methods do you accept?": "Food Bundles supports secure payments through MTN Mobile Money, Airtel Money, Visa/MasterCard (via Flutterwave), and Bank transfer (optional).",
  "Do you offer credit terms?": "Yes, we offer net-30 payment terms for qualifying businesses after credit approval. Contact sales@food.rw for application details.",
  "When will I be charged?": "Payment is processed upon order confirmation for credit card payments, or according to agreed terms for business accounts.",
  "Can I get an invoice?": "Yes, invoices are automatically generated and sent to your registered email. You can also download them from your dashboard.",
  
  // Delivery & Tracking
  "How can I track my deliveries?": "All deliveries can be tracked in the Orders section of your dashboard. You'll receive real-time updates and can communicate directly with delivery personnel through our platform.",
  "What are your delivery hours?": "Standard delivery is 6am-8pm, Monday to Sunday. Express delivery options available for urgent orders.",
  "Do you deliver on weekends?": "Yes, we deliver on Saturdays. Sunday delivery is available for premium subscribers with advance notice.",
  "What is your delivery area?": "We currently serve Kigali and surrounding areas. Contact us to check if we deliver to your specific location.",
  "How much does delivery cost?": "Delivery fees vary by distance and order size, typically 2,000-5,000 RWF. Premium subscribers get free delivery on orders over 30,000 RWF.",
  
  // Subscriptions & Plans
  "What subscription plans do you offer?": "We offer two subscription plans: Basic (20k) for essential features and Premium (50k) for advanced benefits including priority delivery and special pricing.",
  "What's included in the Basic plan?": "Basic plan (20k/month) includes access to supplier network, order tracking, basic inventory management, and standard delivery.",
  "What's included in the Premium plan?": "Premium plan (50k/month) includes everything in Basic plus priority delivery, special pricing, weekend delivery, free delivery on large orders, and dedicated account manager.",
  "Can I change my subscription plan?": "Yes, you can upgrade or downgrade your plan anytime. Changes take effect at the next billing cycle.",
  
  // Account & Technical
  "How do I create an account?": "Click 'Sign Up' on our homepage, provide your business details, verify your email, and complete the onboarding process.",
  "I forgot my password": "Use the 'Forgot Password' link on the login page, or contact support at +250 796 897 823 for immediate assistance.",
  "How do I update my account information?": "Log into your dashboard and go to Account Settings to update your business information, contact details, and preferences.",
  "Is my data secure?": "Yes, we use industry-standard encryption and security measures to protect your data. We're compliant with data protection regulations.",
  
  // Suppliers & Products
  "How do I find suppliers?": "Use the search function in the Shop section, filter by location, product type, or rating to find suppliers that meet your needs.",
  "How are suppliers verified?": "All suppliers undergo verification including business registration, quality standards, and food safety compliance checks.",
  "Can I request specific products?": "Yes, use the 'Request Product' feature or contact your account manager to request specific items from suppliers.",
  
  // Refunds & Returns
  "What is your refund policy?": "We offer refunds within 30 days of purchase for unused products. Contact support at +250 796 897 823 or sales@food.rw to initiate a refund request.",
  "How do I return products?": "Contact support within 24 hours of delivery for quality issues. We'll arrange pickup and provide full refund or replacement.",
  "What if my order is damaged?": "Report damaged items immediately upon delivery. We'll provide immediate replacement or full refund at no cost to you.",
  
  // Platform Access & USSD
  "How do farmers access the system?": "Farmers use the USSD code *795# on any mobile phone. Through USSD, farmers can register, view demand, offer produce for sale, and track payments — no smartphone or internet required.",
  "How do restaurants and distributors access Food Bundles?": "Restaurants and distributors use a web platform where they can search for available products, place and manage orders, track deliveries, and view invoices and payment status.",
  "What is the USSD code for farmers?": "Farmers can access Food Bundles by dialing *795# on any mobile phone. This works without internet or smartphone requirements.",
  "Do I need internet to use Food Bundles?": "Farmers: No — USSD (*795#) works on any mobile phone without internet. Restaurants & distributors: Yes — web platform access required.",
  
  // Payment Methods
  "What payment methods are supported?": "Food Bundles supports secure payments through MTN Mobile Money, Airtel Money, Visa/MasterCard (via Flutterwave), and Bank transfer (optional).",
  "Can I use mobile money?": "Yes, we support both MTN Mobile Money and Airtel Money for secure payments on the platform.",
  "Do you accept credit cards?": "Yes, we accept Visa and MasterCard payments processed securely through Flutterwave payment gateway.",
  
  // Tracking & Monitoring
  "Can I track my orders or payments?": "Yes. Restaurants & distributors can track orders online through the web platform. Farmers can check payment status via *795# USSD code.",
  "How do farmers check payment status?": "Farmers can check their payment status by dialing *795# and following the menu options to view payment information."
};

const keywordMapping: { [key: string]: string } = {
  // Contact & Support
  "phone": "What is your phone number?",
  "email": "What is your email address?",
  "contact": "How can I contact support?",
  "support": "How can I contact support?",
  "hours": "What are your business hours?",
  "help": "How can I contact support?",
  
  // About & Services
  "about": "What is FoodBundles?",
  "services": "What services do you offer?",
  "work": "How does FoodBundles work?",
  "foodbundles": "What is FoodBundles?",
  
  // Orders
  "order": "How do I place an order?",
  "place": "How do I place an order?",
  "buy": "How do I place an order?",
  "purchase": "How do I place an order?",
  "modify": "Can I modify my order?",
  "change": "Can I modify my order?",
  "cancel": "How do I cancel an order?",
  "minimum": "What is the minimum order amount?",
  
  // Payment
  "payment": "What payment methods do you accept?",
  "pay": "What payment methods do you accept?",
  "credit": "Do you offer credit terms?",
  "invoice": "Can I get an invoice?",
  "charged": "When will I be charged?",
  "billing": "When will I be charged?",
  
  // Delivery
  "delivery": "How can I track my deliveries?",
  "track": "How can I track my deliveries?",
  "shipping": "How can I track my deliveries?",
  "deliver": "What are your delivery hours?",
  "weekend": "Do you deliver on weekends?",
  "area": "What is your delivery area?",
  "cost": "How much does delivery cost?",
  "fee": "How much does delivery cost?",
  
  // Subscriptions
  "subscription": "What subscription plans do you offer?",
  "plan": "What subscription plans do you offer?",
  "basic": "What's included in the Basic plan?",
  "premium": "What's included in the Premium plan?",
  "upgrade": "Can I change my subscription plan?",
  "downgrade": "Can I change my subscription plan?",
  
  // Account
  "account": "How do I create an account?",
  "signup": "How do I create an account?",
  "register": "How do I create an account?",
  "password": "I forgot my password",
  "forgot": "I forgot my password",
  "update": "How do I update my account information?",
  "security": "Is my data secure?",
  "data": "Is my data secure?",
  
  // Suppliers
  "supplier": "How do I find suppliers?",
  "find": "How do I find suppliers?",
  "verified": "How are suppliers verified?",
  "product": "Can I request specific products?",
  "request": "Can I request specific products?",
  
  // Refunds & Returns
  "refund": "What is your refund policy?",
  "return": "How do I return products?",
  "damaged": "What if my order is damaged?",
  "quality": "How do I return products?",
  
  // Platform Access
  "ussd": "How do farmers access the system?",
  "*795#": "What is the USSD code for farmers?",
  "795": "What is the USSD code for farmers?",
  "code": "What is the USSD code for farmers?",
  "web": "How do restaurants and distributors access Food Bundles?",
  "platform": "How do restaurants and distributors access Food Bundles?",
  "internet": "Do I need internet to use Food Bundles?",
  "smartphone": "Do I need internet to use Food Bundles?",
  "access": "How do farmers access the system?",
  
  // Payment Methods
  "mtn": "Can I use mobile money?",
  "airtel": "Can I use mobile money?",
  "mobile": "Can I use mobile money?",
  "money": "Can I use mobile money?",
  "visa": "Do you accept credit cards?",
  "mastercard": "Do you accept credit cards?",
  "card": "Do you accept credit cards?",
  "flutterwave": "Do you accept credit cards?",
  "bank": "What payment methods are supported?",
  "transfer": "What payment methods are supported?",
  
  // User Types
  "who": "Who can use Food Bundles?",
  "users": "Who can use Food Bundles?",
  "distributors": "Who can use Food Bundles?",
  "distributor": "Who can use Food Bundles?",
  
  // Tracking
  "status": "Can I track my orders or payments?",
  "check": "How do farmers check payment status?"
};

export function SharedChat({ isOpen, onClose, title = "Food Bundle Support", className = "" }: SharedChatProps) {
  const [message, setMessage] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: "Hi! I'm Food Bundle Support Online. How can I help you today?",
      sender: "bot",
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    },
  ]);

  const findSuggestions = (input: string) => {
    const inputLower = input.toLowerCase();
    const suggestions: string[] = [];
    
    // Direct keyword matching
    const keywords = inputLower.split(' ');
    keywords.forEach(keyword => {
      if (keywordMapping[keyword]) {
        suggestions.push(keywordMapping[keyword]);
      }
    });
    
    // Partial matching for better coverage
    Object.keys(keywordMapping).forEach(keyword => {
      if (inputLower.includes(keyword) && !suggestions.includes(keywordMapping[keyword])) {
        suggestions.push(keywordMapping[keyword]);
      }
    });
    
    // Question similarity matching
    if (suggestions.length === 0) {
      Object.keys(faqData).forEach(question => {
        const questionWords = question.toLowerCase().split(' ');
        const inputWords = inputLower.split(' ');
        const commonWords = questionWords.filter(word => inputWords.some(inputWord => inputWord.includes(word) || word.includes(inputWord)));
        
        if (commonWords.length >= 2) {
          suggestions.push(question);
        }
      });
    }
    
    return [...new Set(suggestions)].slice(0, 5); // Limit to 5 suggestions
  };

  const handleSuggestionClick = (question: string) => {
    const userMessage = {
      id: messages.length + 1,
      text: question,
      sender: "user" as const,
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
    
    const botResponse = {
      id: messages.length + 2,
      text: faqData[question as keyof typeof faqData] || "I'm sorry, I don't have information about that. Please contact our support team.",
      sender: "bot" as const,
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
    
    setMessages(prev => [...prev, userMessage, botResponse]);
    setSuggestions([]);
    setMessage("");
  };

  const handleSend = (e: any) => {
    e.preventDefault();
    if (!message.trim()) return;

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
    
    const messageSuggestions = findSuggestions(message);
    
    setTimeout(() => {
      if (messageSuggestions.length > 0) {
        setMessages((prev) => [
          ...prev,
          {
            id: prev.length + 1,
            text: "I found some topics that might help you. Click on any question below:",
            sender: "bot",
            time: new Date().toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
          },
        ]);
        setSuggestions(messageSuggestions);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            id: prev.length + 1,
            text: "Thanks for your message! For immediate assistance, please contact us at +250 796 897 823 or sales@food.rw",
            sender: "bot",
            time: new Date().toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
          },
        ]);
      }
    }, 600);
    
    setMessage("");
  };

  if (!isOpen) return null;

  return (
    <div className={`fixed bottom-4 right-4 w-[calc(100vw-2rem)] max-w-md sm:w-96 h-[75vh] max-h-[600px] bg-white border rounded shadow-2xl z-50 flex flex-col ${className}`}>
      <div className="flex items-center justify-between p-2 bg-green-600 text-white rounded">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
              <span className="text-green-600 text-[14px] font-bold">F</span>
            </div>
            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-green-600" />
          </div>
          <div>
            <h4 className="font-semibold text-[14px]">{title}</h4>
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
        
        {suggestions.length > 0 && (
          <div className="flex justify-start">
            <div className="max-w-[80%] space-y-2">
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="block w-full text-left px-3 py-2 bg-green-50 hover:bg-green-100 border border-green-200 rounded-lg text-[11px] text-green-700 transition-colors"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}
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