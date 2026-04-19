/** Full catalog for shop; default cart is a subset for demo checkout */
export const PRODUCTS = [
  {
    id: "a",
    name: "Minimal desk lamp",
    unitPrice: 2450,
    swatchClass: "bg-gray-300 dark:bg-gray-500",
    blurb: "Warm LED, matte finish — fits any workspace.",
  },
  {
    id: "b",
    name: "Wireless earbuds",
    unitPrice: 1890,
    swatchClass: "bg-gray-400 dark:bg-gray-400",
    blurb: "Noise-aware, all-day battery for commutes.",
  },
  {
    id: "c",
    name: "Ceramic mug set",
    unitPrice: 1290,
    swatchClass: "bg-gray-200 dark:bg-gray-600",
    blurb: "Set of two, microwave-safe glaze.",
  },
  {
    id: "d",
    name: "Linen throw pillow",
    unitPrice: 1120,
    swatchClass: "bg-gray-500 dark:bg-gray-500",
    blurb: "Soft linen cover, feather-friendly insert.",
  },
  {
    id: "e",
    name: "Stainless bottle",
    unitPrice: 890,
    swatchClass: "bg-gray-600 dark:bg-gray-400",
    blurb: "Insulated 24h cold / 12h hot.",
  },
  {
    id: "f",
    name: "Everyday tote",
    unitPrice: 3200,
    swatchClass: "bg-gray-300 dark:bg-gray-600",
    blurb: "Heavy canvas, inner zip pocket.",
  },
  {
    id: "g",
    name: "Scented candle",
    unitPrice: 750,
    swatchClass: "bg-gray-200 dark:bg-gray-500",
    blurb: "Soy wax, 45h burn, subtle cedar.",
  },
  {
    id: "h",
    name: "Bamboo cutting board",
    unitPrice: 1680,
    swatchClass: "bg-amber-700/90 dark:bg-amber-800/80",
    blurb: "Juice groove and easy-grip handles.",
  },
  {
    id: "i",
    name: "Cotton bath towel",
    unitPrice: 980,
    swatchClass: "bg-sky-200 dark:bg-sky-900/60",
    blurb: "Plush 600 GSM, quick-drying.",
  },
];

export const DEFAULT_CART_LINES = [
  { id: "a", name: "Minimal desk lamp", unitPrice: 2450, quantity: 1, swatchClass: "bg-gray-300 dark:bg-gray-500" },
  { id: "b", name: "Wireless earbuds", unitPrice: 1890, quantity: 2, swatchClass: "bg-gray-400 dark:bg-gray-400" },
  { id: "c", name: "Ceramic mug set", unitPrice: 1290, quantity: 1, swatchClass: "bg-gray-200 dark:bg-gray-600" },
  { id: "d", name: "Linen throw pillow", unitPrice: 1120, quantity: 1, swatchClass: "bg-gray-500 dark:bg-gray-500" },
  { id: "e", name: "Stainless bottle", unitPrice: 890, quantity: 1, swatchClass: "bg-gray-600 dark:bg-gray-400" },
  { id: "f", name: "Everyday tote", unitPrice: 3200, quantity: 1, swatchClass: "bg-gray-300 dark:bg-gray-600" },
  { id: "g", name: "Scented candle", unitPrice: 750, quantity: 1, swatchClass: "bg-gray-200 dark:bg-gray-500" },
];
