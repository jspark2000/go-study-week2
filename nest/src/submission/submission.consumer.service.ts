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
import { JudgeResultMessage, type JudgeResultDTO } from './dto/submission.dto'

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
      await this.submissionService.updateSubmissionResult(submissionDTO)
    } catch (error) {
      throw new InternalServerErrorException(error)
    }
  }

  async transformRabbitMQResponse(msg: object): Promise<JudgeResultDTO> {
    try {
      const resultMsg = plainToInstance(JudgeResultMessage, msg)
      await validateOrReject(resultMsg)

      return {
        ...resultMsg,
        result: this.parseJudgeResult(resultMsg)
      }
    } catch (error) {
      console.log(error)
      throw new InternalServerErrorException('채점 결과 메세지 형식 오류')
    }
  }

  private parseJudgeResult(msg: JudgeResultMessage): JudgeResult {
    switch (msg.result) {
      case 0:
        return JudgeResult.Accepted
      case 1:
        return JudgeResult.NotAnswer
      case 2:
      case 3:
      default:
        return JudgeResult.Error
    }
  }
}
