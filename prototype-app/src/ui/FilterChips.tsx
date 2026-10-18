import Smooth from './Smooth';
import {Icon} from './index';

// Native ChipsField13573:66271: padding8/12, gap8, label14/20, trailing20.
export default function FilterChips({items,onRemove}:any){
 if(!items.length)return null;
 return <Smooth.div className="filter-chips" aria-label="Применённые условия отбора">{items.map((item:any)=><Smooth.div className="filter-chip" key={item.id}><Smooth.span>{item.label}</Smooth.span><Smooth.button type="button" aria-label={'Снять условие «'+item.label+'»'} data-tooltip={'Снять только условие «'+item.label+'»'} onClick={()=>onRemove(item.id)}><Icon name="close" size={20}/></Smooth.button></Smooth.div>)}</Smooth.div>;
}
