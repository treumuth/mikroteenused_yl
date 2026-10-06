const fs = require('fs');
const path = require('path');
const { AppError } = require('@raamatupood/common');

/**
 * Raamatukataloog + laoseis samas teenuses.
 * stock väli väheneb reserveerimisel; release taastab koguse tellimuse tühistamisel või rollback'il.
 */
class BookRepository {
  constructor(seedPath, logger) {
    this.logger = logger;
    this.booksById = new Map();
    /** @type {Map<string, number>} bookId -> reserveeritud kogus (veel laos, aga tellimuse all) */
    this.reservedByBook = new Map();
    this.loadSeed(seedPath);
  }

  loadSeed(seedPath) {
    this.ingestSeedFile(seedPath);
    const extendedPath = path.join(path.dirname(seedPath), 'extendedSeed.json');
    if (fs.existsSync(extendedPath)) {
      this.ingestSeedFile(extendedPath);
      this.logger.info('Extended catalog seed merged', { extendedPath });
    }
    this.logger.info('Catalog loaded from seed', { books: this.booksById.size, seedPath });
  }

  ingestSeedFile(filePath) {
    const raw = fs.readFileSync(filePath, 'utf8');
    const data = JSON.parse(raw);
    for (const book of data.books || []) {
      this.booksById.set(book.id, { ...book });
      if (!this.reservedByBook.has(book.id)) {
        this.reservedByBook.set(book.id, 0);
      }
    }
  }

  findById(id) {
    return this.booksById.get(id) || null;
  }

  listBooks(filter = {}) {
    let items = Array.from(this.booksById.values());
    if (filter.category) {
      items = items.filter((b) => b.category === filter.category);
    }
    return items;
  }

  getAvailableStock(bookId) {
    const book = this.findById(bookId);
    if (!book) {
      return null;
    }
    const reserved = this.reservedByBook.get(bookId) || 0;
    return book.stock - reserved;
  }

  /**
   * Atomiline reserveerimine — sünkroonset lukku simuleerib JavaScripti single-thread event loop.
   * Päris süsteemis kasutataks DB transaktsiooni või eraldi lao teenust.
   */
  reserveStock(bookId, quantity, reservationId) {
    const book = this.findById(bookId);
    if (!book) {
      throw new AppError('Book not found', 404, 'BOOK_NOT_FOUND', { bookId });
    }
    if (!Number.isInteger(quantity) || quantity < 1) {
      throw new AppError('Invalid quantity', 400, 'INVALID_QUANTITY');
    }
    const available = this.getAvailableStock(bookId);
    if (available < quantity) {
      throw new AppError('Insufficient stock', 409, 'INSUFFICIENT_STOCK', {
        bookId,
        requested: quantity,
        available,
      });
    }
    const reserved = this.reservedByBook.get(bookId) || 0;
    this.reservedByBook.set(bookId, reserved + quantity);
    this.logger.info('Stock reserved', { bookId, quantity, reservationId, availableAfter: available - quantity });
    return {
      bookId,
      quantity,
      reservationId,
      priceCents: book.priceCents,
      title: book.title,
    };
  }

  releaseStock(bookId, quantity, reservationId) {
    const book = this.findById(bookId);
    if (!book) {
      throw new AppError('Book not found', 404, 'BOOK_NOT_FOUND', { bookId });
    }
    const reserved = this.reservedByBook.get(bookId) || 0;
    const newReserved = Math.max(0, reserved - quantity);
    this.reservedByBook.set(bookId, newReserved);
    this.logger.info('Stock released', { bookId, quantity, reservationId, reservedNow: newReserved });
    return { bookId, released: quantity, reservationId };
  }

  /**
   * Tellimuse kinnitamisel muudetakse reserveering tegelikuks mahakandeks.
   */
  commitReservation(bookId, quantity) {
    const book = this.findById(bookId);
    if (!book) {
      throw new AppError('Book not found', 404, 'BOOK_NOT_FOUND', { bookId });
    }
    const reserved = this.reservedByBook.get(bookId) || 0;
    if (reserved < quantity) {
      throw new AppError('Reservation mismatch', 409, 'RESERVATION_MISMATCH', { bookId });
    }
    this.reservedByBook.set(bookId, reserved - quantity);
    book.stock -= quantity;
    if (book.stock < 0) {
      book.stock = 0;
    }
    return { bookId, stockRemaining: book.stock };
  }
}

module.exports = { BookRepository };
