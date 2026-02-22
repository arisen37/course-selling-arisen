import express from 'express'
import type { Express  } from 'express';
import { courseRouter } from './routers/courseRouter.ts';
import { lessonRouter } from './routers/lessonRouter.ts';
import { purchaseRouter } from './routers/purchaseRouter.ts';
import { UserRouter } from './routers/userRouter.ts';

const app : Express = express();

app.use(express.json());
app.use('/' , courseRouter);
app.use('/' , lessonRouter);
app.use('/' , purchaseRouter);
app.use('/' , UserRouter);

app.listen(3000, ()=>{
    console.log("Sever is RUNNING")
});