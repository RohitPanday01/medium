import z from 'zod';

export const signupInput = z.object({
    email: z.string().email(),
    password: z.string(),
    name: z.string().optional()
})

export type  SignupInputType = z.infer<typeof signupInput>;

export const signinInput = z.object({
    email : z.string().email(),
    password: z.string()
})

export type SigninInputType = z.infer<typeof signinInput>

export const createpostInput = z.object({
    title:z.string(),
    content : z.string()
})

export type CreatPostInputType = z.infer<typeof createpostInput>

export const updatePost = z.object({
    title: z.string().optional(),
    content: z.string().optional()
})

export type UpdatePostType = z.infer<typeof updatePost>