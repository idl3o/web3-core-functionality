---
layout: default
title: Home
description: Welcome to the Web3 Crypto Streaming Service Platform
permalink: /
---

<!-- HERO SECTION -->-->
<section class="hero-section">
  <div class="hero-bg" style="background-image: url('/assets/images/homepage-banner.jpg')"></div>
  <div class="hero-content">
    <h1>Web3 Crypto Streaming Service</h1>eb3 Crypto Streaming Service</h1>
    <h2>The Future of Content Streaming</h2>    <h2>The Future of Content Streaming</h2>
    <p>Empowering creators and viewers through blockchain technology, decentralized delivery, and direct monetization.</p>ators and viewers through blockchain technology, decentralized delivery, and direct monetization.</p>
    <div class="hero-cta">
      <a href="#beta-signup" class="button primary">Join Beta Program</a>
      <a href="#features" class="button secondary">Learn More</a>ass="button secondary">Learn More</a>
    </div>
  </div>
</section>

<!-- KEY BENEFITS SECTION -->
<section class="benefits-section">
  <div class="container">ss="container">
    <div class="section-header"> class="section-header">
      <h2>Key Benefits</h2>Key Benefits</h2>
      <p>Our platform addresses the fundamental issues in traditional streaming services</p>      <p>Our platform addresses the fundamental issues in traditional streaming services</p>
    </div>
    
    <div class="benefits-grid">grid">
      <div class="benefit-card">
        <div class="benefit-icon">💰</div>-icon">💰</div>
        <h3>90%+ Creator Revenue</h3>
        <p>Creators receive the vast majority of their revenue with minimal platform fees.</p>>Creators receive the vast majority of their revenue with minimal platform fees.</p>
      </div>  </div>
      
      <div class="benefit-card">
        <div class="benefit-icon">🛡️</div>>
        <h3>Censorship Resistant</h3>
        <p>Decentralized content registry prevents arbitrary content removal.</p>
      </div>
      
      <div class="benefit-card">
        <div class="benefit-icon">🔒</div>
        <h3>Privacy Preserving</h3>
        <p>Minimal data collection with user control over personal information.</p>p>
      </div>
      
      <div class="benefit-card">
        <div class="benefit-icon">⚡</div>
        <h3>Instant Payments</h3>
        <p>Near-immediate settlement of earnings without lengthy holding periods.</p>p>
      </div>
    </div>div>
  </div>
</section>

<!-- LATEST UPDATES SECTION -->
<section class="updates-section">ss="updates-section">
  <div class="container">ss="container">
    <div class="section-header"> class="section-header">
      <h2>Latest Updates</h2>Latest Updates</h2>
      <p>Stay informed about our progress and developments</p>      <p>Stay informed about our progress and developments</p>
    </div>
    
    <div class="updates-grid">rid">
      <div class="featured-post">>
        {% if site.posts.size > 0 %} > 0 %}
          {% for post in site.posts limit:1 %}
            <h3><a href="{{ post.url | relative_url }}">{{ post.title }}</a></h3>  <h3><a href="{{ post.url | relative_url }}">{{ post.title }}</a></h3>
            <div class="post-meta">{{ post.date | date: "%B %d, %Y" }}</div>        <div class="post-meta">{{ post.date | date: "%B %d, %Y" }}</div>
            <p>{{ post.excerpt | strip_html | truncatewords: 40 }}</p> | strip_html | truncatewords: 40 }}</p>
            <a href="{{ post.url | relative_url }}" class="read-more">Read More →</a>| relative_url }}" class="read-more">Read More →</a>
          {% endfor %}
        {% else %}
          <h3>Coming Soon: Our First Blog Post</h3>
          <p>We're working on our first blog post. Check back soon for updates about our platform.</p>es about our platform.</p>
        {% endif %}
      </div>

      <div class="recent-news">recent-news">
        <h3>Recent News</h3>
        {% if site.data.updates %}
          {% assign updates = site.data.updates | sort: 'date' | reverse %} updates = site.data.updates | sort: 'date' | reverse %}
          {% for update in updates limit:3 %} for update in updates limit:3 %}
            <div class="update-item">            <div class="update-item">
              <div class="update-date">{{ update.date | date: "%B %Y" }}</div>e-date">{{ update.date | date: "%B %Y" }}</div>
              <h4>{{ update.title }}</h4>title }}</h4>
              <p>{{ update.description }}</p>tion }}</p>
            </div>
          {% endfor %}
        {% else %}
          <div class="update-item">
            <div class="update-date">October 2023</div>ber 2023</div>
            <h4>Beta Testing Phase Launched</h4>h4>
            <p>Our beta testing phase has officially begun! Early adopters can now test our streaming capabilities.</p> beta testing phase has officially begun! Early adopters can now test our streaming capabilities.</p>
          </div>
          <div class="update-item">ss="update-item">
            <div class="update-date">September 2023</div>">September 2023</div>
            <h4>Smart Contract Audit Completed</h4>
            <p>Our payment and subscription smart contracts have successfully passed a comprehensive security audit.</p>t contracts have successfully passed a comprehensive security audit.</p>
          </div>
        {% endif %} %}
        <a href="{{ '/blog' | relative_url }}" class="button secondary">View All Updates</a>ive_url }}" class="button secondary">View All Updates</a>
      </div>
    </div>
  </div>
