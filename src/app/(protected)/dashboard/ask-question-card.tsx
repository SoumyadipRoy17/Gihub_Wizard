"use client";
import { Button } from "@/components/ui/button";
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
  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setAnswer(""); // Clear old answer
    setLoading(true); // You forgot to enable loading

    if (!project?.id) return;
    setOpen(true);

    const { output, filesReferences } = await askQuestion(question, project.id);
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

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {" "}
              <Image
                src={"/logo.png"}
                alt="github_wizard"
                width={40}
                height={40}
              />
            </DialogTitle>
          </DialogHeader>
          <DialogDescription>{answer}</DialogDescription>
          <h1>File References</h1>
          {filesReferences?.map((file) => {
            return <span key={file.fileName}>{file.fileName}</span>;
          })}
        </DialogContent>
      </Dialog>
      <Card className="relative col-span-3 sm:col-span-2">
        <CardHeader>
          <CardTitle>Ask a Question ?</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit}>
            <Textarea
              placeholder="Which file should I edit"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
            />
            <div className="h-4"></div>
            <Button type="submit">Ask Github Wizard</Button>
          </form>
        </CardContent>
      </Card>
    </>
  );
};

export default AskQuestionCard;
