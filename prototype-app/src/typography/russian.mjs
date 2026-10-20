const nbsp='\u00a0',joiner='\u2060';
const shortWords='а|да|или|что|как|чем|в|во|и|к|ко|о|об|обо|от|по|с|со|у|на|не|ни|но|до|за|из|без|для|над|под|при|про|вне|через|между|перед|после';
const leadingWord=new RegExp(`(?<![\\p{L}\\p{N}/])(${shortWords})[ \\t]+(?=[\\p{L}\\p{N}«„(]|$)`,'giu');
const unit='(?:км|см|мм|м[²³]?|л|кг|мг|г|т|ч|мин|сек|с|бар|Па|кПа|МПа|В|Вт|кВт|Гц|%|₽|руб\\.|°[CСF])';
const measuredNumber=new RegExp(`(\\d)[ \\t]+(?=${unit}(?![\\p{L}\\p{N}]))`,'gu');
const compoundUnit=/(?<![\p{L}\p{N}])(?:км\/[чс]|м[²³]?\/[чс]|л\/(?:ч|мин)|об\/мин)(?![\p{L}\p{N}])/gu;

// Display copy only. Do not pass source records, form values or exports here.
export function russianText(value){
 if(typeof value!=='string')return value;
 // Technical addresses remain byte-for-byte intact, even inside Russian copy.
 return value.split(/((?:https?:\/\/|www\.)[^\s]+|[\w.+-]+@[\w.-]+\.[a-z]{2,})/giu).map((part,index)=>{
  if(index%2)return part;
  return part.replace(leadingWord,`$1${nbsp}`)
   .replace(/([\p{L}\p{N}»”])[ \t]+(бы|же|ли)(?!\p{L})/giu,`$1${nbsp}$2`)
   .replace(measuredNumber,`$1${nbsp}`)
   .replace(/(\d{1,2})[ \t]+(?=(?:января|февраля|марта|апреля|мая|июня|июля|августа|сентября|октября|ноября|декабря)(?!\p{L}))/giu,`$1${nbsp}`)
   .replace(/(\d)[ \t]+(?=\d{3}(?:\D|$))/gu,`$1${nbsp}`)
   .replace(/([№§])[ \t]*(?=\d)/gu,`$1${nbsp}`)
   .replace(/([А-ЯЁ]\.)(?:[ \t]+)(?=[А-ЯЁ])/gu,`$1${nbsp}`)
   .replace(/[ \t]+—(?=[ \t])/gu,`${nbsp}—`)
   .replace(compoundUnit,match=>match.replace('/',`${joiner}/${joiner}`));
 }).join('');
}

// Merge adjacent primitive children before formatting: {speed} + ' км/ч'.
export function russianChildren(children){
 if(typeof children==='string')return russianText(children);
 if(!Array.isArray(children))return children;
 const result=[];let run=[];
 const flush=()=>{if(run.length){result.push(run.length===1?typeof run[0]==='string'?russianText(run[0]):run[0]:russianText(run.join('')));run=[];}};
 for(const child of children){if(typeof child==='string'||typeof child==='number')run.push(child);else{flush();result.push(russianChildren(child));}}
 flush();return result;
}

const literalTags=new Set(['input','textarea','option','pre','code','script','style']);
export function typographicProps(type,props){
 const tag=typeof type==='string'?type:type===Symbol.for('react.fragment')?'fragment':type?.elementTag;
 if(!tag||literalTags.has(tag)||props?.contentEditable||props?.['data-typography']==='literal'||props?.children===undefined)return props;
 const children=russianChildren(props.children);
 return children===props.children?props:{...props,children};
}
