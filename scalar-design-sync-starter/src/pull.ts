
import fs from "fs-extra";
import path from "path";

export async function pullCommand(opts:any){
 const design = await fs.readJson(opts.design);
 const screensDir = path.join(opts.out,"src/screens/generated");
 await fs.ensureDir(screensDir);

 for(const s of design.screens || []){
   const name = s.name.replace(/\s+/g,'');
   const content = `export default function ${name}Generated(){
     return <div>${s.name}</div>
   }`
   await fs.writeFile(path.join(screensDir, name+".generated.tsx"), content);
 }

 console.log("Generated screens");
}
