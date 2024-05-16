import { createHash } from '../utilities/crypto-lib.mjs';
import Block from './Block.mjs';

export default class Blockchain {
  constructor() {
    this.chain = [Block.genesis];
  }

  addBlock({ data }) {
    const newBlock = Block.mineBlock({
      lastBlock: this.chain.at(-1),
      data: data,
    });
    this.chain.push(newBlock);
    return newBlock;
  }

  replaceChain(chain) {
    console.log('INSIDE REPLACE CHAIN');
    if (chain.length <= this.chain.length) return;
    console.log('BEFORE VALIDATE CHAIN');
    if (!Blockchain.validateChain(chain)) return;
    console.log('AFTER VALIDATE CHAIN');
    this.chain = chain;
  }

  static validateChain(chain) {
    if (JSON.stringify(chain.at(0)) !== JSON.stringify(Block.genesis))
      return false;

    for (let i = 1; i < chain.length; i++) {
      const { timestamp, lastHash, hash, data, nonce, difficulty } =
        chain.at(i);
      const currentLastHash = chain[i - 1].hash;
      const lastDifficulty = chain[i - 1].difficulty;
      if (lastHash !== currentLastHash) return false;
      if (Math.abs(lastDifficulty - difficulty) > 1) return false;
      const validHash = createHash(
        timestamp,
        lastHash,
        data,
        nonce,
        difficulty,
      );
      if (hash !== validHash) return false;
    }

    return true;
  }
}
