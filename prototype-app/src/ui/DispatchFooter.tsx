import Smooth from './Smooth';
import {Icon} from './index';

export const dispatchContacts={
 name:'Центральная Диспетчерская Служба',
 phone:'+7 (499) 517-70-17',
 phoneHref:'tel:+74995177017',
 email:'cds@rosneft.ru',
};

export function DispatchContacts({heading=false}: {heading?:boolean}={}){
 const Name=heading?'h2':Smooth.span;
 return <>
  <Name className="dispatch-name">{dispatchContacts.name}</Name>
  <Smooth.a className="dispatch-contact" href={dispatchContacts.phoneHref} data-typography="literal"><Icon name="ui.dispatchPhoneS" size={20}/>{dispatchContacts.phone}</Smooth.a>
  <Smooth.a className="dispatch-contact" href={'mailto:'+dispatchContacts.email} data-typography="literal"><Icon name="ui.dispatchLetterS" size={20}/>{dispatchContacts.email}</Smooth.a>
 </>;
}

export default function DispatchFooter({className='',copyright=false,heading=false}:any){
 return <Smooth.footer className={`dispatch-footer ${className}`}><DispatchContacts heading={heading}/>{copyright&&<small className="dispatch-copyright">Все права защищены.</small>}</Smooth.footer>;
}
