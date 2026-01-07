export const APP_NAME = process.env.APP_NAME || "Procode";
export const APP_DESCRIPTION =
  process.env.APP_DESCRIPTION || "advanced e-commerce platform";
export const LATEST_PRODUCTS_LIMIT =
  Number(process.env.LATEST_PRODUCTS_LIMIT) || 4;
export const PAYMENT_METHODS= process.env.PAYMENT_METHOD?.split(",") || ["Paypal", "Stripe", "CashOnDelivery"];  
export const DEFAULT_PAYMENT_METHOD = process.env.DEFAULT_PAYMENT_METHOD || "Paypal";