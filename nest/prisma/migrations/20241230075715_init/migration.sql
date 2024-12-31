-- CreateEnum
CREATE TYPE "JudgeResult" AS ENUM ('Judging', 'Accepted', 'NotAnswer', 'Error');

-- CreateTable
CREATE TABLE "submission" (
    "id" SERIAL NOT NULL,
    "problem_id" INTEGER NOT NULL,
    "code" TEXT NOT NULL,
    "create_time" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "result" "JudgeResult" NOT NULL DEFAULT 'Judging',

    CONSTRAINT "submission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "testcase_result" (
    "testcase_result" INTEGER NOT NULL,
    "testcase_id" INTEGER NOT NULL,
    "result" "JudgeResult" NOT NULL DEFAULT 'Judging',
    "create_time" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "problem" (
    "id" SERIAL NOT NULL,
    "content" TEXT NOT NULL,

    CONSTRAINT "problem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "testcase" (
    "id" SERIAL NOT NULL,
    "problem_id" INTEGER NOT NULL,
    "input" VARCHAR(128) NOT NULL,
    "output" VARCHAR(128) NOT NULL,

    CONSTRAINT "testcase_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "testcase_result_testcase_result_testcase_id_key" ON "testcase_result"("testcase_result", "testcase_id");

-- AddForeignKey
ALTER TABLE "submission" ADD CONSTRAINT "submission_problem_id_fkey" FOREIGN KEY ("problem_id") REFERENCES "problem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "testcase_result" ADD CONSTRAINT "testcase_result_testcase_result_fkey" FOREIGN KEY ("testcase_result") REFERENCES "submission"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "testcase_result" ADD CONSTRAINT "testcase_result_testcase_id_fkey" FOREIGN KEY ("testcase_id") REFERENCES "testcase"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "testcase" ADD CONSTRAINT "testcase_problem_id_fkey" FOREIGN KEY ("problem_id") REFERENCES "problem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
