// Bundle the original Figma SVGs with the loading UI: entry transitions must
// not depend on a second wave of requests to public assets after submission.
const sources=import.meta.glob('../../public/assets/figma/loader-*.svg',{eager:true,query:'?raw',import:'default'}) as Record<string,string>;
const bundled=new Map(Object.entries(sources).map(([path,svg])=>[
 path.slice(path.lastIndexOf('/')+1),`data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
]));
export function loadingAsset(filename:string){
 const source=bundled.get(filename);
 if(!source)throw new Error(`Loading SVG is not bundled: ${filename}`);
 return source;
}
