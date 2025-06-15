import { Client } from 'pg';

const client = new Client({
  user: 'postgres',         // replace if different
  host: 'localhost',
  database: 'myhives_db',
  password: 'Cada_2068_new', // replace with your actual password
  port: 5432,
});

async function insertUser(name: string, email: string) {
  try {
    await client.connect();
    console.log('We are connected! :) ');
    const query = 'INSERT INTO users (username, email) VALUES ($1, $2) RETURNING *';
    const values = [name, email];

    const result = await client.query(query, values);
    console.log('Inserted user:', result.rows[0], result);
  } catch (err) {
    console.error('ERROR inserting user: :( ', err);
  } finally {
    await client.end();
    console.log('We are disconnected! :) ');
  }
}

insertUser('johny', 'johny@bravo.com');
