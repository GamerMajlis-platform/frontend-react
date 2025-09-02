export interface Product {
  id: number;
  category: string;
  productName: string;
  seller: string;
  price: string;
  rate: string;
  reviews: string;
  imageUrl?: string;
}

export const productData: Product[] = [
  {
    id: 1,
    category: "Gaming Gear",
    productName: "Pro Gaming Headset with Noise Cancellation",
    seller: "TechStore",
    price: "$149.99",
    rate: "4.8",
    reviews: "234 reviews",
    imageUrl:
      "https://images.unsplash.com/photo-1599669454699-248893623440?w=300&h=200&fit=crop",
  },
  {
    id: 2,
    category: "Gaming Gear",
    productName: "Mechanical Keyboard RGB Backlit",
    seller: "GameHub",
    price: "$89.99",
    rate: "4.6",
    reviews: "156 reviews",
    imageUrl:
      "https://images.unsplash.com/photo-1541140532154-b024d705b90a?w=300&h=200&fit=crop",
  },
  {
    id: 3,
    category: "Gaming Gear",
    productName: "Gaming Mouse High Precision",
    seller: "ProGamer",
    price: "$59.99",
    rate: "4.9",
    reviews: "312 reviews",
    imageUrl:
      "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=300&h=200&fit=crop",
  },
  {
    id: 4,
    category: "Console",
    productName: "Gaming Controller Pro",
    seller: "ConsoleHub",
    price: "$79.99",
    rate: "4.7",
    reviews: "189 reviews",
    imageUrl:
      "https://images.unsplash.com/photo-1493711662062-fa541adb3fc8?w=300&h=200&fit=crop",
  },
  {
    id: 5,
    category: "PC Parts",
    productName: "Graphics Card RTX",
    seller: "PCMaster",
    price: "$699.99",
    rate: "4.9",
    reviews: "425 reviews",
    imageUrl:
      "https://images.unsplash.com/photo-1591488320449-011701bb6704?w=300&h=200&fit=crop",
  },
  {
    id: 6,
    category: "Audio",
    productName: "Gaming Speakers",
    seller: "SoundTech",
    price: "$129.99",
    rate: "4.5",
    reviews: "98 reviews",
    imageUrl:
      "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=300&h=200&fit=crop",
  },
  {
    id: 7,
    category: "Gaming Gear",
    productName:
      "Professional Gaming Headset with Advanced Noise Cancellation Technology and Premium Surround Sound Experience for Ultimate Gaming Performance",
    seller:
      "Premium Gaming Store with International Shipping and Extended Warranty Services",
    price: "$299.99",
    rate: "4.9",
    reviews:
      "1,234 reviews with detailed feedback from professional gamers and streamers",
    imageUrl:
      "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=300&h=200&fit=crop",
  },
  {
    id: 8,
    category: "Gaming Gear",
    productName: 'Ultra-Wide Gaming Monitor 34" Curved Display',
    seller: "DisplayTech",
    price: "$449.99",
    rate: "4.8",
    reviews: "267 reviews",
    imageUrl:
      "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=300&h=200&fit=crop",
  },
  {
    id: 9,
    category: "PC Parts",
    productName: "Gaming RAM 32GB DDR4 RGB",
    seller: "MemoryHub",
    price: "$199.99",
    rate: "4.7",
    reviews: "145 reviews",
    imageUrl:
      "https://images.unsplash.com/photo-1562976540-1502c2145186?w=300&h=200&fit=crop",
  },
  {
    id: 10,
    category: "Console",
    productName: "Gaming Console Stand with Cooling Fan",
    seller: "CoolGaming",
    price: "$39.99",
    rate: "4.4",
    reviews: "89 reviews",
    imageUrl:
      "https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=300&h=200&fit=crop",
  },
  {
    id: 11,
    category: "Audio",
    productName: "Wireless Gaming Earbuds",
    seller: "AudioMax",
    price: "$79.99",
    rate: "4.6",
    reviews: "203 reviews",
    imageUrl:
      "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=300&h=200&fit=crop",
  },
  {
    id: 12,
    category: "Gaming Gear",
    productName: "Gaming Chair Ergonomic Pro",
    seller: "ComfortSeating",
    price: "$249.99",
    rate: "4.8",
    reviews: "178 reviews",
    imageUrl:
      "https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=300&h=200&fit=crop",
  },
];

// Product categories for filtering
export const productCategories = [
  "All Categories",
  "Gaming Gear",
  "Console",
  "PC Parts",
  "Audio",
];

// Sort options for marketplace
export const sortOptions = [
  { value: "name" as const, label: "Name A-Z" },
  { value: "price-low" as const, label: "Price: Low to High" },
  { value: "price-high" as const, label: "Price: High to Low" },
  { value: "rating" as const, label: "Highest Rated" },
  { value: "reviews" as const, label: "Most Reviews" },
];

export type SortOption = (typeof sortOptions)[number]["value"];
