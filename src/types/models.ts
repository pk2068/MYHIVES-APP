// src/types/models.ts

// Basic types for common fields
export interface BaseModel {
    //user_id: string; // Assuming UUIDs for IDs
    createdAt: Date;
    updatedAt: Date;
  }
  
  // User Model
  export interface User extends BaseModel {
    user_id : string; // UUID for user_id    
    googleId?: string | null;
    linkedinId?: string | null;
    username?: string | null;
    email: string;
    password_hash?: string | null; // Hashed password
  }
  
  // Location Model
  export interface Location extends BaseModel {
    user_id: string; // Foreign key to User
    name: string;
    address: string;
    latitude: number;
    longitude: number;
    description?: string | null;
  }
  
  // MajorInspection Model
  export interface MajorInspection extends BaseModel {
    location_id: string;
    inspectionDate: Date; // Date only, but TS Date type is fine
    generalNotes?: string | null;
  }
  
  // HiveInspection Model
  // Using Enums for predefined statuses
  export enum ColonyHealthStatus {
    Thriving = 'thriving',
    Weak = 'weak',
    Failing = 'failing',
  }
  
  export enum QueenStatus {
    Seen = 'seen',
    NotSeen = 'not_seen',
    LayingWell = 'laying_well',
    QueenCellsPresent = 'queen_cells_present',
  }
  
  export enum TreatmentApplied {
    FormicAcid = 'Formic acid',
    OxalicAcid = 'Oxalic acid',
    None = 'None',
  }
  
  export enum QueenCellStatus {
    Open = 'open',
    Closed = 'closed',
  }
  
  export interface BeehiveConfiguration {
    broodChambers: number;
    supers: number;
    queenExcluder: boolean;
  }
  
  export interface HiveInspection extends BaseModel {
    majorInspectionId: string;
    hiveNumber: string; // Identifier for the specific hive (e.g., "Hive A", "Hive 1")
    inspectionHour: string; // e.g., "10:30"
    colonyHealthStatus: ColonyHealthStatus;
    numberOfChambers: number;
    amountOfBrood: string; // e.g., "5 frames", "60%"
    queenStatus: QueenStatus;
    approximateAmountOfHoney: string; // e.g., "10 lbs", "3 frames"
    amountOfDroneComb: string; // e.g., "1 frame", "10%"
    sugarFeedAdded: boolean;
    sugarFeedQuantity?: string | null; // e.g., "1 gallon"
    beehiveConfiguration: BeehiveConfiguration;
    numberOfVarroaMitesFound: number;
    varroaTreatment: boolean;
    treatmentApplied?: TreatmentApplied | null;
    dosageAmount?: string | null;
    raisingNewQueen: boolean;
    queenCellAge?: number | null; // in days
    queenCellStatus?: QueenCellStatus | null;
    otherNotes?: string | null;
  }