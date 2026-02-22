import { Router } from 'express'
import { authMiddleware } from '../Middlewares/auth.ts';
import type { Request, Response } from 'express';
import { config } from 'dotenv';
import {
    CreateCourseSchema
}
    from '../schema.ts'
import { prisma } from '../db.ts';
config();

const courseRouter = Router();

courseRouter.post('/courses', authMiddleware, async function (req: Request, res: Response) {
    const result = CreateCourseSchema.safeParse(req.body);
    if (req.role != "INSTRUCTOR") {
        return res.status(403).send({
            err: "Unauthorized Access"
        })
    }
    else if (!result.success) {
        return res.status(403).send({
            err: "Invalid Input"
        })
    }
    else {
        const courseInfo: {
            InstructorId: string,
            title: string,
            price: number,
            description: string,
        } = {
            InstructorId: req.userId,
            title: result.data?.title!,
            price: result.data?.price!,
            description: result.data?.description!,
        }

        try {
            const course = await prisma.course.create({
                data: courseInfo
            })
            return res.status(200).send({
                id : course.id ,
                msg: `Succesfully Added to Database`
            })
        }
        catch (err) {
            console.log(err)
            return res.status(400).send({
                err
            })
        }
    }
})


courseRouter.get('/courses', async function (req: Request, res: Response) {
    try {
        const Allcourses = await prisma.course.findMany({
        })
        return res.status(200).json(Allcourses)
    }
    catch (err) {
        return res.status(401).send({
            err
        })
    }
})

courseRouter.get('/courses/:id', async function (req: Request, res: Response) {

    const { id } = req.params;
    const courseId = id;
    try {
        const course = await prisma.course.findUnique({
            where: { id: courseId as string },
            include: {
                lessons: true
            }
        })
        if (!course) {
            return res.status(404).send({ 
                message: "Course not found"
             });
        }
        let arrayOfLessons = course.lessons
        return res.status(200).json(course)
    }
    catch (err) {
        return res.status(401).send({
            err
        })
    }
})

courseRouter.patch('/courses/:id', authMiddleware, async function (req: Request, res: Response) {
    const { id } = req.params;
    const courseId = id;
    const result = CreateCourseSchema.partial().safeParse(req.body)
    if (req.role == "INSTRUCTOR" && result.data) {
        try {
            const updateCourse = await prisma.course.update({
                where: { 
                    id: courseId as string,
                },
                data: result.data
            })
            console.log(`Patched the course with id ${courseId}`)
            return res.status(200).json(updateCourse);
        }
        catch (err) {
            return res.status(400).send({
                err
            })
        }
    }
    else {
        return res.status(403).send({
            err: "Invalid Authorization"
        })
    }
})

courseRouter.delete('/courses/:id', authMiddleware, async function (req: Request, res: Response) {
    const { id } = req.params;
    const courseId = id;
    if (req.role == "INSTRUCTOR") {
        try {
            const deleteCourse = await prisma.course.delete({
                where: { id: courseId as string },
            })
            console.log(`Patched the course with id ${courseId}`)
            res.status(200).json({
                message : "Course deleted"
            })
        }
        catch (err) {
            return res.status(400).send({
                err
            })
        }
    }
    else {
        return res.status(403).send({
            err: "Invalid Request"
        })
    }
})

export { courseRouter }