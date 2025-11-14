import { hivesAttributes } from 'database/models-ts/hives.js';

// these DTO types are used in the HiveRouter files to define the shape of request body data it expects to receive and send out
export type HiveControllerCreateDTO = Omit<hivesAttributes, 'hive_id' | 'location_id' | 'created_at' | 'updated_at'>;
export type HiveControllerUpdateDTO = Partial<HiveControllerCreateDTO>;
export type HiveControllerCreateStrongDTO = Omit<HiveControllerCreateDTO, 'description'> & Required<Pick<HiveControllerCreateDTO, 'description'>>;

// const some: HiveControllerCreateStrongDTO = {
//   hive_name: 'Test Hive',
//   description: 'A test hive description',
//   is_active: true,
// };
