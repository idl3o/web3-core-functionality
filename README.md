# GitHub Pages Project

Welcome to this GitHub Pages repository! This project is set up to deploy a website using GitHub Pages with automatic builds and deployments through GitHub Actions.

[![Deploy to GitHub Pages](https://github.com/idl3o/gh-pages/actions/workflows/deploy.yml/badge.svg)](https://github.com/idl3o/gh-pages/actions/workflows/deploy.yml)

## 🚀 Quick Start

1. **Clone this repository**
   ```bash
   git clone https://github.com/idl3o/gh-pages.git
   cd gh-pages
   ```

2. **Install dependencies**
   ```bash
   ./update-dependencies.sh
   ```

3. **Make changes to your content**
   - Edit files in the root directory for simple pages
   - Add posts in the `_posts` directory
   - Modify templates in the `_layouts` and `_includes` directories

4. **Test your changes locally**
   ```bash
   bundle exec jekyll serve
   ```
   Then visit `http://localhost:4000` in your browser.

5. **Deploy your changes**
   ```bash
   ./build-and-deploy.sh
   ```
   Or simply push to the main branch to trigger automatic deployment.

## 📂 Repository Structure

- `index.html`: Main landing page
- `assets/`: Contains CSS, JavaScript, and images
- `_config.yml`: Jekyll configuration
- `_posts/`: Contains blog posts
- `_layouts/`: Contains layout templates
- `_includes/`: Contains reusable components

## Deployment

The site is automatically deployed from the `main` branch using GitHub Actions.

## License

MIT © Your Name
