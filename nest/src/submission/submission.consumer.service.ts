import { Nack, AmqpConnection } from '@golevelup/nestjs-rabbitmq'
import {
  Injectable,
  InternalServerErrorException,
  type OnModuleInit
} from '@nestjs/common'
import { SubmissionService } from './submission.service'
import { plainToInstance } from 'class-transformer'
import { validateOrReject } from 'class-validator'
import { JudgeResult } from '@prisma/client'
import { JudgeResultDTO } from './dto/submission.dto'

@Injectable()
export class SubmissionConsumerService implements OnModuleInit {
  constructor(
    private readonly amqpConnection: AmqpConnection,
    private readonly submissionService: SubmissionService
  ) {}

  onModuleInit() {
    this.amqpConnection.createSubscriber(
      async (msg: object) => {
        try {
          const res = await this.transformRabbitMQResponse(msg)
          await this.handleJudgerMessage(res)
        } catch (error) {
          console.log(error)
          return new Nack()
        }
      },
      {
        exchange: 'submission.exchange',
        routingKey: 'judge.result',
        queue: 'judge.q.result',
        queueOptions: {
          channel: 'judge-result-channel'
        }
      },
      'nest-mq-handler'
    )
  }

  async handleJudgerMessage(submissionDTO: JudgeResultDTO): Promise<void> {
    try {
      if (submissionDTO.result === JudgeResult.Accepted) {
        await this.submissionService.updateSubmissionResult(submissionDTO)
      }
    } catch (error) {
      throw new InternalServerErrorException(error)
    }
  }

  async transformRabbitMQResponse(msg: object) {
    try {
      const submissionDTO = plainToInstance(JudgeResultDTO, msg)
      await validateOrReject(submissionDTO)
      return submissionDTO
    } catch (error) {
      throw new InternalServerErrorException(error)
    }
  }
}
