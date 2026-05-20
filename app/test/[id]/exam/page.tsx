import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ExamClient from "./ExamClient";

export const dynamic = "force-dynamic";

export default async function ExamPage(props: PageProps<"/test/[id]/exam">) {
  const { id } = await props.params;

  const test = await prisma.test.findUnique({
    where: { id },
    include: {
      questions: {
        orderBy: { questionNumber: "asc" },
      },
    },
  });

  if (!test) notFound();

  return <ExamClient test={test} questions={test.questions} />;
}
