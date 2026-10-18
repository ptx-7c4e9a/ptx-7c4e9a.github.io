import Smooth from './Smooth';
// Both native assets stay mounted; only opacity changes, so theme switches do not reload their slot.
export default function ThemeImage({light,dark,alt='',className='',imageStyle}:any){return <Smooth.span className={'themed-image '+className}><Smooth.img className="theme-art-light" src={light} alt={alt} style={imageStyle}/><Smooth.img className="theme-art-dark" src={dark} alt="" aria-hidden="true" style={imageStyle}/></Smooth.span>;}
