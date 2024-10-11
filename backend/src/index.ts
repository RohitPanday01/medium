import { Hono } from 'hono'
import { userrouter } from './routes/user'
import { blogrouter } from './routes/blog'
import { cors } from 'hono/cors';


const app = new Hono();

app.use('/*', cors())
app.route('/api/v1/user',userrouter)
app.route('/api/v1/blog', blogrouter)

export default app

//If you want, you can extract the prisma variable in a global middleware that set’s it on the context variable
// app.use(”*”, (c) => {
// 	const prisma = new PrismaClient({
//       datasourceUrl: c.env.DATABASE_URL,
//   }).$extends(withAccelerate());
//   c.set(”prisma”, prisma);
// })