</section>

<!-- COMPARISON SECTION -->
<section class="comparison-section">ss="comparison-section">
  <div class="container">ss="container">
    <div class="section-header"> class="section-header">
      <h2>What Sets Us Apart</h2>What Sets Us Apart</h2>
      <p>A direct comparison between traditional platforms and our Web3 solution.</p>      <p>A direct comparison between traditional platforms and our Web3 solution.</p>
    </div>
    <table class="comparison-table">
      <thead>
        <tr>
          <th>Feature</th>
          <th>Traditional Platforms</th>
          <th>Web3 Crypto Streaming</th><th>Web3 Crypto Streaming</th>
        </tr>
      </thead>>
      <tbody>>
        <tr>
          <td><strong>Creator Revenue</strong></td>trong></td>
          <td>20-50%</td>
          <td>90%+</td>>90%+</td>
        </tr>
        <tr>
          <td><strong>Content Control</strong></td>d><strong>Content Control</strong></td>
          <td>Centralized moderation</td>
          <td>Decentralized, censorship-resistant</td>ed, censorship-resistant</td>
        </tr>
        <tr>
          <td><strong>User Data</strong></td>d><strong>User Data</strong></td>
          <td>Harvested and sold</td>
          <td>Privacy-preserving, minimal collection</td> collection</td>
        </tr>
        <tr>
          <td><strong>Payment Processing</strong></td>d><strong>Payment Processing</strong></td>
          <td>5-10% fees</td>
          <td>Minimal crypto transaction fees</td>ion fees</td>
        </tr>
        <tr>
          <td><strong>Payment Timeline</strong></td>d><strong>Payment Timeline</strong></td>
          <td>30-90 day delays</td>
          <td>Near-instant settlement</td>ttlement</td>
        </tr>
        <tr>
          <td><strong>Geographic Restrictions</strong></td>d><strong>Geographic Restrictions</strong></td>
          <td>Region-based content blocks</td>
          <td>Globally accessible</td>td>
        </tr>
      </tbody>>
    </table>
  </div>
</section>

<!-- TECHNOLOGY SECTION -->GY SECTION -->
<section class="technology-section" id="technology">="technology-section" id="technology">
  <div class="container">="container">
    <div class="section-header"> class="section-header">
      <h2>Core Technology</h2>Core Technology</h2>
      <p>Our platform leverages cutting-edge technologies across the web3 and streaming ecosystems</p>      <p>Our platform leverages cutting-edge technologies across the web3 and streaming ecosystems</p>
    </div>
    {% include tech-overview.html %}
  </div>
</section>

