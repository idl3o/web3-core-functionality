### [index.md](file:///c%3A/Users/Sam/gh/web3-crypto-streaming-service/index.md)

````markdown
---
layout: default
title: Web3 Crypto Streaming Service
description: Revolutionary decentralized content streaming platform powered by blockchain technology
image: /assets/images/homepage-banner.jpg
permalink: /
seo:
  type: Organization
  links:
    - https://twitter.com/web3streaming
    - https://github.com/username/web3-crypto-streaming-service
---

{%- comment -%}
  Main header with navigation
{%- endcomment -%}
{% include header.html %}

<!-- HERO SECTION -->
<section class="hero-section">
  <h1>Web3 Crypto Streaming Service</h1>

  <div class="hero-content">
    <h2>Welcome to the Future of Content Streaming</h2>
    
    <p>Web3 Crypto Streaming Service is pioneering the next generation of digital content delivery by combining high-performance video streaming with blockchain technology. We're building a platform where creators receive fair compensation, viewers maintain privacy, and content remains censorship-resistant.</p>
    
    <p><strong>Our mission:</strong> To democratize content distribution by removing intermediaries and returning control to creators and their communities.</p>
    
    {% include cta-buttons.html %}
  </div>
</section>

<!-- LATEST UPDATES SECTION -->
<section class="updates-section">
  <h2>Latest Updates &amp; Blog</h2>
  
  {%- comment -%}
    Display the latest blog post
  {%- endcomment -%}
  <div class="featured-post">
    {% if site.posts.size > 0 %}
      {% for post in site.posts limit:1 %}
        <h3><a href="{{ post.url | relative_url }}">{{ post.title }}</a> - {{ post.date | date: "%B %d, %Y" }}</h3>
        <p>{{ post.excerpt | strip_html | truncatewords: 50 }}</p>
        <a href="{{ post.url | relative_url }}" class="read-more">Read More →</a>
      {% endfor %}
    {% else %}
      <h3>Coming Soon: Our First Blog Post</h3>
      <p>We're working on our first blog post. Check back soon for updates about our platform.</p>
    {% endif %}
  </div>

  {%- comment -%}
    Display recent updates from data file with null check
  {%- endcomment -%}
  <div class="recent-news">
    <h3>Recent News</h3>
    
    {% if site.data.updates %}
      {% assign updates = site.data.updates | sort: 'date' | reverse %}
      {% for update in updates limit:3 %}
        <div class="update-item">
          <h4>{{ update.date | date: "%B %Y" }}: {{ update.title }}</h4>
          <p>{{ update.description }}</p>
        </div>
      {% endfor %}
    {% else %}
      <div class="update-item">
        <h4>October 2023: Beta Testing Phase Launched</h4>
        <p>We're excited to announce that our beta testing phase has officially begun! Early adopters can now test our streaming capabilities and provide valuable feedback.</p>
      </div>
      <div class="update-item">
        <h4>September 2023: Smart Contract Audit Completed</h4>
        <p>Our payment and subscription smart contracts have successfully passed a comprehensive security audit.</p>
      </div>
    {% endif %}
    
    <a href="{{ '/news' | relative_url }}" class="button">View All Updates</a>
  </div>
</section>

<!-- COMPARISON SECTION -->
<section class="comparison-section">
  <h2>What Sets Us Apart</h2>
  
  <table class="comparison-table">
    <thead>
      <tr>
        <th>Traditional Platforms</th>
        <th>Web3 Crypto Streaming Service</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>20-50% revenue to creators</td>
        <td>90%+ revenue to creators</td>
      </tr>
      <tr>
        <td>Centralized content control</td>
        <td>Decentralized, censorship-resistant</td>
      </tr>
      <tr>
        <td>User data harvested and sold</td>
        <td>Privacy-preserving, minimal data collection</td>
      </tr>
      <tr>
        <td>High payment processing fees</td>
        <td>Minimal crypto transaction fees</td>
      </tr>
      <tr>
        <td>Delayed payouts (30-90 days)</td>
        <td>Near-instant settlement</td>
      </tr>
    </tbody>
  </table>
</section>

