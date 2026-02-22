import * as z from 'zod';

const SignUpSchema = z.object({
    email : z.email(),
    password : z.string().min(6),
    name : z.string().max(255),
    role : z.enum(["STUDENT" , "INSTRUCTOR"])
})

const LoginSchema = z.object({
    email : z.email(),
    password : z.string().min(6)
})

const CreateCourseSchema = z.object({
    title : z.string(),
    description : z.string(),
    price : z.number()
})

const CreateLessonSchema = z.object({
    title : z.string(),
    content : z.string(),
    courseId : z.string()
})

const PurchaseCourseSchema = z.object({
    courseId : z.string()
})

export {SignUpSchema,
        LoginSchema, 
        CreateCourseSchema, 
        CreateLessonSchema, 
        PurchaseCourseSchema}