# Personal Website

A modern, responsive personal website built with [Hugo](https://gohugo.io) and hosted on GitHub Pages. Features include project showcases, blog posts, interactive tags, and a professional timeline layout.

🌐 **Live Site**: [https://yx-fan.github.io](https://yx-fan.github.io)

## Features

- **Custom Design**: Professional blue gradient theme with clean, modern UI
- **Projects Showcase**: Visual project cards with background images
- **Interactive Tags**: Dynamic tag cloud with search functionality
- **About Page**: Professional timeline layout for experience and education
- **Like Button**: Firebase-powered global like counter with Google Analytics integration
- **Responsive**: Fully responsive design for all devices

## Tech Stack

- **Framework**: Hugo (static site generator)
- **Theme**: Ananke (customized)
- **Database**: Firebase Realtime Database (for like counter)
- **Analytics**: Google Analytics
- **Hosting**: GitHub Pages

## Quick Start

### Prerequisites

- [Hugo](https://gohugo.io) (version 0.132.2 or later)

### Local Development

```bash
# Run local server
./startLocally.sh

# Or manually
hugo server --baseURL="http://localhost:1313" --disableFastRender
```

Visit [http://localhost:1313](http://localhost:1313) to view the site.

### Deployment

```bash
# Deploy to GitHub Pages
./deploy_to_github_page.sh
```

This builds the site and deploys to the `docs/` directory for GitHub Pages.

## Project Structure

```
├── content/          # Markdown content (pages, projects, posts)
├── layouts/          # Custom Hugo templates
├── static/           # Static assets (CSS, images)
├── themes/ananke/    # Ananke theme (git submodule)
└── hugo.toml         # Hugo configuration
```

## Customization

- **Styles**: Custom CSS in `static/css/`
- **Layouts**: Custom templates in `layouts/`
- **Firebase**: Configuration in `layouts/_default/baseof.html`
- **Analytics**: Google Analytics in `layouts/partials/google_analytics.html`