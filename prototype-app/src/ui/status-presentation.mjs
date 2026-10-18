// Shared presentation only: entity values and lifecycle transitions stay in their products.
export const statusLabels={
 NEW:'Новая',ASSIGNED_DEMO:'Ресурсы назначены',Assigned:'Ресурсы назначены',
 Unassigned:'Новая',In_repair:'В ремонте',On_line:'На линии',Ready:'Свободно',
 Available:'Доступно',Online:'На связи',Offline:'Нет связи',REFUSED_DEMO:'Отказано',
 IN_PROGRESS:'В работе',CLOSED:'Закрыта',Refused:'Отказано',REFUSED:'Отказано',
 recent30m:'До 30 мин',between30mAnd24h:'30 мин–24 ч',older24h:'Более 24 ч',never:'Нет данных',
};

const groups={
 success:['В движении','On_line','На линии','Online','На связи','ASSIGNED_DEMO','Assigned','Ресурсы назначены','ТС назначено','Завершена','Завершено','Выполнена','Выполнено','Открыт','Открыта','Действует','Используется','Получен','Есть','recent30m','До 30 мин'],
 info:['Зажигание выключено','NEW','Unassigned','Новая','Новое','Ready','Available','Свободно','Доступно','Подготовлен','Подготовлена','На обработке'],
 warning:['Позиция устарела','In_repair','В ремонте','IN_PROGRESS','В работе','Ожидает ТС','Ожидается','Ожидает назначения','Без назначения','Отложено','Отложена','between30mAnd24h','30 мин–24 ч'],
 danger:['Offline','Нет связи','Refused','REFUSED','REFUSED_DEMO','Отказано','Отменена','Отменено','Ошибка','Просрочен','Просрочена','older24h','Более 24 ч'],
 neutral:['Стоит','CLOSED','Закрыт','Закрыта','Черновик','Не используется','Нет','never','Нет данных'],
};
const tones=new Map(Object.entries(groups).flatMap(([tone,values])=>values.map(value=>[value,tone])));
export function statusTone(value){return tones.get(String(value??'').trim())||'neutral';}
export function statusLabel(value){return statusLabels[value]||value||'—';}
