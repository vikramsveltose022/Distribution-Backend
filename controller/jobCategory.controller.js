import { JobBatch, JobCateogry } from "../model/jobCategory.model.js";

export const saveJobCategory = async (req, res, next) => {
    try {
        const job = await JobCateogry.create(req.body)
        return job ? res.status(200).json({ message: "Data Save Successfully", status: true }) : res.status(400).json({ message: "something went wrong", stauts: false })
    }
    catch (err) {
        console.log(err);
        return res.status(500).json({ error: "Internal Server Error", status: false })
    }
}
export const viewJobCategory = async (req, res, next) => {
    try {
        const job = await JobCateogry.find({ status: "Active", database: req.params.database }).sort({ sortorder: -1 })
        return (job.length > 0) ? res.status(200).json({ JobCategory: job, status: true }) : res.status(404).json({ message: "Not Found", status: false })
    }
    catch (err) {
        console.log(err);
        return res.status(500).json({ error: "Internal Server Error", status: false })
    }
}
export const viewJobCategoryById = async (req, res, next) => {
    try {
        const job = await JobCateogry.findById({ _id: req.params.id })
        return job ? res.status(200).json({ JobCategory: job, status: true }) : res.status(404).json({ message: "Not found" })
    }
    catch (err) {
        console.log(err);
        return res.status(500).json({ error: "Internal Server Error", status: false })
    }
}
export const deleteJobCategory = async (req, res, next) => {
    try {
        const job = await JobCateogry.findById(req.params.id)
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
export const updatedJobCategory = async (req, res, next) => {
    try {
        const job = await JobCateogry.findById(req.params.id)
        if (!job) {
            return res.statut(404).json({ message: "Not found", status: false })
        }
        const updatedJob = req.body;
        const updateJob = await JobCateogry.findByIdAndUpdate(req.params.id, updatedJob, { new: true })
        return updateJob ? res.status(200).json({ message: "Updated Successfully", status: true }) : res.status(400).json({ message: "something went wrong", status: false })
    }
    catch (err) {
        console.log(err);
        return res.status(500).json({ error: "Internal Server Error", status: false })
    }
}

//--------------------------------------------------------------------
export const saveJobBatch = async (req, res, next) => {
    try {
        const job = await JobBatch.create(req.body)
        return job ? res.status(200).json({ message: "Data Save Successfully", status: true }) : res.status(400).json({ message: "something went wrong", stauts: false })
    }
    catch (err) {
        console.log(err);
        return res.status(500).json({ error: "Internal Server Error", status: false })
    }
}
export const viewJobBatch = async (req, res, next) => {
    try {
        const job = await JobBatch.find({ status: "Active", database: req.params.database }).sort({ sortorder: -1 })
        return (job.length > 0) ? res.status(200).json({ JobBatch: job, status: true }) : res.status(404).json({ message: "Not Found", status: false })
    }
    catch (err) {
        console.log(err);
        return res.status(500).json({ error: "Internal Server Error", status: false })
    }
}
export const viewJobBatchById = async (req, res, next) => {
    try {
        const job = await JobBatch.findById({ _id: req.params.id })
        return job ? res.status(200).json({ JobBatch: job, status: true }) : res.status(404).json({ message: "Not found" })
    }
    catch (err) {
        console.log(err);
        return res.status(500).json({ error: "Internal Server Error", status: false })
    }
}
export const deleteJobBatch = async (req, res, next) => {
    try {
        const job = await JobBatch.findById(req.params.id)
        if (!job) {
            return res.status(404).json({ message: "Not Found", status: false })
        }
        job.status = "Deactive"
        const deleteJob = await job.save();
        return (deleteJob) ? res.status(200).json({ message: "delete successfully", status: false }) : res.status(400).json({ message: "something went wrong", status: false })
    } catch (err) {
        console.log(err);
        return res.status(500).json({ error: "Internal Server Error", status: false })
    }
}
export const updatedJobBatch = async (req, res, next) => {
    try {
        const job = await JobBatch.findById(req.params.id)
        if (!job) {
            return res.statut(404).json({ message: "Not found", status: false })
        }
        const updatedJob = req.body;
        const updateJob = await JobBatch.findByIdAndUpdate(req.params.id, updatedJob, { new: true })
        return updateJob ? res.status(200).json({ message: "Updated Successfully", status: true }) : res.status(400).json({ message: "something went wrong", status: false })
    }
    catch (err) {
        console.log(err);
        return res.status(500).json({ error: "Internal Server Error", status: false })
    }
}