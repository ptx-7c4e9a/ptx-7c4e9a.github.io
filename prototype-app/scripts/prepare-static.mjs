import {readFile,writeFile,mkdir,readdir,stat} from 'node:fs/promises';
import {resolve,join,relative,sep} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';

// Routes implemented by App and Klk. EKTP sections are states within /ektp.
export const staticRoutes=Object.freeze([
 '/', '/ektp', '/ektp/error', '/rationale/ektp', '/rationale/klk', '/rationale/klk/1', '/rationale/klk/2',
 ...['1','2'].flatMap(variant=>[
  `/klk/${variant}`,
  ...['home','requests','vehicles','drivers','terminals','models','classification','error','requests/load-error'].map(section=>`/klk/${variant}/${section}`),
 ]),
]);

export async function prepareStaticSite(directory){
 const html=await readFile(join(directory,'index.html'),'utf8');
 const entries=[...html.matchAll(/(?:src|href)=["']([^"']+)["']/g)].map(match=>match[1]);
 const bundled=entries.filter(url=>/\.(?:js|css)(?:[?#]|$)/.test(url));
 if(!bundled.length||bundled.some(url=>!url.startsWith('/assets/')))throw new Error('Static entry assets must use /assets/ for the approved root-domain target.');
 for(const url of bundled)await stat(join(directory,url.split(/[?#]/)[0]));
 for(const route of staticRoutes.filter(route=>route!='/')){
  const folder=join(directory,route);
  await mkdir(folder,{recursive:true});
  await writeFile(join(folder,'index.html'),html);
 }
 // GitHub serves this document with status 404 for unknown URLs; known routes have their own index.
 await writeFile(join(directory,'404.html'),html);
 await writeFile(join(directory,'.nojekyll'),'');
 const files=[];
 async function visit(folder){
  for(const entry of await readdir(folder,{withFileTypes:true})){
   const path=join(folder,entry.name);
   if(entry.isDirectory())await visit(path);
   else if(entry.isFile()){
    const bytes=await readFile(path);
    files.push({path:relative(directory,path).split(sep).join('/'),bytes:bytes.length,sha256:createHash('sha256').update(bytes).digest('hex')});
   }else throw new Error('Candidate contains an unsupported filesystem entry.');
  }
 }
 await visit(directory);files.sort((a,b)=>a.path.localeCompare(b.path,'en'));
 return {formatVersion:1,target:'https://ptx-7c4e9a.github.io/',base:'/',routes:staticRoutes,files,totalBytes:files.reduce((sum,file)=>sum+file.bytes,0),contentSha256:createHash('sha256').update(JSON.stringify(files)).digest('hex')};
}

if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const app=resolve(fileURLToPath(new URL('..',import.meta.url)));
 const manifest=await prepareStaticSite(join(app,'dist'));
 const evidence=join(app,'.local','release-candidate');await mkdir(evidence,{recursive:true});
 await writeFile(join(evidence,'manifest.json'),JSON.stringify(manifest,null,2)+'\n');
 console.log(JSON.stringify({routes:manifest.routes.length,files:manifest.files.length,totalBytes:manifest.totalBytes,contentSha256:manifest.contentSha256,manifest:'.local/release-candidate/manifest.json',published:false}));
}
