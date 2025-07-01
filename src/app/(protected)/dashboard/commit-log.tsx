"use client";
import React from "react";
import useProject from "@/hooks/use-project";
import { api } from "@/trpc/react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import Link from "next/link";

const CommitLog = () => {
  const { projectId, project } = useProject();
  const { data: commits } = api.project.getCommits.useQuery({ projectId });
  return (
    <>
      <ul className="space-y-6">
        {commits?.map((commit, commitIdx) => (
          <li key={commit.id} className="relative flex gap-x-4">
            <div
              className={cn(
                commitIdx === commits.length - 1 ? "h-8" : "-bottom-6",
                "absolute top-0 left-0 flex w-6 justify-center",
              )}
            >
              <div className="w-px translate-x-1 bg-gray-200"></div>
            </div>
            <>
              <Image
                src={commit.commitAuthorAvatar}
                alt="commit avatar"
                width={32}
                height={32}
                className="relative mt-4 size-8 flex-none rounded-full bg-gray-200"
              ></Image>
              <div className="rounded-mg flex-auto bg-white p-3 ring-1 ring-gray-200 ring-inset">
                <div className="flex justify-between gap-x-4">
                  <Link
                    target="_blank"
                    href={`${project?.githubUrl}/commits/${commit.commitHash}`}
                    className="py-0.5 text-xs leading-5 text-gray-500"
                  >
                    {commit.commitMessage}
                  </Link>
                </div>
              </div>
            </>
          </li>
        ))}
      </ul>
    </>
  );
};

export default CommitLog;
