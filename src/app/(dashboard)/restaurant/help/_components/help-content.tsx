"use client";

import type React from "react";

import { useState } from "react";
import {
  Phone,
  Mail,
  MessageCircle,
  Users,
  ChevronDown,
  ChevronRight,
  Paperclip,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

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

export function HelpContent({ contactInfo, faqs }: Props) {
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
    attachment: null as File | null,
    notifications: false,
  });

  const handleInputChange = (
    field: string,
    value: string | boolean | File | null
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Support request submitted:", formData);
    // Handle form submission
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
      <Card className="border-green-200 bg-green-50">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-6 w-6 text-green-600" />
              <div>
                <h3 className="font-semibold text-green-900">
                  Emergency Issue
                </h3>
                <p className="text-sm text-green-700">
                  Our customer support team is available to assist you with any
                  questions or issues you may have.
                </p>
              </div>
            </div>
            <Button className="bg-green-600 hover:bg-green-700 text-white">
              Call 911
            </Button>
          </div>
        </CardContent>
      </Card>

        <CardHeader>
          <CardTitle className="text-xl font-bold">
            Contact Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Phone Support */}
            <div className="flex flex-col items-center justify-center space-y-4 ">
              <div className=" flex items-center justify-center bg-blue-100 p-2 rounded-full">
                <Phone className="h-5 w-5 text-blue-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-1">
                Phone Support
              </h4>
              <p className="text-sm text-gray-600 mb-1">{contactInfo.phone}</p>
              <p className="text-xs text-gray-500">{contactInfo.hours}</p>
            </div>

            {/* Email Support */}
            <div className="flex flex-col items-center justify-center space-y-4 ">
              <div className="flex items-center justify-center bg-green-100 p-2 rounded-full">
                <Mail className="h-5 w-5 text-green-600" />
              </div>
              <div className="flex flex-col items-center">
                <h4 className="font-semibold text-gray-900 mb-1">
                  Email Support
                </h4>
                <p className="text-sm text-gray-600 mb-1">
                  {contactInfo.email}
                </p>
                <p className="text-xs text-gray-500">
                  {contactInfo.responseTime}
                </p>
              </div>
            </div>

            {/* WhatsApp Support */}
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="flex flex-col items-center justify-center bg-green-100 p-2 rounded-full ">
                <MessageCircle className="h-5 w-5 text-green-600" />
              </div>
              <div className="flex flex-col items-center">
                <h4 className="font-semibold text-gray-900 mb-1">
                  WhatsApp Support
                </h4>
                <p className="text-sm text-gray-600 mb-1">
                  {contactInfo.whatsapp}
                </p>
                <p className="text-xs text-gray-500">24/7 chat support</p>
              </div>
            </div>

            {/* Live Chat */}
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="flex flex-col itmes-center justify-center bg-purple-100 p-2 rounded-full">
                <Users className="h-5 w-5 text-purple-600" />
              </div>
              <div className="flex flex-col items-center">
                <h4 className="font-semibold text-gray-900 mb-1">Live Chat</h4>
                <p className="text-sm text-gray-600 mb-1">
                  Chat with Assistant team
                </p>
                <p className="text-xs text-gray-500">Available now</p>
              </div>
            </div>
          </div>
        </CardContent>

      {/* Send us a message */}
      <Card>
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
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              Send Message
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* FAQ Section */}
      {/* <Card> */}
      <CardHeader>
        <CardTitle className="text-xl font-bold">
          Frequently Asked Questions
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {faqs.map((faq) => (
            <div key={faq.id} className="">
              <button
                onClick={() => toggleFAQ(faq.id)}
                className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors"
              >
                <span className="font-medium text-gray-900">
                  {faq.question}
                </span>
                {expandedFAQ === faq.id ? (
                  <ChevronDown className="h-5 w-5 text-gray-500" />
                ) : (
                  <ChevronRight className="h-5 w-5 text-gray-500" />
                )}
              </button>
              {expandedFAQ === faq.id && (
                <div className="px-4 pb-4 text-gray-600 ">
                  <p className="pt-3">{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
      {/* </Card> */}
    </div>
  );
}
