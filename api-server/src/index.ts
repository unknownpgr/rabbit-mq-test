import * as amqp from "amqplib";
import * as Koa from "koa";
import router from "./router";

async function wait(sec: number = 1) {
  return new Promise((resolve) => setTimeout(resolve, sec));
}

async function main() {
  let connection: amqp.Connection;
  while (true) {
    try {
      await wait();
      connection = await amqp.connect("amqp://rabbitmq");
      break;
    } catch {}
  }

  const sendQueue = "send-queue";

  const app = new Koa();
  app.use(async (ctx, next) => {
    ctx.connection = connection;
    ctx.sendQueue = sendQueue;
    await next();
  });
  app.use(router.routes());
  app.use(router.allowedMethods());

  app.listen(80, () => console.log("start server"));
}

main();
