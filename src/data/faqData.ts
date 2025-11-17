export const faqData = {
  // Basic Information
  "What is FoodBundles?": "FoodBundles connects restaurants with local farms to deliver fresh ingredients efficiently. We offer real-time order tracking, simple inventory management, and promote sustainability in the food supply chain.",
  
  // Contact Information
  "How can I contact support?": "You can reach us via phone at +250 796 897 823, email at sales@food.rw, or WhatsApp at +250 796 897 823. Our business hours are Mon-Fri 9am-6pm EST.",
  "What is your phone number?": "+250 796 897 823. We're available Mon-Fri 9am-6pm EST for phone support.",
  "What is your email address?": "sales@food.rw - We respond within 24 hours to all email inquiries.",
  "Do you have WhatsApp support?": "Yes! Contact us on WhatsApp at +250 796 897 823 for 24/7 chat support.",
  "What are your business hours?": "Mon-Fri 9am-6pm EST for phone and email support. WhatsApp chat is available 24/7.",
  
  // Orders & Ordering
  "How do I place an order?": "Navigate to the Shop section, search for your desired supplier, browse their products, and add items to your cart. Once ready, proceed to checkout and follow the prompts to complete your order.",
  "How do I place an order with a new supplier?": "Navigate to the Shop section, search for your desired supplier, browse their products, and add items to your cart. Once you're ready, proceed to checkout and follow the prompts to complete your order.",
  
  // Payments
  "What payment methods do you accept?": "We accept credit cards, bank transfers, and approved business credit by voucher system. For qualifying businesses, we also offer net-30 payment terms.",
  
  // Delivery & Tracking
  "How can I track my deliveries?": "All deliveries can be tracked in the Orders section of your dashboard. You'll receive real-time updates and can communicate directly with delivery personnel through our platform.",
  
  // Account Management
  "How do I update my restaurant information?": "Go to Settings > Restaurant Profile where you can update your restaurant information, contact details, address, operating hours, and more.",
  
  // Subscription Plans
  "What subscription plans do you offer?": "We offer two subscription plans: Basic (20k) for essential features and Premium (50k) for advanced benefits including priority delivery and special pricing.",
  
  // Refund Policy
  "What is your refund policy?": "We offer refunds within 30 days of purchase for unused products. Contact support at +250 796 897 823 or sales@food.rw to initiate a refund request.",
};

// Keyword mapping for single-word queries
export const keywordMapping = {
  "refund": "What is your refund policy?",
  "refunds": "What is your refund policy?",
  "voucher": "What payment methods do you accept?",
  "vouchers": "What payment methods do you accept?",
  "payment": "What payment methods do you accept?",
  "payments": "What payment methods do you accept?",
  "phone": "What is your phone number?",
  "number": "What is your phone number?",
  "email": "What is your email address?",
  "contact": "How can I contact support?",
  "support": "How can I contact support?",
  "whatsapp": "Do you have WhatsApp support?",
  "subscription": "What subscription plans do you offer?",
  "subscriptions": "What subscription plans do you offer?",
  "plans": "What subscription plans do you offer?",
  "plan": "What subscription plans do you offer?",
  "order": "How do I place an order?",
  "orders": "How do I place an order?",
  "ordering": "How do I place an order?",
  "delivery": "How can I track my deliveries?",
  "deliveries": "How can I track my deliveries?",
  "tracking": "How can I track my deliveries?",
  "track": "How can I track my deliveries?",
  "hours": "What are your business hours?",
  "time": "What are your business hours?",
  "restaurant": "How do I update my restaurant information?",
  "profile": "How do I update my restaurant information?",
  "account": "How do I update my restaurant information?",
  "supplier": "How do I place an order with a new supplier?",
  "suppliers": "How do I place an order with a new supplier?",
};

export const chatbotContext = `
You are "Food Bundle Support Online", the official support chatbot for the FoodBundles restaurant website.

Core Behavior:
- Use faqData as the primary source of truth for answering questions
- Always introduce yourself as "Food Bundle Support Online"
- Keep responses short, clear, and professional
- Maintain a friendly, supportive tone suitable for a restaurant homepage

Keyword Suggestion Logic:
If a user types a single keyword, match it against keywordMapping and respond with:
"Did you mean: [full FAQ question]? Would you like me to answer that?"

Key Information:
- We connect restaurants with local farms for fresh ingredient delivery
- Contact: +250 796 897 823, sales@food.rw, WhatsApp: +250 796 897 823
- Business hours: Mon-Fri 9am-6pm EST (WhatsApp 24/7)
- Subscription plans: Basic (20k), Premium (50k)
- Payment: Credit cards, bank transfers, voucher system, net-30 terms
- Refund policy: 30 days for unused products

Always be helpful, professional, and remind users of contact options when relevant.
`;