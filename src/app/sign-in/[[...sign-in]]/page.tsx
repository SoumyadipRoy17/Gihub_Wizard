// app/sign-in/page.tsx (or wherever your sign-in page is)
import { SignIn } from "@clerk/nextjs";

export default function Page() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-900 via-purple-900 to-black px-4">
      <div className="w-full max-w-md rounded-2xl border border-white/20 bg-white/10 p-8 shadow-lg backdrop-blur-sm">
        <h1 className="mb-6 text-center text-3xl font-bold text-white">
          Welcome Back 👋
        </h1>
        <p className="mb-4 text-center text-sm text-gray-300">
          Sign in to access your dashboard and continue your journey.
        </p>
        <div className="rounded-xlp-4 shadow-md">
          <SignIn />
        </div>
        <p className="mt-6 text-center text-xs text-gray-400">
          Powered by Clerk. Secure and private authentication.
        </p>
      </div>
    </div>
  );
}
