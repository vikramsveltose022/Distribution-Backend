import { JobApplied } from "../model/jobApplied.model.js";

export const saveJobApplied = async (req, res, next) => {
    try {
        const job = await JobApplied.create(req.body)
        return job ? res.status(200).json({ message: "Data Save Successfully", status: true }) : res.status(400).json({ message: "something went wrong", stauts: false })
    }
    catch (err) {
        console.log(err);
        return res.status(500).json({ error: "Internal Server Error", status: false })
    }
}
export const viewJobApplied = async (req, res, next) => {
    try {
        const job = await JobApplied.find({ status: "Active", database: req.params.database }).sort({ sortorder: -1 }).populate({ path: "category", model: "jobCategory" }).populate({ path: "job", model: "createJob" })
        return (job.length > 0) ? res.status(200).json({ Job: job, status: true }) : res.status(404).json({ message: "Not Found", status: false })
    }
    catch (err) {
        console.log(err);
        return res.status(500).json({ error: "Internal Server Error", status: false })
    }
}
export const viewJobAppliedById = async (req, res, next) => {
    try {
        const job = await JobApplied.findById({ _id: req.params.id }).populate({ path: "job", model: "createJob" }).populate({ path: "category", model: "jobCategory" })
        return job ? res.status(200).json({ Job: job, status: true }) : res.status(404).json({ message: "Not found" })
    }
    catch (err) {
        console.log(err);
        return res.status(500).json({ error: "Internal Server Error", status: false })
    }
}
export const deleteJobApplied = async (req, res, next) => {
    try {
        const job = await JobApplied.findById(req.params.id)
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
export const updateJobApplice = async (req, res, next) => {
    try {
        const job = await JobApplied.findById(req.params.id)
        if (!job) {
            return res.statut(404).json({ message: "Not found", status: false })
        }
        const updatedJob = req.body;
        const updateJob = await JobApplied.findByIdAndUpdate(req.params.id, updatedJob, { new: true })
        return updateJob ? res.status(200).json({ message: "Updated Successfully", status: true }) : res.status(400).json({ message: "something went wrong", status: false })
    }
    catch (err) {
        console.log(err);
        return res.status(500).json({ error: "Internal Server Error", status: false })
    }
}