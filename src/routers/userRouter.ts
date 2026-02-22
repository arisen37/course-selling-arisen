import { Router } from 'express'
import * as jwt from 'jsonwebtoken'
import { config } from 'dotenv'
import type { Request , Response } from 'express'
import {
    SignUpSchema,
    LoginSchema
}
    from '../schema.ts'
import * as bcrypt from 'bcrypt'
import { prisma } from '../db.ts'
import { authMiddleware } from '../Middlewares/auth.ts'

config();

const UserRouter = Router();

UserRouter.post('/auth/signup' , function (req: Request, res: Response) {

    const result = SignUpSchema.safeParse(req.body);
    if (result.success) {
        const userData : {
            email : string,
            name : string,
            password : string,
            role : ("STUDENT" | "INSTRUCTOR")
        } = result.data

        const email: string = userData.email;
        const password: string = userData.password;
        const role: ("STUDENT" | "INSTRUCTOR") = userData.role;
        const name = userData.name;

        bcrypt.hash(password, 5, async function (err, hash) {

            const hashedPassword = hash;
            const createdAt : Date = new Date();

            const UserData = {
                email,
                password : hashedPassword,
                name,
                role,
                createdAt
            }

            try{
                const user = await prisma.user.create({
                  data: UserData
                })
                console.log(`Succesfully added ${userData} to Database`)

                const Token = jwt.sign({
                    userId : user.id,
                    role,
                } , process.env.JWTSECRET)

                return res.status(200).send({
                   token : Token
                })
            }
            catch(err){
                console.log(`Unable to Add ${userData} to Database`)
                return res.status(500).send({
                    error : "Unable to add the entry to the database"
                })
            }
        })
    }
    else{
        return res.status(400).send({
            error : "zod schema validation failed"
        })
    }
})


UserRouter.post('/auth/login' , async function(req : Request , res : Response){
    const result = LoginSchema.safeParse(req.body)
    if(result.success){
        const userData : {
            email : string,
            password : string
        } = result.data

        const currentUser = await prisma.user.findUnique({
            where : { email : userData.email },
        })

        if(currentUser)
            bcrypt.compare(userData.password , currentUser.password, function(err , result){
                if(result){
                    const Token = jwt.sign({
                        userId : currentUser.id,
                        role : currentUser.role,
                    } , process.env.JWTSECRET)

                    return res.status(200).send({
                        token : Token,
                    })
                }
                else{
                    return res.status(401).send({
                        err : "Unauthorized Access"
                    })
                }
            })
    }
    else{
        return res.status(403).send({
            err : "User Not Found"
        })
    }
});

UserRouter.get('/me' , authMiddleware , async function(req : Request , res : Response){
    const id = req.userId;
    try{
        const user = await prisma.user.findUnique({
            where : {id : id},
            select : {
                id : true,
                email : true,
                name : true,
                role : true,
            }
        })

        if(!user){
            res.status(404).send({
                msg : "User not found"
            })
        }

        res.status(200).json(user);
    }
    catch(err){
        console.log(err);
        res.status(500).send({
            err : "Invalid Server Error"
        })
    }
})

export { UserRouter }
