import { Leaf } from 'lucide-react'
import { Button } from "@/components/ui/button"

export default function Header() {
  return (
    <header className="sticky top-0 z-50 flex items-center justify-between px-8 py-6 bg-white/80 backdrop-blur-md border-b border-gray-100/50">
      {/* Logo */}
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 bg-green-600 rounded-sm flex items-center justify-center">
          <Leaf className="w-4 h-4 text-white" />
        </div>
        <span className="text-xl font-semibold text-gray-900">FoodBundle</span>
      </div>
      
      {/* Navigation Menu */}
      <nav className="hidden md:flex items-center gap-12">
        <a href="#" className="text-gray-700 hover:text-green-600 transition-colors font-medium">
          Home
        </a>
        <a href="#" className="text-gray-700 hover:text-green-600 transition-colors font-medium">
          About
        </a>
        <a href="#" className="text-gray-700 hover:text-green-600 transition-colors font-medium">
          How It Works
        </a>
        <a href="#" className="text-gray-700 hover:text-green-600 transition-colors font-medium">
          Contact
        </a>
      </nav>
      
      {/* Action Buttons */}
      <div className="flex items-center gap-3">
        <Button 
          className="border-2 border-green-600 text-green-600 hover:bg-green-50 px-6 py-2 rounded-full font-medium"
        >
          Login
        </Button>
        <Button className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-full font-medium">
          Get Started
        </Button>
      </div>
    </header>
  )
}
