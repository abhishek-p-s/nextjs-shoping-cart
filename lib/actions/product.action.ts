'use server'

import { prisma } from "@/db/db-connect"
import { LATEST_PRODUCTS_LIMIT } from "../constants"

export async function getLatestProducts(){

    const data = prisma.product.findMany({
        take:LATEST_PRODUCTS_LIMIT,
        orderBy:{
            createdAt:'desc'
        }
    })

    return (await data).map((product)=>({
        ...product,
        price:product.price.toString(),
        rating:product.rating.toString(),
    }))
}