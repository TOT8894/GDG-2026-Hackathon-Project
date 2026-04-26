import { useParams } from "react-router-dom";
import { PRODUCTS } from "../data/catalog";

export default function ProductDetailPage() {
  const { id } = useParams();
  console.log("URL id:", id);
console.log("Product IDs:", PRODUCTS.map(p => p.id));
  const product = PRODUCTS.find((p) => String(p.id) === id);

  if (!product) return <p>Product not found.</p>;

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold">{product.name}</h1>
      <div
        className={`mt-4 aspect-[4/3] w-96 rounded-xl ${product.swatchClass}`}
      />
      <p className="mt-4 text-gray-700">{product.blurb}</p>
      <p className="mt-2 text-blue-600 font-bold">ETB {product.unitPrice}</p>
      <button className="mt-4 bg-green-500 text-white px-6 py-2 rounded">
        Add to Cart
      </button>
    </div>
  );
}