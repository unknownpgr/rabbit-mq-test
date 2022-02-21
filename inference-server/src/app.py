import pika
import time
import json

# Initialize RabbitMQ connection
# RabbitMq initialization takes few seconds.
# Therefore, waiting is required.
while True:
    try:
        time.sleep(1)
        connection = pika.BlockingConnection(pika.ConnectionParameters('rabbitmq'))
        break
    except:
        pass

def callback(ch, method, properties, body):

    json_body = json.loads(body)
    q = json_body['q']
    try:
        a = json_body['a']
        b = json_body['b']
        # Suppose that we do some cpu-bound, time-consuming task.
        time.sleep(10)
        response = str(int(a)+int(b))
    except:
        response ='err'

    channel.queue_declare(q)
    channel.basic_publish(exchange='', routing_key=q, body=response)


channel = connection.channel()
channel.queue_declare(queue='send-queue')
channel.basic_consume(queue='send-queue', on_message_callback=callback, auto_ack=True)
channel.start_consuming()
