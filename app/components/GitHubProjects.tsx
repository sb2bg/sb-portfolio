interface Repo {
  id: number;
  name: string;
  html_url: string;
  description: string | null;
  language: string | null;
  stargazers_count: number;
  homepage: string | null;
  fork: boolean;
}

// Project descriptions for repos that don't have them on GitHub
const projectDescriptions: Record<string, string> = {
  walrus: "Dynamically typed programming language written in Rust",
  sykora: "Strong UCI chess engine written in Zig",
  "hues-who": "Flag guessing game built with TypeScript",
  "gamepigeon-solver":
    "Solver for GamePigeon word games, connect 4, and tic-tac-toe",
  CustomDeathMessages:
    "Spigot plugin with 22k+ downloads for customizable death messages",
  "next-minesweeper": "Minesweeper game built with Next.js",
  roommaite: "Roommate management app built with Flutter for HackTX",
  jordan_java: "App to teach special education students financial skills",
  "8bit-auto": "Vintage car matching - 1st place winner at RiverHacks",
};

async function getGitHubRepos(): Promise<Repo[]> {
  const res = await fetch(
    "https://api.github.com/users/sb2bg/repos?sort=updated&per_page=30",
    {
      next: { revalidate: 3600 }, // Revalidate every hour
    }
  );

  if (!res.ok) {
    return [];
  }

  const repos: Repo[] = await res.json();

  // Filter to only include repos in projectDescriptions
  return repos
    .filter((repo) => repo.name in projectDescriptions)
    .sort((a, b) => b.stargazers_count - a.stargazers_count);
}

export async function GitHubProjects() {
  const repos = await getGitHubRepos();

  if (repos.length === 0) {
    return (
      <p className="text-[#7a756a]">
        Unable to load projects. Check out my GitHub directly.
      </p>
    );
  }

  return (
    <ul className="space-y-6">
      {repos.map((repo) => (
        <li key={repo.id}>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <a
                href={repo.html_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#4a3f35] hover:text-[#2c2a26] font-medium underline underline-offset-4 transition-colors"
              >
                {repo.name}
              </a>
              {repo.homepage && (
                <a
                  href={repo.homepage}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-3 text-xs text-[#8a847a] hover:text-[#5c584e] transition-colors"
                >
                  [live →]
                </a>
              )}
              <p className="text-sm text-[#6b655a] mt-1">
                {repo.description ||
                  projectDescriptions[repo.name] ||
                  "No description"}
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs text-[#8a847a] shrink-0">
              {repo.language && (
                <span className="px-2 py-0.5 bg-[#e8e2d6] rounded">
                  {repo.language}
                </span>
              )}
              {repo.stargazers_count > 0 && (
                <span>★ {repo.stargazers_count}</span>
              )}
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}
