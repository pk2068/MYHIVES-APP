import { Users } from '../models-ts/users.js';
import { Locations } from '../models-ts/locations.js';
import { Hives } from '../models-ts/hives.js';

export const setupDummyData = async () => {
  // 1. Preveri, če dummy podatki že obstajajo, da jih ne podvajaš
  const locationCount = await Locations.count();
  if (locationCount > 0) {
    console.log('Dummy data already exists. Skipping...');
    return;
  }

  console.log('Seeding dummy data...');

  // create 2 dummy users
  let user1 = await Users.findOne({ where: { username: 'Jose5' } });
  let user2 = await Users.findOne({ where: { username: 'TonyClark' } });

  if (!user1 || !user2) {
    console.error('Dummy users not found. Please ensure that dummy users are created before running this script.');

    return;
  }

  const joseId = user1.getDataValue('user_id');
  const tonyId = user2.getDataValue('user_id');

  if (!joseId || !tonyId) {
    console.error('User IDs not found for dummy users. Please ensure that dummy users have valid IDs.');
    return;
  }

  //   console.log('User Jose:', user1?.toJSON());
  //   console.log('User Tony:', user2?.toJSON());

  // 2. Vstavi testne lokacije in panje
  // (Predpostavljamo, da uporabnik z ID=1 že obstaja)
  const homeLocation1 = await Locations.create({
    user_id: joseId,
    name: 'Home beeyard',
    address: 'Sladki Vrh 1',
    latitude: '46.69',
    longitude: '15.73',
  });

  const homeLocation2 = await Locations.create({
    user_id: tonyId,
    name: 'Work beeyard',
    address: 'Ljubljanska ulica 5',
    latitude: '46.70',
    longitude: '15.74',
  });

  //   console.log('Created locations:', homeLocation1.toJSON(), homeLocation2.toJSON());

  const hivesCount = await Hives.count();
  if (hivesCount > 0) {
    console.log('Dummy data already exists. Skipping...');
    return;
  }

  const hive1a = await Hives.create({
    location_id: homeLocation1.getDataValue('location_id')!,
    hive_name: 'PANJ-01',
    description: 'This hive belongs to dummyuser1 and is located at Home beeyard.',
  });

  const hive1b = await Hives.create({
    location_id: homeLocation1.getDataValue('location_id')!,
    hive_name: 'PANJ-02',
    description: 'This second hive belongs to dummyuser1 and is located at Home beeyard.',
  });

  const hive2a = await Hives.create({
    location_id: homeLocation2.getDataValue('location_id')!,
    hive_name: 'PANJ-02',
    description: 'This hive belongs to dummyuser2 and is located at Work beeyard.',
  });

  console.log('Dummy data successfully created!');
};
