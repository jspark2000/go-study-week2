#!/usr/bin/env bash

set -ex

# Check requirements: npm
if [ ! $(command -v npm) ]
then
  echo "Error: npm is not installed. Please install npm first."
  exit 1
fi

BASEDIR=$(dirname $(dirname $(realpath $0)))

cd $BASEDIR

# Install pnpm and Node.js packages
npm install -g pnpm@latest
pnpm install

# Enable git auto completion
if ! grep -q "bash-completion/completions/git" ~/.bashrc
then
  echo "source /usr/share/bash-completion/completions/git" >> ~/.bashrc
fi

# Apply database migration
for i in {1..5}
do
  pnpm --filter="nest" exec prisma migrate dev && break # break if migration succeed
  echo -e '\n⚠️ Failed to migrate. Waiting for db to be ready...\n'
  sleep 5
done

# Install Go dependencies
cd $BASEDIR/go
go get

# Check RabbitMQ connection
while ! nc -z "$RABBITMQ_HOST" "$RABBITMQ_PORT"; do sleep 3; done
echo "rabbitmq is up - server running..."

# Make an Exchange
rabbitmqadmin -H $RABBITMQ_HOST -u $RABBITMQ_DEFAULT_USER -p $RABBITMQ_DEFAULT_PASS -V $RABBITMQ_DEFAULT_VHOST \
  declare exchange name=$POST_EXCHANGE_NAME type=direct

# Make queues
rabbitmqadmin -H $RABBITMQ_HOST -u $RABBITMQ_DEFAULT_USER -p $RABBITMQ_DEFAULT_PASS -V $RABBITMQ_DEFAULT_VHOST \
  declare queue name="$POST_RESULT_QUEUE_NAME" durable=true
rabbitmqadmin -H $RABBITMQ_HOST -u $RABBITMQ_DEFAULT_USER -p $RABBITMQ_DEFAULT_PASS -V $RABBITMQ_DEFAULT_VHOST \
  declare queue name="$POST_SUBMISSION_QUEUE_NAME" durable=true

# Make bindings
rabbitmqadmin -H $RABBITMQ_HOST -u $RABBITMQ_DEFAULT_USER -p $RABBITMQ_DEFAULT_PASS -V $RABBITMQ_DEFAULT_VHOST \
  declare binding source="$POST_EXCHANGE_NAME" destination_type=queue destination="$POST_RESULT_QUEUE_NAME" routing_key="$POST_RESULT_ROUTING_KEY"
rabbitmqadmin -H $RABBITMQ_HOST -u $RABBITMQ_DEFAULT_USER -p $RABBITMQ_DEFAULT_PASS -V $RABBITMQ_DEFAULT_VHOST \
  declare binding source="$POST_EXCHANGE_NAME" destination_type=queue destination="$POST_SUBMISSION_QUEUE_NAME" routing_key="$POST_SUBMISSION_ROUTING_KEY"
