import { Role } from "../model/role.model.js"
import { User } from "../model/user.model.js";

export const SubscriptionAdminPlan = async (body)=>{
    try{
       const existRole = await Role.findOne({roleName:"SuperAdmin",database:body.database});
       if(!existRole){
        console.log("Role Not Found");
       }
       const existingSuperAdmin = await User.findOne({database:body.database,rolename:existRole._id.toString()})
       if(!existingSuperAdmin){
        console.log("user not found");
       }
       if(existingSuperAdmin.planStatus!=="paid"){
        return false;
       } else{
        existingSuperAdmin.userRegister += 1;
        if(existingSuperAdmin.userRegister <=existingSuperAdmin.userAllotted){
            await existingSuperAdmin.save();
            return true;
        } else{
            return false
        }
       }
    }
    catch(err){
       console.log(err);
    }
}