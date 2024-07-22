import { SkillTest } from "../model/skill.test.model.js";

export const saveSkillTestQuestion = async (req, res) => {
    try {
        const test = await SkillTest.create(req.body)
        return test ? res.status(200).json({ message: "data saved successfull", status: true }) : res.status(400).json({ message: "something went wrong", status: false })

    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
}
export const submitTest = async (req, res) => {
    const employeeAnswers = req.body;
    try {
        const questions = await SkillTest.find({});
        const totalQuestions = questions.length;
        let correctAnswers = 0;
        let attempt = 0;
        employeeAnswers.forEach((que, index) => {
            questions.forEach((question, index) => {
                if (que.rightAnswer === question.rightAnswer) {
                    correctAnswers++;
                }
            })
            if (que.rightAnswer) {
                attempt++;
            }
        });
        console.log("Attempt Question : " + attempt)
        console.log("Not Attempt Question : " + (totalQuestions - attempt))
        console.log("Right Question : " + correctAnswers)
        const score = (correctAnswers / totalQuestions) * 100;
        return res.status(200).json({ score, status: true });
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: 'Internal Server Error' });
    }
}
export const viewTestQuestion = async (req, res, next) => {
    try {
        const test = await SkillTest.find({ status: "Active", database: req.params.database }).sort({ sortorder: -1 })
        return (test.length > 0) ? res.status(200).json({ Question: test, status: true }) : res.status(404).json({ message: "Not Found", status: false })
    }
    catch (err) {
        console.log(err);
        return res.status(500).json({ error: "Internal Server Error", status: false })
    }
}
export const viewTestQuestionById = async (req, res, next) => {
    try {
        const test = await SkillTest.findById(req.params.id)
        return (test) ? res.status(200).json({ Question: test, status: true }) : res.status(404).json({ message: "Not Found", status: false })
    }
    catch (err) {
        console.log(err);
        return res.status(500).json({ error: "Internal Server Error", status: false })
    }
}
export const deleteTestQuestion = async (req, res, next) => {
    try {
        const test = await SkillTest.findById(req.params.id)
        if (!test) {
            return res.status(404).json({ message: "Not Found", status: false })
        }
        test.status = "Deactive";
        await test.save()
        return res.status(200).json({ message: "delete successfull", status: true })
    }
    catch (err) {
        console.log(err);
        return res.status(500).json({ error: "Internal Server Error", status: false })
    }
}
export const updatedTestQuestion = async (req, res, next) => {
    try {
        const salary = await SkillTest.findById(req.params.id)
        if (!salary) {
            return res.status(404).json({ message: "Not Found", status: false })
        }
        const updatedData = req.body;
        await SkillTest.findByIdAndUpdate(req.params.id, updatedData, { new: true })
        return res.status(200).json({ message: "updated successfull", status: true })
    }
    catch (err) {
        console.log(err);
        return res.status(500).json({ error: "Internal Server Error", status: false })
    }
}