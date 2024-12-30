import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common'
import { AppService } from './app.service'
import type { Problem } from '@prisma/client'

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello()
  }

  @Get('problem/:id')
  async getProblem(
    @Param('id', ParseIntPipe) problemId: number
  ): Promise<Problem> {
    return await this.appService.getProblem(problemId)
  }
}
