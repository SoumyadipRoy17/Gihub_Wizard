import { GithubRepoLoader } from "@langchain/community/document_loaders/web/github";
import { Document } from "@langchain/core/documents";
import { generateEmbedding, summariseCode } from "./gemini";
import { generate } from "node_modules/@langchain/core/dist/utils/fast-json-patch";
import { db } from "@/server/db";
import { Octokit } from "octokit";

const getFileCOunt = async (
  path: string,
  octokit: Octokit,
  githubOwner: string,
  githubRepo: string,
  acc: number = 0,
) => {
  const { data } = await octokit.rest.repos.getContent({
    owner: githubOwner,
    repo: githubRepo,
    path,
  });

  if (!Array.isArray(data) && data.type === "file") {
    return acc + 1; // Count the file itself
  }

  if (Array.isArray(data)) {
    let fileCount = 0;
    const directories: string[] = [];
    for (const item of data) {
      if (item.type === "dir") {
        directories.push(item.path);
      } else {
        fileCount += 1; // Count the file
      }
    }

    if (directories.length > 0) {
      const directoryCounts = await Promise.all(
        directories.map((dir) =>
          getFileCOunt(dir, octokit, githubOwner, githubRepo, 0),
        ),
      );
      fileCount += directoryCounts.reduce((acc, count) => acc + count, 0);
    }
  }

  return acc;
};

export const checkCredits = async (githubUrl: string, githubToken?: string) => {
  //find out no of files in repo
  const octokit = new Octokit({
    auth: githubToken,
  });

  const githubOwner = githubUrl.split("/")[3];
  const githubRepo = githubUrl.split("/")[4];

  if (!githubOwner || !githubRepo) {
    return 0;
  }

  const fileCount = await getFileCOunt("", octokit, githubOwner, githubRepo);
  return fileCount;
};

export const LoadGithubRepo = async (
  githubUrl: string,
  githubToken?: string,
) => {
  const loader = new GithubRepoLoader(githubUrl, {
    accessToken: githubToken || "",
    branch: "main",
    ignoreFiles: ["README.md", "LICENSE", "package-lock.json"],
    recursive: true,
    unknown: "warn",
    maxConcurrency: 5,
  });
  const docs = await loader.load();
  return docs;
};

export const indexGithubRepo = async (
  projectId: string,
  githubUrl: string,
  githubToken?: string,
) => {
  const docs = await LoadGithubRepo(githubUrl, process.env.GITHUB_TOKEN);
  if (docs.length === 0) {
    throw new Error("No documents found in the GitHub repository.");
  }
  const allEmbeddings = await generateEmbeddings(docs);

  await Promise.allSettled(
    allEmbeddings.map(async (embedding, index) => {
      console.log(
        `processing ${index + 1} of ${allEmbeddings.length} - ${embedding.fileName}`,
      );
      if (!embedding) return;

      const sourceCodeEmbedding = await db.sourceCodeEmbedding.create({
        data: {
          projectId,
          fileName: embedding.fileName,
          summary: embedding.summary,
          sourceCode: embedding.sourceCode,
        },
      });

      await db.$executeRaw`
      UPDATE "SourceCodeEmbedding"
      SET "summaryEmbedding" = ${embedding.embedding}::vector
      WHERE id = ${sourceCodeEmbedding.id};`;
    }),
  );

  // Here you would typically save the documents to your database
  // and create embeddings for them.
  // For example:
  // await saveDocumentsToDatabase(projectId, docs);

  return docs;
};

export const generateEmbeddings = async (docs: Document[]) => {
  return await Promise.all(
    docs.map(async (doc) => {
      const summary = await summariseCode(doc);
      const embedding = await generateEmbedding(summary);

      return {
        summary,
        embedding,
        sourceCode: JSON.parse(JSON.stringify(doc.pageContent)),
        fileName: doc.metadata.source,
      };
    }),
  );
};
