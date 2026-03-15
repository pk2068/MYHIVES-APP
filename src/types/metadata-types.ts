export interface LookupItem {
  id: number; // Optional for creation
  name: string;
}

// The structure for fetching all data
export interface AllMetadata {
  varroa_treatments: LookupItem[];
  queen_statuses: LookupItem[];
  queen_cell_statuses: LookupItem[];
  colony_health_statuses: LookupItem[];
}

//  For adding to a specific category
export type MetadataCategory = keyof AllMetadata;

// Type X: For creating full initial state
export type FullMetadataDTO = AllMetadata;
