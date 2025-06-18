import { BeehiveConfiguration, ColonyHealthStatus, QueenCellStatus, QueenStatus, TreatmentApplied } from "./models";

// DTO for user registration (excluding fields like ID, timestamps, OAuth IDs)
export interface RegisterUserDto {
  username: string;
  email: string;
  password: string; // Password is required for direct registration
}

// DTO for user update (all fields optional)
export interface UpdateUserDto {
  username?: string;
  email?: string;
  password?: string;
}

// DTO for user login
export interface LoginUserDto {
  email: string;
  password: string;
}

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
// export interface RegisterUserDto { /* ... */ }

export interface CreateMajorInspectionDto { // <-- ADD THIS NEW INTERFACE
  locationId: string;
  inspectionDate: string; // Or Date if you prefer handling Date objects directly in body, but string is common for 'YYYY-MM-DD'
  generalNotes?: string | null;
}

// DTO for updating a Major Inspection
export interface UpdateMajorInspectionDto {
  locationId?: string; // Can be updated if needed, but usually fixed
  inspectionDate?: string;
  generalNotes?: string | null;
}

// DTO for creating a Hive Inspection
export interface CreateHiveInspectionDto {
  majorInspectionId: string; // The major inspection this hive inspection belongs to (comes from body/param)
  hiveNumber: string;
  inspectionHour: string; // E.g., "10:30"
  colonyHealthStatus: ColonyHealthStatus;
  numberOfChambers: number;
  amountOfBrood: string;
  queenStatus: QueenStatus;
  approximateAmountOfHoney: string;
  amountOfDroneComb: string;
  sugarFeedAdded: boolean;
  sugarFeedQuantity?: string | null;
  beehiveConfiguration: BeehiveConfiguration; // Should be sent as a JSON object
  numberOfVarroaMitesFound: number;
  varroaTreatment: boolean;
  treatmentApplied?: TreatmentApplied | null;
  dosageAmount?: string | null;
  raisingNewQueen: boolean;
  queenCellAge?: number | null;
  queenCellStatus?: QueenCellStatus | null;
  otherNotes?: string | null;
}

// DTO for updating a Hive Inspection (all fields optional)
export interface UpdateHiveInspectionDto {
  hiveNumber?: string;
  inspectionHour?: string;
  colonyHealthStatus?: ColonyHealthStatus;
  numberOfChambers?: number;
  amountOfBrood?: string;
  queenStatus?: QueenStatus;
  approximateAmountOfHoney?: string;
  amountOfDroneComb?: string;
  sugarFeedAdded?: boolean;
  sugarFeedQuantity?: string | null;
  beehiveConfiguration?: BeehiveConfiguration;
  numberOfVarroaMitesFound?: number;
  varroaTreatment?: boolean;
  treatmentApplied?: TreatmentApplied | null;
  dosageAmount?: string | null;
  raisingNewQueen?: boolean;
  queenCellAge?: number | null;
  queenCellStatus?: QueenCellStatus | null;
  otherNotes?: string | null;
}
// etc.