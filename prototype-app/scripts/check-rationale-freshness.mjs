import {readdir,readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {join,relative,resolve} from 'node:path';

export const appRoot=fileURLToPath(new URL('..',import.meta.url));
const sha=bytes=>createHash('sha256').update(bytes).digest('hex');
export const sourceHash=bytes=>sha(bytes.toString('utf8').replace(/\r\n/g,'\n'));
export async function interfaceFingerprint(){
 const files=[];
 async function visit(dir){for(const item of await readdir(dir,{withFileTypes:true})){
  const path=join(dir,item.name),key=relative(appRoot,path).replaceAll('\\','/');
  if(key==='public/assets/rationale')continue;
  if(item.isDirectory())await visit(path);
  else if(!/^rationale[^/]*\.json$/i.test(item.name)){const bytes=await readFile(path);files.push([key,key.startsWith('src/')?sourceHash(bytes):sha(bytes)]);}
 }}
 await visit(join(appRoot,'src'));await visit(join(appRoot,'public'));files.sort((a,b)=>a[0].localeCompare(b[0],'en'));
 return sha(JSON.stringify(files));
}
export async function checkRationaleFreshness(){
 const manifest=JSON.parse(await readFile(join(appRoot,'source-evidence/rationale-current.json'),'utf8'));
 const errors=[];
 if(manifest.interfaceSha256!==await interfaceFingerprint())errors.push('Интерфейс изменился после проверки обоснований. Сверьте затронутые иллюстрации и сценарии в CUA; обновите evidence.');
 let illustrations=0;
 for(const kind of ['ektp','ektp-2','klk','klk-2']){
  const bytes=await readFile(join(appRoot,`src/data/rationale-${kind}.json`));
  if(sourceHash(bytes)!==manifest.readers[kind])errors.push(`Текст обоснования ${kind} изменён после проверки.`);
  for(const section of JSON.parse(bytes).sections)for(const image of section.illustrations??[]){
   illustrations++;
   const proof=manifest.images[image.src];
   if(!proof||!proof.visuallyReviewed||proof.sha256!==sha(await readFile(join(appRoot,'public',image.src))))errors.push(`Нет актуального просмотренного снимка: ${image.src}`);
   if(proof&&(proof.width!==image.width||proof.height!==image.height))errors.push(`Неверный размер снимка: ${image.src}`);
  }
 }
 if(errors.length)throw new Error(errors.join('\n'));
 return {readers:4,illustrations,reviewedAt:manifest.reviewedAt,scope:'Local reader freshness; not publication or complete product acceptance'};
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url))console.log(JSON.stringify(await checkRationaleFreshness(),null,2));
