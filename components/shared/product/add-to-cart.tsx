"use client";
import { Button } from "@/components/ui/button";
import { addItemToCart } from "@/lib/actions/cart.action";
import { CartItem } from "@/types";
import { PlusCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

const AddToCart = ({ item }: { item: CartItem }) => {
  const router = useRouter();

  const handleAddToCart = async () => {
    const res = await addItemToCart(item);
    if (!res?.success) {
      toast.error(res.message);
      return;
    }

    toast(res.message, {
      description: `${item.name} added to cart`,
      action: {
        label: "Cart",
        onClick: () => router.push("/cart"),
      },
    });
  };

  return (
    <Button variant="default" className="w-full mt-4" onClick={handleAddToCart}>
      <PlusCircle /> Add to Cart
    </Button>
  );
};

export default AddToCart;
