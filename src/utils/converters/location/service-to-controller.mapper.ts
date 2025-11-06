import { LocationServiceRetrievedDTO } from '../../../services/dto/location-service.dto.js';
import { LocationControllerOutputDTO, LocationControllerListOutputDTO } from '../../../controllers/dto/location-controller.dto.js';

export class LocationServiceToControllerMapper {
  private static parseNumber(value: string | number | undefined): number | undefined {
    if (value === undefined || value === null) return undefined;
    const n = typeof value === 'string' ? parseFloat(value) : value;
    return Number.isNaN(Number(n)) ? undefined : Number(n);
  }

  // Map service retrieved DTO to controller output DTO
  static toControllerOutputDTO(serviceDTO: LocationServiceRetrievedDTO, msq: string, success: boolean = true): LocationControllerOutputDTO {
    return {
      success: success,
      message: msq,
      location: {
        id: serviceDTO.location_id ?? '',
        userId: serviceDTO.user_id,
        name: serviceDTO.name,
        address: serviceDTO.address,
        latitude: this.parseNumber(serviceDTO.latitude),
        longitude: this.parseNumber(serviceDTO.longitude),
        description: serviceDTO.notes,
        createdAt: serviceDTO.created_at ? String(serviceDTO.created_at) : new Date().toISOString(),
        updatedAt: serviceDTO.updated_at ? String(serviceDTO.updated_at) : new Date().toISOString(),
      },
    };
  }

  // Map service list retrieved DTO to controller list output DTO
  static toControllerListOutputDTO(serviceDTOs: LocationServiceRetrievedDTO[], msq: string, success: boolean = true): LocationControllerListOutputDTO {
    return {
      success: success,
      message: msq ?? 'Locations retrieved successfully!',
      locations: serviceDTOs.map((dto) => this.toControllerOutputDTO(dto, msq, success).location),
    };
  }
}
