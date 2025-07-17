import { users } from './users.js';
import { locations } from './locations.js';
import { major_inspections } from './major_inspections.js';
import { hives } from './hives.js';
import { hive_inspections } from './hive_inspections.js';

export function associateModels() {
  // User to Location (one-to-many)
  users.hasMany(locations, {
    foreignKey: 'user_id',
    as: 'locations',
  });
  locations.belongsTo(users, {
    foreignKey: 'user_id',
    as: 'user',
  });

  // Location to MajorInspection (one-to-many)
  locations.hasMany(major_inspections, {
    foreignKey: 'location_id',
    as: 'locations_majorInspections',
  });
  major_inspections.belongsTo(locations, {
    foreignKey: 'location_id',
    as: 'majorInspection_location',
  });

  // Location to Hives (one-to-many)
  locations.hasMany(hives, {
    foreignKey: 'location_id',
    as: 'locations_hives',
  });
  hives.belongsTo(locations, {
    foreignKey: 'location_id',
    as: 'hives_location',
  });

  // MajorInspection to HiveInspection (one-to-many)
  major_inspections.hasMany(hive_inspections, {
    foreignKey: 'major_inspection_id',
    as: 'majors_hiveInspections',
  });
  hive_inspections.belongsTo(major_inspections, {
    foreignKey: 'major_inspection_id',
    as: 'hiveInspections_majorInspection',
  });

  // Hive to HiveInspection (one-to-many)
  hives.hasMany(hive_inspections, {
    foreignKey: 'hive_id',
    as: 'hives_hiveInspections',
  });

  hive_inspections.belongsTo(hives, {
    foreignKey: 'hive_id',
    as: 'hiveInspections_hive',
  });
}
