import { IsNotEmpty, IsString } from 'class-validator'

export class CreatePostDTO {
  @IsString()
  @IsNotEmpty()
  title: string

  @IsString()
  @IsNotEmpty()
  content: string
}
