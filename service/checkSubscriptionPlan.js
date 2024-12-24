import { Role } from "../model/role.model.js"

export const SubscriptionAdminPlan = async (body)=>{
    try{
       const existRole = await Role.findOne({rolename:"SuperAdmin",database:body.database});
       if(!existRole){
        console.log("Role Not Found");
       }

    }
    catch(err){

    }
}