import { Users } from './users.js';
import { Locations } from './locations.js';
import { Major_inspections } from './major-inspections.js';
import { Hives } from './hives.js';
import { Hive_inspections } from './hive_inspections.js';

export function associateModels() {
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
}
