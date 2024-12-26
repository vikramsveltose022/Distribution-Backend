import { Role } from "../model/role.model.js"
import { User } from "../model/user.model.js";

export const SubscriptionAdminPlan = async (body)=>{
    try{
        let msg;
       const existRole = await Role.findOne({roleName:"SuperAdmin",database:body.database});
       if(!existRole){
        console.log("Role Not Found");
       }
       const existingSuperAdmin = await User.findOne({database:body.database,rolename:existRole._id.toString()})
       if(!existingSuperAdmin){
        console.log("user not found");
       }
       if(existingSuperAdmin.planStatus!=="paid"){
        return msg="subscription not found";
       } else{
        existingSuperAdmin.userRegister += 1;
        if(existingSuperAdmin.userRegister <=existingSuperAdmin.userAllotted){
            return msg="subscription done";
        } else{
            return msg="subscription limit full";
        }
       }
    }
    catch(err){
       console.log(err);
    }
}