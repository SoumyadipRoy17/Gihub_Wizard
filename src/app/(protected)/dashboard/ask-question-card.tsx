"use client";
import { Button } from "@/components/ui/button";
import MDEditor from "@uiw/react-md-editor";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import useProject from "@/hooks/use-project";
import Image from "next/image";
import React from "react";
import { askQuestion } from "./actions";
import { readStreamableValue } from "ai/rsc";
import CodeReferences from "./code-references";
import { api } from "@/trpc/react";
import { toast } from "sonner";
import useRefetch from "@/hooks/use-refetch";

const AskQuestionCard = () => {
  const { project } = useProject();
  const [question, setQuestion] = React.useState("");
  const [open, setOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [filesReferences, setFilesReferences] = React.useState<
    {
      fileName: string;
      sourceCode: string;
      summary: string;
    }[]
  >();

  const [answer, setAnswer] = React.useState("");
  const saveAnswer = api.project.saveAnswer.useMutation({
    onSuccess: () => {
      console.log("Answer saved successfully");
    },
    onError: (error) => {
      console.error("Error saving answer:", error);
    },
  });
  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setAnswer(""); // Clear old answer
    setFilesReferences([]); // Clear old file references
    setLoading(true); // You forgot to enable loading

    if (!project?.id) return;

    const { output, filesReferences } = await askQuestion(question, project.id);
    setOpen(true);
    // output is assumed to be streamable; no need to check for 'readable' property
    console.log("output received:", output);

    setFilesReferences(filesReferences);

    // for await (const delta of readStreamableValue(output)) {
    //   if (delta) setAnswer((ans) => ans + delta);
    // }
    try {
      for await (const delta of readStreamableValue(output)) {
        if (delta) setAnswer((ans) => ans + delta);
        console.log("delta", delta);
      }
      console.log("Didnt enter delta");
    } catch (err) {
      console.error("Streaming failed:", err);
      setAnswer("Something went wrong while generating the answer.");
    }

    setLoading(false);
  };

  const refetch = useRefetch();

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[80vw]">
          <DialogHeader>
            <div className="flex items-center gap-2"></div>
            <DialogTitle>
              {" "}
              <Image
                src={"/logo.png"}
                alt="github_wizard"
                width={40}
                height={40}
              />
              <Button
                disabled={saveAnswer.isPending}
                variant={"outline"}
                onClick={() => {
                  saveAnswer.mutate(
                    {
                      projectId: project!.id,
                      question,
                      answer,
                      filesReferences: filesReferences ?? [],
                    },
                    {
                      onSuccess: () => {
                        toast.success("Answer saved successfully");
                        refetch();
                      },
                      onError: (error) => {
                        toast.error("Error saving answer: " + error.message);
                      },
                    },
                  );
                }}
              >
                Save Answer
              </Button>
            </DialogTitle>
          </DialogHeader>

          {/* 
            MDEditor.Markdown is used here to render the AI-generated answer as formatted Markdown.
            This usage is based on the @uiw/react-md-editor API, which allows rendering Markdown content.
            */}
          <p className="!h-full max-h-[40vh] max-w-[70vw] overflow-scroll bg-white text-black">
            {answer ?? ""}
          </p>
          <div className="h-4"></div>

          <CodeReferences fileReferences={filesReferences ?? []} />

          <Button
            type="button"
            onClick={() => {
              setOpen(false);
            }}
          >
            Close
          </Button>

          {/* <h1>File References</h1>
          {filesReferences?.map((file) => {
            return <span key={file.fileName}>{file.fileName}</span>;
          })} */}
        </DialogContent>
      </Dialog>
      <Card className="relative col-span-3 sm:col-span-2">
        <CardHeader>
          <CardTitle>Ask a Question ?</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit}>
            <Textarea
              placeholder="Which file should I edit ?"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
            />
            <div className="h-4"></div>
            <Button type="submit" disabled={loading}>
              Ask Github Wizard
            </Button>
          </form>
        </CardContent>
      </Card>
    </>
  );
};

export default AskQuestionCard;
