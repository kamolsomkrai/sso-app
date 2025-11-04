import Image from "next/image";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex w-full flex-1 flex-col items-center justify-center px-20 text-center">
        <h1 className="text-6xl font-bold text-zinc-800 dark:text-zinc-100">
          Welcome to{' '}
          <a
            className="text-blue-600 hover:underline dark:text-blue-400"
            href="https://nextjs.org"
            target="_blank"
            rel="noopener noreferrer"
          >
            Next.js!
          </a>
        </h1>
      </main>
    </div>
  );
}
