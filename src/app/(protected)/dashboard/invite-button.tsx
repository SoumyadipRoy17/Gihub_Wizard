"use client";

import { Dialog, DialogHeader } from "@/components/ui/dialog";
import useProject from "@/hooks/use-project";
import { DialogContent, DialogTitle } from "@/components/ui/dialog";
import React from "react";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

const InviteButton = () => {
  const { projectId } = useProject();
  const [open, setOpen] = React.useState(false);
  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite Team Members</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-500">
            Ask them to copy and paste this link
          </p>
          <Input
            className="mt-4"
            readOnly
            onClick={() => {
              navigator.clipboard.writeText(
                `${window.location.origin}/join/${projectId}`,
              );
              toast.success("Invite link copied to clipboard!");
            }}
            value={`${window.location.origin}/join/${projectId}`}
          ></Input>
        </DialogContent>
      </Dialog>
      <Button
        size={"sm"}
        onClick={() => {
          setOpen(true);
        }}
      >
        Invite Members
      </Button>
    </>
  );
};

export default InviteButton;
