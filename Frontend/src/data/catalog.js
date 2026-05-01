/** Full catalog for shop; default cart is a subset for demo checkout */
import img1 from "../images/image1.png";
import img2 from "../images/image2.png";
import img3 from "../images/image3.png";
import img4 from "../images/image4.png";
import img5 from "../images/image5.png";
import img6 from "../images/image6.png";
import img7 from "../images/image7.png";
export const PRODUCTS = [
  {
    id: "a",
    name: "Minimal desk lamp",
    unitPrice: 2450,
    image:img1,
    swatchClass: "bg-gray-300 dark:bg-gray-500",
    blurb: "Warm LED, matte finish — fits any workspace.",
  },
  {
    id: "b",
    name: "Wireless earbuds",
    unitPrice: 1890,
     image:img2,
    swatchClass: "bg-gray-400 dark:bg-gray-400",
    blurb: "Noise-aware, all-day battery for commutes.",
  },
  {
    id: "c",
    name: "Ceramic mug set",
    unitPrice: 1290,
     image:img3,
    swatchClass: "bg-gray-200 dark:bg-gray-600",
    blurb: "Set of two, microwave-safe glaze.",
  },
  {
    id: "d",
    name: "Linen throw pillow",
    unitPrice: 1120,
     image:img4,
    swatchClass: "bg-gray-500 dark:bg-gray-500",
    blurb: "Soft linen cover, feather-friendly insert.",
  },
  {
    id: "e",
    name: "Stainless bottle",
     image:img5,
    unitPrice: 890,
    swatchClass: "bg-gray-600 dark:bg-gray-400",
    blurb: "Insulated 24h cold / 12h hot.",
  },
  {
    id: "f",
    name: "Everyday tote",
     image:img6,
    unitPrice: 3200,
    swatchClass: "bg-gray-300 dark:bg-gray-600",
    blurb: "Heavy canvas, inner zip pocket.",
  },
  {
    id: "g",
    name: "Scented candle",
     image:img7,
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
  { id: "a", name: "Minimal desk lamp", unitPrice: 2450, image:img1 ,quantity: 1, swatchClass: "bg-gray-300 dark:bg-gray-500" },
  { id: "b", name: "Wireless earbuds", unitPrice: 1890, image:img2 , quantity: 2, swatchClass: "bg-gray-400 dark:bg-gray-400" },
  { id: "c", name: "Ceramic mug set", unitPrice: 1290, image:img3 , quantity: 1, swatchClass: "bg-gray-200 dark:bg-gray-600" },
  { id: "d", name: "Linen throw pillow", unitPrice: 1120, image:img4 , quantity: 1, swatchClass: "bg-gray-500 dark:bg-gray-500" },
  { id: "e", name: "Stainless bottle", unitPrice: 890, image:img5 , quantity: 1, swatchClass: "bg-gray-600 dark:bg-gray-400" },
  { id: "f", name: "Everyday tote", unitPrice: 3200, image:img6, quantity: 1, swatchClass: "bg-gray-300 dark:bg-gray-600" },
  { id: "g", name: "Scented candle", unitPrice: 750, image:img7, quantity: 1, swatchClass: "bg-gray-200 dark:bg-gray-500" },
];
