import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,mkdir,writeFile,readFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join,resolve,dirname,basename} from 'node:path';
import {prepareStaticSite,staticRoutes} from '../scripts/prepare-static.mjs';

async function cleanTestDirectory(dir){
 const target=resolve(dir);
 assert.equal(dirname(target),resolve(tmpdir()));
 assert.ok(basename(target).startsWith('proto-static-'));
 await rm(target,{recursive:true,force:true});
}

test('every implemented direct route has a static document with root-resolved assets and reproducible hashes',async()=>{
 const dir=await mkdtemp(join(tmpdir(),'proto-static-'));
 try{
  await mkdir(join(dir,'assets'));
  await writeFile(join(dir,'assets','entry.js'),'export{}');
  const html='<html><script type="module" src="/assets/entry.js"></script></html>';
  await writeFile(join(dir,'index.html'),html);
  const first=await prepareStaticSite(dir),second=await prepareStaticSite(dir);
  assert.equal(first.contentSha256,second.contentSha256);
  assert.equal(new Set(staticRoutes).size,staticRoutes.length);
  for(const route of staticRoutes){
   const doc=await readFile(join(dir,route,'index.html'),'utf8');
   assert.equal(doc,html);
   assert.equal(new URL('/assets/entry.js','https://ptx-7c4e9a.github.io'+route+'/').pathname,'/assets/entry.js');
  }
  assert.equal(await readFile(join(dir,'404.html'),'utf8'),html);
  assert.ok(first.files.some(file=>file.path==='.nojekyll'));
  assert.ok(!first.files.some(file=>file.path.endsWith('manifest.json')));
 }finally{await cleanTestDirectory(dir);}
});

test('candidate preparation rejects relative or missing entry resources',async()=>{
 const dir=await mkdtemp(join(tmpdir(),'proto-static-invalid-'));
 try{
  await writeFile(join(dir,'index.html'),'<script src="./assets/entry.js"></script>');
  await assert.rejects(prepareStaticSite(dir),/must use \/assets\//);
  await writeFile(join(dir,'index.html'),'<script src="/assets/missing.js"></script>');
  await assert.rejects(prepareStaticSite(dir),{code:'ENOENT'});
 }finally{await cleanTestDirectory(dir);}
});
