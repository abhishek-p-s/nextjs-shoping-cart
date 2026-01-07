"use server";

import { auth } from "@/auth";
import { getMyCart } from "./cart.action";
import { getUserById } from "./user.action";
import { insertOrderSchema } from "../validators";
import { prisma } from "@/db/db-connect";
import { CartItem, PaymentResult, ShippingAddress } from "@/types";
import { formatError } from "../utils";

export const createOrder = async function () {
  try {
    const session = await auth();

    if (!session) throw new Error("User not authenticated");

    const cart = await getMyCart();

    const userId = session?.user?.id;

    if (!userId) throw new Error("User not found");

    const user = await getUserById(userId);

    if (!user) throw new Error("User not found");

    if (!cart || cart.items.length === 0) {
      return {
        success: false,
        message: "Cart is empty",
        redirectTo: "/cart",
      };
    }

    if (!user.address) {
      return {
        success: false,
        message: "Shipping address not found",
        redirectTo: "/shipping-address",
      };
    }

    if (!user.paymentMethod) {
      return {
        success: false,
        message: "Payment method not found",
        redirectTo: "/payment-method",
      };
    }

    const order = await insertOrderSchema.parse({
      userId: user.id,
      orderItems: cart.items,
      shippingAddress: user.address,
      paymentMethod: user.paymentMethod,
      itemsPrice: cart.itemsPrice,
      shippingPrice: cart.shippingPrice,
      taxPrice: cart.taxPrice,
      totalPrice: cart.totalPrice,
    });

    const insertedOrderId = await prisma.$transaction(async (tx) => {
      const insertedOrder = await tx.order.create({ data: order });

      for (const item of cart.items as CartItem[]) {
        await tx.orderItem.create({
          data: { ...item, price: item.price, orderId: insertedOrder.id },
        });
      }

      await tx.cart.delete({ where: { id: cart.id } });

      return insertedOrder.id;
    });

    if (!insertedOrderId) throw new Error("Failed to create order");

    return {
      success: true,
      message: "Order created successfully",
      redirectTo: `/order/${insertedOrderId}`,
    };
  } catch (error) {
    return {
      success: false,
      message: formatError(error),
    };
  }
};

export async function getOrderById(orderId: string) {
  try {
    const order = await prisma.order.findFirst({
      where: { id: orderId },
      include: {
        orderItems: true,
        user: { select: { name: true, email: true } },
      },
    });

    if (!order) return null;

    return {
      id: order.id,
      userId: order.userId,
      user: order.user,
      orderitems: order.orderItems.map((item) => ({
        productId: item.productId,
        name: item.name,
        slug: item.slug,
        image: item.image,
        qty: item.qty,
        price: item.price.toString(),
      })),
      shippingAddress: order.shippingAddress as ShippingAddress,
      paymentMethod: order.paymentMethod,
      itemsPrice: order.itemsPrice.toString(),
      shippingPrice: order.shippingPrice.toString(),
      taxPrice: order.taxPrice.toString(),
      totalPrice: order.totalPrice.toString(),
      isPaid: order.isPaid,
      paidAt: order.paidAt,
      isDelivered: order.isDelivered,
      deliveredAt: order.deliveredAt,
      paymentResult: order.paymentResult as PaymentResult,
      createdAt: order.createdAt,
    };
  } catch (error) {
    console.error(error);
    return null;
  }
}
