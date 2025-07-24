"use client";
import { Button } from "@/components/ui/button";
import {
  ArrowRightIcon,
  GithubIcon,
  BrainCircuit,
  FileTextIcon,
} from "lucide-react";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { redirect } from "next/navigation";

export default function Home() {
  return (
    <main className="min-h-screen bg-black px-6 py-16 font-sans text-white md:px-20">
      <section className="mx-auto max-w-4xl text-center">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-5xl leading-tight font-bold md:text-6xl"
        >
          Meet <span className="text-purple-500">GitHub Wizard</span> — your
          magical AI companion for repo intelligence.
        </motion.h1>

        <p className="mt-6 text-lg text-gray-300 md:text-xl">
          Analyze repos, summarize commits, auto-generate and summarize
          meetings, ask questions about your code, and more. All powered by AI.
          Generous free credits await.
        </p>

        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Button
            onClick={() => {
              redirect("/dashboard");
            }}
            className="rounded-xl bg-purple-600 px-6 py-3 text-lg text-white hover:bg-purple-700"
          >
            Get Started <ArrowRightIcon className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>

      <section className="mx-auto mt-24 grid max-w-6xl gap-10 md:grid-cols-3">
        <FeatureCard
          title="Repo Analysis"
          description="Dive into your repositories and get intelligent insights."
          icon={<BrainCircuit className="h-8 w-8 text-purple-400" />}
        />
        <FeatureCard
          title="Commit Summaries"
          description="Understand your commit history in seconds with powerful summaries."
          icon={<FileTextIcon className="h-8 w-8 text-green-400" />}
        />
        <FeatureCard
          title="Meetings with AssemblyAI"
          description="Create and summarize team meetings instantly using voice intelligence."
          icon={<FileTextIcon className="h-8 w-8 text-blue-400" />}
        />
        <FeatureCard
          title="Ask Questions about Repos"
          description="Get answers about your codebase using natural language queries."
          icon={<BrainCircuit className="h-8 w-8 text-yellow-400" />}
        />
        <FeatureCard
          title="Understand Issues Faster"
          description="Auto-interpret issues and improve resolution time."
          icon={<FileTextIcon className="h-8 w-8 text-red-400" />}
        />
        <FeatureCard
          title="Free & Generous Credits"
          description="Test the full power of GitHub Wizard with zero cost upfront."
          icon={<ArrowRightIcon className="h-8 w-8 text-pink-400" />}
        />
      </section>

      <footer className="mt-32 text-center text-sm text-gray-500">
        © {new Date().getFullYear()} GitHub Wizard — Built with ❤️ by
        developers for developers
      </footer>
    </main>
  );
}

function FeatureCard({
  title,
  description,
  icon,
}: {
  title: string;
  description: string;
  icon: JSX.Element;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6 shadow-lg hover:shadow-purple-500/20"
    >
      <div className="mb-4">{icon}</div>
      <h3 className="mb-2 text-xl font-semibold">{title}</h3>
      <p className="text-gray-400">{description}</p>
    </motion.div>
  );
}
