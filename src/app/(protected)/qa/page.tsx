"use client";
import React from "react";
import { api } from "@/trpc/react";
import useProject from "@/hooks/use-project";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import AskQuestionCard from "../dashboard/ask-question-card";
import Image from "next/image";
import MDEditor from "@uiw/react-md-editor";
import CodeReferences from "../dashboard/code-references";

const QAPage = () => {
  const { projects, projectId } = useProject();
  const { data: questions } = api.project.getQuestions.useQuery({
    projectId: projectId ?? "",
  });

  const [questionIndex, setQuestionIndex] = React.useState(0);
  const question = questions?.[questionIndex];
  return (
    <Sheet>
      <AskQuestionCard />
      <div className="h-4"></div>
      <h1 className="text-xl font-semibold">Saved Questions</h1>
      <div className="h-2"></div>
      <div className="flex flex-col gap-2">
        {questions?.map((question, index) => {
          return (
            <React.Fragment key={question.id}>
              <SheetTrigger onClick={() => setQuestionIndex(index)}>
                <div className="flex items-center gap-4 rounded-lg border bg-white p-4 shadow">
                  <Image
                    src={question.user.imageUrl ?? ""}
                    alt=""
                    className="rounded-full"
                    height={30}
                    width={30}
                  />
                  <div className="flx-col flex text-left">
                    <div className="flex items-center gap-2">
                      <p className="line-clamp-1 text-lg font-medium text-gray-700">
                        {question.question}
                      </p>
                      <span className="text-xs whitespace-nowrap text-gray-400">
                        {question.createdAt.toLocaleDateString()}
                      </span>
                    </div>
                    <p className="line-clamp-1 text-sm text-gray-500">
                      {question.answer}
                    </p>
                  </div>
                </div>
              </SheetTrigger>
            </React.Fragment>
          );
        })}
      </div>
      {question && (
        <SheetContent className="sm:max-w-[80vw]">
          <SheetHeader>
            <SheetTitle>{question.question}</SheetTitle>
            {/* <MDEditor.Markdown source={question.answer ?? ""} /> */}
            <p>{question.answer ?? ""}</p>
            <CodeReferences
              fileReferences={(question.fileReferences ?? []) as any}
            />
          </SheetHeader>
        </SheetContent>
      )}
    </Sheet>
  );
};

export default QAPage;
