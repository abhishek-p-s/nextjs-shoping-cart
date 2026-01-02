import { getMyCart } from "@/lib/actions/cart.action";
import CartTable from "./cart-table";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cart",
};

const Cart = async () => {
  const cart = await getMyCart();

  return (
    <div>
      <CartTable cart={cart} />
    </div>
  );
};

export default Cart;