<!-- FEATURES SECTION -->
<section class="features-section">lass="features-section">
  <div class="container">
    <h2>Platform Features</h2>Platform Features</h2>
    <p>Designed for both creators and viewers</p>igned for both creators and viewers</p>
    <div class="features-container">    <div class="features-container">
      <div class="feature-card">-card">
        <h4>Viewing Experience</h4>>
        <ul>
          <li>High-quality streaming up to 4K</li>eaming up to 4K</li>
          <li>Cross-platform compatibility</li>
          <li>Adaptive streaming based on connection</li>ed on connection</li>
          <li>Offline viewing capabilities</li>pabilities</li>
        </ul>
      </div>
      <div class="feature-card">
        <h4>Payment Options</h4>
        <ul>
          <li>Multiple cryptocurrency support</li>li>
          <li>Fiat on-ramps for mainstream users</li>>Fiat on-ramps for mainstream users</li>
          <li>Subscription management dashboard</li>i>Subscription management dashboard</li>
          <li>Pay-as-you-go microtransactions</li>otransactions</li>
        </ul>
      </div>
    </div>
  </div>
</section>

<!-- ROADMAP SECTION -->SECTION -->
<section class="roadmap-section" id="roadmap">ss="roadmap-section" id="roadmap">
  <div class="container">ss="container">
    <div class="section-header"> class="section-header">
      <h2>Roadmap</h2>Roadmap</h2>
      <p>Our development timeline and future plans</p>      <p>Our development timeline and future plans</p>
    </div>
    {% include roadmap-timeline.html %}
    <div class="roadmap-cta">ta">
      <a href="{{ '/whitepaper' | relative_url }}" class="button secondary">Read Full Whitepaper</a>| relative_url }}" class="button secondary">Read Full Whitepaper</a>
    </div>
  </div>
</section>

<!-- TEAM SECTION -->
<section class="team-section" id="team">
  <div class="container">ss="container">
    <h2>Our Team</h2>Our Team</h2>
    <p>The people building the future of decentralized content streaming</p> people building the future of decentralized content streaming</p>
    {% include team-section.html %}    {% include team-section.html %}
  </div>
</section>

<!-- FAQ SECTION -->
<section class="faq-section" id="faq">
  <div class="container">
    <h2>Frequently Asked Questions</h2>Frequently Asked Questions</h2>
    <p>Find answers to common questions about our platform</p>d answers to common questions about our platform</p>
    <div class="faq-container">    <div class="faq-container">
      <details class="faq-item">="faq-item">
        <summary><strong>How is content stored and delivered?</strong></summary>t stored and delivered?</strong></summary>
        <div class="faq-answer">nswer">
          <p>Content metadata is stored on IPFS while the streaming content is delivered through our decentralized node network. This hybrid approach ensures both censorship resistance and high-quality streaming.</p> on IPFS while the streaming content is delivered through our decentralized node network. This hybrid approach ensures both censorship resistance and high-quality streaming.</p>
        </div>
      </details>
      <details class="faq-item">
        <summary><strong>What cryptocurrencies are supported for payments?</strong></summary>ng></summary>
        <div class="faq-answer">
          <p>Our native STREAM token provides the best experience with the lowest fees, but we also support ETH, MATIC, USDC, and DAI for payments. More tokens will be added based on community demand.</p>
        </div>
      </details>
      <details class="faq-item">
        <summary><strong>How do creators get paid?</strong></summary>
        <div class="faq-answer">
          <p>Creators receive payments directly to their wallet addresses through smart contracts. Payments can be received as subscriptions, one-time payments, or tips from viewers. Funds are settled almost instantly, without the 30-90 day delays common on traditional platforms.</p>ost instantly, without the 30-90 day delays common on traditional platforms.</p>
        </div>
      </details>
    </div>
    <div class="faq-more text-center">
      <a href="{{ '/faq' | relative_url }}" class="button secondary">View All FAQs</a>ive_url }}" class="button secondary">View All FAQs</a>
    </div>
  </div>
</section>

<!-- PARTNERS SECTION -->
<section class="partners-section">
  <div class="container">ss="container">
    <div class="section-header"> class="section-header">
      <h2>Partners & Integrations</h2>Partners & Integrations</h2>
      <p>Working together to build the decentralized streaming ecosystem</p>      <p>Working together to build the decentralized streaming ecosystem</p>
    </div>
    {% include partners-carousel.html %}tml %}
  </div>
</section>

