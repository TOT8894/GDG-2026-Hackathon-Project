/** Build a simple delivery-style timeline from payment / order status (API-agnostic). */
export function buildTrackingSteps(payment) {
  const raw =
    payment?.status ??
    payment?.paymentStatus ??
    payment?.state ??
    "pending";
  const s = String(raw).toLowerCase();

  const paid =
    ["paid", "success", "completed", "confirmed", "processing", "shipped", "delivered", "out_for_delivery"].some(
      (k) => s.includes(k),
    );

  const preparing =
    ["processing", "preparing", "packed"].some((k) => s.includes(k)) || paid;

  const shipped =
    ["shipped", "out_for_delivery", "in_transit", "delivered"].some((k) =>
      s.includes(k),
    );

  const delivered = ["delivered", "completed"].some((k) => s.includes(k));

  return [
    { id: "placed", label: "Order placed", description: "We received your checkout.", done: true },
    {
      id: "paid",
      label: "Payment confirmed",
      description: "Your mobile money or wallet payment cleared.",
      done: paid,
    },
    {
      id: "prepare",
      label: "Preparing",
      description: "Seller is packing your items.",
      done: preparing && paid,
    },
    {
      id: "ship",
      label: "Out for delivery",
      description: "Courier is on the way.",
      done: shipped,
    },
    {
      id: "done",
      label: "Delivered",
      description: "Handed off — enjoy your order.",
      done: delivered,
    },
  ];
}
