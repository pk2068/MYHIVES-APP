import { Users } from './users.js';
import { Locations } from './locations.js';
import { Major_inspections } from './major-inspections.js';
import { Hives } from './hives.js';
import { Hive_inspections } from './hive-inspections.js';
import { Roles } from './roles.js';
import { UserRoles } from './user-roles.js';
import { Varroa_treatments } from './varroa-treatments.js';
import { Colony_health_statuses } from './colony-health-statuses.js';
import { Queen_cell_statuses } from './queen-cell-statuses.js';
import { Queen_statuses } from './queen-statuses.js';

export function associateModels() {
  // --- User to Roles (Many-to-Many) ---
  Users.belongsToMany(Roles, {
    through: UserRoles,
    foreignKey: 'user_id',
    otherKey: 'role_id',
    as: 'roles_association', // This alias will be used in your eager loading
  });

  Roles.belongsToMany(Users, {
    through: UserRoles,
    foreignKey: 'role_id',
    otherKey: 'user_id',
    as: 'users',
  });

  // User to Location (one-to-many)
  Users.hasMany(Locations, {
    foreignKey: 'user_id',
    as: 'locations',
  });
  Locations.belongsTo(Users, {
    foreignKey: 'user_id',
    as: 'user',
  });

  // Location to MajorInspection (one-to-many)
  Locations.hasMany(Major_inspections, {
    foreignKey: 'location_id',
    as: 'locations_majorInspections',
  });
  Major_inspections.belongsTo(Locations, {
    foreignKey: 'location_id',
    as: 'majorInspection_location',
  });

  // Location to Hives (one-to-many)
  Locations.hasMany(Hives, {
    foreignKey: 'location_id',
    as: 'locations_hives',
  });
  Hives.belongsTo(Locations, {
    foreignKey: 'location_id',
    as: 'hives_location',
  });

  // MajorInspection to HiveInspection (one-to-many)
  Major_inspections.hasMany(Hive_inspections, {
    foreignKey: 'major_inspection_id',
    as: 'majors_hiveInspections',
  });
  Hive_inspections.belongsTo(Major_inspections, {
    foreignKey: 'major_inspection_id',
    as: 'hiveInspections_majorInspection',
  });

  // Hive to HiveInspection (one-to-many)
  Hives.hasMany(Hive_inspections, {
    foreignKey: 'hive_id',
    as: 'hives_hiveInspections',
  });

  Hive_inspections.belongsTo(Hives, {
    foreignKey: 'hive_id',
    as: 'hiveInspections_hive',
  });

  // Varroa Treatments
  Varroa_treatments.hasMany(Hive_inspections, {
    foreignKey: 'varroa_treatment_id',
    as: 'inspections',
  });
  Hive_inspections.belongsTo(Varroa_treatments, {
    foreignKey: 'varroa_treatment_id',
    as: 'varroa_treatment',
  });

  // Queen Statuses
  Queen_statuses.hasMany(Hive_inspections, {
    foreignKey: 'queen_status_id',
    as: 'inspections',
  });
  Hive_inspections.belongsTo(Queen_statuses, {
    foreignKey: 'queen_status_id',
    as: 'queen_status',
  });

  // Queen Cell Statuses
  Queen_cell_statuses.hasMany(Hive_inspections, {
    foreignKey: 'queen_cell_status_id',
    as: 'inspections',
  });
  Hive_inspections.belongsTo(Queen_cell_statuses, {
    foreignKey: 'queen_cell_status_id',
    as: 'queen_cell_status',
  });

  // Colony Health Statuses
  Colony_health_statuses.hasMany(Hive_inspections, {
    foreignKey: 'colony_health_status_id',
    as: 'inspections',
  });
  Hive_inspections.belongsTo(Colony_health_statuses, {
    foreignKey: 'colony_health_status_id',
    as: 'colony_health_status',
  });
}
