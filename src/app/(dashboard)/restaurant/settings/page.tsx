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
    preferredSuppliers: Array<{
      id: string;
      name: string;
      category: string;
      logo: string;
    }>;
    deliveryPreferences: {
      timeSlot: "morning" | "afternoon" | "evening";
      specialInstructions: string;
    };
  };
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
      profilePhoto: "/modern-restaurant-interior.png",
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
      preferredSuppliers: [
        {
          id: "1",
          name: "Farm Fresh Foods",
          category: "Produce, Dairy",
          logo: "/imgs/flesh.svg",
        },
        {
          id: "2",
          name: "Organic Meats Co.",
          category: "Meats, Poultry",
          logo: "/imgs/flesh.svg",
        },
        {
          id: "3",
          name: "Global Spices",
          category: "Spices, Herbs",
          logo: "/imgs/flesh.svg",
        },
      ],
      deliveryPreferences: {
        timeSlot: "morning",
        specialInstructions: "Please deliver to the back entrance",
      },
    },
  };
}

export default async function SettingsPage() {
  const settings = await getRestaurantSettings();

  return (
    <div className="min-h-screen bg-gray-50">

      <main className="container mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Restaurant Settings
          </h1>
          <p className="text-gray-600">
            Manage your restaurant profile and preferences
          </p>
        </div>

        <SettingsContent settings={settings} />
      </main>
    </div>
  );
}
