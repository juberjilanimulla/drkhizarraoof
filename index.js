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

// Morgan logs
morgan.token("remote-addr", (req) => {
  return req.headers["x-forwarded-for"] || req.socket.remoteAddress;
});

app.use(
  morgan(
    ":remote-addr :method :url :status :res[content-length] - :response-time ms"
  )
);

// Body parser
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true }));

// ⭐ Correct CORS config
const allowedOrigins = [
  "https://drkhizarraoof.com",
  "https://www.drkhizarraoof.com",
  "https://api.drkhizarraoof.com",
  "http://localhost:3000",
];

// Global CORS must be here
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      } else {
        return callback(new Error("CORS not allowed"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.options("*", cors());

// Routes
app.use("/api/auth", authRouter);
app.use("/api/admin", adminRouter);
app.use("/api/user", userRouter);

// DB Connect
dbConnect()
  .then(() => {
    Admin();
    app.listen(port, () => console.log(`server listening at ${port}`));
  })
  .catch((error) => console.log("unable to connect to server", error));
