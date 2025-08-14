import { SettingsContent } from "./_components/settings-content";

type RestaurantSettings = {
  accountInfo: {
    restaurantName: string;
    ownerName: string;
    email: string;
    phone: string;
    profilePhoto: string;
  };
  restaurantDetails: {
    type: string;
    operatingHours: {
      [key: string]: { open: string; close: string; isOpen: boolean };
    };
    address: {
      street: string;
      suite: string;
      city: string;
      state: string;
      zipCode: string;
    };
    location: {
      lat: number;
      lng: number;
    };
  };
  shoppingPreferences: {
    preferredProducts: Array<{
      id: string;
      name: string;
      category: string;
      isCustom: boolean;
    }>;
    deliveryPreferences: {
      timeSlot: "morning" | "afternoon" | "evening";
      specialInstructions: string;
    };
  };
  availableProducts: Array<{
    id: string;
    name: string;
    category: string;
  }>;
};

async function getRestaurantSettings(): Promise<RestaurantSettings> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 100));

  return {
    accountInfo: {
      restaurantName: "Umucyo Restaurant",
      ownerName: "John Smith",
      email: "contact@umucyo.com",
      phone: "(555) 123-4567",
      profilePhoto: "/imgs/profile.jpg",
    },
    restaurantDetails: {
      type: "Fine Dining",
      operatingHours: {
        monday: { open: "09:00", close: "22:00", isOpen: true },
        tuesday: { open: "09:00", close: "22:00", isOpen: true },
        wednesday: { open: "09:00", close: "22:00", isOpen: true },
        thursday: { open: "09:00", close: "22:00", isOpen: true },
        friday: { open: "09:00", close: "22:00", isOpen: true },
        saturday: { open: "09:00", close: "22:00", isOpen: true },
        sunday: { open: "09:00", close: "22:00", isOpen: true },
      },
      address: {
        street: "123 Main St",
        suite: "Suite 4B",
        city: "New York",
        state: "NY",
        zipCode: "10001",
      },
      location: {
        lat: 40.7128,
        lng: -74.006,
      },
    },
    shoppingPreferences: {
      preferredProducts: [
        {
          id: "1",
          name: "Organic Tomatoes",
          category: "VEGETABLES",
          isCustom: false,
        },
        {
          id: "2",
          name: "Free-Range Eggs",
          category: "VEGETABLES",
          isCustom: false,
        },
        {
          id: "custom-1",
          name: "Artisan Sourdough Bread",
          category: "GRAINS",
          isCustom: true,
        },
      ],
      deliveryPreferences: {
        timeSlot: "morning",
        specialInstructions: "Please deliver to the back entrance",
      },
    },
    availableProducts: [
      { id: "1", name: "Organic Tomatoes", category: "VEGETABLES" },
      { id: "2", name: "Free-Range Eggs", category: "VEGETABLES" },
      { id: "3", name: "Grass-Fed Ground Beef", category: "VEGETABLES" },
      { id: "4", name: "Organic Spinach", category: "VEGETABLES" },
      { id: "5", name: "Fresh Atlantic Salmon", category: "VEGETABLES" },
      { id: "6", name: "Premium Beef Sirloin", category: "VEGETABLES" },
      { id: "7", name: "Organic Mixed Greens", category: "VEGETABLES" },
      { id: "8", name: "Fresh Herbs Bundle", category: "HERBS_SPICES" },
      { id: "9", name: "Artisan Cheese Selection", category: "VEGETABLES" },
      { id: "10", name: "Seasonal Fruit Mix", category: "FRUITS" },
      { id: "11", name: "Whole Grain Bread", category: "GRAINS" },
      { id: "12", name: "Sweet Potatoes", category: "TUBERS" },
      { id: "13", name: "Black Beans", category: "LEGUMES" },
      { id: "14", name: "Fresh Basil", category: "HERBS_SPICES" },
      { id: "15", name: "Organic Carrots", category: "VEGETABLES" },
    ],
  };
}

export default async function SettingsPage() {
  const settings = await getRestaurantSettings();

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="container mx-auto px-6 py-8">
        <SettingsContent settings={settings} />
      </main>
    </div>
  );
}
