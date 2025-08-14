import { Leaf, Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import Link from "next/link"
import { cn } from "@/lib/utils"

export default function Header() {
  return (
    <header className="sticky top-0 z-50 flex items-center justify-between max-w-7xl mx-auto py-6 bg-white/80 backdrop-blur-md border-b border-gray-100/50">
      {/* Logo */}
      <Link href="/" className="flex items-center gap-2">
        <div className="w-6 h-6 bg-green-600 rounded-sm flex items-center justify-center">
          <Leaf className="w-4 h-4 text-white" />
        </div>
        <span className="text-xl font-semibold text-gray-900">FoodBundle</span>
      </Link>

      {/* Desktop Navigation Menu */}
      <NavigationMenu className="hidden md:flex">
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuLink
              href="/"
              className={cn(
                "group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50",
                "text-gray-700 hover:text-green-600",
              )}
            >
              Home
            </NavigationMenuLink>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuLink
              href="#how_it_work"
              className={cn(
                "group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50",
                "text-gray-700 hover:text-green-600",
              )}
            >
              About
            </NavigationMenuLink>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuLink
              href="/how-it-works"
              className={cn(
                "group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50",
                "text-gray-700 hover:text-green-600",
              )}
            >
              How It Works
            </NavigationMenuLink>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuLink
              href="/contact"
              className={cn(
                "group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50",
                "text-gray-700 hover:text-green-600",
              )}
            >
              Contact
            </NavigationMenuLink>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>

      {/* Desktop Action Buttons */}
      <div className="hidden md:flex items-center gap-3">
        <Button
          variant="outline"
          size="default"
          className="border-2 border-green-600 text-green-600 hover:bg-green-50 rounded-full font-medium bg-transparent"
          asChild
        >
          <Link href="/login">Login</Link>
        </Button>
        <Button size="default" className="bg-green-600 hover:bg-green-700 text-white rounded-full font-medium" asChild>
          <Link href="/signup">Get Started</Link>
        </Button>
      </div>

      {/* Mobile Menu */}
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="w-[300px] sm:w-[400px]">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <div className="w-6 h-6 bg-green-600 rounded-sm flex items-center justify-center">
                <Leaf className="w-4 h-4 text-white" />
              </div>
              FoodBundle
            </SheetTitle>
            <SheetDescription>Connecting farms to tables with fresh, local produce</SheetDescription>
          </SheetHeader>
          <div className="grid gap-4 py-6">
            <Link
              href="/"
              className="flex items-center py-2 text-lg font-medium text-gray-700 hover:text-green-600 transition-colors"
            >
              Home
            </Link>
            <Link
              href="/"
              className="flex items-center py-2 text-lg font-medium text-gray-700 hover:text-green-600 transition-colors"
            >
              About
            </Link>
            <Link
              href="#how-it-works"
              className="flex items-center py-2 text-lg font-medium text-gray-700 hover:text-green-600 transition-colors"
            >
              How It Works
            </Link>
            <Link
              href="#contact"
              className="flex items-center py-2 text-lg font-medium text-gray-700 hover:text-green-600 transition-colors"
            >
              Contact
            </Link>
            <div className="flex flex-col gap-3 pt-6 border-t">
              <Button
                variant="outline"
                size="default"
                className="border-2 border-green-600 text-green-600 hover:bg-green-50 rounded-full font-medium bg-transparent"
                asChild
              >
                <Link href="/login">Login</Link>
              </Button>
              <Button
                size="default"
                className="bg-green-600 hover:bg-green-700 text-white rounded-full font-medium"
                asChild
              >
                <Link href="/signup">Get Started</Link>
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </header>
  )
}
