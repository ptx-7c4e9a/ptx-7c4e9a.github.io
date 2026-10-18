// Read-only illustrative document metadata; not production identifiers or files.
export function vehicleDocuments(vehicle){
 const suffix=String(vehicle.id).replace(/\D/g,'').padStart(6,'0');
 return [{name:'Свидетельство о регистрации ТС',number:'СТС-ДЕМО-'+suffix,issued:'01.09.2025',valid:'Бессрочно'},{name:'Полис ОСАГО',number:'ОСАГО-ДЕМО-'+suffix,issued:'01.09.2026',valid:'31.08.2027'},{name:'Диагностическая карта',number:'ТО-ДЕМО-'+suffix,issued:'01.09.2026',valid:'31.08.2027'}];
}
