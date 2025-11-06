import { LocationServiceCreateDTO, LocationServiceUpdateDTO, LocationServiceRetrievedDTO } from '../../services/dto/location-service.dto.js';

/**
 * Interface defining the data access operations for the Location model.
 * All location services will depend on this contract, not a concrete implementation.
 */
export interface ILocationRepository {
  create(location: LocationServiceCreateDTO): Promise<LocationServiceRetrievedDTO>;

  readById(id: string): Promise<LocationServiceRetrievedDTO | null>;

  readAllByUserId(userId: string): Promise<LocationServiceRetrievedDTO[]>;

  update(id: string, location: LocationServiceUpdateDTO): Promise<[number, LocationServiceRetrievedDTO[]]>;

  delete(id: string): Promise<number>;
}
