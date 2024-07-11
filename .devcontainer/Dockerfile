FROM mcr.microsoft.com/vscode/devcontainers/typescript-node:20-bullseye

# Install dependencies
RUN apt-get update && export DEBIAN_FRONTEND=noninteractive \
  && apt-get -y install --no-install-recommends netcat direnv

# Add go binaries to secure path
RUN echo 'Defaults secure_path="/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:/usr/local/go/bin"' > /etc/sudoers.d/secure_path
RUN chmod 440 /etc/sudoers.d/secure_path

# Install RabbitMQ CLI tool
RUN curl https://raw.githubusercontent.com/rabbitmq/rabbitmq-server/main/deps/rabbitmq_management/bin/rabbitmqadmin -o /usr/local/bin/rabbitmqadmin
RUN chmod 755 /usr/local/bin/rabbitmqadmin
