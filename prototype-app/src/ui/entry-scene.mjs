import loadingLines from '../data/loading-line-geometry.json' with {type:'json'};
// C124/C126: local presentation revisions; Figma keyframes remain source data.
const angle=25*Math.PI/180,c=Math.cos(angle),s=Math.sin(angle);
export const loadingMatrix=[c,s,s,-c,720-c*720-s*450,450-s*720+c*450];
export function loadingPoint(x,y){const [a,b,c,d,e,f]=loadingMatrix;return {x:a*x+c*y+e,y:b*x+d*y+f};}
export function fadeCenters(seconds){
 // Continuous loops, no whole-layer disappearance; each hole passes along a route.
 const phase=seconds*Math.PI*2/32;
 return {a:27+24*Math.sin(phase),b:64+24*Math.sin(phase+Math.PI),
  c:74-24*Math.sin(phase),d:26-24*Math.sin(phase+Math.PI),
  y:31+8*Math.sin(phase*.5),z:80+6*Math.sin(phase*.5+Math.PI),
  u:30+24*Math.sin(phase),v:68+24*Math.sin(phase+Math.PI),
  w:74-24*Math.sin(phase),x:26-24*Math.sin(phase+Math.PI)};
}

// Extend the native curve tangents beyond the viewport without stretching it.
export function loadingTrajectoryBox(index){const line=loadingLines[index],sx=line.imageWidth/line.nativeWidth,sy=1140/line.nativeHeight;return {left:line.imageX-250*sx,top:-120-480*sy,width:600*sx,height:(line.nativeHeight+960)*sy,center:(250+line.nativeWidth/2)/600*100,offset:480/(line.nativeHeight+960)*100,scale:line.nativeHeight/(line.nativeHeight+960),endpoints:[line.start,line.end].map(([x,y])=>loadingPoint(line.imageX+x*sx,-120+y*sy))};}
export function loadingTrajectoryStyle(index){const {left,top,width,height,center,offset,scale}=loadingTrajectoryBox(index);return {left,top,width,height,'--trajectory-center':center+'%','--fade-origin':offset+'%','--fade-scale':scale};}
