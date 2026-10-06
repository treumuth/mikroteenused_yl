/**
 * Kataloogi päringumootor — laiendab lihtsat listBooks meetodit.
 * Õppekood: filtreerimine, sorteerimine, pagination stub.
 */

const { AppError } = require('@raamatupood/common');

function normalizeQueryString(value) {
  if (value === undefined || value === null) {
    return '';
  }
  return String(value).trim().toLowerCase();
}

function filterByTitle(books, titlePart) {
  const q = normalizeQueryString(titlePart);
  if (!q) {
    return books;
  }
  return books.filter((b) => b.title.toLowerCase().includes(q));
}

function filterByAuthor(books, authorPart) {
  const q = normalizeQueryString(authorPart);
  if (!q) {
    return books;
  }
  return books.filter((b) => b.author.toLowerCase().includes(q));
}

function filterByCategory(books, category) {
  const q = normalizeQueryString(category);
  if (!q) {
    return books;
  }
  return books.filter((b) => normalizeQueryString(b.category) === q);
}

function filterByMinPrice(books, minCents) {
  const min = Number(minCents);
  if (!Number.isFinite(min)) {
    return books;
  }
  return books.filter((b) => b.priceCents >= min);
}

function filterByMaxPrice(books, maxCents) {
  const max = Number(maxCents);
  if (!Number.isFinite(max)) {
    return books;
  }
  return books.filter((b) => b.priceCents <= max);
}

function filterInStockOnly(books, stockLookup) {
  return books.filter((b) => stockLookup(b.id) > 0);
}

function sortBooks(books, sortBy, direction) {
  const dir = direction === 'desc' ? -1 : 1;
  const key = sortBy || 'title';
  const allowed = ['title', 'author', 'priceCents', 'category'];
  if (!allowed.includes(key)) {
    throw new AppError(`Invalid sortBy: ${key}`, 400, 'INVALID_SORT');
  }
  return [...books].sort((a, b) => {
    const av = a[key];
    const bv = b[key];
    if (av < bv) {
      return -1 * dir;
    }
    if (av > bv) {
      return 1 * dir;
    }
    return 0;
  });
}

function paginate(items, page, pageSize) {
  const p = Math.max(1, Number(page) || 1);
  const size = Math.min(100, Math.max(1, Number(pageSize) || 20));
  const start = (p - 1) * size;
  return {
    page: p,
    pageSize: size,
    total: items.length,
    items: items.slice(start, start + size),
  };
}

class BookQueryEngine {
  constructor(getAllBooks, getAvailableStock) {
    this.getAllBooks = getAllBooks;
    this.getAvailableStock = getAvailableStock;
  }

  search(params) {
    let books = this.getAllBooks();
    books = filterByTitle(books, params.title);
    books = filterByAuthor(books, params.author);
    books = filterByCategory(books, params.category);
    books = filterByMinPrice(books, params.minPriceCents);
    books = filterByMaxPrice(books, params.maxPriceCents);
    if (params.inStockOnly === 'true' || params.inStockOnly === true) {
      books = filterInStockOnly(books, (id) => this.getAvailableStock(id));
    }
    books = sortBooks(books, params.sortBy, params.sortDir);
    const pageResult = paginate(books, params.page, params.pageSize);
    pageResult.items = pageResult.items.map((b) => ({
      id: b.id,
      title: b.title,
      author: b.author,
      priceCents: b.priceCents,
      category: b.category,
      stockAvailable: this.getAvailableStock(b.id),
    }));
    return pageResult;
  }

  aggregateByCategory() {
    const books = this.getAllBooks();
    const map = new Map();
    for (const b of books) {
      const cat = b.category || 'unknown';
      if (!map.has(cat)) {
        map.set(cat, { category: cat, count: 0, totalStockAvailable: 0 });
      }
      const row = map.get(cat);
      row.count += 1;
      row.totalStockAvailable += this.getAvailableStock(b.id);
    }
    return Array.from(map.values());
  }
}

module.exports = { BookQueryEngine, filterByTitle, filterByAuthor, sortBooks, paginate };
