import {useSyncExternalStore} from 'react';
const subscribe=(fn:()=>void)=>{window.addEventListener('popstate',fn);return()=>window.removeEventListener('popstate',fn);};
// Static hosts redirect directory entry points to a trailing slash.
export const usePath=()=>useSyncExternalStore(subscribe,()=>window.location.pathname.replace(/\/+$/,'')||'/');
export function go(path:string){if(path===window.location.pathname)return;window.history.pushState({},'',path);window.dispatchEvent(new PopStateEvent('popstate'));}
