import express from "express";
import config from "./config.js";
import dbConnect from "./db.js";
import authRouter from "./routes/auth/authRouter.js";
import { Admin } from "./helpers/helperFunction.js";
import morgan from "morgan";
import cors from "cors";
import adminRouter from "./routes/admin/adminRouter.js";
import userRouter from "./routes/user/userRouter.js";

const app = express();
const port = config.PORT;

morgan.token("remote-addr", (req) => {
  return req.headers["x-forwarded-for"] || req.socket.remoteAddress;
});

app.use(
  morgan(
    ":remote-addr :method :url :status :res[content-length] - :response-time ms"
  )
);

// MIDDLEWARE FIXED
app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ extended: true, limit: "20mb" }));

// CORS
const allowedOrigins = [
  "https://drkhizarraoof.com",
  "https://www.drkhizarraoof.com",
  "https://api.drkhizarraoof.com",
  "http://localhost:3000",
];

app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin || allowedOrigins.includes(origin)) {
        return cb(null, true);
      }
      return cb(new Error("CORS not allowed"), false);
    },
    credentials: true,
    methods: "GET,POST,PUT,DELETE",
    allowedHeaders: "Content-Type,Authorization",
  })
);

app.options("*", cors());

// Routes
app.use("/api/auth", authRouter);
app.use("/api/admin", adminRouter);
app.use("/api/user", userRouter);

// DB
dbConnect()
  .then(() => {
    Admin();
    app.listen(port, () => {
      console.log(`server listening at ${port}`);
    });
  })
  .catch((err) => {
    console.log("unable to connected to server", err);
  });
