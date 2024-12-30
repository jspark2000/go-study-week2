import { Injectable, InternalServerErrorException } from '@nestjs/common'
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq'
import type { JudgeRequestMessage } from './interfaces/judge-message.interface'

@Injectable()
export class SubmissionProducerService {
  constructor(private readonly amqpConnection: AmqpConnection) {}

  async publishJudgeMessage(message: JudgeRequestMessage) {
    try {
      await this.amqpConnection.publish(
        'submission.exchange',
        'judge.request',
        message,
        {
          messageId: String(message.id),
          persistent: true,
          type: 'judge'
        }
      )
    } catch (error) {
      throw new InternalServerErrorException(error)
    }
  }
}
