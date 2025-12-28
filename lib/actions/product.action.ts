"use server";

import { prisma } from "@/db/db-connect";
import { LATEST_PRODUCTS_LIMIT } from "../constants";

export async function getLatestProducts() {
  const data = prisma.product.findMany({
    take: LATEST_PRODUCTS_LIMIT,
    orderBy: {
      createdAt: "desc",
    },
  });

  return (await data).map((product) => ({
    ...product,
    price: product.price.toString(),
    rating: product.rating.toString(),
  }));
}

//Get a single product by its slug

export async function getProductBySlug(slug: string) {
  const product = await prisma.product.findFirst({
    where: { slug: slug },
  });
  return product
    ? {
        ...product,
        price: product.price.toString(),
        rating: product.rating.toString(),
      }
    : null;
}
