import { Sequelize } from 'sequelize';
import { ILocationRepository } from '../interfaces/i-location-repository.js';
import { Locations } from '../../database/models-ts/locations.js'; // Assuming model is imported like this
import { LocationServiceCreateDTO, LocationServiceUpdateDTO, LocationServiceRetrievedDTO } from '../../services/dto/location-service.dto.js';

export class LocationRepository implements ILocationRepository {
  private readonly db: Sequelize; // Dependency for Sequelize instance (for transactions)

  constructor(db: Sequelize) {
    this.db = db;
  }

  async create(location: LocationServiceCreateDTO): Promise<LocationServiceRetrievedDTO> {
    const newLocation = await Locations.create(location);
    return newLocation.toJSON() as LocationServiceRetrievedDTO;
  }

  async findById(id: string): Promise<LocationServiceRetrievedDTO | null> {
    const location = await Locations.findByPk(id);
    return location ? (location.toJSON() as LocationServiceRetrievedDTO) : null;
  }

  async findAllByUserId(userId: string): Promise<LocationServiceRetrievedDTO[]> {
    const allLocations = await Locations.findAll({ where: { user_id: userId } });
    return allLocations.map((location) => location.toJSON() as LocationServiceRetrievedDTO);
  }

  async update(id: string, location: LocationServiceUpdateDTO): Promise<[number, LocationServiceRetrievedDTO[]]> {
    // We use the managed transaction pattern for safety, guaranteeing rollback if necessary.
    return this.db.transaction(async (t) => {
      const [updatedCount, updatedLocations] = await Locations.update(location, {
        where: { location_id: id },
        returning: true,
        transaction: t, // Pass the transaction object
      });

      if (updatedCount > 1) {
        // Safety mechanism: If more than one row was somehow affected, trigger rollback.
        throw new Error('Concurrency failure: More than one location record updated.');
      }

      // If successful, commit automatically.
      return [updatedCount, updatedLocations.map((loc) => loc.toJSON() as LocationServiceRetrievedDTO)];
    });
  }

  async delete(id: string): Promise<number> {
    return Locations.destroy({ where: { location_id: id } });
  }
}
