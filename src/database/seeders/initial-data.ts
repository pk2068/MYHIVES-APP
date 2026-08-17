// filepath: database/seeders/initial-data.ts
import { Roles } from '../models-ts/roles.js';
import { Colony_health_statuses } from '../models-ts/colony-health-statuses.js';
import { Queen_statuses } from '../models-ts/queen-statuses.js';
import { Queen_cell_statuses } from '../models-ts/queen-cell-statuses.js';
import { Varroa_treatments } from '../models-ts/varroa-treatments.js';

export const seedInitialData = async () => {
  console.log('🌱 Checking required lookup & system data...');

  // 1. Seed Roles
  const rolesCount = await Roles.count();
  if (rolesCount === 0) {
    await Roles.bulkCreate([
      { role_name: 'Admin', description: 'System Administrator with full access' },
      { role_name: 'Beekeeper', description: 'Standard user managing apiaries and hives' },
      { role_name: 'Viewer', description: 'Read-only access to specific apiary data' },
    ]);
    console.log('  └─ Roles seeded.');
  }

  // 2. Seed Colony Health Statuses
  const healthCount = await Colony_health_statuses.count();
  if (healthCount === 0) {
    await Colony_health_statuses.bulkCreate([
      { status_name: 'Thriving', is_active: true },
      { status_name: 'Weak', is_active: true },
      { status_name: 'Failing', is_active: true },
      { status_name: 'Unchanged', is_active: true },
      { status_name: 'Unknown', is_active: true },
    ]);
    console.log('  └─ Colony Health Statuses seeded.');
  }

  // 3. Seed Queen Statuses
  const queenStatusCount = await Queen_statuses.count();
  if (queenStatusCount === 0) {
    await Queen_statuses.bulkCreate([
      { status_name: 'Seen', is_active: true },
      { status_name: 'Not Seen', is_active: true },
      { status_name: 'Laying Well', is_active: true },
      { status_name: 'Queen Cells Present', is_active: true },
      { status_name: 'Superseded', is_active: true },
      { status_name: 'Absent', is_active: true },
      { status_name: 'Virgin', is_active: true },
      { status_name: 'Unknown', is_active: true },
    ]);
    console.log('  └─ Queen Statuses seeded.');
  }

  // 4. Seed Queen Cell Statuses
  const queenCellCount = await Queen_cell_statuses.count();
  if (queenCellCount === 0) {
    await Queen_cell_statuses.bulkCreate([
      { status_name: 'Open', is_active: true },
      { status_name: 'Closed', is_active: true },
      { status_name: 'Hatched', is_active: true },
      { status_name: 'Destroyed', is_active: true },
      { status_name: 'Emerging', is_active: true },
      { status_name: 'Unknown', is_active: true },
    ]);
    console.log('  └─ Queen Cell Statuses seeded.');
  }

  // 5. Seed Varroa Treatments
  const treatmentCount = await Varroa_treatments.count();
  if (treatmentCount === 0) {
    await Varroa_treatments.bulkCreate([
      { treatment_name: 'Formic Acid', is_active: true },
      { treatment_name: 'Oxalic Acid', is_active: true },
      { treatment_name: 'Apivar', is_active: true },
      { treatment_name: 'Api Life Var', is_active: true },
      { treatment_name: 'Mite Away Quick Strips', is_active: true },
      { treatment_name: 'None', is_active: true },
      { treatment_name: 'Other', is_active: true },
    ]);
    console.log('  └─ Varroa Treatments seeded.');
  }

  console.log('✅ Initial static data check completed.');
};
