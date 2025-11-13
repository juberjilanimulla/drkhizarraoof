import { Router } from "express";
import admindoctorRouter from "./admindoctorRouter.js";
import admincontactRouter from "./admincontactRouter.js";
import adminsubcribeRouter from "./adminsubcribeRouter.js";
import adminreviewRouter from "./adminreviewRouter.js";
import adminvideoRouter from "./adminvideoRouter.js";
import adminslotbookingRouter from "./adminslotbookingRouter.js";
import adminappointmentRouter from "./adminappointmentRouter.js";
import adminpaymentRouter from "./adminpaymentRouter.js";
import adminblogRouter from "./adminblogRouter.js";
import admincommentRouter from "./admincommentRouter.js";

const adminRouter = Router();

adminRouter.use("/doctor", admindoctorRouter);
adminRouter.use("/blog", adminblogRouter);
adminRouter.use("/contact", admincontactRouter);
adminRouter.use("/subcribe", adminsubcribeRouter);
adminRouter.use("/review", adminreviewRouter);
adminRouter.use("/video", adminvideoRouter);
adminRouter.use("/slotbooking", adminslotbookingRouter);
adminRouter.use("/appointment", adminappointmentRouter);
adminRouter.use("/payment", adminpaymentRouter);
adminRouter.use("/comment", admincommentRouter);
export default adminRouter;
