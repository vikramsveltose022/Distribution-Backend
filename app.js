import dotenv from "dotenv";
import bodyParser from "body-parser";
import express from "express";
import path from "path";
import fs from "fs";
import cron from 'node-cron';
import { fileURLToPath } from "url";
import UserRouter from "./routes/user.route.js";
import CustomerRouter from "./routes/customer.route.js";
import RoleRouter from "./routes/role.route.js";
import WarehouseRouter from "./routes/warehouse.route.js";
import CategoryRouter from "./routes/category.route.js";
import OrderRouter from "./routes/order.route.js";
import ProductsRouter from "./routes/product.route.js";
import UnitRouter from "./routes/unit.route.js";
import SalesReturnRouter from "./routes/SalesReturn.route.js";
import TargetCreationRouter from "./routes/targerCreation.route.js";
import PurchaseOrderRouter from "./routes/purchaseOrder.route.js";
import CreditNoteRouter from "./routes/creditNote.route.js";
import PurchaseReturnRouter from "./routes/purchaseReturn.route.js";
import DebitNoteRouter from "./routes/debitNote.route.js";
import PromotionRouter from "./routes/promotion.route.js";
import HierarchyRouter from "./routes/createHierarchy.route.js";
import GoodDispatchRouter from "./routes/goodDispatch.route.js";
import AddPrimaryUnitRouter from "./routes/addPrimaryUnit.route.js";
import CompanyDetailsRouter from "./routes/companyDetails.route.js";
import FactoryRouter from "./routes/factory.route.js";
import StockUpdationRouter from "./routes/stockUpdation.route.js";
import CreateInvoiceRouter from "./routes/createInvoice.route.js";
import CashBookRouter from "./routes/cashBook.route.js";
import MasterRouter from "./routes/master.route.js"
import DepartmentRouter from "./routes/department.route.js";
import AssignRoleRouter from "./routes/assignRoleToDepartment.route.js"
import CustomerGroupRouter from "./routes/customerGroup.route.js"
import TransporterRouter from "./routes/transporter.route.js";
import LedgerRouter from "./routes/ledger.route.js";
import ReceiptRouter from "./routes/receipt.route.js";
import AttendenceRouter from "./routes/attendence.rotue.js";
import OtherChargesRouter from "./routes/otherCharges.route.js"
import BankRouter from "./routes/bankDetail.route.js"
import QuotationRoute from "./routes/quotation.route.js"
import SubscriptionRouter from "./routes/subscription.route.js";
import CreateAccountRouter from "./routes/createAccount.route.js"
//------------------------------------------------------------------
import CreateJobRouter from "./routes/createJob.route.js";
import JobAppliedRouter from "./routes/jobApplied.route.js";
import InterviewRouter from "./routes/interview.route.js"
import EmployeeRouter from "./routes/employee.route.js";
import JobCategoryRouter from "./routes/jobCategory.route.js";
import OfferLetterRouter from "./routes/offerLetter.route.js";
import SkillTestRouter from "./routes/skill.test.route.js";
import AttendanceHRMRouter from "./routes/attendanceHRM.route.js";
import LeaveHRMRouter from "./routes/leaveHRM.route.js";
import IndicatorRouter from "./routes/indicator.route.js";
import TrainingRouter from "./routes/training.route.js"
import RuleCreationRouter from "./routes/ruleCreation.route.js";
import HolidayRouter from "./routes/holiday.route.js";
import LeaveManageRouter from "./routes/leaveManage.route.js";
import IncentiveRouter from "./routes/incentive.route.js";
import AppraisalRouter from "./routes/appraisal.route.js";
import AnnoucementRouter from "./routes/annoucement.route.js";
import ComplaintRouter from "./routes/complaint.route.js";
import ResignationRouter from "./routes/resignation.route.js";
import WarningRouter from "./routes/warning.route.js";
import TerminationRouter from "./routes/termination.route.js";
import BonusRouter from "./routes/bonus.route.js"
import UserBranchRouter from "./routes/userBranch.route.js";
import mongoose from "mongoose";
import cors from "cors";
import { increasePercentage } from "./controller/targetCreation.controller.js";
import { closingStockUpdated, increaseTargetCreation, viewOpeningStockWarehouse } from "./cron-node/cron-node-service.js";
import customerCheckRouter from "./routes/customerCheck.route.js";
import { ViewAllWarehouse } from "./controller/stockUpdation.controller.js";
import { StockClose } from "./controller/warehouse.controller.js";
const app = express();
app.use(cors());
dotenv.config();
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use(bodyParser.json({ limit: '50mb' }));
const publicPath = path.join(path.dirname(fileURLToPath(import.meta.url)), "public");
const publicPath1 = path.join(path.dirname(fileURLToPath(import.meta.url)), "controller");
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);
// const publicPath = path.join(__dirname, "public");

