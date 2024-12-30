// prisma/seed.ts

import { PrismaClient, type Prisma } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const problem: Prisma.ProblemCreateInput = {
    content:
      '임의의 자연수 N을 입력받았을 때, 그 제곱을 출력하는 함수를 작성하시오'
  }

  const response = await prisma.problem.create({
    data: problem
  })

  const testcases: Prisma.TestcaseCreateManyInput[] = [
    {
      in: '1',
      out: '1',
      problemId: response.id
    },
    {
      in: '2',
      out: '4',
      problemId: response.id
    },
    {
      in: '3',
      out: '9',
      problemId: response.id
    },
    {
      in: '4',
      out: '16',
      problemId: response.id
    },
    {
      in: '5',
      out: '25',
      problemId: response.id
    },
    {
      in: '6',
      out: '36',
      problemId: response.id
    },
    {
      in: '7',
      out: '49',
      problemId: response.id
    },
    {
      in: '8',
      out: '64',
      problemId: response.id
    },
    {
      in: '9',
      out: '81',
      problemId: response.id
    },
    {
      in: '11',
      out: '121',
      problemId: response.id
    }
  ]

  await prisma.testcase.createMany({
    data: testcases
  })
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
