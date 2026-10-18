import ThemeImage from './ThemeImage';
import optical from '../data/optical-scale.json';
export function transportType(v:any){const t=v.vehicleType||v.type||v.model||'';if(/полуприцеп|тягач|Урал/i.test(t))return 'fuel-tanker-semi-trailer';if(/вахтов|автобус|4208/i.test(t))return 'crew-bus';if(/фургон|Sprinter|Соболь|ГАЗ/i.test(t))return 'service-van';if(/Борт|43253/i.test(t))return 'flatbed-truck';return 'fuel-tanker-truck';}
export function transportImage(v:any,view='card',theme='light'){return `/assets/transport/transport-${transportType(v)}-${view}-${theme}.png`;}
export function transportScale(v:any,view='card'){return optical.assets.find(a=>a.type===transportType(v)&&a.view===view)?.scale||1;}
export function Transport({vehicle,theme='light',className='',alt=''}:any){return <ThemeImage className={className} light={transportImage(vehicle,'card','light')} dark={transportImage(vehicle,'card','dark')} alt={alt} imageStyle={{transform:`scale(${transportScale(vehicle)})`}}/>;}

// Reserve the full rotation envelope of the native alpha silhouette, plus8px.
export function transportLabelOffset(v:any){const item=optical.assets.find(a=>a.type===transportType(v)&&a.view==='map');if(!item)return 88;const [w,h]=item.size,[x0,y0,x1,y1]=item.bbox;const radius=Math.max(...[[x0,y0],[x0,y1],[x1,y0],[x1,y1]].map(([x,y])=>Math.hypot((x/w-.5)*64,(y/h-.5)*64)))*item.scale;return Math.ceil(32+radius+8);}
