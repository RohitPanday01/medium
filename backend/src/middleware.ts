import { Context } from "hono";
import { verify } from "hono/jwt";

export const jwtMiddleware = async (c: Context, next: () => Promise<void>) => {
  const header = c.req.header("authorization") || "";

  if (!header.startsWith("Bearer ")) {
    return c.json({ error: "Unauthorized - No token provided" }, 401);
  }

  const token = header.split(" ")[1];

  try {
    const response = await verify(token, c.env.JWT_SECRET);

    if (response && response.id) {
      c.set('userId', response.id as string); // Assuming 'response.id' is a string
      await next(); // Proceed to the next middleware/handler
    } else {
      return c.json({ error: "Unauthorized - Invalid token" }, 401);
    }
  } catch (error) {
    return c.json({ error: "Unauthorized - Token verification failed" }, 401);
  }
};


