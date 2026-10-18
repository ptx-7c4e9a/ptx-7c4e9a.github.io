import data from '../data/trip-routes.json' with {type:'json'};
export default new Map(data.vehicles.map(trip=>[trip.vehicleId,trip]));
