import { HelpContent } from "./_components/help-content";

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

async function getHelpData() {
  // Simulate API call delay
  await new Promise((resolve) => setTimeout(resolve, 100));

  const contactInfo: ContactInfo = {
    phone: "+1 (555) 123-4567",
    email: "support@foodbundle.com",
    whatsapp: "+1 (555) 123-4567",
    hours: "Mon-Fri 9am-6pm EST",
    responseTime: "We'll respond within 24hrs",
  };

  const faqs: FAQ[] = [
    {
      id: "1",
      question: "How do I place an order with a new supplier?",
      answer:
        "Navigate to the Shop section, search for your desired supplier, browse their products, and add items to your cart. Once you're ready, proceed to checkout and follow the prompts to complete your order.",
      category: "orders",
    },
    {
      id: "2",
      question: "What payment methods do you accept?",
      answer:
        "We accept credit cards, bank transfers, and approved business credit accounts. For qualifying businesses, we also offer net-30 payment terms.",
      category: "payments",
    },
    {
      id: "3",
      question: "How can I track my deliveries?",
      answer:
        "All deliveries can be tracked in the Orders section of your dashboard. You'll receive real-time updates and can communicate directly with delivery personnel through our platform.",
      category: "delivery",
    },
    {
      id: "4",
      question: "How do I update my restaurant information?",
      answer:
        "Go to Settings > Restaurant Profile where you can update your restaurant information, contact details, address, operating hours, and more.",
      category: "account",
    },
  ];

  return {
    contactInfo,
    faqs,
  };
}

export default async function HelpPage() {
  const helpData = await getHelpData();

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="container mx-auto px-6 py-8 max-w-4xl">
        <HelpContent contactInfo={helpData.contactInfo} faqs={helpData.faqs} />
      </main>
    </div>
  );
}
