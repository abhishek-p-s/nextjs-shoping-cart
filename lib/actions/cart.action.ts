"use server";

import { cookies } from "next/headers";
import { CartItem } from "@/types";
import { formatError, round2 } from "../utils";
import { auth } from "@/auth";
import { cartItemSchema, insertCartSchema } from "../validators";
import { revalidatePath } from "next/cache";
import { prisma } from "@/db/db-connect";
import { Prisma } from "../generated/prisma/client";
import { success } from "zod";

// Calculate cart prices
const calcPrice = (items: CartItem[]) => {
  const itemsPrice = round2(
      items.reduce((acc, item) => acc + Number(item.price) * item.qty, 0)
    ),
    shippingPrice = round2(itemsPrice > 100 ? 0 : 10),
    taxPrice = round2(0.15 * itemsPrice),
    totalPrice = round2(itemsPrice + taxPrice + shippingPrice);

  return {
    itemsPrice: itemsPrice.toFixed(2),
    shippingPrice: shippingPrice.toFixed(2),
    taxPrice: taxPrice.toFixed(2),
    totalPrice: totalPrice.toFixed(2),
  };
};

export async function addItemToCart(data: CartItem) {
  try {
    // Check for cart cookie
    const sessionCartId = (await cookies()).get("sessionCartId")?.value;
    if (!sessionCartId) throw new Error("Cart session not found");

    // Get session and user ID
    const session = await auth();
    const userId = session?.user?.id || undefined;

    // Get cart
    const cart = await getMyCart();

    // Parse and validate item
    const item = cartItemSchema.parse(data);

    // Find product in database
    const product = await prisma.product.findFirst({
      where: { id: item.productId },
    });
    if (!product) throw new Error("Product not found");

    if (!cart) {
      const prices = calcPrice([item]);
      // Add to database
      await prisma.cart.create({
        data: {
          userId: userId,
          sessionCartId: sessionCartId,
          itemPrice: prices.itemsPrice,
          shippingPrice: prices.shippingPrice,
          taxPrice: prices.taxPrice,
          totalPrice: prices.totalPrice,
          items: [item],
        },
      });

      // Revalidate product page
      revalidatePath(`/product/${product.slug}`);

      return {
        success: true,
        message: `${product.name} added to cart`,
      };
    } else {
      //check item already exist in the cart

      const existItem = (cart.items as CartItem[]).find(
        (i) => i.productId === item.productId
      );

      if (existItem) {
        if (product.stock < existItem.qty + 1) {
          throw new Error("Not enough Stock");
        }

        existItem.qty += 1;
      } else {
        //if item does not exist in the cart

        if (product.stock < 1) throw new Error("Not enough Stock");

        cart.items.push(item);
      }
      const prices = calcPrice(cart.items);
      await prisma.cart.update({
        where: { id: cart.id },
        data: {
          items: cart.items as Prisma.CartUpdateitemsInput[],
          itemPrice: prices.itemsPrice,
          shippingPrice: prices.shippingPrice,
          taxPrice: prices.taxPrice,
          totalPrice: prices.totalPrice,
        },
      });

      revalidatePath(`/product/${product.slug}`);

      return {
        success: true,
        message: `${product.name} ${
          existItem ? "updated in" : "added to"
        } cart`,
      };
    }
  } catch (error) {
    return {
      success: false,
      message: formatError(error),
    };
  }
}

export async function getMyCart() {
  // Check for cart cookie
  const sessionCartId = (await cookies()).get("sessionCartId")?.value;
  if (!sessionCartId) throw new Error("Cart session not found");

  // Get session and user ID
  const session = await auth();
  const userId = session?.user?.id ? (session.user.id as string) : undefined;

  // Get user cart from database
  const cart = await prisma.cart.findFirst({
    where: userId ? { userId: userId } : { sessionCartId: sessionCartId },
  });

  if (!cart) return undefined;

  return {
    ...cart,
    items: cart.items as CartItem[],
    itemsPrice: cart.itemPrice.toString(),
    totalPrice: cart.totalPrice.toString(),
    shippingPrice: cart.shippingPrice.toString(),
    taxPrice: cart.taxPrice.toString(),
  };
}

export async function removeItemFromCart(productId: string) {
  try {
    const sessionCartId = (await cookies()).get("sessionCartId")?.value;
    if (!sessionCartId) throw new Error("Cart session not found");
    console.log("inside the function");
    const product = await prisma.product.findFirst({
      where: { id: productId },
    });
    if (!product) throw new Error("Product not Found");

    const cart = await getMyCart();

    if (!cart) throw new Error("Cart not found");

    const existItem = cart.items.find((i) => i.productId === product.id);

    if (!existItem) throw new Error("item not found");

    if (existItem?.qty === 1) {
      cart.items = cart.items.filter((i) => i.productId !== product.id);
    } else {
      existItem.qty = existItem.qty - 1;
    }
    const prices = calcPrice(cart.items);
    // Update cart in database
    await prisma.cart.update({
      where: { id: cart.id },
      data: {
        items: cart.items as Prisma.CartUpdateitemsInput[],
        itemPrice: prices.itemsPrice,
        shippingPrice: prices.shippingPrice,
        taxPrice: prices.taxPrice,
        totalPrice: prices.totalPrice,
      },
    });

    revalidatePath(`/product/${product.slug}`);

    return {
      success: true,
      message: `${product.name} was removed from cart`,
    };
  } catch (error) {
    console.log(error, "ERROR");
    return {
      success: false,
      message: formatError(error),
    };
  }
}
