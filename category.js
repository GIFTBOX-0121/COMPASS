
(() => {
  'use strict';

  const API =
    'https://compass-api.starsx0601.workers.dev';

  const NAMES = {
    physical: 'Physical',
    mv: 'Music Video',
    streaming: 'Streaming',
    download: 'Download',
    radio: 'Radio',
    karaoke: 'Karaoke',
    other: 'Other'
  };

  const category = document.body.dataset.category;

  const title = document.getElementById('categoryTitle');
  const search = document.getElementById('categorySearch');
  const list = document.getElementById('articleList');

  if (!NAMES[category] || !title || !search || !list) {
    return;
  }

  title.textContent = NAMES[category];
  document.title = NAMES[category] + ' | COMPASS';

  let articles = [];

  function formatDate(value) {
    if (!value) return '';

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';

    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).replaceAll('/', '.');
  }

  function updatedLabel(article) {
    if (!article.published_at || !article.updated_at) {
      return '';
    }

    const published = new Date(article.published_at);
    const updated = new Date(article.updated_at);

    if (
      !Number.isFinite(published.getTime()) ||
      !Number.isFinite(updated.getTime()) ||
      updated.getTime() - published.getTime() <= 60000
    ) {
      return '';
    }

    return formatDate(article.updated_at) + ' 更新';
  }

  function showMessage(message) {
    list.replaceChildren();

    const p = document.createElement('p');
    p.className = 'message';
    p.textContent = message;

    list.appendChild(p);
  }

  function render() {
    const words = search.value
      .trim()
      .toLocaleLowerCase()
      .split(/\s+/)
      .filter(Boolean);

    const filtered = articles.filter(article => {
      const text = [
        article.title || '',
        article.summary || ''
      ].join(' ').toLocaleLowerCase();

      return words.every(word => text.includes(word));
    });

    list.replaceChildren();

    if (!filtered.length) {
      showMessage(
        words.length
          ? '検索条件に一致する記事はありません。'
          : '現在、公開中の記事はありません。'
      );
      return;
    }

    for (const article of filtered) {
      const card = document.createElement('a');
      card.className = 'article-card';
      card.href =
        'article.html?id=' +
        encodeURIComponent(article.id);

      const updated = updatedLabel(article);

      if (updated) {
        const label = document.createElement('span');
        label.className = 'update-label';
        label.textContent = updated;
        card.appendChild(label);
      }

      const heading = document.createElement('h2');
      heading.className = 'article-title';
      heading.textContent = article.title || '無題';
      card.appendChild(heading);

      if (article.summary) {
        const summary = document.createElement('p');
        summary.className = 'article-summary';
        summary.textContent = article.summary;
        card.appendChild(summary);
      }

      list.appendChild(card);
    }
  }

  async function load() {
    showMessage('記事を読み込み中…');

    try {
      const response = await fetch(
        API + '/api/public/articles',
        { cache: 'no-store' }
      );

      if (!response.ok) {
        throw new Error('HTTP ' + response.status);
      }

      const data = await response.json();

      articles = (Array.isArray(data.articles)
        ? data.articles
        : []
      ).filter(article => article.category === category);

      render();

    } catch (error) {
      showMessage(
        '記事を取得できませんでした。ページを再読み込みしてください。'
      );
    }
  }

  search.addEventListener('input', render);

  load();
})();

