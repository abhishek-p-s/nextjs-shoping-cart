import { PrismaClient } from "@/lib/generated/prisma/client";
import sampleData from "./sample-data";
import { prisma } from "./db-connect";

async function main(){
   try {
     console.log("Seeding database...");

    await prisma.product.deleteMany()

    await prisma.product.createMany({data:sampleData.products})
    
    console.log("Database seeded successfully.");
   } catch (error) {
    console.log("Error seeding database:", error);
   }
}

main()