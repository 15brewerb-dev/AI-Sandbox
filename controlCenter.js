const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = 3000;

function readJSON(file) {
  return JSON.parse(fs.readFileSync(path.join(__dirname, file), "utf8"));
}

function getState() {
  return {
    agents: readJSON("control/agents.json"),
    tasks: readJSON("control/tasks.json"),
    updatedAt: new Date().toISOString()
  };
}

function page() {
  return `<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<title>AI Sandbox Command Center</title>
<style>
  *{box-sizing:border-box} body{margin:0;background:#0b1020;color:#eef2ff;font-family:Arial,sans-serif}
  header{padding:22px 28px;border-bottom:1px solid #25304d;background:#11182b;position:sticky;top:0}
  h1{margin:0 0 6px;font-size:24px}.muted{color:#98a5c3;font-size:13px}
  main{padding:24px;max-width:1500px;margin:auto}.goal{background:#151e35;border:1px solid #2d3c61;border-radius:14px;padding:18px;margin-bottom:22px}
  .progress{height:12px;background:#202b47;border-radius:8px;overflow:hidden;margin-top:10px}.bar{height:100%;background:#7aa2ff}
  h2{font-size:18px;margin:26px 0 12px}.agents{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:12px}
  .agent,.task{background:#121a2e;border:1px solid #293655;border-radius:12px;padding:14px}
  .agent.active{border-color:#3f6b5d}.agent.planned{opacity:.7}.tag{display:inline-block;padding:4px 7px;border-radius:20px;background:#202b47;font-size:11px;margin:3px 3px 0 0}
  .boards{display:grid;grid-template-columns:repeat(4,minmax(220px,1fr));gap:14px;align-items:start}
  .column{background:#0f1628;border:1px solid #24304d;border-radius:14px;padding:12px;min-height:240px}.column h3{margin:4px 4px 12px;font-size:14px;text-transform:uppercase;letter-spacing:.08em;color:#9fb0d1}
  .task{margin-bottom:10px}.task h4{margin:0 0 8px;font-size:15px}.small{font-size:12px;line-height:1.45;color:#b7c2da}.money{color:#a8e6b5}
  @media(max-width:950px){.boards{grid-template-columns:1fr 1fr}} @media(max-width:600px){.boards{grid-template-columns:1fr}}
</style>
</head>
<body>
<header><h1>AI Sandbox Command Center</h1><div class="muted">Visual control layer — auto-refreshes every 5 seconds</div></header>
<main><div id="app">Loading…</div></main>
<script>
async function render(){
  const r = await fetch("/api/state");
  const s = await r.json();
  const goal=s.tasks.goal, tasks=s.tasks.tasks, agents=s.agents.agents;
  const pct=Math.min(100,Math.round((goal.current/goal.target)*100)||0);
  const statuses=["inbox","working","review","done"];
  const label={inbox:"Inbox",working:"Working",review:"Review",done:"Done"};
  document.getElementById("app").innerHTML=
    '<section class="goal"><b>Primary goal:</b> '+goal.name+
    '<div class="muted">'+goal.primaryMetric+': '+goal.current+' / '+goal.target+'</div>'+
    '<div class="progress"><div class="bar" style="width:'+pct+'%"></div></div></section>'+
    '<h2>Agents</h2><section class="agents">'+agents.map(a=>
      '<div class="agent '+a.status+'"><b>'+a.name+'</b><div class="muted">'+a.department+' · '+a.status+'</div>'+
      '<p class="small">'+a.role+'</p><div>'+a.abilities.map(x=>'<span class="tag">'+x+'</span>').join('')+'</div>'+
      '<p class="small"><b>Success:</b> '+a.successMetric+'</p></div>').join('')+'</section>'+
    '<h2>Task Flow</h2><section class="boards">'+statuses.map(st=>
      '<div class="column"><h3>'+label[st]+'</h3>'+
      tasks.filter(t=>t.status===st).map(t=>
        '<div class="task"><h4>'+t.id+' — '+t.title+'</h4><div class="small"><b>Owner:</b> '+t.owner+
        '<br><b>Experiment:</b> '+t.experiment+
        '<br><b>Next:</b> '+t.nextAction+
        '<br><b>Success:</b> '+t.successCondition+
        '<br><span class="money"><b>Cost limit:</b> $'+t.costLimitUsd+'</span></div></div>').join('')+
      '</div>').join('')+'</section>'+
    '<p class="muted" style="margin-top:20px">State loaded '+new Date(s.updatedAt).toLocaleString()+'</p>';
}
render(); setInterval(render,5000);
</script>
</body></html>`;
}

const server = http.createServer((req,res)=>{
  if(req.url==="/api/state"){
    res.writeHead(200,{"Content-Type":"application/json"});
    return res.end(JSON.stringify(getState()));
  }
  res.writeHead(200,{"Content-Type":"text/html; charset=utf-8"});
  res.end(page());
});

server.listen(PORT,()=> {
  console.log("\nAI Sandbox Command Center is running.");
  console.log("Open this in Chrome: http://localhost:"+PORT+"\n");
});
