import { Nack, type AmqpConnection } from '@golevelup/nestjs-rabbitmq'
import {
  Injectable,
  InternalServerErrorException,
  type OnModuleInit
} from '@nestjs/common'
import { ProcessedPostDTO } from './dto/processed-post.dto'
import { PostStatus } from '@prisma/client'
import type { PostService } from './post.service'
import { plainToInstance } from 'class-transformer'
import { validateOrReject } from 'class-validator'

@Injectable()
export class PostConsumerService implements OnModuleInit {
  constructor(
    private readonly amqpConnection: AmqpConnection,
    private readonly postService: PostService
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

  async handleJudgerMessage(postDTO: ProcessedPostDTO): Promise<void> {
    try {
      if (postDTO.status === PostStatus.Success) {
        await this.postService.updatePostResult(postDTO)
      }
    } catch (error) {
      throw new InternalServerErrorException(error)
    }
  }

  async transformRabbitMQResponse(msg: object): Promise<ProcessedPostDTO> {
    try {
      const postDTO = plainToInstance(ProcessedPostDTO, msg)
      await validateOrReject(postDTO)
      return postDTO
    } catch (error) {
      throw new InternalServerErrorException(error)
    }
  }
}
