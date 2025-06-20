import { User } from './User.js';
import { Location } from './Location.js';
import { MajorInspection } from './MajorInspection.js';
import { HiveInspection } from './HiveInspection.js';

export const associateModels = () => {
  // User has many Locations
  User.hasMany(Location, {
    foreignKey: 'userId',
    as: 'locations', // Alias for easy eager loading
    onDelete: 'CASCADE',
  });
  Location.belongsTo(User, {
    foreignKey: 'userId',
    as: 'user',
  });

  // Location has many MajorInspections
  Location.hasMany(MajorInspection, {
    foreignKey: 'locationId',
    as: 'majorInspections',
    onDelete: 'CASCADE',
  });
  MajorInspection.belongsTo(Location, {
    foreignKey: 'locationId',
    as: 'location',
  });

  // MajorInspection has many HiveInspections
  MajorInspection.hasMany(HiveInspection, {
    foreignKey: 'majorInspectionId',
    as: 'hiveInspections',
    onDelete: 'CASCADE',
  });
  HiveInspection.belongsTo(MajorInspection, {
    foreignKey: 'majorInspectionId',
    as: 'majorInspection',
  });

  console.log('Model associations set up.');
};