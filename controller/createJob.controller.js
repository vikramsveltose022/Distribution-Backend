import { Job } from "../model/CreateJob.model.js";

export const saveJob = async (req, res, next) => {
    try {
        const job = await Job.create(req.body)
        return job ? res.status(200).json({ message: "Data Save Successfully", status: true }) : res.status(400).json({ message: "something went wrong", stauts: false })
    }
    catch (err) {
        console.log(err);
        return res.status(500).json({ error: "Internal Server Error", status: false })
    }
}
export const viewJob = async (req, res, next) => {
    try {
        const job = await Job.find({ status: "Active", database: req.params.database }).sort({ sortorder: -1 }).populate({ path: "branch", model: "jobBatch" }).populate({ path: "jobCategory", model: "jobCategory" })
        return (job.length > 0) ? res.status(200).json({ Job: job, status: true }) : res.status(404).json({ message: "Not Found", status: false })
    }
    catch (err) {
        console.log(err);
        return res.status(500).json({ error: "Internal Server Error", status: false })
    }
}
export const viewJobById = async (req, res, next) => {
    try {
        const job = await Job.findById({ _id: req.params.id }).populate({ path: "branch", model: "jobBatch" }).populate({ path: "jobCategory", model: "jobCategory" })
        return job ? res.status(200).json({ Job: job, status: true }) : res.status(404).json({ message: "Not found" })
    }
    catch (err) {
        console.log(err);
        return res.status(500).json({ error: "Internal Server Error", status: false })
    }
}
export const deleteJob = async (req, res, next) => {
    try {
        const job = await Job.findById(req.params.id)
        if (!job) {
            return res.status(404).json({ message: "Not Found", status: false })
        }
        job.status = await "Deactive"
        const deleteJob = await job.save();
        return (deleteJob) ? res.status(200).json({ message: "delete successfully", status: false }) : res.status(400).json({ message: "something went wrong", status: false })
    } catch (err) {
        console.log(err);
        return res.status(500).json({ error: "Internal Server Error", status: false })
    }
}
export const updateJob = async (req, res, next) => {
    try {
        const job = await Job.findById(req.params.id)
        if (!job) {
            return res.statut(404).json({ message: "Not found", status: false })
        }
        const updatedJob = req.body;
        const updateJob = await Job.findByIdAndUpdate(req.params.id, updatedJob, { new: true })
        return updateJob ? res.status(200).json({ message: "Updated Successfully", status: true }) : res.status(400).json({ message: "something went wrong", status: false })
    }
    catch (err) {
        console.log(err);
        return res.status(500).json({ error: "Internal Server Error", status: false })
    }
}