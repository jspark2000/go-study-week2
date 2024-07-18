import { Injectable, InternalServerErrorException } from '@nestjs/common'
import type { PostMessage } from './interfaces/post-message.interface'
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq'

@Injectable()
export class PostProducerService {
  constructor(private readonly amqpConnection: AmqpConnection) {}

  async publishPostMessage(message: PostMessage) {
    try {
      await this.amqpConnection.publish(
        'post.exchange',
        'post.submission',
        message,
        {
          messageId: String(message.id),
          persistent: true,
          type: 'post'
        }
      )
    } catch (error) {
      throw new InternalServerErrorException(error)
    }
  }
}
