# MyHives Database Models - Class Diagram

## Mermaid Class Diagram

```mermaid
classDiagram
    class Users {
        -user_id: string (UUID)
        -username: string
        -password_hash: string
        -email: string
        -google_id: string
        -linkedin_id: string
        -created_at: Date
        -updated_at: Date
        -roles_association: Roles[]
    }

    class Roles {
        -role_id: number (autoIncrement)
        -role_name: string
        -description: string
        -users: Users[]
    }

    class UserRoles {
        -user_id: string (FK)
        -role_id: number (FK)
        -createdAt: Date
    }

    class Locations {
        -location_id: string (UUID)
        -user_id: string (FK)
        -name: string
        -address: string
        -latitude: string
        -longitude: string
        -country: string
        -notes: string
        -created_at: Date
        -updated_at: Date
    }

    class Hives {
        -hive_id: string (UUID)
        -location_id: string (FK)
        -hive_name: string
        -description: string
        -is_active: boolean
        -created_at: Date
        -updated_at: Date
    }

    class Major_inspections {
        -major_inspection_id: string (UUID)
        -location_id: string (FK)
        -inspection_date: string
        -general_notes: string
        -created_at: Date
        -updated_at: Date
    }

    class Hive_inspections {
        -hive_inspection_id: string (UUID)
        -major_inspection_id: string (FK)
        -hive_id: string (FK)
        -inspection_time: string
        -colony_health_status_id: number
        -num_chambers: number
        -brood_frames_count: number
        -brood_percentage: number
        -queen_status_id: number
        -approx_honey_weight_kg: number
        -drone_comb_frames_count: number
        -drone_comb_percentage: number
        -sugar_feed_added: boolean
        -sugar_feed_quantity_kg: number
        -brood_chambers_count: number
        -supers_count: number
        -queen_excluder_present: boolean
        -num_varroa_mites_found: number
        -varroa_treatment_id: number
        -varroa_treatment_dosage: string
        -raising_new_queen: boolean
        -queen_cell_age_days: number
        -queen_cell_status_id: number
        -other_notes: string
        -created_at: Date
        -updated_at: Date
    }

    class Colony_health_statuses {
        -status_id: number (autoIncrement)
        -status_name: string
    }

    class Queen_statuses {
        -status_id: number (autoIncrement)
        -status_name: string
    }

    class Queen_cell_statuses {
        -status_id: number (autoIncrement)
        -status_name: string
    }

    class Varroa_treatments {
        -treatment_id: number (autoIncrement)
        -treatment_name: string
    }

    %% Relationships
    Users "1" --> "*" Locations : owns
    Users "1" --> "*" UserRoles : has
    Roles "1" --> "*" UserRoles : assigned_to
    
    Locations "1" --> "*" Hives : contains
    Locations "1" --> "*" Major_inspections : has
    
    Hives "1" --> "*" Hive_inspections : inspected_in
    Major_inspections "1" --> "*" Hive_inspections : includes
    
    Hive_inspections "many" --> "1" Colony_health_statuses : references
    Hive_inspections "many" --> "1" Queen_statuses : references
    Hive_inspections "many" --> "1" Queen_cell_statuses : references
    Hive_inspections "many" --> "1" Varroa_treatments : references
```

## Entity Relationship Summary

### Core Entities
1. **Users** - Beekeepers/system users with authentication
2. **Locations** - Apiaries or locations owned by users
3. **Hives** - Individual hives within locations
4. **Major_inspections** - Scheduled inspections at a location
5. **Hive_inspections** - Detailed inspection records for individual hives

### Lookup/Reference Tables
- **Roles** - User roles (admin, beekeeper, etc.)
- **UserRoles** - Junction table for many-to-many user-to-role relationship
- **Colony_health_statuses** - Status values for colony health
- **Queen_statuses** - Status values for queen condition
- **Queen_cell_statuses** - Status values for queen cells
- **Varroa_treatments** - Types of varroa mite treatments

### Key Relationships
- **Users 1:N Locations** - One user owns multiple locations
- **Users M:N Roles** - Multiple users can have multiple roles (via UserRoles)
- **Locations 1:N Hives** - One location contains multiple hives
- **Locations 1:N Major_inspections** - One location has multiple inspections
- **Major_inspections 1:N Hive_inspections** - One major inspection includes multiple hive inspections
- **Hives 1:N Hive_inspections** - One hive has multiple inspection records
- **Hive_inspections M:1 Reference Tables** - Each hive inspection references status/treatment types
