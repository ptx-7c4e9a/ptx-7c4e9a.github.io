import fs from 'node:fs';
import path from 'node:path';
import net from 'node:net';
import http from 'node:http';
import {spawn,spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';

const appRoot=fs.realpathSync(path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..'));
const runtime=path.join(appRoot,'.local','server');
fs.mkdirSync(runtime,{recursive:true});
const statusFile=path.join(runtime,'status.json');
const logFile=path.join(runtime,'server.log');
const expectedTitle=fs.readFileSync(path.join(appRoot,'index.html'),'utf8').match(/<title>(.*?)<\/title>/)?.[1];
const port=4173;
const pipe=process.platform==='win32'
 ?'\\\\.\\pipe\\proto-local-'+createHash('sha256').update(appRoot.toLowerCase()).digest('hex').slice(0,16)
 :path.join(runtime,'supervisor.sock');
const log=message=>fs.appendFileSync(logFile,`${new Date().toISOString()} ${message}\n`);
const probe=()=>new Promise(resolve=>{
 const request=http.get({host:'127.0.0.1',port,path:'/ektp',timeout:2500,headers:{'Cache-Control':'no-cache'}},response=>{
  let body='';response.setEncoding('utf8');
  response.on('data',part=>{if(body.length<65536)body+=part;});
  response.on('end',()=>resolve({ok:response.statusCode===200&&body.includes(`<title>${expectedTitle}</title>`)&&body.includes('id="root"'),status:response.statusCode}));
  response.on('error',()=>resolve({ok:false,status:null}));
 });
 request.on('timeout',()=>request.destroy());
 request.on('error',()=>resolve({ok:false,status:null}));
});
const portOccupied=()=>new Promise(resolve=>{
 const socket=net.connect({host:'127.0.0.1',port});
 socket.setTimeout(800);
 socket.once('connect',()=>{socket.destroy();resolve(true);});
 socket.once('error',()=>resolve(false));
 socket.once('timeout',()=>{socket.destroy();resolve(true);});
});

if(process.argv.includes('--status')){
 let saved=null;try{saved=JSON.parse(fs.readFileSync(statusFile,'utf8'));}catch{}
 console.log(JSON.stringify({saved,probe:await probe()},null,2));
 process.exit(0);
}

// An OS-owned pipe prevents duplicate supervisors and disappears after a crash.
const lock=net.createServer(socket=>socket.end('Proto local server supervisor\n'));
try{await new Promise((resolve,reject)=>{lock.once('error',reject);lock.listen(pipe,resolve);});}
catch(error){if(error.code==='EADDRINUSE'){console.log('Proto supervisor is already running.');process.exit(0);}throw error;}

let child=null,checking=false,stopping=false,failures=0,starts=0,startedChildAt=0,lastIssue='';
const startedAt=new Date().toISOString();
const state={appRoot,url:'http://localhost:4173/ektp',supervisorPid:process.pid,childPid:null,startedAt,health:'starting',starts:0};
function save(){fs.writeFileSync(statusFile,JSON.stringify({...state,checkedAt:new Date().toISOString()},null,2)+'\n');}
function terminateOwnedChild(){
 const owned=child;if(!owned||owned.exitCode!==null)return;
 // Only the process spawned by this supervisor (and its children) is stopped.
 if(process.platform==='win32')spawnSync('taskkill.exe',['/PID',String(owned.pid),'/T','/F'],{windowsHide:true,stdio:'ignore'});
 else owned.kill('SIGTERM');
}
function start(){
 const vite=path.join(appRoot,'node_modules','vite','bin','vite.js');
 if(!fs.existsSync(vite))throw Error('Vite is missing; restore the project dependencies.');
 const output=fs.openSync(logFile,'a');
 child=spawn(process.execPath,[vite,'--host','127.0.0.1','--port',String(port),'--strictPort'],{
  cwd:appRoot,windowsHide:true,stdio:['ignore',output,output],env:{...process.env,NO_COLOR:'1'},
 });
 fs.closeSync(output);
 const owned=child;
 startedChildAt=Date.now();starts++;failures=0;
 state.childPid=owned.pid;state.starts=starts;state.health='starting';
 log(`Vite started pid=${owned.pid}, start=${starts}`);save();
 owned.on('error',error=>{log(`Vite spawn error: ${error.code||error.message}`);if(child===owned)child=null;});
 owned.on('exit',(code,signal)=>{
  log(`Vite exited pid=${owned.pid}, code=${code}, signal=${signal}`);
  if(child===owned){child=null;state.childPid=null;state.health='restarting';save();}
 });
}
async function check(){
 if(checking||stopping)return;checking=true;
 try{
  const health=await probe();
  if(health.ok){failures=0;lastIssue='';state.health=child?'ready':'existing-prototype';}
  else if(child&&child.exitCode===null){
   state.health='starting';failures++;
   if(failures>=3&&Date.now()-startedChildAt>30000){log('Owned Vite failed consecutive health checks; restarting.');terminateOwnedChild();}
  }else if(!await portOccupied())start();
  else{
   state.health='port-in-use';
   if(lastIssue!=='port-in-use'){log('Port4173 is occupied by an unrecognized service; leaving it untouched.');lastIssue='port-in-use';}
  }
  save();
 }finally{checking=false;}
}
function shutdown(){
 if(stopping)return;stopping=true;clearInterval(interval);terminateOwnedChild();
 state.health='stopped';state.childPid=null;save();lock.close(()=>process.exit(0));
 setTimeout(()=>process.exit(0),2000).unref();
}
process.on('SIGINT',shutdown);process.on('SIGTERM',shutdown);
process.on('uncaughtException',error=>{log(`Supervisor fatal: ${error.message}`);terminateOwnedChild();process.exit(1);});
process.on('unhandledRejection',error=>{log(`Supervisor rejection: ${error?.message||error}`);terminateOwnedChild();process.exit(1);});
log(`Supervisor started pid=${process.pid}, root=${appRoot}`);save();
const interval=setInterval(()=>{void check();},5000);
await check();
