import Smooth from './Smooth';
import {useContext,useEffect,useLayoutEffect,useRef,useState} from 'react';
import {usePopoverPresent} from './PopoverSurface';
import PopoverSurface from './PopoverSurface';
import {createPortal} from 'react-dom';
import {AppThemeContext} from './ThemeTransition';
import {Icon,IconButton} from './index';

// Popover M / List Plain: 12px padding, 8px ListItem radius, no scrim.
export default function ActionPopover({anchor,items,onClose,placement='bottom',title='',label='Действия',keepOpen=false,className=''}:any){const ref=useRef<HTMLDivElement>(null),theme=useContext(AppThemeContext),present=usePopoverPresent(),sidebar=placement==='sidebar';const [position,setPosition]=useState<any>(null);
 useLayoutEffect(()=>{
  const surface=ref.current;if(!surface)return;
  let r=anchor.getBoundingClientRect();const width=surface.offsetWidth,height=surface.offsetHeight;
  if(sidebar){
   // Keep the native indicator rail and its flyout in the same visible nav range.
   const nav=anchor.closest('nav'),bottom=Math.min(innerHeight-16,nav?.getBoundingClientRect().bottom??innerHeight-16),spill=r.bottom+height-bottom;
   if(nav&&spill>0){nav.scrollTop+=spill;r=anchor.getBoundingClientRect();}
  }
  const left=sidebar?r.right:r.right-width,top=sidebar?r.bottom:placement==='top'?r.top-height-8:r.bottom+8+height<=innerHeight-16?r.bottom+8:r.top-height-8;
  setPosition({left:Math.max(16,Math.min(left,innerWidth-width-16)),top:Math.max(16,Math.min(top,innerHeight-height-16))});
 },[anchor,sidebar,placement,items.length]);
 useEffect(()=>{if(!present||!position)return;const first=ref.current?.querySelector<HTMLButtonElement>('[role^=menuitem]');first?.focus();const outside=(e:PointerEvent)=>{if(!ref.current?.contains(e.target as Node)&&!anchor.contains(e.target))onClose();};const key=(e:KeyboardEvent)=>{if(e.key==='Escape'){e.preventDefault();e.stopPropagation();onClose();anchor.focus();}else if(e.key==='Tab'){onClose();anchor.focus();}else if(['ArrowDown','ArrowUp','Home','End'].includes(e.key)){e.preventDefault();const buttons=Array.from(ref.current?.querySelectorAll<HTMLButtonElement>('[role^=menuitem]')||[]),index=buttons.indexOf(document.activeElement as HTMLButtonElement);buttons[e.key==='Home'?0:e.key==='End'?buttons.length-1:(index+(e.key==='ArrowDown'?1:-1)+buttons.length)%buttons.length]?.focus();}};document.addEventListener('pointerdown',outside);document.addEventListener('keydown',key);const anchorTop=anchor.getBoundingClientRect().top;const scroll=()=>{if(sidebar&&Math.abs(anchor.getBoundingClientRect().top-anchorTop)>1)onClose();};document.addEventListener('scroll',scroll,true);window.addEventListener('resize',onClose);return()=>{document.removeEventListener('pointerdown',outside);document.removeEventListener('keydown',key);document.removeEventListener('scroll',scroll,true);window.removeEventListener('resize',onClose);};},[present,!!position]);
 return createPortal(<PopoverSurface ref={ref} role="menu" data-theme={theme} aria-label={title||label} className={`action-popover ${sidebar?'sidebar-flyout':''} ${className}`} style={{...position,visibility:position?'visible':'hidden',transformOrigin:sidebar?'left top':placement==='top'?'right bottom':'right top'}}>{title&&<Smooth.header><Smooth.b>{title}</Smooth.b><IconButton name="close" label="Закрыть меню" onClick={()=>{onClose();anchor.focus();}}/></Smooth.header>}{items.map((item:any)=><Smooth.button role={typeof item.checked==='boolean'?'menuitemcheckbox':'menuitem'} aria-checked={typeof item.checked==='boolean'?item.checked:undefined} aria-current={item.selected?'page':undefined} className={item.selected?'selected':''} data-tooltip={item.tooltip} key={item.id} onClick={e=>{if(!keepOpen)onClose();item.onClick(e);}}>{typeof item.checked==='boolean'&&<Smooth.span className="menu-checkmark" data-checked={item.checked} aria-hidden="true">{item.checked&&<Icon name="check" size={20}/>}</Smooth.span>}{item.icon&&!sidebar&&<Icon name={item.icon} size={20}/>}<Smooth.span>{item.label}</Smooth.span></Smooth.button>)}</PopoverSurface>,document.body);
}
