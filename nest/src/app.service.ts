import { Injectable } from '@nestjs/common'
import { PrismaService } from './prisma/prisma.service'

@Injectable()
export class AppService {
  constructor(private readonly prismaService: PrismaService) {}

  getHello(): string {
    return 'Hello World!'
  }

  async getProblem(problemId: number) {
    return await this.prismaService.problem.findUnique({
      where: {
        id: problemId
      }
    })
  }
}
