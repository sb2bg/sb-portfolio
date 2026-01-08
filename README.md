# sb-portfolio

My personal resume/portfolio site.

## About

Simple text-based resume with a tan theme. Pulls my projects directly from the GitHub API to stay automatically updated.

## Tech Stack

- Next.js 15
- TypeScript
- Tailwind CSS

## Development

```bash
yarn dev
```

## Notes

Projects displayed are controlled by the `projectDescriptions` object in `app/components/GitHubProjects.tsx`. The site fetches from GitHub hourly and shows only the repos I've explicitly included.
