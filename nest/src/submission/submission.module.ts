import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq'
import { SubmissionService } from './submission.service'
import { SubmissionProducerService } from './submission.producer.service'
import { SubmissionConsumerService } from './submission.consumer.service'
import { SubmissionController } from './submission.controller'

@Module({
  imports: [
    ConfigModule.forRoot(),
    RabbitMQModule.forRootAsync(RabbitMQModule, {
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => {
        const channels = {
          'judge-request-channel': {
            prefetchCount: 1,
            default: true
          },
          'judge-result-channel': {
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
      },
      inject: [ConfigService]
    })
  ],
  providers: [
    SubmissionService,
    SubmissionProducerService,
    SubmissionConsumerService
  ],
  controllers: [SubmissionController]
})
export class SubmissionModule {}
