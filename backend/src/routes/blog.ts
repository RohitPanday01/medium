import { Hono } from 'hono'
import { PrismaClient } from '@prisma/client/edge'
import { withAccelerate } from '@prisma/extension-accelerate'
import { sign, verify } from 'hono/jwt'
import { jwtMiddleware } from '../middleware'
import { createpostInput, updatePost } from '@rohitpanday1/common-app'


export const blogrouter = new Hono<{
  Bindings: {
    DATABASE_URL: string;
    JWT_SECRET: string;
  };
  Variables: {
    userId: string; 
  };
}>();

blogrouter.use(async (c, next) => {
  const authHeader = c.req.header("authorization") || "";
  try {
      const user = await verify(authHeader, c.env.JWT_SECRET);
      if (user) {
          c.set("userId", user.id as string);
          await next();
      } else {
          c.status(403);
          return c.json({
              message: "You are not logged in"
          })
      }
  } catch(e) {
      c.status(403);
      return c.json({
          message: "You are not logged in"
      })
  }
});

blogrouter.post('/' ,async (c)=>{
   const userid = c.get('userId')
   const prisma = new PrismaClient({
    datasourceUrl:c.env.DATABASE_URL
   }).$extends(withAccelerate())

   const body  = await c.req.json();
   const { success } = createpostInput.safeParse(body);
	if (!success) {
		c.status(400);
		return c.json({ error: "invalid input" });
	}
   const post  = await prisma.post.create({
    data:{
       title: body.title ,
       content: body.content,
       authorId: userid
    }
   })

   return c.json({id:post.id})
})

blogrouter.get('/bulk', async (c) => {
  const prisma = new PrismaClient({
      datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate())
  const blogs = await prisma.post.findMany({
      select: {
          content: true,
          title: true,
          id: true,
          author: {
              select: {
                  name: true
              }
          }
      }
  });

  return c.json({
      blogs
  })
})

blogrouter.get('/:id' , async (c)=>{
  const id = c.req.param('id');
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL
})

try {
  const blog = await prisma.post.findFirst({
      where: {
          id: id
      },
      select: {
          id: true,
          title: true,
          content: true,
          author: {
              select: {
                  name: true
              }
          }
      }
  })

  return c.json({
      blog
  });
} catch(e) {
  c.status(411); // 4
  return c.json({
      message: "Error while fetching blog post"
  });
}

})
// update the post 
blogrouter.put('/', async (c) => {
	const userId = c.get('userId');
	const prisma = new PrismaClient({
		datasourceUrl: c.env?.DATABASE_URL	,
	}).$extends(withAccelerate());

	const body = await c.req.json();
  const { success } = updatePost.safeParse(body);
	if (!success) {
		c.status(400);
		return c.json({ error: "invalid input" });
	}
	prisma.post.update({
		where: {
			id: body.id,
			authorId: userId
		},
		data: {
			title: body.title,
			content: body.content
		}
	});

	return c.text('updated post');
});



