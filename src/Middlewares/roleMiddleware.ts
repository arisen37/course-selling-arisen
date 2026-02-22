import type { Request , Response , NextFunction } from 'express'
import * as jwt from 'jsonwebtoken'
import { config } from 'dotenv'

config();

function requiredRole(role : string ){
    return (req : Request , res : Response , next : NextFunction) => {
        const Token = req.headers.authorization?.split(' ')[1]!
        if(!Token){
            res.status(403).send({
                err : "Unauthorized Access"
            })
        }
        
        const decodedInfo = jwt.verify(Token! , process.env.JWTSECRET) as jwt.JwtPayload
        if(decodedInfo.role == role){
            next();
        }
        else{
            res.status(403).send({
                err : "Unauthorized Access"
            })
        }
    }
}

export { requiredRole }