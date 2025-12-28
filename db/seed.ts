import { prisma } from "./db-connect";
import sampleData from "./sample-data";

async function main(){
   try {
     console.log("Seeding database...");

    await prisma.product.deleteMany()
    await prisma.account.deleteMany()
    await prisma.session.deleteMany()
    await prisma.verificationToken.deleteMany()
    await prisma.user.deleteMany()

    await prisma.product.createMany({data:sampleData.products})
    await prisma.user.createMany({data:sampleData.users})
    
    console.log("Database seeded successfully.");
   } catch (error) {
    console.log("Error seeding database:", error);
   }
}

main()