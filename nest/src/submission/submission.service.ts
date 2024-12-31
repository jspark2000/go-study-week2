import { Injectable, InternalServerErrorException } from '@nestjs/common'
import { PrismaService } from 'src/prisma/prisma.service'
import { SubmissionProducerService } from './submission.producer.service'
import type { JudgeResultDTO, SubmissionDTO } from './dto/submission.dto'
import type { JudgeRequestMessage } from './interfaces/judge-message.interface'
import { JudgeResult } from '@prisma/client'

@Injectable()
export class SubmissionService {
  constructor(
    private readonly producer: SubmissionProducerService,
    private readonly prismaService: PrismaService
  ) {}

  async getSubmissionResult(submissionId: number) {
    try {
      return await this.prismaService.submission.findUnique({
        where: {
          id: submissionId
        },
        include: {
          TestcaseResult: true
        }
      })
    } catch (error) {
      console.log(error)
      throw new InternalServerErrorException(error)
    }
  }

  async submitCode(submissionDTO: SubmissionDTO): Promise<void> {
    try {
      // submission 생성
      const submission = await this.createSubmission(submissionDTO)

      // 테스트케이스별 채점 결과 생성
      await this.createTestcaseResults(submission.problemId, submission.id)

      // RabbitMQ로 메세지 전송
      const message: JudgeRequestMessage = { ...submission }
      return await this.producer.publishJudgeMessage(message)
    } catch (error) {
      throw new InternalServerErrorException(error)
    }
  }

  async updateSubmissionResult(submissionDTO: JudgeResultDTO): Promise<void> {
    try {
      await this.prismaService.testcaseResult.update({
        where: {
          submissionId_testcaseId: {
            submissionId: submissionDTO.submissionId,
            testcaseId: submissionDTO.testcaseId
          }
        },
        data: {
          result: submissionDTO.result
        }
      })

      if (submissionDTO.result === JudgeResult.Accepted) {
        const testcaseResults =
          await this.prismaService.testcaseResult.findMany({
            where: {
              submissionId: submissionDTO.submissionId
            },
            select: {
              result: true
            }
          })

        const notJudged = testcaseResults.filter(
          (testcaseResult) => testcaseResult.result === JudgeResult.Judging
        ).length

        if (!notJudged) {
          await this.prismaService.submission.update({
            where: {
              id: submissionDTO.submissionId
            },
            data: {
              result: submissionDTO.result
            }
          })
        }
      } else {
        await this.prismaService.submission.update({
          where: {
            id: submissionDTO.submissionId
          },
          data: {
            result: submissionDTO.result
          }
        })
      }
    } catch (error) {
      console.log(error)
      throw new InternalServerErrorException(error)
    }
  }

  private async createSubmission(submissionDTO: SubmissionDTO): Promise<{
    id: number
    code: string
    problemId: number
  }> {
    try {
      return await this.prismaService.submission.create({
        data: submissionDTO,
        select: {
          id: true,
          code: true,
          problemId: true
        }
      })
    } catch (error) {
      console.log(error)
      throw new InternalServerErrorException(error)
    }
  }

  private async createTestcaseResults(
    problemId: number,
    submissionId: number
  ): Promise<void> {
    try {
      const testcases = await this.prismaService.testcase.findMany({
        where: {
          problemId
        },
        select: {
          id: true
        }
      })

      await this.prismaService.testcaseResult.createMany({
        data: testcases.map((testcase) => {
          return {
            testcaseId: testcase.id,
            submissionId
          }
        })
      })
    } catch (error) {
      console.log(error)
      throw new InternalServerErrorException(error)
    }
  }
}
