import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

// TASK: middlewares - cors, json parsing, urlencoded data, serve static assets, cookie parsing
app.use(
  cors({
    origin: process.env.CROSS_ORIGIN,
    credentials: true,
  })
);
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

// TASK: routes import
import userRouter from "./routes/user.routes.js";

// TASK: routes declaration
app.use("/api/v1/users", userRouter);

export { app };
