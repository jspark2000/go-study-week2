import { Injectable, InternalServerErrorException } from '@nestjs/common'
import type { PostProducerService } from './post.producer.service'
import type { CreatePostDTO } from './dto/create-post.dto'
import type { PostMessage } from './interfaces/post-message.interface'
import type { PrismaService } from 'src/prisma/prisma.service'
import type { Post } from '@prisma/client'

@Injectable()
export class PostService {
  constructor(
    private readonly producer: PostProducerService,
    private readonly prismaService: PrismaService
  ) {}

  async getPosts(): Promise<Post[]> {
    try {
      return await this.prismaService.post.findMany()
    } catch (error) {
      throw new InternalServerErrorException(error)
    }
  }

  async createPost(postDTO: CreatePostDTO) {
    try {
      const createdPost = await this.prismaService.post.create({
        data: postDTO,
        select: {
          id: true,
          title: true,
          content: true
        }
      })

      const message: PostMessage = { ...createdPost }

      return await this.producer.publishPostMessage(message)
    } catch (error) {
      console.log(error)
      throw new InternalServerErrorException(error)
    }
  }
}
