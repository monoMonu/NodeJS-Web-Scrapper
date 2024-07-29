import dotenv from 'dotenv'
import { MongoClient } from "mongodb";
dotenv.config({ path: '.env'});

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function connect() {
   try {
      await client.connect();
      console.log('Connected to MongoDB');
      return client.db('myDB');
   } catch (error) {
      console.error('Error connecting to MongoDB:', error);
      throw error; 
   }
}

function close() {
   return client.close();
}

export async function storeData(data) {
   const db = await connect();
   const collection = db.collection('data');

   try {
      await collection.insertMany(data);
      console.log('data inserted');
   } catch (error) {
      console.error('Error in Scraper:', error);
   } finally {
      await close();
   }
}

