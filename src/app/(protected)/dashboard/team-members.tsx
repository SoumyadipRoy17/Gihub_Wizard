"use client";

import useProject from "@/hooks/use-project";
import { api } from "@/trpc/react";
import Image from "next/image";
import React from "react";

const TeamMembers = () => {
  const { projectId } = useProject();
  const { data: members } = api.project.getTeamMembers.useQuery({ projectId });
  return (
    <div className="flex items-center gap-2">
      <ul className="list-disc pl-5">
        {members?.map((member) => (
          <Image
            key={member.id}
            src={member.user.imageUrl || ""}
            alt={member.user.firstName || ""}
            height={30}
            width={30}
            className="mr-2 inline-block rounded-full"
          />
        )) || <li>No team members found.</li>}
      </ul>
    </div>
  );
};

export default TeamMembers;
