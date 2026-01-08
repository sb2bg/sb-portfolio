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

## Deployment

### Docker

Build and run with Docker Compose:

```bash
docker compose up -d
```

The site will be available at `http://localhost:3000`.

### Manual Docker

```bash
# Build
docker build -t sb-resume .

# Run
docker run -p 3000:3000 sb-resume
```

### Server Deployment

1. Clone repo on your server
2. Run `docker compose up -d`
3. Set up reverse proxy (nginx/caddy) to forward your domain to port 3000
4. Optional: Use a process manager or systemd service to auto-restart on reboot

Example nginx config:

```nginx
server {
    server_name yourdomain.com;
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## Notes

Projects displayed are controlled by the `projectDescriptions` object in `app/components/GitHubProjects.tsx`. The site fetches from GitHub hourly and shows only the repos I've explicitly included.
