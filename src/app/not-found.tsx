import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function NotFound() {
  return (
    <section className="relative flex min-h-[calc(100vh-10rem)] items-center justify-center overflow-hidden bg-zinc-50 px-4 py-16 dark:bg-zinc-950">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-1/3 h-72 w-72 -translate-x-1/2 rounded-full bg-blue-500/10 blur-3xl dark:bg-blue-500/15" />
        <div className="absolute bottom-0 right-1/4 h-56 w-56 rounded-full bg-cyan-400/10 blur-3xl dark:bg-cyan-400/10" />
      </div>

      <div className="relative w-full max-w-3xl rounded-3xl border border-zinc-200 bg-white/80 p-8 text-center shadow-xl shadow-zinc-950/5 backdrop-blur sm:p-12 dark:border-white/10 dark:bg-zinc-900/80 dark:shadow-black/20">
        <p className="mb-8 font-mono text-sm font-semibold tracking-[0.18em] text-blue-600 dark:text-blue-400">
          404 Error!
        </p>
        <div className="grid items-center gap-8 md:grid-cols-2 md:gap-12">
          <div className="relative mx-auto aspect-square w-full max-w-[300px] overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-900 shadow-lg shadow-zinc-950/20 dark:border-white/10">
            <Image
              src="/photo-1.avif"
              alt="404 illustration"
              fill
              sizes="(min-width: 768px) 300px, 80vw"
              className="object-cover"
              priority
            />
          </div>

          <div>
            <h1 className="text-4xl font-bold tracking-tight text-zinc-950 sm:text-5xl dark:text-white">
              Ooops!
            </h1>
            <p className="mx-auto mt-4 max-w-sm text-base leading-7 text-zinc-600 dark:text-zinc-400">
              It looks like this page or resource doesn&apos;t exist.
            </p>

            <Link
              href="/practice"
              className="mt-8 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-zinc-50 dark:focus:ring-offset-zinc-900"
            >
              Back to Typing Practice
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
