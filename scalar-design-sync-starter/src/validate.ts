
import fs from "fs-extra";

export async function validateCommand(opts:any){
 const design = await fs.readJson(opts.design);
 const errors = [];
 for(const node of design.nodes || []){
   if(!node.role) errors.push(`Node ${node.id} missing role`);
 }
 console.log({valid: errors.length===0, errors});
}
