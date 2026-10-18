import {loadingAsset} from './loading-assets';
import Smooth from './Smooth';
// Native Loader M, 320:3629: 6/4/2px circles at x=7/14/19 in a 24px slot.
export default function Loader(){return <Smooth.span className="native-dots" aria-hidden="true">{[6,4,2].map((size,i)=><Smooth.span key={size} className={'loading-dot dot-'+i} style={{width:size,height:size,left:[7,14,19][i],maskImage:`url("${loadingAsset(`loader-dot-${size}.svg`)}")`}}><Smooth.img src={loadingAsset('loader-dot-'+size+'.svg')} alt=""/></Smooth.span>)}</Smooth.span>;}
