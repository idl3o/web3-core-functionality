# Deployment Configuration Note

This repository uses the **direct HTML/CSS approach** (not Jekyll processing) for GitHub Pages deployment.

## Important Files:

- `.nojekyll` - Tells GitHub Pages not to process the site with Jekyll
- `index.html` - The main entry point for the site
- `redirect.html` - Provides redirection for deprecated URLs
- Various HTML files in subdirectories for different sections

## File Organization:

- `/assets/` - CSS, JavaScript, and images
- `/docs/` - Documentation files
- `/java/` - Java serverless integration documentation
- `/whitepaper/` - Project whitepaper

## For Local Testing:

```bash
# Navigate to the repository
cd /path/to/gh-pages

# Start a Python HTTP server
python3 -m http.server

# Open http://localhost:8000 in your browser
```

Alternatively, use the provided script:
```bash
chmod +x test-local.sh
./test-local.sh
```

## Notes for Future Development:

1. All new content should be added as HTML files, not Markdown
2. Use the existing CSS styles for consistency
3. Keep the structure and navigation consistent
4. Update links when adding new pages
