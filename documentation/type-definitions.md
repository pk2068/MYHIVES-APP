# Type Definitions & Interfaces

This document serves as a reference for the Data Transfer Objects (DTOs) and Repository Interfaces used throughout the MyHives application.

## 1. User & Authentication

### DTOs

**Source:** `src/services/dto/user-service.dto.ts`

```typescript
export interface UserCreationDTO {
  username: string;
  email: string;
  password_hash: string;
  google_id?: string;
}

export interface UserUpdateDTO {
  username?: string;
  password_hash?: string;
  google_id?: string;
}

export interface UserRetrievedDTO {
  user_id: string;
  username: string;
  email: string;
  password_hash?: string; // Often excluded in controller responses
  google_id?: string;
  roles?: string[];
  created_at?: Date;
  updated_at?: Date;
}
```

### Repository Interface

**Source:** `src/repositories/interfaces/i-user-repository.ts`

```typescript
export interface IUserRepository {
  create(user: UserCreationDTO): Promise<UserRetrievedDTO>;
  readById(id: string): Promise<UserRetrievedDTO | null>;
  readByEmail(email: string): Promise<UserRetrievedDTO | null>;
  readByGoogleId(googleId: string): Promise<UserRetrievedDTO | null>;
  readAll(): Promise<UserRetrievedDTO[]>;
  update(id: string, user: UserUpdateDTO): Promise<[number, UserRetrievedDTO[]]>;
  delete(id: string): Promise<number>;
  findUserWithRoles(email: string): Promise<UserRetrievedDTO | null>;
}
```

---

## 2. Admin & Roles

### DTOs

**Source:** `src/services/dto/admin-role-service.dto.ts`

```typescript
export interface RoleCreateDTO {
  role_name: string;
  description?: string;
}

export interface RoleRetrievedDTO {
  role_id: number;
  role_name: string;
  description?: string;
}

export interface AdminUserRetrievedDTO {
  user_id: string;
  username: string;
  email: string;
  created_at: Date;
  roles: RoleRetrievedDTO[];
}

export interface UserRoleLinkDTO {
  user_id: string;
  role_id: number;
}

export interface UserRoleRetrievedDTO {
  id: number;
  user_id: string;
  role_id: number;
}
```

### Repository Interface

**Source:** `src/repositories/interfaces/i-admin-repository.ts`

```typescript
export interface IAdminRepository {
  createRole(data: RoleCreateDTO): Promise<RoleRetrievedDTO>;
  findAllRoles(): Promise<RoleRetrievedDTO[]>;
  findAllUsersWithRoles(): Promise<AdminUserRetrievedDTO[]>;
  findUserById(id: string): Promise<AdminUserRetrievedDTO | null>;
  assignRoleToUser(link: UserRoleLinkDTO): Promise<UserRoleRetrievedDTO>;
  removeUserRole(userId: string, roleId: string): Promise<boolean>;
}
```

---

## 3. Locations

### DTOs

**Source:** `src/services/dto/location-service.dto.ts`

```typescript
export interface LocationServiceCreateDTO {
  user_id: string;
  name: string;
  address?: string;
  latitude?: number | string;
  longitude?: number | string;
}

export interface LocationServiceUpdateDTO extends Partial<LocationServiceCreateDTO> {}

export interface LocationServiceRetrievedDTO extends LocationServiceCreateDTO {
  location_id: string;
  created_at: Date;
  updated_at: Date;
}
```

### Repository Interface

**Source:** `src/repositories/interfaces/i-location-repository.ts`

```typescript
export interface ILocationRepository {
  create(location: LocationServiceCreateDTO): Promise<LocationServiceRetrievedDTO>;
  findById(id: string): Promise<LocationServiceRetrievedDTO | null>;
  findAllByUserId(userId: string): Promise<LocationServiceRetrievedDTO[]>;
  update(id: string, location: LocationServiceUpdateDTO): Promise<[number, LocationServiceRetrievedDTO[]]>;
  delete(id: string): Promise<number>;
}
```

---

## 4. Hives

### DTOs

**Source:** `src/services/dto/hive-service.dto.ts`

```typescript
export interface HiveServiceCreateDTO {
  location_id: string;
  name?: string;
  hive_number?: string;
  type?: string;
  description?: string;
  supers_count?: number;
  brood_frames_count?: number;
}

export interface HiveServiceUpdateDTO extends Partial<HiveServiceCreateDTO> {}

export interface HiveServiceRetrievedDTO extends HiveServiceCreateDTO {
  hive_id: string;
  created_at: Date;
  updated_at: Date;
}
```

### Repository Interface

**Source:** `src/repositories/interfaces/i-hive-repository.ts`

```typescript
export interface IHiveRepository {
  create(hive: HiveServiceCreateDTO): Promise<HiveServiceRetrievedDTO>;
  update(id: string, hive: HiveServiceUpdateDTO): Promise<[number, HiveServiceRetrievedDTO[]]>;
  findById(hiveId: string, locationId?: string): Promise<HiveServiceRetrievedDTO | null>;
  findAllByLocationId(locationId: string): Promise<HiveServiceRetrievedDTO[]>;
  delete(hiveId: string, locationId?: string): Promise<number>;
  deleteAll(locationId: string): Promise<number>;
}
```

---

## 5. Inspections (Major & Hive)

### Major Inspection DTOs

**Source:** `src/services/dto/major-inspection-service.dto.ts`

```typescript
export interface MajorInspectionServiceCreateDTO {
  location_id: string;
  inspection_date: Date;
  inspection_type: string;
  description?: string;
}

export interface MajorInspectionServiceUpdateDTO extends Partial<MajorInspectionServiceCreateDTO> {}

export interface MajorInspectionServiceRetrievedDTO extends MajorInspectionServiceCreateDTO {
  major_inspection_id: string;
  created_at: Date;
  updated_at: Date;
}
```

### Hive Inspection DTOs

**Source:** `src/services/dto/hive-inspection-service.dto.ts`

```typescript
export interface HiveInspectionServiceCreateDTO {
  hive_id: string;
  major_inspection_id: string;
  inspection_date?: string | Date;
  colony_health_status_id?: number;
  num_chambers?: number;
  brood_frames_count?: number;
  brood_percentage?: number;
  queen_status_id?: number;
  approx_honey_weight_kg?: number;
  drone_comb_frames_count?: number;
  drone_comb_percentage?: number;
  sugar_feed_added?: boolean;
  sugar_feed_quantity_kg?: number;
  brood_chambers_count?: number;
  supers_count?: number;
  queen_excluder_present?: boolean;
  num_varroa_mites_found?: number;
  varroa_treatment_id?: number;
  varroa_treatment_dosage?: string;
  raising_new_queen?: boolean;
  queen_cell_age_days?: number;
  queen_cell_status_id?: number;
  other_notes?: string;
}

export interface HiveInspectionServiceUpdateDTO extends Partial<HiveInspectionServiceCreateDTO> {}

export interface HiveInspectionServiceRetrievedDTO extends HiveInspectionServiceCreateDTO {
  hive_inspection_id: string;
  inspection_time?: string;
  created_at: Date;
  updated_at: Date;
}
```
