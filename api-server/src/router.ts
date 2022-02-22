import * as Router from "koa-router";
import * as amqp from "amqplib";
import * as uuid from "uuid";

interface ICustomState {}

interface ICustomContext {
  connection: amqp.Connection;
  sendQueue: string;
}

const router = new Router<ICustomState, ICustomContext>();

async function consume(channel: amqp.Channel, queue: string) {
  return new Promise((resolve, reject) => {
    try {
      channel.consume(queue, (msg) => resolve(msg.content.toString()));
    } catch (e) {
      console.log("Retry...");
      reject(e);
    }
  });
}

router.get("/", async (ctx) => {
  const { connection, sendQueue } = ctx;
  const channel: amqp.Channel = await connection.createChannel();
  await channel.assertQueue(sendQueue, { durable: false });
  const receiveQueue: string = uuid.v4();
  const msg = JSON.stringify({
    a: ctx.query.a,
    b: ctx.query.b,
    q: receiveQueue,
  });
  console.log(msg);
  channel.sendToQueue(sendQueue, Buffer.from(msg));
  await channel.assertQueue(receiveQueue, { durable: false });
  const result = await consume(channel, receiveQueue);
  ctx.body = result;
});

export default router;
