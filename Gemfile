source "https://rubygems.org"

gem "jekyll", "~> 4.3.2"
gem "webrick", "~> 1.7"  # Required for Ruby 3.0+

# GitHub Pages compatibility
gem "github-pages", group: :jekyll_plugins

# Jekyll plugins
group :jekyll_plugins do
  gem "jekyll-feed", "~> 0.12"
  gem "jekyll-seo-tag", "~> 2.8"
  gem "jekyll-sitemap", "~> 1.4"
  gem "jekyll-redirect-from", "~> 0.16"
  gem "jekyll-titles-from-headings", "~> 0.5"
  gem "jekyll-remote-theme", "~> 0.4"
  gem "jekyll-include-cache", "~> 0.2"
end

# Windows and JRuby fixes
platforms :mingw, :x64_mingw, :mswin, :jruby do
  gem "tzinfo", ">= 1", "< 3"
  gem "tzinfo-data"
end

# Performance improvements
gem "liquid-c", "~> 4.0", :platforms => [:ruby]
