class CatalogService {
  constructor(bookRepository) {
    this.repo = bookRepository;
  }

  getBook(bookId) {
    const book = this.repo.findById(bookId);
    if (!book) {
      return null;
    }
    const available = this.repo.getAvailableStock(bookId);
    return {
      id: book.id,
      isbn: book.isbn,
      title: book.title,
      author: book.author,
      priceCents: book.priceCents,
      category: book.category,
      stockTotal: book.stock,
      stockAvailable: available,
    };
  }

  searchBooks(query) {
    const category = query.category;
    const items = this.repo.listBooks({ category });
    return {
      items: items.map((b) => ({
        id: b.id,
        title: b.title,
        author: b.author,
        priceCents: b.priceCents,
        stockAvailable: this.repo.getAvailableStock(b.id),
      })),
    };
  }

  reserve(payload) {
    const { bookId, quantity, reservationId } = payload;
    return this.repo.reserveStock(bookId, quantity, reservationId);
  }

  release(payload) {
    const { bookId, quantity, reservationId } = payload;
    return this.repo.releaseStock(bookId, quantity, reservationId);
  }

  commit(payload) {
    const { bookId, quantity } = payload;
    return this.repo.commitReservation(bookId, quantity);
  }
}

module.exports = { CatalogService };
