import { useState, useEffect, useRef } from 'react'
import Navigation from './components/Navigation'
import BookCard from './components/BookCard'
import BookModal from './components/BookModal'
import BorrowModal from './components/BorrowModal'
import Login from './components/Login'

function App() {
  const [books, setBooks] = useState(() => {
    const saved = localStorage.getItem('library_books')
    if (saved) {
      return JSON.parse(saved)
    }
    return [
      { id: 1, title: 'L\'Étranger', author: 'Albert Camus', status: 'read', coverColor: 'linear-gradient(135deg, #FF6B6B, #C0392B)' },
      { id: 2, title: 'Les Misérables', author: 'Victor Hugo', status: 'unread', coverColor: 'linear-gradient(135deg, #4facfe, #00f2fe)' }
    ]
  })

  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('library_auth') === 'true'
  })

  const [user, setUser] = useState(() => {
    return localStorage.getItem('library_user') || ''
  })

  const [searchQuery, setSearchQuery] = useState('')

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingBook, setEditingBook] = useState(null)

  const fileInputRef = useRef(null)
  const [notification, setNotification] = useState(null)
  const [currentCategory, setCurrentCategory] = useState('all') // 'all' or 'borrowed'

  const [isBorrowModalOpen, setIsBorrowModalOpen] = useState(false)
  const [borrowingBook, setBorrowingBook] = useState(null)

  useEffect(() => {
    localStorage.setItem('library_books', JSON.stringify(books))
  }, [books])

  const handleLogin = (username) => {
    setIsAuthenticated(true)
    setUser(username)
    localStorage.setItem('library_auth', 'true')
    localStorage.setItem('library_user', username)
    setNotification({ message: 'Connexion réussie !', type: 'success' })
    setTimeout(() => setNotification(null), 3000)
  }

  const handleLogout = () => {
    setIsAuthenticated(false)
    setUser('')
    localStorage.removeItem('library_auth')
    localStorage.removeItem('library_user')
    setNotification({ message: 'Déconnexion réussie !', type: 'info' })
    setTimeout(() => setNotification(null), 3000)
  }

  const handleStatusChange = (id, newStatus) => {
    const book = books.find(b => b.id === id)
    if (newStatus === 'unread') {
      // Trying to borrow
      setBorrowingBook(book)
      setIsBorrowModalOpen(true)
    } else {
      // Trying to return (reset from borrowed to available)
      handleReturnBook(id)
    }
  }

  const handleSaveBorrowInfo = (borrowerData) => {
    setBooks(books.map(b =>
      b.id === borrowingBook.id
        ? { ...b, status: 'unread', borrower: borrowerData }
        : b
    ))
    setNotification({ message: `Livre emprunté par \${borrowerData.name}`, type: 'success' })
    setTimeout(() => setNotification(null), 3000)
  }

  const handleReturnBook = (id) => {
    setBooks(books.map(b =>
      b.id === id
        ? { ...b, status: 'read', borrower: null }
        : b
    ))
    setNotification({ message: 'Livre rendu et maintenant disponible', type: 'success' })
    setTimeout(() => setNotification(null), 3000)
  }

  const handleSaveBook = (bookData) => {
    if (editingBook) {
      setBooks(books.map(b => b.id === editingBook.id ? { ...b, ...bookData } : b))
    } else {
      setBooks([...books, { ...bookData, id: Date.now() }])
    }
    setEditingBook(null)
  }

  const handleEdit = (book) => {
    setEditingBook(book)
    setIsModalOpen(true)
  }

  const handleAdd = () => {
    setEditingBook(null)
    setIsModalOpen(true)
  }

  const handleImportClick = () => {
    fileInputRef.current.click()
  }

  const handleFileUpload = (e) => {
    const file = e.target.files[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const text = event.target.result
      const lines = text.split(/\r?\n/)

      const newBooks = []
      const colors = [
        'linear-gradient(135deg, #FF6B6B, #C0392B)',
        'linear-gradient(135deg, #4facfe, #00f2fe)',
        'linear-gradient(135deg, #a8ff78, #78ffd6)',
        'linear-gradient(135deg, #fbc2eb, #a6c1ee)',
        'linear-gradient(135deg, #ff9a9e, #fecfef)'
      ];

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim()
        if (!line) continue

        // Split by semicolon or comma
        const separator = line.includes(';') ? ';' : ','
        // Very basic CSV split, handles unquoted fields
        const parts = line.split(separator).map(p => p.trim())

        let title = parts[0]
        let author = parts[1] || 'Inconnu'

        // Remove possible quotes
        title = title.replace(/^["']|["']$/g, '')
        author = author.replace(/^["']|["']$/g, '')

        // Skip if it looks like a header
        if (title.toLowerCase() === 'titre' || title.toLowerCase() === 'title') continue

        if (title) {
          const randomColor = colors[Math.floor(Math.random() * colors.length)]
          newBooks.push({
            id: Date.now() + i,
            title,
            author,
            status: 'unread',
            coverColor: randomColor
          })
        }
      }

      if (newBooks.length > 0) {
        setBooks(prev => [...prev, ...newBooks])
      }

      // Reset input so the same file can be imported again if needed
      e.target.value = null
    }

    reader.readAsText(file)
  }

  const filteredBooks = books.filter(book => {
    const matchesSearch = book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.author.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = currentCategory === 'all' || book.status === 'unread';
    return matchesSearch && matchesCategory;
  })

  const renderNotification = () => {
    if (!notification) return null;
    return (
      <div className="toast-container">
        <div className={`toast \${notification.type || ''}`}>
          <span className="toast-icon">
            {notification.type === 'success' ? '✅' : 'ℹ️'}
          </span>
          <span className="toast-message">{notification.message}</span>
        </div>
      </div>
    );
  };

  if (!isAuthenticated) {
    return (
      <>
        <Login onLogin={handleLogin} />
        {renderNotification()}
      </>
    );
  }

  return (
    <div className="app-container">
      <aside className="sidebar">
        <div className="sidebar-header">
          <h1 className="logo"><span>📚</span> Biblio</h1>
        </div>

        <div className="sidebar-nav">
          <ul className="nav-list">
            <li
              className={`nav-item \${currentCategory === 'all' ? 'active' : ''}`}
              onClick={() => setCurrentCategory('all')}
            >
              <span className="icon">📖</span> Mes livres
            </li>
            <li
              className={`nav-item \${currentCategory === 'borrowed' ? 'active' : ''}`}
              onClick={() => setCurrentCategory('borrowed')}
            >
              <span className="icon">🤝</span> Mes emprunts
            </li>
          </ul>
        </div>

        <div className="sidebar-footer">
          <div className="sidebar-user">
            <span className="user-greeting">Bonjour,</span>
            <span className="user-name">{user}</span>
          </div>
          <button className="btn-secondary btn-sm btn-logout" onClick={handleLogout}>Déconnexion</button>
        </div>
      </aside>

      <main className="main-content">
        <header className="page-header">
          <div className="header-top">
            <h2>{currentCategory === 'all' ? 'Mes Livres' : 'Mes Emprunts'}</h2>
            <div className="header-actions" style={{ display: 'flex', gap: '1rem' }}>
              <input
                type="file"
                accept=".csv"
                style={{ display: 'none' }}
                ref={fileInputRef}
                onChange={handleFileUpload}
              />
              <button className="btn-secondary" onClick={handleImportClick}>
                <span className="icon">📄</span> Import CSV
              </button>
              <button className="btn-primary" onClick={handleAdd}>
                <span className="icon">+</span> Ajouter un Livre
              </button>
            </div>
          </div>
          <div className="search-bar">
            <input
              type="text"
              placeholder="Rechercher par titre ou auteur..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </div>
        </header>

        <div className="books-grid">
          {filteredBooks.length > 0 ? (
            filteredBooks.map(book => (
              <BookCard
                key={book.id}
                book={book}
                onStatusChange={handleStatusChange}
                onEdit={handleEdit}
              />
            ))
          ) : (
            <div className="empty-state">
              <p>Aucun livre trouvé pour "{searchQuery}"</p>
            </div>
          )}
        </div>
      </main>

      <BookModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveBook}
        initialData={editingBook}
      />

      <BorrowModal
        isOpen={isBorrowModalOpen}
        onClose={() => setIsBorrowModalOpen(false)}
        onSave={handleSaveBorrowInfo}
        bookTitle={borrowingBook?.title}
      />

      {renderNotification()}
    </div>
  )
}

export default App
