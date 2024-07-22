import { CreateHierarachy } from "../model/createHierarchy.model.js";

export const saveHierarchy = async (req, res, next) => {
  try {
    const hierarchy = await CreateHierarachy.create(req.body);
    return hierarchy ? res.status(200).json({ message: "save successfull", Hierarchy: hierarchy, status: true, }) : res.status(400).json({ message: "something went wrong", status: false });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: "Internal Server Error", status: false });
  }
};
export const viewHierarchy = async (req, res, next) => {
  try {
    const hierarchy = await CreateHierarachy.find().sort({ sortorder: -1 }).populate({ path: "parentId", model: "role" }).populate({ path: "childId", model: "role" });
    return hierarchy.length > 0? res.status(200).json({ Hierarchy: hierarchy, status: true }): res.status(400).json({ message: "Not Found", status: false });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: "Internal Server Error", status: false });
  }
};
export const viewHierarchyById = async (req, res, next) => {
  try {
    const hierarchy = await CreateHierarachy.find({ _id: req.params.id }).sort({ sortorder: -1 }).populate({ path: "parentId", model: "role" }).populate({ path: "childId", model: "role" });
    return hierarchy.length > 0? res.status(200).json({ Hierarchy: hierarchy, status: true }): res.status(400).json({ message: "Not Found", status: false });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: "Internal Server Error", status: false });
  }
};
