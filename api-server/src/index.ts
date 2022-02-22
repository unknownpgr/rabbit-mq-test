import amqp, { Channel, Connection } from "amqplib";
import express from "express";
import uuid from "uuid";

async function wait(sec: number = 1) {
  return new Promise((resolve) => setTimeout(resolve, sec));
}

async function consume(channel: Channel, queue: string) {
  return new Promise((resolve, reject) => {
    try {
      channel.consume(queue, (msg) => resolve(msg.content.toString()));
    } catch (e) {
      reject(e);
    }
  });
}

async function main() {
  let connection: Connection;
  while (true) {
    try {
      await wait();
      connection = await amqp.connect("amqp://rabbitmq");
      break;
    } catch {}
  }

  const sendQueue = "send-queue";

  const app = express();

  app.get("/", async (req, res) => {
    const channel: Channel = await connection.createChannel();
    await channel.assertQueue(sendQueue, { durable: false });
    const receiveQueue: string = uuid.v4();
    const msg = JSON.stringify({
      a: req.query.a,
      b: req.query.b,
      q: receiveQueue,
    });
    console.log(msg);
    channel.sendToQueue(sendQueue, Buffer.from(msg));
    await channel.assertQueue(receiveQueue, { durable: false });
    const result = await consume(channel, receiveQueue);
    res.send(result);
  });

  app.listen(80, () => console.log("start server"));
}

main();
