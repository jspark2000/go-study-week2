import { PostStatus } from '@prisma/client'
import { IsEnum, IsNotEmpty, IsNumber } from 'class-validator'

export class ProcessedPostDTO {
  @IsNumber()
  @IsNotEmpty()
  id: number

  @IsEnum(PostStatus)
  @IsNotEmpty()
  status: PostStatus
}