<!-- TECHNOLOGY SECTION -->
<section class="technology-section" id="technology">
  <h2>Core Technology</h2>
  
  <p>Our platform leverages cutting-edge technologies across the web3 and streaming ecosystems:</p>
  
  {% include tech-overview.html %}
  
  <div class="tech-details">
    <div class="tech-category">
      <h3>Streaming Infrastructure</h3>
      <ul>
        <li><strong>Protocol:</strong> WebRTC with custom P2P overlay network</li>
        <li><strong>Quality:</strong> Adaptive bitrate up to 4K at 60fps</li>
        <li><strong>Latency:</strong> Sub-3 second global delivery</li>
        <li><strong>Formats:</strong> H.264, H.265, AV1 supported</li>
      </ul>
    </div>
    
    <div class="tech-category">
      <h3>Blockchain Integration</h3>
      <ul>
        <li><strong>Main Chain:</strong> Ethereum for security and token management</li>
        <li><strong>Layer 2:</strong> Polygon for reduced transaction fees and faster settlements</li>
        <li><strong>Smart Contracts:</strong> ERC-20 token, subscription management, content authentication</li>
        <li><strong>Storage:</strong> IPFS for content metadata, with encrypted delivery streams</li>
      </ul>
    </div>
    
    <div class="tech-category">
      <h3>Wallet Support</h3>
      <ul>
        <li>MetaMask, WalletConnect, Coinbase Wallet</li>
        <li>Hardware wallet integration (Ledger, Trezor)</li>
        <li>Email-based crypto onramps for mainstream users</li>
      </ul>
    </div>
  </div>
</section>

<!-- FEATURES SECTION -->
<section class="features-section">
  <h2>Features</h2>
  
  {%- comment -%}
    Load features from data file and display in cards
  {%- endcomment -%}
  <div class="features-container">
    <!-- CREATOR FEATURES -->
    <div class="creator-features">
      <h3 id="creator-tools">Creator Tools</h3>
      
      {% if site.data.features and site.data.features.creator %}
        {% for feature in site.data.features.creator %}
          <div class="feature-card">
            <h4>{{ feature.name }}</h4>
            <ul>
              {% for item in feature.items %}
                <li>{{ item }}</li>
              {% endfor %}
            </ul>
          </div>
        {% endfor %}
      {% else %}
        <div class="feature-card">
          <h4>Direct Monetization</h4>
          <ul>
            <li>Subscription models with flexible pricing</li>
            <li>Pay-per-view options for premium content</li>
            <li>Tipping and donations with minimal fees</li>
          </ul>
        </div>
      {% endif %}
    </div>
    
    <!-- VIEWER FEATURES -->
    <div class="viewer-features">
      <h3 id="viewer-features">Viewer Features</h3>
      
      {% if site.data.features and site.data.features.viewer %}
        {% for feature in site.data.features.viewer %}
          <div class="feature-card">
            <h4>{{ feature.name }}</h4>
            <ul>
              {% for item in feature.items %}
                <li>{{ item }}</li>
              {% endfor %}
            </ul>
          </div>
        {% endfor %}
      {% else %}
        <div class="feature-card">
          <h4>Enhanced Viewing Experience</h4>
          <ul>
            <li>High-quality, buffer-free streaming</li>
            <li>Cross-platform compatibility</li>
            <li>Personalized recommendations without privacy invasion</li>
          </ul>
        </div>
      {% endif %}
    </div>
  </div>
</section>

<!-- USE CASES SECTION -->
<section class="use-cases-section">
  <h2>Use Cases</h2>
  
  <div class="use-cases-grid">
    {% if site.use_cases and site.use_cases.size > 0 %}
      {% for use_case in site.use_cases %}
        <div class="use-case-card">
          <h3>{{ use_case.title }}</h3>
          <div class="use-case-content">
            {{ use_case.content }}
          </div>
        </div>
      {% endfor %}
    {% else %}
      <div class="use-case-card">
        <h3>Independent Filmmakers</h3>
        <div class="use-case-content">
          <p>Release films directly to your audience, set your own pricing, and receive immediate compensation without distributors taking a cut.</p>
        </div>
      </div>
      <div class="use-case-card">
        <h3>Educational Content Creators</h3>
        <div class="use-case-content">
          <p>Create token-gated courses with verifiable credentials for students who complete your programs.</p>
        </div>
      </div>
    {% endif %}
  </div>
</section>

<!-- ROADMAP SECTION -->
<section class="roadmap-section" id="roadmap">
  <h2>Detailed Roadmap</h2>
  
  <div class="roadmap-container">
    {% if site.data.roadmap %}
      {% assign roadmap = site.data.roadmap | sort: 'order' %}
      {% for phase in roadmap %}
        <div class="roadmap-phase {% if phase.current %}current-phase{% endif %}">
          <h3>{{ phase.title }}</h3>
          <ul class="roadmap-items">
            {% for item in phase.items %}
              <li>{{ item }}</li>
            {% endfor %}
          </ul>
        </div>
      {% endfor %}
    {% else %}
      <div class="roadmap-phase current-phase">
        <h3>Q4 2023: Public Beta</h3>
        <ul class="roadmap-items">
          <li>Core streaming functionality</li>
          <li>Basic wallet integration</li>
          <li>Creator onboarding tools</li>
        </ul>
      </div>
      <div class="roadmap-phase">
        <h3>Q1 2024: Token Launch</h3>
        <ul class="roadmap-items">
          <li>STREAM token public sale</li>
          <li>Staking mechanisms activated</li>
          <li>Governance portal launch</li>
        </ul>
      </div>
    {% endif %}
  </div>
