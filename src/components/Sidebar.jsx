import React from 'react';

const Sidebar = ({ user, currentCategory, onCategoryChange, onLogout, books = [] }) => {
  // Extract unique categories from books
  const categories = Array.from(new Set(books.map(b => b.category).filter(Boolean))).sort();

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h1 className="logo"><span>📚</span> Biblio Akany Ando</h1>
      </div>

      <div className="sidebar-nav">
        <ul className="nav-list">
          <li
            className={`nav-item ${currentCategory === 'all' ? 'active' : ''}`}
            onClick={() => onCategoryChange('all')}
          >
            <span className="icon">📖</span> Mes livres
          </li>
          <li
            className={`nav-item ${currentCategory === 'borrowed' ? 'active' : ''}`}
            onClick={() => onCategoryChange('borrowed')}
          >
            <span className="icon">🤝</span> Mes emprunts
          </li>
        </ul>

        {categories.length > 0 && (
          <>
            <div className="nav-section-title">Mes catégories</div>
            <ul className="nav-list">
              {categories.map(cat => (
                <li
                  key={cat}
                  className={`nav-item ${currentCategory === cat ? 'active' : ''}`}
                  onClick={() => onCategoryChange(cat)}
                >
                  <span className="icon">🏷️</span> {cat}
                </li>
              ))}
            </ul>
          </>
        )}
      </div>

      <div className="sidebar-footer">
        <div className="sidebar-user">
          <span className="user-greeting">Bonjour,</span>
          <span className="user-name">{user}</span>
        </div>
        <button className="btn-secondary btn-sm btn-logout" onClick={onLogout}>
          Déconnexion
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
