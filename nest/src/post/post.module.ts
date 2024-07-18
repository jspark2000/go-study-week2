import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq'
import { PostProducerService } from './post.producer.service'
import { PostService } from './post.service'
import { PostConsumerService } from './post.consumer.service'

@Module({
  imports: [
    ConfigModule.forRoot(),
    RabbitMQModule.forRootAsync(RabbitMQModule, {
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => {
        const channels = {
          'post-channel': {
            prefetchCount: 1,
            default: true
          },
          'post-result-channel': {
            prefetchCount: 1
          }
        }

        const uri =
          'amqp://' +
          config.get('RABBITMQ_DEFAULT_USER') +
          ':' +
          config.get('RABBITMQ_DEFAULT_PASS') +
          '@' +
          config.get('RABBITMQ_HOST') +
          ':' +
          config.get('RABBITMQ_PORT') +
          '/' +
          config.get('RABBITMQ_DEFAULT_VHOST')

        return {
          uri,
          channels,
          connectionInitOptions: { wait: false }
        }
      }
    })
  ],
  providers: [PostService, PostProducerService, PostConsumerService]
})
export class PostModule {}
