import { Router } from 'express'
import type { Request , Response } from 'express'
import { authMiddleware } from '../Middlewares/auth.ts';
import { CreateLessonSchema } from '../schema.ts'
import { prisma } from '../db.ts';


const lessonRouter = Router();

lessonRouter.post('/lessons' , authMiddleware , async function(req : Request, res : Response){
    const result = CreateLessonSchema.safeParse(req.body);
    if(result.success && req.role == "INSTRUCTOR"){

        const lessonData : {
            title: string,
            content: string,
            courseId: string,
            createdAt : Date,
        } = {
            title : result.data.title,
            content : result.data.content,
            courseId : result.data.courseId,
            createdAt : new Date(),
        }

        try{
            const addLesson = await prisma.lesson.create({
                data : lessonData
            })
            return res.status(200).send({
                id : addLesson.id,
                msg : "Added lesson to the db"
            })
        }
        catch(err){
            return res.status(400).send({
                err : "Unable to add entry to db"
            })
        }
    }
    else{
        return res.status(403).send({
            err : "Invalid Request"
        })
    }
});

lessonRouter.get('/courses/:courseId/lessons' , async function(req : Request , res : Response){
    const { courseId } = req.params
    try{
        const getLessons = await prisma.course.findUnique(
            {
                where : {id : courseId as string},
                include : {
                    lessons : true
                }
            }
        )
        if(getLessons){
            return res.status(200).json(getLessons.lessons)
        }
    }
    catch(err){
        return res.status(401).send({
            err
        })
    }
})

export { lessonRouter }

