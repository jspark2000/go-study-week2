import {
  Body,
  Controller,
  Get,
  InternalServerErrorException,
  Post
} from '@nestjs/common'
import { PostService } from './post.service'
import { Post as PostType } from '@prisma/client'
import { CreatePostDTO } from './dto/create-post.dto'

@Controller('posts')
export class PostController {
  constructor(private readonly postService: PostService) {}

  @Get()
  async getPosts(): Promise<PostType[]> {
    try {
      return await this.postService.getPosts()
    } catch (error) {
      throw new InternalServerErrorException(error)
    }
  }

  @Post()
  async registerPost(@Body() postDTO: CreatePostDTO): Promise<void> {
    try {
      return await this.postService.createPost(postDTO)
    } catch (error) {
      throw new InternalServerErrorException(error)
    }
  }
}
