import { AnimatedDotsBackground } from "@/components/animated-dots-background";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { HeroWithRestaurants } from "@/components/hero-section";
import QuickTalkSection from "@/components/quck-talk-section";
import { FoodBundlesConnect } from "@/components/showcase-section";

interface FeaturedPost {
  id: string;
  restaurantId: string;
  content: string;
  images: string[];
  videos: string[];
  restaurant: {
    id: string;
    name: string;
    email: string;
  };
}

async function getFeaturedPosts() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://server.food.rw'}/posts/featured`, {
      cache: 'no-store',
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.data || [];
  } catch (error) {
    console.error('Failed to fetch featured posts:', error);
    return [];
  }
}

export default async function HomePage() {
  const featuredPosts: FeaturedPost[] = await getFeaturedPosts();
  
  // Group posts by restaurant and collect all images
  const restaurantPostsMap = new Map<string, { name: string; images: string[]; content: string }>();
  
  featuredPosts.forEach(post => {
    const existing = restaurantPostsMap.get(post.restaurantId);
    if (existing) {
      existing.images.push(...post.images);
    } else {
      restaurantPostsMap.set(post.restaurantId, {
        name: post.restaurant.name,
        images: post.images,
        content: post.content,
      });
    }
  });
  
  // Convert to array for featured restaurants
  const featuredRestaurants = Array.from(restaurantPostsMap.values()).map(r => ({
    name: r.name,
    image: r.images[0] || '/placeholder.svg',
    images: r.images,
    featuredPost: r.content,
    seen: true,
  }));
  
  const numberOfFeaturedRestaurants = featuredRestaurants.length;
  // Dummy restaurants data
  const dummyRestaurants = [
    {
      name: "Imboni",
      image: "/restaurants/rest3.png",
      featuredPost:
        "Just received fresh organic tomatoes for tonight's special pasta!",
      seen: true,
    },
    {
      name: "Laza",
      image: "/restaurants/laza-girl.png",
      featuredPost:
        "Our new vegan menu is launching next week with locally sourced ingredients.",
      seen: false,
    },
    {
      name: "Mr Chip's",
      image: "/restaurants/rest8.png",
      featuredPost:
        "Fresh catch of the day: Atlantic salmon and sea bass available now!",
      seen: true,
    },
    {
      name: "Tugende Hostel",
      image: "/restaurants/Tugende Hostel.jpg",
      featuredPost:
        "Authentic spices and herbs sourced directly from India for our curry dishes.",
      seen: false,
    },
    {
      name: "Food & Stuff",
      image: "/restaurants/rest7.png",
      featuredPost:
        "Farm-to-table dining with ingredients harvested this morning!",
      seen: true,
    },
    {
      name: "sole Luna",
      image: "/restaurants/sole-luna.png",
      featuredPost: "Daily fresh seafood selection from local fishermen.",
      seen: true,
    },
    {
      name: "Petit Marché",
      image: "/restaurants/rest4.png",
      featuredPost:
        "Authentic Mediterranean cuisine with olive oil from Greece.",
      seen: false,
    },
    {
      name: "Simple by Inki",
      image: "/restaurants/rest13.png",
      featuredPost: "Modern Japanese dishes with a contemporary twist.",
      seen: true,
    },
    {
      name: "Ewaka ",
      image: "/restaurants/rest1.png",
      featuredPost: "Country-style cooking with locally grown ingredients.",
      seen: false,
    },
    {
      name: "Bicu Lounge",
      image: "/restaurants/rest9.png",
      featuredPost: "Grilled specialties with ocean-fresh seafood daily.",
      seen: true,
    },
    {
      name: "Mukati na Butta",
      image: "/restaurants/rest12.png",
      featuredPost: "Plant-based cuisine featuring seasonal vegetables.",
      seen: true,
    },
    {
      name: "Country Roots",
      image: "/restaurants/Untitled design (9).png",
      featuredPost:
        "Family-owned restaurant supporting local farmers for 25 years.",
      seen: true,
    },
       {
      name: "Imboni",
      image: "/restaurants/rest3.png",
      featuredPost:
        "Just received fresh organic tomatoes for tonight's special pasta!",
      seen: true,
    },
    {
      name: "Laza",
      image: "/restaurants/laza-girl.png",
      featuredPost:
        "Our new vegan menu is launching next week with locally sourced ingredients.",
      seen: false,
    },
    {
      name: "Mr Chip's",
      image: "/restaurants/rest8.png",
      featuredPost:
        "Fresh catch of the day: Atlantic salmon and sea bass available now!",
      seen: true,
    },
    {
      name: "Tugende Hostel",
      image: "/restaurants/Tugende Hostel.jpg",
      featuredPost:
        "Authentic spices and herbs sourced directly from India for our curry dishes.",
      seen: false,
    },
    {
      name: "Food & Stuff",
      image: "/restaurants/rest7.png",
      featuredPost:
        "Farm-to-table dining with ingredients harvested this morning!",
      seen: true,
    }
  ];
  
  // Calculate how many dummy restaurants to add (16 - featured count)
  const dummyCount = Math.max(0, 16 - numberOfFeaturedRestaurants);
  const dummyToAdd = dummyRestaurants.slice(0, dummyCount);
  
  // Combine featured and dummy restaurants
  const restaurants = [...featuredRestaurants, ...dummyToAdd];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="h-12 bg-green-700"></div>
      <div>
        <div id="home">
          <HeroWithRestaurants restaurants={restaurants} />
        </div>
        <div id="connect">
          <FoodBundlesConnect />
        </div>

        <div id="ask-help">
          <AnimatedDotsBackground className="">
            <QuickTalkSection />
          </AnimatedDotsBackground>
        </div>
        <Footer />
      </div>
    </div>
  );
}
