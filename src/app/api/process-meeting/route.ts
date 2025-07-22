import { processMeeting } from "@/lib/assembly";
import { db } from "@/server/db";
import { auth } from "@clerk/nextjs/server";
import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";

const bodyParser = z.object({
  meetingId: z.string(),
  meetingUrl: z.string(),
  projectId: z.string(),
});

export const maxDurtion = 300;

export async function POST(req: NextRequest) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json("Unauthorized", { status: 401 });
  }

  try {
    const body = await req.json();
    const { meetingUrl, projectId, meetingId } = bodyParser.parse(body);

    const { summaries } = (await processMeeting(meetingUrl)) as any;

    await db.issue.createMany({
      data: summaries.map((summary: any) => ({
        start: summary.start,
        end: summary.end,
        gist: summary.gist,
        headline: summary.headline,
        summary: summary.summary,
        meetingId,
      })),
    });

    await db.meeting.update({
      where: { id: meetingId },
      data: {
        status: "COMPLETED",
        name: summaries[0]?.headline || "Meeting Summary",
      },
    });

    return NextResponse.json("Meeting processed successfully", { status: 200 });
  } catch (error) {
    console.error("Error processing request:", error);
    return NextResponse.json("Internal Server Error", { status: 500 });
  }
}
