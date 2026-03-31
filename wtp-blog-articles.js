if (document.getElementById('blog-container')) {
  const RSS_URL = 'https://wtprints.com/rss';
  const blogContainer = document.getElementById('blog-container');
  const loadingIndicator = document.getElementById('loading');
  let currentPage = 1;
  const articlesPerPage = 10;
  const EXCLUSION_LIST = {
    paths: [
      '/page/500off',
      '/page/home',
      '/',
      '/page/privacy-policy',
      '/page/alreadyknow',
      '/page/contact-us',
      '/page/norcal',
      '/page/Buttontest',
      '/page/Send-Files',
      '/page/thanksgiving',
      '/page/customorder',
      '/page/direct-to',
      '/page/clipping-path-service-custom-quote',
      '/page/terms-of-use',
      '/page/turntimes',
      '/page/test',
      '/page/commercial-printing-business-tips'
    ]
  };

  async function fetchRSS() {
    try {
      const response = await fetch(RSS_URL);
      const text = await response.text();
      const xml = new DOMParser().parseFromString(text, 'text/xml');
      let items = Array.from(xml.querySelectorAll('item'));
      items = items.filter(item => {
        try {
          const link = new URL(item.querySelector('link').textContent);
          return !EXCLUSION_LIST.paths.includes(link.pathname);
        } catch {
          return true;
        }
      });
      items.sort((a, b) => {
        const dateA = new Date(a.querySelector('pubDate').textContent);
        const dateB = new Date(b.querySelector('pubDate').textContent);
        return dateB - dateA;
      });
      return items;
    } catch (error) {
      console.error('Error fetching RSS:', error);
      return [];
    }
  }

  function createArticleElement(item) {
    const title = item.querySelector('title').textContent;
    const link = item.querySelector('link').textContent;
    const description = item.querySelector('description').textContent;
    const pubDate = new Date(item.querySelector('pubDate').textContent).toLocaleDateString();
    const imageUrl = item.querySelector('enclosure') ? item.querySelector('enclosure').getAttribute('url') : '';
    const article = document.createElement('article');
    article.className = 'article';
    article.innerHTML = `
      <div class="pub-date">${pubDate}</div>
      <h2><a href="${link}">${title}</a></h2>
      ${imageUrl ? `<img src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7" data-src="${imageUrl}" alt="${title}" />` : ''}
      <p>${description}</p>
    `;
    return article;
  }

  function loadArticles(page) {
    loadingIndicator.style.display = 'block';
    fetchRSS().then(items => {
      const start = (page - 1) * articlesPerPage;
      const end = start + articlesPerPage;
      const articleElements = items.slice(start, end).map(createArticleElement);
      articleElements.forEach(article => blogContainer.appendChild(article));
      observeImages();
      if (end >= items.length) {
        loadingIndicator.style.display = 'none';
      } else {
        loadingIndicator.style.display = 'block';
      }
    });
  }

  function observeImages() {
    const images = document.querySelectorAll('img[data-src]');
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.dataset.src;
          img.classList.add('loaded');
          observer.unobserve(img);
        }
      });
    }, { rootMargin: '100px' });
    images.forEach(img => observer.observe(img));
  }

  function infiniteScroll() {
    if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight - 500) {
      currentPage++;
      loadArticles(currentPage);
    }
  }

  loadArticles(currentPage);
  window.addEventListener('scroll', infiniteScroll);
}
