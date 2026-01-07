import { generateAccessToken } from '../lib/paypal';

test("generate token from paypal", async () => {
  const token = await generateAccessToken();

  console.log(token, "TOKEN FROM PAYPAL TESTING");

  expect(typeof token).toBe("string");

  expect(token.length).toBeGreaterThan(0);
});


