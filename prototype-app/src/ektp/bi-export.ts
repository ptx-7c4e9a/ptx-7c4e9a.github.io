import {csvText} from './bi-data.mjs';

export function exportBiRows(rows:any[],columns:any[],name:string){
 const url=URL.createObjectURL(new Blob([csvText(rows,columns)],{type:'text/csv;charset=utf-8'}));
 const link=document.createElement('a');link.href=url;link.download=name;link.click();
 setTimeout(()=>URL.revokeObjectURL(url),1000);
}
