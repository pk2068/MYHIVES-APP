import { LocationControllerCreateInputDTO, LocationControllerUpdateInputDTO } from '../../../controllers/dto/location-controller.dto.js'; //'../../../src/controlcontroller/location-controller-create-input.dto';
import { LocationServiceCreateDTO, LocationServiceUpdateDTO } from '../../../services/dto/location-service.dto.js';

export class LocationControllerToServiceMapper {
  // Helper to parse numbers safely
  private static parseNumber(value: any): number | null {
    const parsed = Number(value);
    return isNaN(parsed) ? null : parsed;
  }

  // Map controller input DTO to service input DTO
  static toServiceCreateDTO(controllerDTO: LocationControllerCreateInputDTO, userId: string): LocationServiceCreateDTO {
    return {
      user_id: userId,
      name: controllerDTO.name,
      address: controllerDTO.address,
      latitude: controllerDTO.latitude?.toString(),
      longitude: controllerDTO.longitude?.toString(),
      country: controllerDTO.country,
      notes: controllerDTO.notes,
    };
  }

  static toServiceUpdateDTO(controllerDTO: LocationControllerUpdateInputDTO, userId: string): LocationServiceUpdateDTO {
    return {
      name: controllerDTO.name,
      address: controllerDTO.address,
      latitude: controllerDTO.latitude?.toString(),
      longitude: controllerDTO.longitude?.toString(),
      country: controllerDTO.country,
      notes: controllerDTO.notes,
    };
  }
}
