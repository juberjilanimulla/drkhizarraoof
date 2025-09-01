import { Router } from "express";
import userblogRouter from "./userblogRouter.js";
import usercontactRouter from "./usercontactRouter.js";
import usersubcribeRouter from "./usersubcribeRouter.js";
import userreviewRouter from "./userreviewRouter.js";
import usercommentRouter from "./usercommentRouter.js";
import uservideoRouter from "./uservideoRouter.js";
import userappointmentRouter from "./userappointmentRouter.js";
import userslotbookingRouter from "./userslotbookingRouter.js";
import userpaymentRouter from "./userpaymentRouter.js";

const userRouter = Router();

userRouter.use("/blog", userblogRouter);
userRouter.use("/contact", usercontactRouter);
userRouter.use("/subcribe", usersubcribeRouter);
userRouter.use("/review", userreviewRouter);
userRouter.use("/comment", usercommentRouter);
userRouter.use("/video", uservideoRouter);
userRouter.use("/appointment", userappointmentRouter);
userRouter.use("/slotbooking", userslotbookingRouter);
userRouter.use("/payment", userpaymentRouter);

export default userRouter;
