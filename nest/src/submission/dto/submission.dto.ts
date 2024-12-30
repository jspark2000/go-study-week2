import { JudgeResult } from '@prisma/client'
import { IsEnum, IsNotEmpty, IsNumber, IsString } from 'class-validator'

export class SubmissionDTO {
  @IsString()
  @IsNotEmpty()
  code: string

  @IsNumber()
  @IsNotEmpty()
  problemId: number
}

export class JudgeResultDTO {
  @IsNumber()
  @IsNotEmpty()
  submissionId: number

  @IsNumber()
  @IsNotEmpty()
  testcaseId: number

  @IsEnum(JudgeResult)
  @IsNotEmpty()
  result: JudgeResult
}
