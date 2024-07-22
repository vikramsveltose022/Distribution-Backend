import { UserBranch } from "../model/userBranch.model.js"

export const SaveBranch = async (req, res, next) => {
    try {
        const savedBranch = await UserBranch.create(req.body)
        return res.status(200).json({ status: true, message: 'Save Branch Successfully.', Branch: savedBranch });
    } catch (error) {
        console.log(error)
        return res.status(500).json({ error: "Internal Server Error", status: false })
    }
}
export const ViewBranch = async (req, res, next) => {
    try {
        const database = req.params.database
        const Branch = await UserBranch.find({ database: database })
        return (Branch) ? res.status(200).json({ message: "Branch Found Successfully ..!", Branch: Branch, status: true }) : res.status(404).json({ message: "Branch Not Found", status: false })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ error: "Internal Server Error", status: false })
    }
}
export const ViewByIdBranch = async (req, res, next) => {
    try {
        const id = req.params.id;
        const Branch = await UserBranch.findById(id)
        return (Branch) ? res.status(200).json({ message: "Branch Found Successfully ..!", Branch: Branch, status: true }) : res.status(404).json({ message: "Branch Not Found", status: false })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ error: "Internal Server Error", status: false })
    }
}
export const DeleteBranch = async (req, res, next) => {
    try {
        const id = req.params.id;
        const Branch = await UserBranch.findByIdAndDelete(id)
        return (Branch) ? res.status(200).json({ message: "Branch Deleted Successfully ..!", Branch: Branch, status: true }) : res.status(404).json({ message: "Branch Not Deleted", status: false })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ error: "Internal Server Error", status: false })
    }
}
export const UpdateBranch = async (req, res, next) => {
    try {
        const id = req.params.id;
        const Branch = await UserBranch.findByIdAndUpdate(id, req.body)
        return (Branch) ? res.status(200).json({ message: "Branch Updated Successfully ..!", Branch: Branch, status: true }) : res.status(404).json({ message: "Branch Not Updated", status: false })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ error: "Internal Server Error", status: false })
    }
}