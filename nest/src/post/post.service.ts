import { Injectable, InternalServerErrorException } from '@nestjs/common'
import { PostProducerService } from './post.producer.service'
import { CreatePostDTO } from './dto/create-post.dto'
import type { PostMessage } from './interfaces/post-message.interface'
import { PrismaService } from 'src/prisma/prisma.service'
import type { Post } from '@prisma/client'
import { ProcessedPostDTO } from './dto/processed-post.dto'

/**
 * PostService는 게시물의 조회, 생성, 업데이트 및 외부 서비스와의 상호작용을 담당합니다.
 */
@Injectable()
export class PostService {
  constructor(
    private readonly producer: PostProducerService,
    private readonly prismaService: PrismaService
  ) {}

  /**
   * 데이터베이스에서 모든 게시물을 조회합니다.
   *
   * @returns {Promise<Post[]>} 게시물 객체 배열을 반환하는 Promise입니다.
   * @throws {InternalServerErrorException} 데이터베이스 작업 중 오류가 발생한 경우 예외를 던집니다.
   */
  async getPosts(): Promise<Post[]> {
    try {
      return await this.prismaService.post.findMany()
    } catch (error) {
      throw new InternalServerErrorException(error)
    }
  }

  /**
   * 데이터베이스에 새 게시물을 생성하고 게시물 메시지를 발행합니다.
   *
   * @param {CreatePostDTO} postDTO - 게시물 세부 정보를 포함하는 데이터 전송 객체입니다.
   * @returns {Promise<void>} 게시물 메시지가 발행되면 완료되는 Promise입니다.
   * @throws {InternalServerErrorException} 데이터베이스 작업 또는 메시지 발행 중 오류가 발생한 경우 예외를 던집니다.
   */
  async createPost(postDTO: CreatePostDTO): Promise<void> {
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

  /**
   * 제공된 데이터를 기반으로 기존 게시물의 상태를 업데이트합니다.
   *
   * @param {ProcessedPostDTO} postDTO - 업데이트된 게시물 세부 정보를 포함하는 데이터 전송 객체입니다.
   * @returns {Promise<Post>} 업데이트된 게시물 객체를 반환하는 Promise입니다.
   * @throws {InternalServerErrorException} 데이터베이스 작업 중 오류가 발생한 경우 예외를 던집니다.
   */
  async updatePostResult(postDTO: ProcessedPostDTO): Promise<Post> {
    try {
      return await this.prismaService.post.update({
        where: {
          id: postDTO.id
        },
        data: {
          status: postDTO.status
        }
      })
    } catch (error) {
      throw new InternalServerErrorException(error)
    }
  }
}
