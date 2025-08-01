import { GoogleGenerativeAI } from "@google/generative-ai";
import { Document } from "@langchain/core/documents";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export const aiSummarizeCommits = async (diff: string) => {
  try {
    const prompt = `
You are an expert programmer, and you are trying to summarize a git diff. Reminders about the git diff format: 
For every file, there are a few metadata lines, like (for example):

diff --git a/lib/index.js b/lib/index.js  
index aadf005..6bef063 100644  
--- a/lib/index.js  
+++ b/lib/index.js

This means that 'lib/index.js' was modified in this commit. Note that this is only an example.

Then there is a specifier of the lines that were modified.  
A line starting with '+' means it was added.  
A line that starting with '-' means that line was deleted.  
A line that starts with neither '+' nor '-' is code given for context and better understanding.  
It is not part of the diff.

EXAMPLE SUMMARY COMMENTS:

✓ Raised the amount of returned recordings from {'A0'} to {'A100'} [packages/server/recordings_api.ts], [packages/server/constants.ts]  
✓ Fixed a typo in the github action name (.github/workflows/gpt-commit-summarizer.yml)  
✓ Moved the 'octokit' initialization to a separate file [src/octokit.ts], [src/index.ts]  
✓ Added an OpenAPI API for completions [packages/utils/apis/openai.ts]  
✓ Lowered numeric tolerance for test files

Most commits will have less comments than this example list.  
The last comment does not include the file names,  
because there were more than two relevant files in the hypothetical commit.  
Do not include parts of the example in your summary.
Please summarize the following git diff in a similar format to the example above,
but do not include the example comments in your summary.

Git diff:
${diff}
`;

    const response = await model.generateContent([prompt]);

    return response.response.text();
  } catch (error) {
    console.error("Error summarizing commits:", error);
    throw new Error("Failed to summarize commits");
  }
};

export async function summariseCode(doc: Document) {
  console.log("Summarising code:", doc.metadata.source);

  try {
    const response = await model.generateContent([
      `You are an expert programmer, and you are trying to summarize a code file.Please summarize the following code file in a few sentences, focusing on its purpose and functionality.` +
        `You are onboarding a junior software engineer and explaining to them the purpose pf the ` +
        `\n\nFile: ${doc.metadata.source}\n\nCode:\n${doc.pageContent.slice(0, 10000)}`,
    ]);

    return response.response.text();
  } catch (error) {
    return "";
  }
}

export async function generateEmbedding(summary: string) {
  const model = genAI.getGenerativeModel({
    model: "text-embedding-004",
  });
  const result = await model.embedContent([summary]);
  const embedding = result.embedding;
  return embedding.values;
}
