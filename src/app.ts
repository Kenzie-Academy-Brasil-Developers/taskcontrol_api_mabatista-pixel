import express, { Application, json } from "express";
import helmet from "helmet";
import "express-async-errors";
import { handleErrors } from "./middlewares/handleErrors.middleware";
import { taskRouter, categoryRouter } from "./routers";
import { userRouter } from "./routers/users.router";


export const app: Application = express();

app.use(helmet());
app.use(json());
app.use("/tasks", taskRouter);
app.use("/categories", categoryRouter);
app.use("/users", userRouter);
app.use(handleErrors);