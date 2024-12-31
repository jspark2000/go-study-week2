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
      input: '1',
      output: '1',
      problemId: response.id
    },
    {
      input: '2',
      output: '4',
      problemId: response.id
    },
    {
      input: '3',
      output: '9',
      problemId: response.id
    },
    {
      input: '4',
      output: '16',
      problemId: response.id
    },
    {
      input: '5',
      output: '25',
      problemId: response.id
    },
    {
      input: '6',
      output: '36',
      problemId: response.id
    },
    {
      input: '7',
      output: '49',
      problemId: response.id
    },
    {
      input: '8',
      output: '64',
      problemId: response.id
    },
    {
      input: '9',
      output: '81',
      problemId: response.id
    },
    {
      input: '11',
      output: '121',
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
