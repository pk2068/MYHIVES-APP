// DTO for creating a Location

export interface CreateLocationDto {
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  description?: string | null; // Optional
}
// You can add more DTOs here as your API grows
// DTO for updating a Location (all fields optional)

export interface UpdateLocationDto {
  name?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  description?: string | null;
}
