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

// Ordered allowlist: projects render in this order.
// Descriptions come from each repo's GitHub "About" field —
// to change a description, edit it on GitHub, not here.
const featuredRepos: string[] = [
  "sykora",
  "walrus",
  "marionette",
  "crucible",
  "CustomDeathMessages",
  "nibble",
  "PolyForge",
  "8bit-auto",
];

function ensureHttps(url: string | null): string | null {
  if (!url) return null;
  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }
  return `https://${url}`;
}

async function getGitHubRepos(): Promise<Repo[]> {
  const res = await fetch(
    "https://api.github.com/users/sb2bg/repos?sort=updated&per_page=100",
    {
      next: { revalidate: 3600 }, // Revalidate every hour
    },
  );

  if (!res.ok) {
    return [];
  }

  const repos: Repo[] = await res.json();
  const byName = new Map(repos.map((r) => [r.name, r]));

  return featuredRepos
    .map((name) => byName.get(name))
    .filter((r): r is Repo => r !== undefined);
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
                  href={ensureHttps(repo.homepage) || "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-3 text-xs text-[#8a847a] hover:text-[#5c584e] transition-colors"
                >
                  [live →]
                </a>
              )}
              {repo.description && (
                <p className="text-sm text-[#6b655a] mt-1">
                  {repo.description}
                </p>
              )}
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
