import type {CSSProperties} from 'react';
import Smooth from './Smooth';
import {Icon} from './index';
import './rationale.css';

type Node={title:number;body?:number[];label?:number;children?:Node[];tone?:'success'|'info'|'warning'|'alert'};
export type Diagram={start:number;end:number;kind:'hierarchy'|'flow'|'groups'|'feedback';plain?:boolean;root?:Node;nodes:Node[];sourceNode:string};

export default function RationaleDiagram({diagram,text}: {diagram:Diagram;text:{text:string}[]}){
 const node=(item:Node)=>item.tone?<Smooth.section className={'system-alert '+item.tone} aria-label={text[item.title].text}>
  <Icon name={item.tone==='success'?'check':'info'} size={20}/><div className="system-alert-copy"><strong>{text[item.title].text}</strong>{item.body?.map(index=><p key={index}>{text[index].text}</p>)}</div>
 </Smooth.section>:<div className="rationale-node">
  {item.label!==undefined&&<span className="rationale-node-label">{text[item.label].text}</span>}
  <b>{text[item.title].text}</b>
  {item.body?.map(index=><p key={index}>{text[index].text}</p>)}
  {item.children&&<ul className="rationale-subtree">{item.children.map(child=><li key={child.title}>{node(child)}</li>)}</ul>}
 </div>;
 return <figure className={'reader-diagram rationale-'+diagram.kind+(diagram.plain?' rationale-plain':'')} data-source-node={diagram.sourceNode} aria-label={text[diagram.root?.title??diagram.nodes[0].title].text}>
  {diagram.root&&<div className="rationale-tree-root">{node(diagram.root)}</div>}
  {diagram.kind==='flow'?<ol className="rationale-flow-list" style={{'--flow-columns':diagram.nodes.length} as CSSProperties}>{diagram.nodes.map((item,index)=><li key={item.title}>
   {index>0&&<svg className="rationale-connector" viewBox="0 0 24 24" aria-hidden="true"><path d="M2 12h18m-6-6 6 6-6 6"/></svg>}{node(item)}
  </li>)}</ol>:<ul className="rationale-branches">{diagram.nodes.map(item=><li key={item.title}>{node(item)}</li>)}</ul>}
 </figure>;
}
