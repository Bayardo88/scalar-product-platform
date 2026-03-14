
figma.showUI(__html__, { width: 400, height: 500 });

function applyMetadata(node, astNode){
 node.setPluginData("astId", astNode.id || "");
 node.setPluginData("role", astNode.role || "");
}

function applyLayout(frame, layout){
 if(!layout) return;
 if(layout.display==="stack"){
   frame.layoutMode = layout.direction==="horizontal" ? "HORIZONTAL" : "VERTICAL";
 }
 if(layout.gap) frame.itemSpacing = layout.gap;
}

async function createNode(astNode){
 let node;
 if(astNode.type==="Text"){
   await figma.loadFontAsync({family:"Inter", style:"Regular"});
   const t = figma.createText();
   t.characters = astNode.name || "Text";
   node = t;
 } else {
   const f = figma.createFrame();
   f.resize(320,120);
   applyLayout(f, astNode.layout);
   node = f;
 }
 applyMetadata(node, astNode);
 if(astNode.children){
   for(const c of astNode.children){
     const child = await createNode(c);
     node.appendChild(child);
   }
 }
 return node;
}

function dashboardTemplate(){
 return {
   id:"root",
   type:"Region",
   role:"appShell",
   name:"Dashboard",
   layout:{display:"stack",direction:"vertical",gap:24},
   children:[
     {id:"topbar",type:"Region",role:"navigation.topbar",name:"Topbar"},
     {id:"main",type:"Region",role:"content.main",name:"Main",
       children:[
         {id:"chart",type:"Region",role:"chart.analytics",name:"Analytics"},
         {id:"feed",type:"Region",role:"feed.activity",name:"Activity Feed"}
       ]
     }
   ]
 }
}

function parsePrompt(prompt){
 const t = prompt.toLowerCase();
 if(t.includes("dashboard")) return "dashboard";
 return "dashboard";
}

figma.ui.onmessage = async (msg)=>{
 if(msg.type==="generate"){
   const type = parsePrompt(msg.prompt);
   let ast;
   if(type==="dashboard") ast = dashboardTemplate();
   const node = await createNode(ast);
   node.resize(1440,900);
   figma.currentPage.appendChild(node);
 }
}
