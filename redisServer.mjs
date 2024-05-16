import redis from 'redis';

const CHANNELS = {
  DEMO: 'SATOSHI',
  BLOCKCHAIN: 'BLOCKCHAIN',
};

export default class RedisServer {
  constructor({ blockchain }) {
    this.blockchain = blockchain;

    this.publisher = redis.createClient();
    this.subscriber = redis.createClient();

    this.loadChannels();

    this.subscriber.on('message', (channel, message) =>
      this.messageHandler(channel, message),
    );
  }

  broadcast() {
    this.publish({
      channel: CHANNELS.BLOCKCHAIN,
      message: JSON.stringify(this.blockchain.chain),
    });
  }

  loadChannels() {
    Object.values(CHANNELS).forEach((channel) =>
      this.subscriber.subscribe(channel),
    );
  }

  messageHandler(channel, message) {
    const msg = JSON.parse(message);

    if (channel === CHANNELS.BLOCKCHAIN) {
      console.log('REPLACE IS IN PROGRESS', msg);
      this.blockchain.replaceChain(msg);
    }
  }

  publish({ channel, message }) {
    this.publisher.publish(channel, message);
  }
}
