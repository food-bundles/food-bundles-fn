import Link from "next/link";
import {  Facebook, Twitter, Instagram, Linkedin } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-green-700 text-white py-12 pt-2  ">
      <div className="max-w-7xl mx-auto px-4 ">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* FoodBundle */}
          <div className="space-y-4">
            <div>
              <span className="text-[14px] font-semibold text-white">
                FoodBundle
              </span>
            </div>
            <p className="text-green-200 text-[13px] leading-relaxed">
              Connect your restaurant with FoodBundles for fresh, quality
              ingredients.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4 pt-0">
            <h3 className="text-[14px] font-semibold text-white">Quick Links</h3>
            <div className="space-y-2">
              <Link
                href="/farmer"
                className="block text-green-200 hover:text-white transition-colors text-[13px]"
              >
                For Farmers
              </Link>
              <Link
                href="/restaurant"
                className="block text-green-200 hover:text-white transition-colors text-[13px]"
              >
                For Restaurants
              </Link>
            </div>
          </div>

          {/* Support */}
          <div className="space-y-4">
            <h3 className="text-[14px] font-semibold text-white">Support</h3>
            <div className="space-y-2">
              <Link
                href="https://wa.me/250796897823"
                className="block text-green-200 hover:text-white transition-colors text-sm"
              >
                Help Center
              </Link>
              <Link
                href="https://mail.google.com/mail/?view=cm&to=sales@food.rw"
                className="block text-green-200 hover:text-white transition-colors text-sm"
              >
                Contact Us
              </Link>
            </div>
          </div>

          {/* Contact Us */}
          <div className="space-y-4">
            <h3 className="text-[14px] font-semibold text-white">Contact Us</h3>
            <div className="space-y-2 text-[13px] text-green-200">
              <p>KG 5 Ave, Kigali</p>
              <p>info@foodbundle.com</p>
            </div>
          </div>
        </div>

        <div className="border-t border-green-600 mt-4 pt-4 md:pt-0 flex flex-col md:flex-row justify-between items-center">
          <p className="text-green-200 text-[13px] ">
            © 2025 FoodBundle. All rights reserved.
          </p>
          <div className="flex space-x-4 mt-4 md:mt-0">
            <Link
              href="#"
              className="text-green-200 hover:text-white transition-colors"
            >
              <Facebook className="h-5 w-5" />
            </Link>
            <Link
              href="#"
              className="text-green-200 hover:text-white transition-colors"
            >
              <Twitter className="h-5 w-5" />
            </Link>
            <Link
              href="#"
              className="text-green-200 hover:text-white transition-colors"
            >
              <Instagram className="h-5 w-5" />
            </Link>
            <Link
              href="#"
              className="text-green-200 hover:text-white transition-colors"
            >
              <Linkedin className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
