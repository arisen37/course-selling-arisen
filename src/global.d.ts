namespace Express {
    interface Request {
        userId: string,
        role: string,
        email : string,
        password : string,
    }
}

namespace NodeJS {
    interface ProcessEnv {
        JWTSECRET: jwt.Secret
    }
}



