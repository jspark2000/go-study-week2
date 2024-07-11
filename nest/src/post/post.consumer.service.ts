import { Nack, type AmqpConnection } from '@golevelup/nestjs-rabbitmq'
import { Injectable, type OnModuleInit } from '@nestjs/common'
import type { PrismaService } from 'src/prisma/prisma.service'

@Injectable()
export class PostConsumerService implements OnModuleInit {
  constructor(
    private readonly amqpConnection: AmqpConnection,
    private readonly prismaService: PrismaService
  ) {}

  onModuleInit() {
    this.amqpConnection.createSubscriber(
      async (msg: object) => {
        try {
          // const res = await this.validateJudgerResponse(msg)
          // await this.handleJudgerMessage(res)
          console.log(msg)
        } catch (error) {
          console.log(error)
          return new Nack()
        }
      },
      {
        exchange: 'post.exchange',
        routingKey: 'post.result',
        queue: 'post.q.result',
        queueOptions: {
          channel: 'post-result-channel'
        }
      },
      'nest-mq-handler'
    )
  }
}
