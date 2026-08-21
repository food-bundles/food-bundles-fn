import Link from "next/link";
import { Facebook, Twitter, Instagram, Linkedin } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-green-700 text-white py-6">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* FoodBundles */}
          <div className="space-y-4 lg:col-span-1">
            <div>
              <span className="text-[14px] font-semibold text-white">
                FoodBundles
              </span>
            </div>
            <p className="text-green-200 text-[13px] leading-relaxed">
              Connect your restaurant with FoodBundles for fresh, quality
              ingredients.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4 pt-0">
            <h3 className="text-[14px] font-semibold text-white">
              Quick Links
            </h3>
            <div className="space-y-2">
              <Link
                href="/farmers"
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

          {/* Company */}
          <div className="space-y-4">
            <h3 className="text-[14px] font-semibold text-white">Company</h3>
            <div className="space-y-2">
              <Link
                href="/about"
                className="block text-green-200 hover:text-white transition-colors text-[13px]"
              >
                About Us
              </Link>
              <Link
                href="/terms"
                className="block text-green-200 hover:text-white transition-colors text-[13px]"
              >
                Terms &amp; Conditions
              </Link>
              <Link
                href="/privacy-policy"
                className="block text-green-200 hover:text-white transition-colors text-[13px]"
              >
                Privacy Policy
              </Link>
              <Link
                href="/refund-policy"
                className="block text-green-200 hover:text-white transition-colors text-[13px]"
              >
                Refund Policy
              </Link>
            </div>
          </div>

          {/* Support */}
          <div className="space-y-4">
            <h3 className="text-[14px] font-semibold text-white">Support</h3>
            <div className="space-y-2">
              <Link
                href="https://wa.me/250796897823?app_absent=0"
                target="_blank"
                rel="noopener noreferrer"
                className="block text-green-200 hover:text-white transition-colors text-sm"
              >
                Help Center
              </Link>
              <Link
                href="/support"
                className="block text-green-200 hover:text-white transition-colors text-sm"
              >
                Contact Us
              </Link>
            </div>
          </div>

          {/* Contact Us */}
          <div className="space-y-4">
            <h3 className="text-[14px] font-semibold text-white">
              Contact Us
            </h3>
            <div className="space-y-2 text-[13px] text-green-200">
              <p>KG 5 Ave, Kigali</p>
              <p>info@food.rw</p>
            </div>
          </div>
        </div>

        <div className="border-t border-green-600 mt-2 pt-3 flex flex-col md:flex-row justify-between items-center">
          <p className="text-green-200 text-[13px]">
            © {new Date().getFullYear()} FoodBundles. All rights reserved.
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
              href="https://www.instagram.com/foodbundlesrw/"
              target="_blank"
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
