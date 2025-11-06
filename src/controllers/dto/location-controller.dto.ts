// DTOs for the Controller Layer (API input/output)

// Incoming DTO for creating a new location (user_id is implicit from the authenticated user)
export interface LocationControllerCreateInputDTO {
  name: string;
  address?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
  notes?: string;
}

// Incoming DTO for updating an existing location (all fields optional)
export type LocationControllerUpdateInputDTO = Partial<LocationControllerCreateInputDTO>;

// Outgoing DTO for a single location response
export interface LocationControllerOutputDTO {
  success: boolean;
  message: string;
  location: {
    id: string;
    userId: string;
    name: string;
    address?: string;
    country?: string;
    latitude?: number;
    longitude?: number;
    description?: string;
    createdAt: string;
    updatedAt: string;
  };
}

// Outgoing DTO for a list of locations
export interface LocationControllerListOutputDTO {
  success: boolean;
  message: string;
  locations: Array<LocationControllerOutputDTO['location']>;
}
