import {Fragment} from 'react';
import RationaleDiagram from './RationaleDiagram';

export default function RationaleContent({section}:any){
 const copy=(t:any,key:number)=>{const value=t.href?<a className="reader-source-link" href={t.href} target="_blank" rel="noreferrer">{t.text}</a>:t.text;return t.size>=40?<h1 key={key}>{value}</h1>:t.size>=28?<h2 key={key}>{value}</h2>:t.size>=24?<p className="reader-lead" key={key}>{value}</p>:<p key={key}>{value}</p>;};
 return <>{section.text.map((t:any,index:number)=>{
  if(t.text.trimStart().startsWith('Проверяемые источники:'))return null;
  const illustration=section.illustrations?.find((item:any)=>item.before===index);
  const visual=illustration&&<figure className="rationale-illustration" style={{maxWidth:illustration.width}}><a href={illustration.src} target="_blank" rel="noreferrer" aria-label={'Открыть иллюстрацию: '+illustration.alt}><img src={illustration.src} width={illustration.width} height={illustration.height} alt={illustration.alt} loading="lazy"/></a><figcaption>Иллюстрация из макета Figma. <a href={illustration.src} target="_blank" rel="noreferrer">Открыть в полном размере</a></figcaption></figure>;
  const diagram=section.diagrams?.find((item:any)=>item.start===index);
  if(diagram)return <Fragment key={index}>{visual}<RationaleDiagram diagram={diagram} text={section.text}/></Fragment>;
  if(section.diagrams?.some((item:any)=>index>item.start&&index<=item.end))return null;
  const spec=section.tables?.find((table:any)=>table.start===index);
  if(spec){
   const cells=section.text.slice(spec.start,spec.start+spec.columns*(spec.rows+(spec.header?1:0)));
   const headings=spec.header?cells.splice(0,spec.columns):[];
   const rows=Array.from({length:spec.rows},(_,row)=>cells.slice(row*spec.columns,(row+1)*spec.columns));
   return <div key={index} className="rationale-table-scroll" role="region" aria-label={section.name} tabIndex={0}><table>
    {headings.length>0&&<thead><tr>{headings.map((cell:any,col:number)=><th key={col} scope="col">{cell.text}</th>)}</tr></thead>}
    <tbody>{rows.map((row:any[],rowIndex:number)=><tr key={rowIndex}>{row.map((cell:any,col:number)=>col===0?<th scope="row" key={col}>{cell.text}</th>:<td key={col}>{cell.text}</td>)}</tr>)}</tbody>
   </table></div>;
  }
  if(section.tables?.some((table:any)=>index>table.start&&index<table.start+table.columns*(table.rows+(table.header?1:0))))return null;
  return <Fragment key={index}>{visual}{copy(t,index)}</Fragment>;
 })}</>;
}
