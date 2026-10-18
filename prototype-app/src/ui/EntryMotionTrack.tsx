import {useMemo} from 'react';
import {Track as SourceTrack} from './MotionTrack';
// User revision C103/C104: strengthen entry backgrounds; keep source timing/paths.
export function Track({track,...rest}:any){const boosted=useMemo(()=>{const gain=(v:number)=>Math.min(1,v*1.8),opacity=track.animate?.opacity;return {...track,initial:{...track.initial,...(typeof track.initial?.opacity==='number'?{opacity:gain(track.initial.opacity)}:{})},style:{...track.style,...(typeof track.style?.opacity==='number'?{opacity:gain(track.style.opacity)}:{})},animate:{...track.animate,...(Array.isArray(opacity)?{opacity:opacity.map(gain)}:typeof opacity==='number'?{opacity:gain(opacity)}:{})}};},[track]);return <SourceTrack track={boosted} {...rest}/>;}
export {MotionViewport} from './MotionTrack';
