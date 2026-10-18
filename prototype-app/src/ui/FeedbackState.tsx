import Smooth from './Smooth';
import {Button} from './index';
export default function FeedbackState({kind='info',title,description,action,onAction}:any){return <Smooth.div className="feedback-state"><Smooth.img className="feedback-art" src={'/assets/figma/feedback-'+kind+'.png'} alt=""/><Smooth.div className="empty-copy"><h3>{title}</h3>{description&&<p>{description}</p>}</Smooth.div>{action&&<Button tone="primary" size="l" onClick={onAction}>{action}</Button>}</Smooth.div>;}
