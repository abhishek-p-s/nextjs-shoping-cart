import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { ZodError } from "zod";


export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

//convert prisma object into a regular JS object
export function convertToPlaneObject<T>(value: T): T {
  return JSON.parse(JSON.stringify(value));
}

export function formatNumberWithDecimal(num: number): string {
  const [int, decimal] = num.toString().split(".");
  return decimal ? `${int}.${decimal.padEnd(2, "0")}` : `${int}.00`;
}


// Format errors
export function formatError(error: any): string {
  // Handle Zod validation errors
  if (error instanceof ZodError || error.name === "ZodError") {
    // Check if errors array exists
    if (error.errors && Array.isArray(error.errors)) {
      const fieldErrors = error.errors.map((field: any) => {
        const fieldName = field.path.join(".");
        return fieldName.message
      });

      return fieldErrors.join(". ");
    }
    // Fallback if errors array doesn't exist
    return error.message || "Validation error occurred";
  }
  
  // Handle Prisma unique constraint errors
  if (
    error.name === "PrismaClientKnownRequestError" &&
    error.code === "P2002"
  ) {
    const field = error.meta?.target ? error.meta.target[0] : "Field";
    return `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`;
  }
  
  // Handle other errors
  return typeof error.message === "string"
    ? error.message
    : JSON.stringify(error.message);
}