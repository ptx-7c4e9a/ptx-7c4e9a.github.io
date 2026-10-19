import svg from '../../public/assets/figma/loader-imgLoader128RotateArcsPulseCenterInCode.svg?raw';
import Smooth from './Smooth';

// Keep the native five arcs and their original geometry. Each rotates around
// the same fixed center at its own speed; the central brand dot does not rotate.
const periods=[1400,2200,3100,4800,3700];
let arc=0;
const rings=svg.replace(/<path /g,()=>{const i=arc++;return `<path class="loader-ring" style="animation-duration:${periods[i]}ms;animation-direction:${i%2?'reverse':'normal'}" `;});
export default function RingLoader(){return <Smooth.span className="loader-rings" aria-hidden="true" dangerouslySetInnerHTML={{__html:rings}}/>;}
