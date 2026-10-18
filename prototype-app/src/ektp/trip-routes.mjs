import data from '../data/trip-route-index.json' with {type:'json'};

// Full trips are independent of the selected-period history and current-position windows.
export const tripRoutes=new Map(data.vehicles.map(trip=>[trip.vehicleId,trip]));
export function visibleTrips(vehicles,selectedId,routes=tripRoutes){
 return vehicles.filter(v=>!selectedId||v.id===selectedId).map(v=>routes.get(v.id)).filter(Boolean);
}
let pending;
export function loadTripPaths(){
 if(!pending)pending=import('./trip-paths.mjs').then(module=>module.default).catch(error=>{pending=null;throw error;});
 return pending;
}
