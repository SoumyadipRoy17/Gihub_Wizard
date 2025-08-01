"use server";
import { streamText } from "ai";
import { createStreamableValue } from "ai/rsc";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateEmbedding } from "@/lib/gemini";
import { db } from "@/server/db";

const google = createGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY || "",
});

export async function askQuestion(question: string, projectId: string) {
  const stream = createStreamableValue();
  const queryVector = await generateEmbedding(question);
  const vectorQuery = `[${queryVector.join(",")}]`;

  const result = (await db.$queryRaw`
  SELECT "fileName","sourceCode","summary",.0
  1-("summaryEmbedding"<=> ${vectorQuery}::vector)  AS similarity
  FROM "SourceCodeEmbedding"
  WHERE 1-("summaryEmbedding"<=> ${vectorQuery}::vector) > 0.5
  AND "projectId" = ${projectId}
  ORDER BY similarity DESC
  LIMIT 10
  `) as {
    fileName: string;
    sourceCode: string;
    summary: string;
    similarity: number;
  }[];

  console.log("context result length:", result.length);

  let context = "";

  for (const doc of result) {
    context += `source: ${doc.fileName}\ncode content: ${doc.sourceCode}\n summary of file : ${doc.summary}`;
  }

  //   console.log("context preview:", context.slice(0, 500)); // avoid flooding logs

  try {
    const { textStream } = await streamText({
      model: google("gemini-1.5-flash"),
      prompt: `
          You are a ai code assistant who answers questions about the codebase . Your target audience is a technical intern .
          You are an AI assistant who is brand new , powerful , human-like artificial intelligence.
          The traits of AI include expert knowledge , helpfulness , cleverness , and articulateness.
          AI is a well behaved and well-mannered individual.
          AI is always friendly , kind and inspiring and he is eager to provide vivid and thoughtful responses to the user .
          AI has the sum of all knowledge in their brain and is able to accurately answer nearly any question about any topic in given context .
          If the question is asking about code or a specific file, AI will provide the detailed answer , giving step by step instructions.
          START CONTEXT BLOCK
          ${context}
          END OF CONTEXT BLOCK

          START QUESTION
          ${question}
          END OF QUESTION
          AI assistant will take into account any CONTEXT BLOCK that is provided in a conversation.
          If the context does not provide the answer to question , the AI assistant will say "I'm sorry, but I don't know the answer to this".
          AI assistant will not apologize for previous responses , but instead will indicate new information was gained.
          AI assitant will not invent anything that is not drawn directky from the context.
          Answer in markdown syntax , with code snippets if needed . Be as deailed as possible when answering the question
          `,
      //       prompt: `
      // You are a helpful AI assistant for codebase understanding.

      // Context:
      // File: utils.js
      // Summary: This file contains utility functions for formatting dates and strings.

      // File: db.js
      // Summary: This handles database connection and ORM setup.

      // Question:
      // What does db.js do?

      // Answer:
      // `,
    });

    console.log("TextStream", textStream);

    for await (const delta of textStream) {
      console.log("sending delta:", delta);
      stream.update(delta);
    }
    console.log("stream done");
    stream.done();
  } catch (error) {
    stream.done();
    throw error;
  }

  return {
    output: stream.value,
    filesReferences: result,
  };
}