<!-- BETA SIGNUP SECTION -->
<section class="beta-signup-section" id="beta-signup">lass="beta-signup-section" id="beta-signup">
  <div class="container">
    <div class="section-header"> class="section-header">
      <h2>Join Our Beta Program</h2>Join Our Beta Program</h2>
      <p>Be among the first to experience the future of content streaming</p>      <p>Be among the first to experience the future of content streaming</p>
    </div>
    {% include beta-signup-form.html %}
  </div>
</section>

<!-- GET INVOLVED SECTION -->
<section class="get-involved-section" id="get-involved">lass="get-involved-section" id="get-involved">
  <div class="container">
    <div class="section-header"> class="section-header">
      <h2>Get Involved</h2>Get Involved</h2>
      <p>Multiple ways to participate in our growing ecosystem</p>      <p>Multiple ways to participate in our growing ecosystem</p>
    </div>
    <div class="involvement-grid">
      <div class="involvement-card">ment-card">
        <h3>For Creators</h3>
        <ul class="involvement-links">ent-links">
          <li><a href="{{ '/creators' | relative_url }}">Creator Onboarding Guide</a></li>nboarding Guide</a></li>
          <li><a href="{{ '/calculator' | relative_url }}">Monetization Calculator</a></li><li><a href="{{ '/calculator' | relative_url }}">Monetization Calculator</a></li>
          <li><a href="mailto:creators@web3streaming.example">Contact Creator Support</a></li>tors@web3streaming.example">Contact Creator Support</a></li>
        </ul>
      </div>
      <div class="involvement-card">
        <h3>For Developers</h3>
        <ul class="involvement-links">
          <li><a href="https://github.com/username/web3-crypto-streaming-service" target="_blank" rel="noopener">GitHub Repository</a></li>nk" rel="noopener">GitHub Repository</a></li>
          <li><a href="{{ '/docs/api' | relative_url }}">API Documentation</a></li>><a href="{{ '/docs/api' | relative_url }}">API Documentation</a></li>
          <li><a href="https://discord.gg/web3streaming" target="_blank" rel="noopener">Join Developer Discord</a></li>i><a href="https://discord.gg/web3streaming" target="_blank" rel="noopener">Join Developer Discord</a></li>
        </ul>
      </div>
      <div class="involvement-card">
        <h3>For Investors</h3>
        <ul class="involvement-links">
          <li><a href="{{ '/whitepaper' | relative_url }}">Read Whitepaper</a></li>
          <li><a href="{{ '/tokenomics' | relative_url }}">Token Economics</a></li>><a href="{{ '/tokenomics' | relative_url }}">Token Economics</a></li>
          <li><a href="mailto:investors@web3streaming.example">Investor Relations</a></li>i><a href="mailto:investors@web3streaming.example">Investor Relations</a></li>
        </ul>
      </div>
    </div>
  </div>
</section>

<!-- CONTACT SECTION -->SECTION -->
<section class="contact-section" id="contact">ss="contact-section" id="contact">
  <div class="container">ss="container">
    <div class="section-header"> class="section-header">
      <h2>Contact Us</h2>Contact Us</h2>
      <p>Have questions or feedback? We'd love to hear from you</p>      <p>Have questions or feedback? We'd love to hear from you</p>
    </div>
    {% include contact-info.html %}
  </div>
</section>

<script>
document.addEventListener('DOMContentLoaded', function() {ddEventListener('DOMContentLoaded', function() {
  // Tab functionality
  const tabButtons = document.querySelectorAll('.tab-button');tabButtons = document.querySelectorAll('.tab-button');
  const tabPanes = document.querySelectorAll('.tab-pane');bPanes = document.querySelectorAll('.tab-pane');

  tabButtons.forEach(button => {tons.forEach(button => {
    button.addEventListener('click', function() {
      const tab = this.dataset.tab;.dataset.tab;

      // Remove active class from all buttons and panes
      tabButtons.forEach(btn => btn.classList.remove('active'));      tabButtons.forEach(btn => btn.classList.remove('active'));
      tabPanes.forEach(pane => pane.classList.remove('active'));ane.classList.remove('active'));
      
      // Add active class to current button and panet button and pane
      this.classList.add('active');      this.classList.add('active');
      document.getElementById(`${tab}-tab`).classList.add('active');dd('active');
    });
  });
});
</script>