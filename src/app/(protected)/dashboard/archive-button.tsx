"use client";

import { Button } from "@/components/ui/button";
import useProject from "@/hooks/use-project";
import useRefetch from "@/hooks/use-refetch";
import { api } from "@/trpc/react";
import React from "react";
import { toast } from "sonner";

const ArchiveButton = () => {
  const archiveProject = api.project.archiveProject.useMutation();
  const { projectId } = useProject();
  const refetch = useRefetch();
  return (
    <Button
      disabled={archiveProject.isPending}
      size={"sm"}
      variant="destructive"
      onClick={() => {
        const confirm = window.confirm(
          "Are you sure you want to archive this project? This action cannot be undone.",
        );
        if (confirm) {
          archiveProject.mutate(
            { projectId },
            {
              onSuccess: () => {
                toast.success("Project archived successfully.");
                refetch();
              },
              onError: (error) => {
                toast.error(`Failed to archive project: ${error.message}`);
              },
            },
          ); // Replace with actual project ID
        }
      }}
    >
      Archive{" "}
    </Button>
  );
};

export default ArchiveButton;
