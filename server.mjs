import express from 'express';
import Blockchain from './models/Blockchain.mjs';
import blockRouter from './routes/block-routes.mjs';
import blockchainRouter from './routes/blockchain-routes.mjs';
import RedisServer from './redisServer.mjs';

export const blockchain = new Blockchain();
export const redisServer = new RedisServer({ blockchain: blockchain });

const app = express();
app.use(express.json());

const DEFAULT_PORT = 5001;
const ROOT_NODE = `http://localhost:${DEFAULT_PORT}`;

let NODE_PORT;

setTimeout(() => {
  redisServer.broadcast();
}, 1000);

app.use('/blockchain', blockchainRouter);
app.use('/', blockRouter);

const synchronize = async () => {
  const response = await fetch(`${ROOT_NODE}/blockchain`);
  if (response.ok) {
    const result = await response.json();
    console.log('SYNC', result.data);
    blockchain.replaceChain(result.data);
  }
};

if (process.env.GENERATE_NODE_PORT === 'true') {
  NODE_PORT = DEFAULT_PORT + Math.ceil(Math.random() * 1000);
}

const PORT = NODE_PORT || DEFAULT_PORT;

app.listen(PORT, () => {
  console.log(`Server is running on port: ${PORT}`);

  if (PORT !== DEFAULT_PORT) {
    synchronize();
  }
});
