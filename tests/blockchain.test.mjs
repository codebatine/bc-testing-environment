import { describe, it, expect, beforeEach } from 'vitest';
import Block from '../models/Block.mjs';
import Blockchain from '../models/Blockchain.mjs';
import { createHash } from '../utilities/crypto-lib.mjs';

const BLOCK_DATA = ['Block 1', 'Blockk 2', 'BLock 3'];

const addBlocks = (blockchain, data) => {
  data.forEach((item) => blockchain.addBlock({ data: item }));
};

const invalidateHash = (blockchain, index) => {
  blockchain.chain[index].hash = 'dummy-hash';
};

describe('Blockchain', () => {
  let blockchain, blockchain2, originalChain;

  beforeEach(() => {
    blockchain = new Blockchain();
    blockchain2 = new Blockchain();
    originalChain = blockchain.chain;
  });

  it('should have a property named "chain"', () => {
    expect(blockchain).toHaveProperty('chain');
  });

  it('should have a property "chain" of type Array', () => {
    expect(blockchain.chain).toBeInstanceOf(Array);
  });

  it('should have the genesis block as the first block in the chain', () => {
    expect(blockchain.chain.at(0)).toEqual(Block.genesis);
  });

  it('should add a new block to the chain', () => {
    const data = 'demo block';
    blockchain.addBlock({ data: data });

    expect(blockchain.chain.at(-1).data).toEqual(data);
  });

  describe('Validate chain', () => {
    describe('when the chain does not start with the correct genesis block', () => {
      it('should return false', () => {
        blockchain.chain[0] = { data: 'faulty genesis' };
        expect(Blockchain.validateChain(blockchain.chain)).toBe(false);
      });
    });

    describe('when the chain starts with a correct genesis block and has multiple blocks', () => {
      beforeEach(() => {
        addBlocks(blockchain, BLOCK_DATA);
      });

      describe('and one of the blocks lastHash has changed', () => {
        it('should return false', () => {
          blockchain.chain[1].lastHash = 'weird-hash';
          expect(Blockchain.validateChain(blockchain.chain)).toBe(false);
        });
      });

      describe('and the chain contains a block with invalid data', () => {
        it('should return false', () => {
          blockchain.chain[2].data = 'FAULTY INFO';
          expect(Blockchain.validateChain(blockchain.chain)).toBe(false);
        });
      });

      describe('and the chain contains a block with a jumped difficulty jump', () => {
        it('should return false', () => {
          const lastBlock = blockchain.chain.at(-1);
          const lastHash = lastBlock.hash;
          const timestamp = Date.now();
          const nonce = 0;
          const data = [];
          const difficulty = lastBlock.difficulty - 4;
          const hash = createHash(timestamp, lastHash, difficulty, nonce, data);

          const block = new Block({
            timestamp,
            lastHash,
            hash,
            nonce,
            difficulty,
            data,
          });

          blockchain.chain.push(block);

          expect(Blockchain.validateChain(blockchain.chain)).toBe(false);
        });
      });

      describe('and the chain is valid', () => {
        it('should return true', () => {
          expect(Blockchain.validateChain(blockchain.chain)).toBe(true);
        });
      });
    });
  });

  describe('Replace chain', () => {
    describe('when the new chain is shorter', () => {
      it('should not replace the chain', () => {
        blockchain2.chain[0] = { info: 'chain' };
        blockchain.replaceChain(blockchain2.chain);

        expect(blockchain.chain).toEqual(originalChain);
      });
    });

    describe('when the new chain is longer', () => {
      beforeEach(() => {
        addBlocks(blockchain2, BLOCK_DATA);
      });

      describe('and the chain is invalid', () => {
        it('should not replace the chain', () => {
          invalidateHash(blockchain2, 1);
          blockchain.replaceChain(blockchain2.chain);

          expect(blockchain.chain).toEqual(originalChain);
        });
      });

      describe('and the chain is valid', () => {
        it('should replace the chain', () => {
          blockchain.replaceChain(blockchain2.chain);
          expect(blockchain.chain).toBe(blockchain2.chain);
        });
      });
    });
  });
});
