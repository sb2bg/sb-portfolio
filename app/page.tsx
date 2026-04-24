import Link from "next/link";
import { GitHubProjects } from "./components/GitHubProjects";
import { formatDate, getAllPosts } from "./lib/blog";

export default async function Home() {
  const [latestPost] = await getAllPosts();

  return (
    <div className="min-h-screen bg-[#f5f0e8] text-[#3d3a35] font-mono">
      <main className="max-w-2xl mx-auto px-6 py-16">
        {/* Header */}
        <header className="mb-12">
          <h1 className="text-4xl font-bold text-[#2c2a26] mb-2">
            Sullivan Bognar
          </h1>
          <p className="text-lg text-[#5c584e]">Computer Science @ UT Austin</p>
          <p className="text-sm text-[#7a756a] mt-1">Austin, Texas</p>
        </header>

        {/* Links */}
        <section className="mb-12">
          <div className="flex flex-wrap gap-4 text-sm">
            <a
              href="https://github.com/sb2bg"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#6b5b4d] hover:text-[#3d3a35] underline underline-offset-4 transition-colors"
            >
              github.com/sb2bg
            </a>
            <Link
              href="/blog"
              className="text-[#6b5b4d] hover:text-[#3d3a35] underline underline-offset-4 transition-colors"
            >
              blog
            </Link>
          </div>
        </section>

        {latestPost && (
          <section className="mb-12">
            <h2 className="text-sm uppercase tracking-widest text-[#8a847a] mb-4 border-b border-[#d9d3c7] pb-2">
              Latest Post
            </h2>
            <Link href={`/blog/${latestPost.slug}`} className="group block">
              <div className="flex items-baseline justify-between gap-4 mb-1">
                <h3 className="font-semibold text-[#2c2a26] group-hover:text-[#6b5b4d] underline underline-offset-4 decoration-transparent group-hover:decoration-[#6b5b4d] transition-colors">
                  {latestPost.title}
                </h3>
                <time className="text-xs text-[#8a847a] shrink-0">
                  {formatDate(latestPost.date)}
                </time>
              </div>
              <p className="text-sm text-[#6b655a] leading-relaxed">
                {latestPost.description}
              </p>
            </Link>
          </section>
        )}

        {/* About */}
        <section className="mb-12">
          <h2 className="text-sm uppercase tracking-widest text-[#8a847a] mb-4 border-b border-[#d9d3c7] pb-2">
            About
          </h2>
          <p className="leading-relaxed text-[#4a473f]">
            Software developer passionate about programming languages, systems
            programming, and building tools that make a difference. Experienced
            with Rust, Zig, TypeScript, Java, and more.
          </p>
        </section>

        {/* Experience */}
        <section className="mb-12">
          <h2 className="text-sm uppercase tracking-widest text-[#8a847a] mb-4 border-b border-[#d9d3c7] pb-2">
            Experience
          </h2>
          <div className="mb-8">
            <div className="flex justify-between items-start mb-1">
              <h3 className="font-semibold text-[#2c2a26]">Visa</h3>
              <span className="text-sm text-[#7a756a]">May - Jul 2026</span>
            </div>
            <p className="text-sm text-[#5c584e] mb-2">
              Software Engineering Intern · CMS (Commercial & Money Transfer
              Solutions)
            </p>
            <p className="text-sm text-[#7a756a] italic">Incoming</p>
          </div>
          <div className="mb-8">
            <div>
              <div className="flex justify-between items-start mb-1">
                <h3 className="font-semibold text-[#2c2a26]">
                  UT Austin Computer Science
                </h3>
                <span className="text-sm text-[#7a756a]">Jan - May 2026</span>
              </div>
              <p className="text-sm text-[#5c584e] mb-2">
                Undergraduate Course Assistant · Operating Systems (CS 439)
              </p>
              <p className="text-sm text-[#7a756a] italic">
                Assist with labs, grading, and office hours for an undergraduate
                OS course focused on Pintos and C.
              </p>
            </div>
          </div>
        </section>

        {/* Projects - Dynamic from GitHub */}
        <section className="mb-12">
          <h2 className="text-sm uppercase tracking-widest text-[#8a847a] mb-4 border-b border-[#d9d3c7] pb-2">
            Projects
          </h2>
          <GitHubProjects />
        </section>

        {/* Skills */}
        <section className="mb-12">
          <h2 className="text-sm uppercase tracking-widest text-[#8a847a] mb-4 border-b border-[#d9d3c7] pb-2">
            Skills
          </h2>
          <div className="flex flex-wrap gap-2">
            {[
              "Rust",
              "Zig",
              "JavaScript",
              "TypeScript",
              "Java",
              "Python",
              "Dart/Flutter",
              "Next.js",
              "React",
              "Cloudflare",
              "Docker",
              "Linux",
              "Git",
              "PostgreSQL",
              "Firebase",
            ].map((skill) => (
              <span
                key={skill}
                className="px-3 py-1 bg-[#e8e2d6] text-[#5c584e] text-sm rounded"
              >
                {skill}
              </span>
            ))}
          </div>
        </section>

        {/* Footer */}
        <footer className="pt-8 border-t border-[#d9d3c7] text-sm text-[#8a847a]">
          <p>Built with Next.js</p>
        </footer>
      </main>
    </div>
  );
}