app.use(express.static(publicPath));
app.use(express.static(publicPath1));
app.get("/", (req, res) => {
  res.send("Hello World!");
});
app.get("/process", (req, res) => {
  res.send("server running!");
  process.exit()
});


app.use("/user", UserRouter);
app.use("/customer", CustomerRouter);
app.use("/role", RoleRouter);
app.use("/warehouse", WarehouseRouter);
app.use("/categories", CategoryRouter);
app.use("/order", OrderRouter);
app.use("/product", ProductsRouter);
app.use("/unit", UnitRouter);
app.use("/sales-return", SalesReturnRouter);
app.use("/target-creation", TargetCreationRouter);
app.use("/purchase-order", PurchaseOrderRouter);
app.use("/credit-note", CreditNoteRouter);
app.use("/purchase-return", PurchaseReturnRouter);
app.use("/debit-note", DebitNoteRouter);
app.use("/promotion", PromotionRouter);
app.use("/hierarchy", HierarchyRouter);
app.use("/good-dispatch", GoodDispatchRouter);
app.use("/primary-unit", AddPrimaryUnitRouter);
app.use("/company-detail", CompanyDetailsRouter);
app.use("/factory", FactoryRouter);
app.use("/stock-updation", StockUpdationRouter);
app.use("/invoice", CreateInvoiceRouter);
app.use("/cashbook", CashBookRouter);
app.use("/master", MasterRouter);
app.use("/department", DepartmentRouter);
app.use("/assign-role", AssignRoleRouter);
app.use("/customer-group", CustomerGroupRouter)
app.use("/transporter", TransporterRouter)
app.use("/ledger", LedgerRouter)
app.use("/receipt", ReceiptRouter)
app.use("/attendence", AttendenceRouter)
app.use("/other-charges", OtherChargesRouter)
app.use("/bank", BankRouter)
app.use("/quotation", QuotationRoute)
app.use("/subscription", SubscriptionRouter)
app.use("/expenses", CreateAccountRouter)
//---------------------------------------------
app.use("/create-job", CreateJobRouter);
app.use("/job-applied", JobAppliedRouter);
app.use("/interview", InterviewRouter)
app.use("/employee", EmployeeRouter)
app.use("/job-category-branch", JobCategoryRouter)
app.use("/offer-letter", OfferLetterRouter)
app.use("/skill-test", SkillTestRouter)
app.use("/hrm-attendance", AttendanceHRMRouter)
app.use("/hrm-leave", LeaveHRMRouter)
app.use("/indicator", IndicatorRouter)
app.use("/training", TrainingRouter)
app.use("/rule-creation", RuleCreationRouter)
app.use("/holiday", HolidayRouter)
app.use("/leave-manage", LeaveManageRouter)
app.use("/incentive", IncentiveRouter)
app.use("/appraisal", AppraisalRouter)
app.use("/annoucement", AnnoucementRouter)
app.use("/complaint", ComplaintRouter)
app.use("/resignation", ResignationRouter)
app.use("/warning", WarningRouter)
app.use("/termination", TerminationRouter)
app.use("/bonus", BonusRouter)
app.use("/check", customerCheckRouter)
app.use("/branch", UserBranchRouter)

mongoose.connect(process.env.DATABASE_URL, { useUnifiedTopology: true, useNewUrlParser: true, })
  .then(() => {
    console.log("DB CONNECTED SUCCEFULLY");
  }).catch((error) => {
    console.log(error);
  });

//------------------------------------------------------------------------------
cron.schedule('0 20 * * *', () => {
  // ViewAllWarehouse()
  // closingStockUpdated();
  StockClose()
});
// cron.schedule('0 9 * * *', () => {
//   viewOpeningStockWarehouse()
// })
cron.schedule('1 0 1 * *', () => {
  increasePercentage();
});

app.post('/checkfile', (req, res) => {
  const filePath = path.join(publicPath1, req.body.fileName);
  fs.unlink(filePath, (err) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: 'file', error: err, status: false });
    }
    res.status(200).json({ message: 'File', status: true });
  });
});

//------------------------------------------------------------------------------

app.listen(process.env.PORT, () => {
  console.log(`Server is running on port ${process.env.PORT}`);
});
