import { Hono } from 'hono'
import { PrismaClient } from '@prisma/client/edge'
import { withAccelerate } from '@prisma/extension-accelerate'
import { sign } from 'hono/jwt'
import { signinInput, signupInput } from '@rohitpanday1/common-app';


export const userrouter = new Hono<{
  Bindings: {
    DATABASE_URL: string;
    JWT_SECRET: string;
  };
  Variables: {
    userId: string; 
  };
}>();

//If you want, you can extract the prisma variable in a global middleware that set’s it on the context variable
// app.use(”*”, (c) => {
// 	const prisma = new PrismaClient({
//       datasourceUrl: c.env.DATABASE_URL,
//   }).$extends(withAccelerate());
//   c.set(”prisma”, prisma);
// })

userrouter.post('/signup' , async (c)=>{
  const prisma  = new PrismaClient({
    datasourceUrl :c.env.DATABASE_URL,
  }).$extends(withAccelerate())

   const body = await c.req.json();
   const { success } = signupInput.safeParse(body);
	if (!success) {
		c.status(400);
		return c.json({ error: "invalid input" });
	}
   try {
		const user = await prisma.user.create({
			data: {
				email: body.email,
				password: body.password
			}
		});
		const jwt = await sign({ id: user.id }, c.env.JWT_SECRET);
		return c.json({ jwt });
	} catch(e) {
		c.status(403);
		return c.json({ error: "error while signing up" });
	}
})

userrouter.post('/signin' ,async (c)=>{
  const prisma = new PrismaClient({
		datasourceUrl: c.env?.DATABASE_URL,
	}).$extends(withAccelerate());

	const body = await c.req.json();
  const{success} = signinInput.safeParse(body)
  if (!success) {
		c.status(400);
		return c.json({ error: "invalid input" });
	}
	const user = await prisma.user.findFirst({
		where: {
			email: body.email,
      password: body.password,
		}
	});

	if (!user) {
		c.status(403);
		return c.json({ error: "user not found" });
	}

	const jwt = await sign({ id: user.id }, c.env.JWT_SECRET);
	return c.json({ jwt });
})