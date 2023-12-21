import * as dotenv from 'dotenv';
import { connect, ConnectOptions, set } from 'mongoose';
dotenv.config();

// CONEXÃO COM O BANCO DE DADOS MONGODB ATLAS
set('strictQuery', true);
const connection = connect(process.env.MONGODB_URI!, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  family: 4,
} as ConnectOptions)
  .then(() => console.log('Connected to MongoDB'))
  .catch((err: Error) => console.error(`Error to connect: ${err}`));

module.exports = connection;
