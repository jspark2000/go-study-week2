import {
  Body,
  Controller,
  Get,
  InternalServerErrorException,
  Param,
  ParseIntPipe,
  Post
} from '@nestjs/common'
import { SubmissionService } from './submission.service'
import { SubmissionDTO } from './dto/submission.dto'

@Controller('submissions')
export class SubmissionController {
  constructor(private readonly submissionService: SubmissionService) {}

  @Post()
  async submitCode(@Body() submissionDTO: SubmissionDTO): Promise<void> {
    try {
      return await this.submissionService.submitCode(submissionDTO)
    } catch (error) {
      console.log(error)
      throw new InternalServerErrorException(error)
    }
  }

  @Get(':id')
  async getSubmissionResult(@Param('id', ParseIntPipe) submissionId: number) {
    try {
      return await this.submissionService.getSubmissionResult(submissionId)
    } catch (error) {
      console.log(error)
      throw new InternalServerErrorException(error)
    }
  }
}
