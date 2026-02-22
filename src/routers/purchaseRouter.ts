import { Router } from 'express'
import type { Request, Response } from 'express'
import { PurchaseCourseSchema } from '../schema.ts';
import { prisma } from '../db.ts';
import { authMiddleware } from '../Middlewares/auth.ts';

const purchaseRouter = Router();

purchaseRouter.post('/purchases', authMiddleware, async function (req: Request, res: Response) {
    const result = PurchaseCourseSchema.safeParse(req.body);
    if (!result.data || !result.success) {
        return res.status(403).send({
            err: "Invalid request"
        })
    }
    else if (req.role == "INSTRUCTOR") {
        return res.status(403).send({
            msg: "Instructor cannot purchase course"
        });
    }
    else {
        const userId = req.userId
        const purchaseData: {
            userId: string,
            courseId: string,
            createdAt: Date,
        } = {
            userId: userId,
            courseId: result.data.courseId,
            createdAt: new Date(),
        }
        const purchaseCreate = await prisma.purchase.create({
            data: purchaseData
        })

        if (!purchaseCreate) {
            res.status(400).send({
                err: "Unable to add entry to the database"
            })
        }

        return res.status(200).send({
            msg: "Succesfully Added entry to the database"
        })
    }
})

purchaseRouter.get('/users/:id/purchases', authMiddleware, async function (req: Request, res: Response) {
    const { id } = req.params;
    const userId = id;

    if (req.userId == id) {
        const User = await prisma.user.findUnique({
            where: { id: userId as string },
            include: {
                purchases: {
                    include : {
                        course : true
                    }
                }
            }
        })
        if (!User) {
            return res.status(400).send({
                err: "Unable to find User"
            })
        }
        else {
            return res.status(200).json(User.purchases)
        }
    }
    else {
        res.status(403).send({
            err: "Invalid Request"
        })
    }
})


export { purchaseRouter }

