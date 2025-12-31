"use client";
import { Button } from "@/components/ui/button";
import { addItemToCart, removeItemFromCart } from "@/lib/actions/cart.action";
import { Cart, CartItem } from "@/types";
import { MinusCircle, PlusCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

const AddToCart = ({ cart, item }: { cart?: Cart; item: CartItem }) => {
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

  const handleRemoveFromCart = async () => {
    try {
      const res = await removeItemFromCart(item.productId);
      console.log(res, "res");
      if (res.success) {
        toast.success("Item removed from cart");
      }
    } catch (error) {
      toast.error("some error occured");
    }
  };

  const existItem = cart?.items.find((i) => i.productId === item.productId);

  return existItem ? (
    <div>
      <Button type="button" variant="outline" onClick={handleRemoveFromCart}>
        <MinusCircle className="w-4 h-4" />
      </Button>
      <span className="px-2">{existItem.qty}</span>
      <Button type="button" variant="outline" onClick={handleAddToCart}>
        <PlusCircle className="w-4 h-4" />
      </Button>
    </div>
  ) : (
    <Button className="w-full" type="button" onClick={handleAddToCart}>
      <PlusCircle className="w-4 h-4" />
      Add To Cart
    </Button>
  );
};

export default AddToCart;
