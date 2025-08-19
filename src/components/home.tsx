import { Button } from "@/components/ui/button"
import Image from "next/image"

interface HomeData {
  title: string
  subtitle: string
  description: string
  primaryButton: {
    text: string
    href: string
  }
  secondaryButton: {
    text: string
    href: string
  }
  heroImage: {
    src: string
    alt: string
  }
  decorativeElements: {
    stars: {
      large: { src: string; alt: string }
      small: { src: string; alt: string }
    }
  }
}

interface HomeProps {
  data: HomeData
}

export default function Home({ data }: HomeProps) {
  return (
    <div className="h-[85vh] bg-white font-sans border">
      {/* Background decorative circles */}
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-orange-100/30 rounded-full translate-y-32 -translate-x-32"></div>

      {/* Hero Section */}
      <main className="relative z-10 px-8 py-12">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left Content */}
            <div className="space-y-8">
              <div className="space-y-6">
                <h1 className="text-6xl lg:text-7xl font-bold text-gray-900 leading-[1.1]">{data.title}</h1>
                <p className="text-lg text-gray-600 max-w-lg leading-relaxed">{data.description}</p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 text-lg rounded-full font-medium">
                  {data.primaryButton.text}
                </Button>
                <Button className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 text-lg rounded-full font-medium">
                  {data.secondaryButton.text}
                </Button>
              </div>
            </div>

            {/* Right Content - Image with decorative elements */}
            <div className="relative flex justify-center lg:justify-end">
              {/* Large decorative star */}
              <div className="absolute top-16 left-8 lg:left-16">
                <Image
                  src={data.decorativeElements.stars.large.src || "/placeholder.svg"}
                  alt={data.decorativeElements.stars.large.alt}
                  width={80}
                  height={80}
                  className="w-16 h-16 lg:w-20 lg:h-20"
                />
              </div>

              {/* Small decorative star */}
              <div className="absolute bottom-24 left-4 lg:left-8">
                <Image
                  src={data.decorativeElements.stars.small.src || "/placeholder.svg"}
                  alt={data.decorativeElements.stars.small.alt}
                  width={40}
                  height={40}
                  className="w-8 h-8 lg:w-10 lg:h-10"
                />
              </div>

              {/* Main produce image with background circle */}
              <div className="relative">
                {/* Background circle */}
                <div className="absolute inset-0 w-[400px] h-[400px] lg:w-[450px] lg:h-[450px] bg-green-100/30 rounded-full -translate-x-4 -translate-y-4"></div>

                {/* Produce image */}
                <div className="relative z-10">
                  <Image
                    src={data.heroImage.src || "/placeholder.svg"}
                    alt={data.heroImage.alt}
                    width={400}
                    height={400}
                    className="w-80 h-80 lg:w-96 lg:h-96"
                    priority
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
