import * as jwt from 'jsonwebtoken'
import type { Request , Response , NextFunction } from 'express'
import { config } from 'dotenv'
config();

function authMiddleware(req : Request, res : Response, next : NextFunction){
    const Token = req.headers.authorization?.split(' ')[1]!;
    if(Token){
        try{
            const payLoad = jwt.verify(Token , process.env.JWTSECRET) as any;

            req.userId = payLoad.userId
            req.role = payLoad.role

            return next();
        }
        catch(err){
            res.status(403).send({
                err
            })
        }
    }
    else{
        return res.status(403).send({
            err : "No token found"
        });
    }
}

export { authMiddleware }