"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import useRefetch from "@/hooks/use-refetch";
import { api } from "@/trpc/react";
import { Info } from "lucide-react";
import React from "react";
import { useForm } from "react-hook-form";
import { github } from "react-syntax-highlighter/dist/esm/styles/hljs";
import { toast } from "sonner";

type FormInput = {
  repoUrl: string;
  projectName: string;
  githubToken?: string;
};

const CreatePage = () => {
  const { register, handleSubmit, reset } = useForm<FormInput>();
  const createProject = api.project.createProject.useMutation();
  const checkCredits = api.project.checkCredits.useMutation();
  const refetch = useRefetch();

  function onSubmit(data: FormInput) {
    // if (!!checkCredits.data) {
    createProject.mutate(
      {
        name: data.projectName,
        githubUrl: data.repoUrl,
        githubToken: data.githubToken,
      },
      {
        onSuccess: () => {
          toast.success("Project created successfully!");
          refetch();
          reset();
        },
        onError: (error) => {
          toast.error(`Error creating project: ${error.message}`);
        },
      },
    );
    return true;
    // } else {
    //   checkCredits.mutate({
    //     githubUrl: data.repoUrl,
    //     githubToken: data.githubToken,
    //   });
    // }
  }
  return (
    <div className="flex h-full items-center justify-center gap-12">
      <img src="/logo.png" alt="logo" className="h-56 w-auto" />
      <div>
        <div>
          <h1 className="text-2xl font-semibold">
            Link your Github Repository
          </h1>
          <p className="text-muted-foreground text-sm">
            Enter the URL of your Github repository to link to Gihub Wizard
          </p>
        </div>
        <div className="h-4"></div>
        <div>
          <form onSubmit={handleSubmit(onSubmit)}>
            <Input
              {...register("projectName", { required: true })}
              placeholder="Project Name"
            />
            <div className="h-2"></div>
            <Input
              {...register("repoUrl", { required: true })}
              placeholder="Repository URL"
              type="url"
            />
            <div className="h-2"></div>
            <Input
              {...register("githubToken")}
              placeholder="Github Token (optional)"
            />
            {/* {!!checkCredits.data && (
              <>
                <div className="mt-4 rounded-md border border-orange-200 bg-orange-50 px-4 py-2 text-orange-700">
                  <div className="flex items-center gap-2">
                    <Info className="size-4" />
                    <p className="text-sm">
                      You will be charged{" "}
                      <strong>{checkCredits.data?.fileCount}</strong> credits
                      for your repo
                    </p>
                  </div>
                  <p className="ml-6 text-sm text-blue-600">
                    {" "}
                    You have{" "}
                    <strong>
                      {checkCredits.data?.userCredits} credits left in your
                      account !
                    </strong>
                  </p>
                </div>
              </>
            )} */}
            <div className="h-4"></div>
            <Button type="submit" disabled={createProject.isPending}>
              Create Project
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreatePage;
