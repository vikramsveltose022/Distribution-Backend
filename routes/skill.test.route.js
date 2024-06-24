import express from "express"
import { deleteTestQuestion, saveSkillTestQuestion, submitTest, updatedTestQuestion, viewTestQuestion, viewTestQuestionById } from "../controller/skill.test.controller.js";

const router = express.Router();

router.post('/save-questions', saveSkillTestQuestion)
router.post('/submit-answers', submitTest)
router.get("/view-test-question/:database", viewTestQuestion);
router.get("/view-test-question-by-id/:id", viewTestQuestionById)
router.delete("/delete-test-question/:id", deleteTestQuestion)
router.put("/update-test-question/:id", updatedTestQuestion)

export default router;