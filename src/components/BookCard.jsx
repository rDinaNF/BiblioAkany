import React from 'react';

const BookCard = ({ book, onStatusChange, onEdit }) => {
  return (
    <div className="book-card">
      <div
        className="book-cover"
        style={{
          backgroundImage: book.coverImage ? `url(${book.coverImage})` : book.coverColor,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        {!book.coverImage && <span className="book-title-overlay">{book.title}</span>}
      </div>
      <div className="book-info">
        <h3 className="book-title">{book.title}</h3>
        <p className="book-author">{book.author}</p>
        <div className="book-footer">
          <div className="status-container">
            <button
              className={`status-badge \${book.status}`}
              onClick={() => onStatusChange(book.id, book.status === 'read' ? 'unread' : 'read')}
              disabled={book.status === 'unread'}
              title={book.status === 'unread' ? "Livre actuellement emprunté" : "Cliquez pour emprunter"}
            >
              {book.status === 'read' ? 'Disponible' : 'Emprunté'}
            </button>
            {book.status === 'unread' && book.borrower && (
              <div className="borrower-info">
                <span className="borrower-name">👤 {book.borrower.name}</span>
                <span className="borrower-date">📅 Emprunt : {book.borrower.date}</span>
                {book.borrower.dueDate && (
                  <span className="borrower-date">⌛ Retour : {book.borrower.dueDate}</span>
                )}
              </div>
            )}
          </div>
          
          <div className="card-actions">
            {book.status === 'unread' && (
              <button 
                className="btn-return" 
                onClick={() => onStatusChange(book.id, 'read')}
                title="Rendre le livre"
              >
                📥 Rendre
              </button>
            )}
            <button className="btn-edit" onClick={() => onEdit(book)}>
              ✏️
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookCard;
