/**
 * Content Loader
 *
 * Handles dynamic content loading for the streaming platform
 */

document.addEventListener('DOMContentLoaded', function() {
  // Load trending content
  loadTrendingContent();

  // Mock data for trending content
  function loadTrendingContent() {
    const contentGrid = document.getElementById('trending-content-grid');
    if (!contentGrid) return;

    // Clear placeholder
    contentGrid.innerHTML = '';

    // Mock content data
    const trendingContent = [
      {
        title: 'Introduction to Web3',
        creator: 'Alice Nakamoto',
        duration: '23:45',
        views: '15.3K',
        thumbnail: 'assets/images/placeholder-1.jpg',
        category: 'Education'
      },
      {
        title: 'Building Smart Contracts',
        creator: 'Bob Chen',
        duration: '42:12',
        views: '8.7K',
        thumbnail: 'assets/images/placeholder-2.jpg',
        category: 'Development'
      },
      {
        title: 'Crypto Economics Explained',
        creator: 'Charlie Buterin',
        duration: '18:30',
        views: '12.4K',
        thumbnail: 'assets/images/placeholder-3.jpg',
        category: 'Finance'
      },
      {
        title: 'Decentralized Storage Systems',
        creator: 'Dave Pinckney',
        duration: '33:27',
        views: '5.2K',
        thumbnail: 'assets/images/placeholder-4.jpg',
        category: 'Technology'
      }
    ];

    // Generate content cards
    trendingContent.forEach(content => {
      const card = document.createElement('div');
      card.className = 'content-card';

      // Using a placeholder image if actual thumbnail isn't found
      const imageSrc = `/assets/images/placeholder-content.jpg`;

      card.innerHTML = `
        <div class="content-thumbnail">
          <img src="${imageSrc}" alt="${content.title}">
          <span class="content-duration">${content.duration}</span>
        </div>
        <div class="content-info">
          <h3>${content.title}</h3>
          <p class="content-creator">${content.creator}</p>
          <div class="content-meta">
            <span class="content-views">${content.views} views</span>
            <span class="content-category">${content.category}</span>
          </div>
        </div>
      `;

      contentGrid.appendChild(card);
    });
  }
});
