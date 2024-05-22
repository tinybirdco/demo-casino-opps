import click
import time
import json
import random
import faker

from datetime import datetime
from confluent_kafka import Producer
import socket



@click.command()
@click.option('--topic', help ='the kafka topic. ecomm_ux_demo by default', default='demo_casino')
@click.option('--sample', type=int, default=10_000)
@click.option('--sleep', type=float, default=1)
@click.option('--mps', help='number of messages per sleep (by default 200, and as by default sleep is 1, 200 messages/s',type=int, default=200)
@click.option('--repeat', type=int, default=1)
@click.option('--bootstrap-servers', default='pkc-l6wr6.europe-west2.gcp.confluent.cloud:9092')
@click.option('--security_protocol', default='SASL_SSL')
@click.option('--sasl_mechanism', default='PLAIN')
@click.option('--sasl_plain_username', default='KEY')
@click.option('--sasl_plain_password', default='SECRET')
@click.option('--utc', help='UTC datetime for tmstmp by default', type=bool, default=True)
@click.option('--bcp', is_flag=True, default=False)
def produce(topic,
            sample,
            sleep,
            mps,
            repeat,
            bootstrap_servers,
            security_protocol,
            sasl_mechanism,
            sasl_plain_username,
            sasl_plain_password,
            utc,
            bcp):
  
  conf = {
    'bootstrap.servers': bootstrap_servers,
    'client.id': socket.gethostname(),
    'security.protocol': security_protocol,
    'sasl.mechanism': sasl_mechanism,
    'sasl.username': sasl_plain_username,
    'sasl.password': sasl_plain_password,
    'compression.type': 'lz4'
    }

  producer = Producer(conf)
  fake = faker.Faker()

  onqueue = -1
  t = time.time()
  for _ in range(repeat):
    
    for i in range(sample):
      message = {
        'bet_id': random.randint(0,10000),
        'bet_amount': random.randint(5,100),
        'created_at_ts': datetime.strftime(datetime.utcnow() if utc else datetime.now(),'%Y-%m-%d %H:%M:%S'),
        'game_id': random.randint(1,5),
        'user_id': random.randint(1,100)
      }

      msg=json.dumps(message).encode('utf-8')

      # print(message)   
      producer.produce(topic, value=msg)

      onqueue += 1
      while onqueue >= mps:
        before_onqueue = onqueue
        time.sleep(sleep)
        onqueue = producer.flush(2)
        sent = before_onqueue - onqueue
        dt = time.time() - t
        print(f"Uploading rate: {int(sent/dt)} messsages/second. {i} of {sample}")
        t = time.time()

    if sleep:
      producer.flush()
      time.sleep(sleep)
      print(f'{sample} sent! {_+1} of {repeat} - {datetime.now()}')
    producer.flush()

if __name__ == '__main__':
    produce()
