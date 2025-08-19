import Link from "next/link";
import { Leaf, Facebook, Twitter, Instagram, Linkedin } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* FoodBundle */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="bg-green-500 p-1 rounded">
                <Leaf className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-semibold">FoodBundle</span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              Connecting farms to tables with sustainable practices and fair
              trading.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Quick Links</h3>
            <div className="space-y-2">
              <Link
                href="/about"
                className="block text-gray-400 hover:text-white transition-colors text-sm"
              >
                About Us
              </Link>
              <Link
                href="/how-it-works"
                className="block text-gray-400 hover:text-white transition-colors text-sm"
              >
                How it Works
              </Link>
              <Link
                href="/farmers"
                className="block text-gray-400 hover:text-white transition-colors text-sm"
              >
                For Farmers
              </Link>
              <Link
                href="/restaurants"
                className="block text-gray-400 hover:text-white transition-colors text-sm"
              >
                For Restaurants
              </Link>
            </div>
          </div>

          {/* Support */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Support</h3>
            <div className="space-y-2">
              <Link
                href="/help"
                className="block text-gray-400 hover:text-white transition-colors text-sm"
              >
                Help Center
              </Link>
              <Link
                href="/contact"
                className="block text-gray-400 hover:text-white transition-colors text-sm"
              >
                Contact Us
              </Link>
              <Link
                href="/privacy"
                className="block text-gray-400 hover:text-white transition-colors text-sm"
              >
                Privacy Policy
              </Link>
              <Link
                href="/terms"
                className="block text-gray-400 hover:text-white transition-colors text-sm"
              >
                Terms of Service
              </Link>
            </div>
          </div>

          {/* Contact Us */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Contact Us</h3>
            <div className="space-y-2 text-sm text-gray-400">
              <p>123 Market Street</p>
              <p>Farmville, CA 94123</p>
              <p>info@foodbundle.com</p>
              <p>(555) 123-4567</p>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">
            © 2023 FoodBundle. All rights reserved.
          </p>
          <div className="flex space-x-4 mt-4 md:mt-0">
            <Link
              href="#"
              className="text-gray-400 hover:text-white transition-colors"
            >
              <Facebook className="h-5 w-5" />
            </Link>
            <Link
              href="#"
              className="text-gray-400 hover:text-white transition-colors"
            >
              <Twitter className="h-5 w-5" />
            </Link>
            <Link
              href="#"
              className="text-gray-400 hover:text-white transition-colors"
            >
              <Instagram className="h-5 w-5" />
            </Link>
            <Link
              href="#"
              className="text-gray-400 hover:text-white transition-colors"
            >
              <Linkedin className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
