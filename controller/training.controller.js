import { Training } from "../model/training.model.js"

export const SaveTraining = async (req, res, next) => {
    try {
        const training = await Training.create(req.body)
        return training ? res.status(200).json({ message: "data saved successfully", status: true }) : res.status(400).json({ message: "Bad Request", status: false })
    }
    catch (err) {
        console.log(err)
        return res.status(500).json({ error: "Internal Server Error", status: false })
    }
}
export const ViewTraining = async (req, res, next) => {
    try {
        const training = await Training.find({ status: "Active", database: req.params.database }).populate({ path: "branch", model: "jobBatch" }).populate({ path: "trainer", model: "user" }).sort({ sortorder: -1 })
        return (training.length > 0) ? res.status(200).json({ Training: training, status: true }) : res.status(404).json({ message: "Not Found", status: false })
    }
    catch (err) {
        console.log(err);
        return res.status(500).json({ error: "Internal Server Error", status: false })
    }
}
export const ViewTrainingById = async (req, res, next) => {
    try {
        const training = await Training.findById(req.params.id).populate({ path: "branch", model: "jobBatch" }).populate({ path: "trainer", model: "user" })
        return training ? res.status(200).json({ Training: training, status: true }) : res.status(404).json({ message: "Not Found", status: false })
    }
    catch (err) {
        console.log(err);
        return res.status(500).json({ error: "Internal Server Error", status: false })
    }
}
export const DeleteTrainingDetail = async (req, res, next) => {
    try {
        const training = await Training.findById(req.params.id)
        if (!training) {
            return res.status(404).json({ message: "Not Found", status: false })
        }
        training.status = "Deactive";
        await training.save();
        return res.status(200).json({ message: "delete data successfully", status: false })
    }
    catch (err) {
        console.log(err);
        return res.status(500).json({ error: "Internal Server Error", status: false })
    }
}
export const UpdatedTrainingDetail = async (req, res, next) => {
    try {
        const trainingId = req.params.id;
        const training = await Training.findById(trainingId);
        if (!training) {
            return res.status(404).json({ message: "Not Found", status: false })
        }
        const trainingDetails = req.body;
        await Training.findByIdAndUpdate(trainingId, trainingDetails, { new: true })
        return res.status(200).json({ message: "updated details successfully", status: true })
    }
    catch (err) {
        console.log(err);
        return res.status(500).json({ error: "Internal Server Error", status: false })
    }
}