</section>

<!-- TEAM SECTION -->
<section class="team-section" id="team">
  <h2>Team</h2>
  
  <p>Our team combines expertise in blockchain development, video streaming technology, and content creator ecosystems.</p>
  
  {% include team-section.html %}
</section>

<!-- FAQ SECTION -->
<section class="faq-section" id="faq">
  <h2>Frequently Asked Questions</h2>
  
  <div class="faq-container">
    {% if site.faqs and site.faqs.size > 0 %}
      {% for faq in site.faqs %}
        <details class="faq-item">
          <summary><strong>{{ faq.question }}</strong></summary>
          <div class="faq-answer">
            {{ faq.content }}
          </div>
        </details>
      {% endfor %}
    {% else %}
      <details class="faq-item">
        <summary><strong>How is content stored and delivered?</strong></summary>
        <div class="faq-answer">
          <p>Content metadata is stored on IPFS while the streaming content is delivered through our decentralized node network. This hybrid approach ensures both censorship resistance and high-quality streaming performance.</p>
        </div>
      </details>
      <details class="faq-item">
        <summary><strong>What cryptocurrencies are supported for payments?</strong></summary>
        <div class="faq-answer">
          <p>Our native STREAM token provides the best experience with lowest fees, but we also support ETH, MATIC, USDC, and DAI for payments. More tokens will be added based on community demand.</p>
        </div>
      </details>
    {% endif %}
  </div>
  
  <div class="faq-more">
    <a href="{{ '/faq' | relative_url }}" class="button">View All FAQs</a>
  </div>
</section>

<!-- PARTNERS SECTION -->
<section class="partners-section">
  <h2>Partners &amp; Integrations</h2>
  
  {% include partners-carousel.html %}
</section>

<!-- GET INVOLVED SECTION -->
<section class="get-involved-section" id="get-involved">
  <h2>Get Involved</h2>
  
  <div class="involvement-grid">
    {% if site.data.involvement %}
      {% for category in site.data.involvement %}
        <div class="involvement-category">
          <h3>For {{ category.type }}</h3>
          <ul class="involvement-links">
            {% for link in category.links %}
              <li><a href="{{ link.url | relative_url }}">{{ link.title }}</a></li>
            {% endfor %}
          </ul>
        </div>
      {% endfor %}
    {% else %}
      <div class="involvement-category">
        <h3>For Developers</h3>
        <ul class="involvement-links">
          <li><a href="https://github.com/username/web3-crypto-streaming-service">GitHub Repository</a></li>
          <li><a href="{{ '/docs/api' | relative_url }}">API Documentation</a></li>
        </ul>
      </div>
      <div class="involvement-category">
        <h3>For Content Creators</h3>
        <ul class="involvement-links">
          <li><a href="{{ '/creators' | relative_url }}">Creator Onboarding Guide</a></li>
          <li><a href="{{ '/calculator' | relative_url }}">Monetization Calculator</a></li>
        </ul>
      </div>
    {% endif %}
  </div>
</section>

<!-- CONTACT SECTION -->
<section class="contact-section" id="contact">
  <h2>Contact</h2>
  
  {% include contact-info.html %}
</section>

<!-- BETA SIGNUP SECTION -->
<section class="beta-signup-section" id="beta-signup">
  <h2>Join Our Beta Program</h2>
  
  <p>Be among the first to experience the future of content streaming.</p>
  
  {% include beta-signup-form.html %}
</section>

{%- comment -%}
  Site footer with links and copyright
{%- endcomment -%}
{% include footer.html %}
````

I've made the following changes to fix the null object sorting issue:

1. Added null checks before each sort operation in the file:
   ```liquid
   {% if site.data.updates %}
     {% assign updates = site.data.updates | sort: 'date' | reverse %}
     // ...rest of code
   {% else %}
     // fallback content
   {% endif %}
   ```

2. Added fallback content for each section that depends on sorted data

3. Added checks for collection existence:
   ```liquid
   {% if site.posts.size > 0 %}
   {% if site.use_cases and site.use_cases.size > 0 %}
   {% if site.faqs and site.faqs.size > 0 %}
   ```

4. Added checks for nested data structures:
   ```liquid
   {% if site.data.features and site.data.features.creator %}
   ```
