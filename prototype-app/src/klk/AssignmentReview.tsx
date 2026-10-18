import Smooth from '../ui/Smooth';
import {DetailRow,Empty} from '../ui';

export default function AssignmentReview({state,taskIds}:any){
 return <Smooth.div className="assignment-review">{state.tasks.filter((task:any)=>taskIds.includes(task.id)).map((task:any)=>{
  const rows=state.assignments.filter((assignment:any)=>assignment.selectedTaskIds.includes(task.id)).flatMap((assignment:any)=>assignment.resourceRows);
  return <Smooth.section className="assignment-review-task" key={task.id}>
   <h3>{task.number} · {task.title}</h3>
   {rows.length?rows.map((row:any,index:number)=><Smooth.div className="assignment-review-resource" key={index}>
    {rows.length>1&&<h4 className="assignment-resource-label">Ресурс {index+1}</h4>}<dl>
    <DetailRow label="Транспорт">{state.vehicles.find((vehicle:any)=>vehicle.id===row.vehicleId)?.plate||'ТС не найдено в реестре'}</DetailRow>
    <DetailRow label={row.driverIds.length>1?'Водители':'Водитель'}>{row.driverIds.map((id:string)=>state.drivers.find((driver:any)=>driver.id===id)?.name||'Водитель не найден в реестре').join(', ')}</DetailRow>
    <DetailRow label="Путевой лист">{row.waybill?.number||'Не указан'}</DetailRow>
   </dl></Smooth.div>):<Empty text="Состав назначения не указан" description="Задание отмечено как назначенное, но сведения о транспорте и водителе отсутствуют."/>}
  </Smooth.section>;
 })}</Smooth.div>;
}
