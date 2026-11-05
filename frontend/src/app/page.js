'use client';
import Image from "next/image";

const features = [
  {
    number: "01",
    icon: "◉",
    title: "Voice-based interviews",
    description:
      "Experience realistic interviews by speaking naturally with your AI interviewer.",
  },
  {
    number: "02",
    icon: "✧",
    title: "Intelligent AI evaluation",
    description:
      "Get detailed feedback on your answers, including strengths and areas to improve.",
  },
  {
    number: "03",
    icon: "▥",
    title: "Track your progress",
    description:
      "Review your interview history, scores and improvements over time.",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#090611] text-white selection:bg-purple-500/40">

      {/* Background effects */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-40 top-20 h-96 w-96 rounded-full bg-purple-700/15 blur-[140px]" />
        <div className="absolute -right-40 top-40 h-96 w-96 rounded-full bg-violet-600/15 blur-[140px]" />
        <div className="absolute bottom-0 left-1/3 h-80 w-80 rounded-full bg-indigo-600/10 blur-[130px]" />
      </div>

      {/* Navigation */}
      <header className="relative z-10 mx-auto max-w-7xl px-6 pt-6">
        <nav className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.04] px-6 py-4 shadow-xl shadow-black/10 backdrop-blur-xl">

          <a href="#" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-purple-400/30 bg-purple-500/15 text-xl text-purple-300">
              ✧
            </div>
            <span className="text-lg font-bold tracking-wide">
              INTERVIEW<span className="text-purple-400">.AI</span>
            </span>
          </a>

          <div className="hidden items-center gap-8 text-sm text-gray-400 md:flex">
            <a href="#features" className="transition hover:text-white">
              Features
            </a>
            <a href="#how-it-works" className="transition hover:text-white">
              How it works
            </a>
            <a href="#about" className="transition hover:text-white">
              About
            </a>
          </div>

          <a
            href="#features"
            className="rounded-xl border border-purple-400/40 bg-purple-500/10 px-5 py-2.5 text-sm font-semibold text-purple-200 transition hover:bg-purple-500/25"
          >
            Get Started <span className="ml-1">→</span>
          </a>
        </nav>
      </header>

      {/* Hero section */}
      <section className="relative z-10 mx-auto grid max-w-7xl items-center gap-8 px-6 pb-20 pt-16 md:min-h-[650px] md:grid-cols-2 md:pt-10">

        {/* Hero text */}
        <div className="relative z-10">
          <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-purple-400/25 bg-purple-500/10 px-4 py-2 text-xs font-medium tracking-wide text-purple-200">
            <span className="h-2 w-2 animate-pulse rounded-full bg-purple-400" />
            THE FUTURE OF INTERVIEW PREPARATION
          </div>

          <h1 className="max-w-2xl text-5xl font-bold leading-[1.12] tracking-tight sm:text-6xl lg:text-7xl">
            Your next interview.
            <span className="mt-2 block bg-gradient-to-r from-purple-300 via-violet-400 to-cyan-300 bg-clip-text text-transparent">
              Your best performance.
            </span>
          </h1>

          <p className="mt-7 max-w-xl text-base leading-8 text-gray-400 sm:text-lg">
            Prepare smarter with your personal AI interviewer.
            Practice real-world interviews, speak naturally and
            receive intelligent feedback to improve your performance.
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-4">
            <a
              href="#features"
              className="group rounded-xl bg-gradient-to-r from-violet-600 to-purple-500 px-7 py-4 text-sm font-semibold shadow-lg shadow-purple-600/25 transition hover:-translate-y-1 hover:shadow-purple-500/40"
            >
              Start Practicing
              <span className="ml-3 transition group-hover:translate-x-1">→</span>
            </a>

            <a
              href="#how-it-works"
              className="rounded-xl border border-white/15 bg-white/[0.04] px-7 py-4 text-sm font-semibold text-gray-200 backdrop-blur-lg transition hover:border-purple-400/50 hover:bg-white/[0.08]"
            >
              Explore Features
            </a>
          </div>

          <div className="mt-10 flex flex-wrap gap-x-7 gap-y-3 text-sm text-gray-400">
            <span>✓ Technical Interviews</span>
            <span>✓ HR Interviews</span>
            <span>✓ Mixed Interviews</span>
          </div>
        </div>

        {/* Hero image */}
        
{/* Floating hero character */}
<div className="relative mx-auto flex h-[430px] w-full max-w-2xl items-center justify-center sm:h-[520px] md:h-[600px]">

  {/* Purple ambient glow */}
  <div className="absolute left-1/2 top-1/2 h-[65%] w-[65%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-purple-600/25 blur-[100px]" />

  <div className="absolute left-1/2 top-[58%] h-[45%] w-[55%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-500/10 blur-[90px]" />

  {/* Character image */}
  <div className="absolute inset-0 scale-125 animate-[float_6s_ease-in-out_infinite]">
    <Image
      src="/images/hero-AI.png"
      alt="Futuristic AI virtual interviewer"
      fill
      priority
      sizes="(max-width: 768px) 100vw, 50vw"
      className="object-contain object-center drop-shadow-[0_0_35px_rgba(139,92,246,0.28)]"
    />
  </div>

  {/* Floating status card */}
  <div className="absolute bottom-[5%] left-0 rounded-xl border border-white/15 bg-[#171027]/75 px-4 py-3 shadow-xl backdrop-blur-xl">
    <p className="text-xs text-purple-300">AI STATUS</p>
    <p className="mt-1 text-sm font-semibold text-white">
      Ready to Interview
    </p>
  </div>

  {/* <div className="absolute right-0 top-[15%] hidden rounded-xl border border-cyan-400/20 bg-[#171027]/75 px-4 py-3 text-xs text-cyan-200 shadow-xl backdrop-blur-xl sm:block">
    ✧ AI-powered feedback
  </div> */}

</div>

      </section>

      {/* Features */}
      <section id="features" className="relative z-10 border-t border-white/10 bg-white/[0.015] px-6 py-24">

        <div className="mx-auto max-w-7xl">

          <div className="mx-auto mb-14 max-w-2xl text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-purple-400">
              Why Interview.AI?
            </p>

            <h2 className="mt-4 text-3xl font-bold sm:text-4xl">
              Everything you need to
              <span className="text-purple-400"> stand out.</span>
            </h2>

            <p className="mt-5 leading-7 text-gray-400">
              More than just practice. Build confidence through realistic
              conversations and meaningful feedback.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            {features.map((feature) => (
              <div
                key={feature.number}
                className="group rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.07] to-white/[0.02] p-7 backdrop-blur-xl transition duration-300 hover:-translate-y-2 hover:border-purple-400/40 hover:shadow-xl hover:shadow-purple-950/30"
              >
                <div className="flex items-center justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-purple-400/20 bg-purple-500/10 text-2xl text-purple-300">
                    {feature.icon}
                  </div>
                  <span className="text-sm text-gray-600">
                    {feature.number}
                  </span>
                </div>

                <h3 className="mt-7 text-xl font-semibold">
                  {feature.title}
                </h3>

                <p className="mt-4 leading-7 text-gray-400">
                  {feature.description}
                </p>

                <div className="mt-7 text-sm font-medium text-purple-400 transition group-hover:text-purple-300">
                  Learn more →
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="relative z-10 px-6 py-24">
        <div className="mx-auto max-w-7xl rounded-3xl border border-purple-400/15 bg-gradient-to-br from-purple-900/20 via-[#130c20] to-[#090611] px-8 py-16 text-center sm:px-16">

          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-purple-400">
            Your journey starts here
          </p>

          <h2 className="mt-5 text-3xl font-bold sm:text-4xl">
            Practice. Improve. <span className="text-purple-400">Succeed.</span>
          </h2>

          <p className="mx-auto mt-5 max-w-xl leading-7 text-gray-400">
            Choose your interview, talk with AI and discover how to
            become a stronger candidate.
          </p>

          <a
            href="#features"
            className="mt-9 inline-flex rounded-xl bg-purple-600 px-7 py-4 text-sm font-semibold shadow-lg shadow-purple-600/20 transition hover:bg-purple-500"
          >
            Explore the platform →
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer id="about" className="relative z-10 border-t border-white/10 px-6 py-8">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 text-sm text-gray-500 sm:flex-row">

          <p>
            © 2026 <span className="font-semibold text-purple-400">INTERVIEW.AI</span>
            . All rights reserved.
          </p>

          <p>Built to help you perform at your best.</p>
        </div>
      </footer>
      <style jsx global>{`
  @keyframes float {
    0%, 100% {
      transform: translateY(0px);
    }
    50% {
      transform: translateY(-14px);
    }
  }
`}</style>

    </main>
  );
}
