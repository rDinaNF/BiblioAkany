import { useState, useEffect, useRef } from 'react'
import Navigation from './components/Navigation'
import BookCard from './components/BookCard'
import BookModal from './components/BookModal'
import BorrowModal from './components/BorrowModal'
import Sidebar from './components/Sidebar'
import Login from './components/Login'
import { supabase } from './supabaseClient'

function App() {
  const [books, setBooks] = useState([])
  const [loading, setLoading] = useState(true)

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
  const [notifications, setNotifications] = useState([])
  const [currentCategory, setCurrentCategory] = useState('all') // 'all' or 'borrowed'

  const [isBorrowModalOpen, setIsBorrowModalOpen] = useState(false)
  const [borrowingBook, setBorrowingBook] = useState(null)

  useEffect(() => {
    fetchBooks()
  }, [])

  const fetchBooks = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('books')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error

      const mappedBooks = data.map(b => ({
        id: b.id,
        title: b.title,
        author: b.author,
        status: b.status,
        coverColor: b.cover_color,
        coverImage: b.cover_image,
        borrower: b.borrower_name ? {
          name: b.borrower_name,
          date: b.borrow_date,
          dueDate: b.due_date
        } : null
      }))
      setBooks(mappedBooks)
    } catch (error) {
      console.error('Error fetching books:', error.message)
      addNotification('Erreur lors du chargement des livres', 'error')
    } finally {
      setLoading(false)
    }
  }

  const addNotification = (message, type = 'success') => {
    const id = Date.now()
    setNotifications(prev => [...prev, { id, message, type }])
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id))
    }, 3000)
  }

  const handleLogin = (username) => {
    setIsAuthenticated(true)
    setUser(username)
    localStorage.setItem('library_auth', 'true')
    localStorage.setItem('library_user', username)
    addNotification('Connexion réussie !', 'success')
  }

  const handleLogout = () => {
    setIsAuthenticated(false)
    setUser('')
    localStorage.removeItem('library_auth')
    localStorage.removeItem('library_user')
    addNotification('Déconnexion réussie !', 'info')
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

  const handleSaveBorrowInfo = async (borrowerData) => {
    try {
      const { error } = await supabase
        .from('books')
        .update({
          status: 'unread',
          borrower_name: borrowerData.name,
          borrow_date: borrowerData.date,
          due_date: borrowerData.dueDate
        })
        .eq('id', borrowingBook.id)

      if (error) throw error

      setBooks(books.map(b =>
        b.id === borrowingBook.id
          ? { ...b, status: 'unread', borrower: borrowerData }
          : b
      ))
      addNotification(`Livre emprunté par \${borrowerData.name}`, 'success')
    } catch (error) {
      console.error('Error borrowing book:', error.message)
      addNotification('Erreur lors de l\'emprunt', 'error')
    }
  }

  const handleReturnBook = async (id) => {
    try {
      const { error } = await supabase
        .from('books')
        .update({
          status: 'read',
          borrower_name: null,
          borrow_date: null,
          due_date: null
        })
        .eq('id', id)

      if (error) throw error

      setBooks(books.map(b =>
        b.id === id
          ? { ...b, status: 'read', borrower: null }
          : b
      ))
      addNotification('Livre rendu et maintenant disponible', 'success')
    } catch (error) {
      console.error('Error returning book:', error.message)
      addNotification('Erreur lors du rendu du livre', 'error')
    }
  }

  const handleSaveBook = async (bookData) => {
    try {
      const dbData = {
        title: bookData.title,
        author: bookData.author,
        status: bookData.status || 'read',
        cover_color: bookData.coverColor,
        cover_image: bookData.coverImage
      }

      if (editingBook) {
        const { error } = await supabase
          .from('books')
          .update(dbData)
          .eq('id', editingBook.id)

        if (error) throw error
        
        setBooks(books.map(b => b.id === editingBook.id ? { ...b, ...bookData } : b))
        addNotification('Livre modifié avec succès')
      } else {
        const { data, error } = await supabase
          .from('books')
          .insert([dbData])
          .select()

        if (error) throw error
        
        const newBook = {
          ...bookData,
          id: data[0].id,
          borrower: null
        }
        setBooks([newBook, ...books])
        addNotification('Nouveau livre ajouté')
      }
    } catch (error) {
      console.error('Error saving book:', error.message)
      addNotification('Erreur lors de l\'enregistrement', 'error')
    } finally {
      setEditingBook(null)
    }
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
    reader.onload = async (event) => {
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
        const insertData = newBooks.map(b => ({
          title: b.title,
          author: b.author,
          status: b.status,
          cover_color: b.coverColor
        }))

        try {
          const { data, error } = await supabase
            .from('books')
            .insert(insertData)
            .select()

          if (error) throw error

          const fetchedNewBooks = data.map(b => ({
            id: b.id,
            title: b.title,
            author: b.author,
            status: b.status,
            coverColor: b.cover_color,
            coverImage: b.cover_image,
            borrower: null
          }))

          setBooks(prev => [...fetchedNewBooks, ...prev])
          addNotification(`\${newBooks.length} livres importés avec succès !`)
        } catch (error) {
          console.error('Error importing books:', error.message)
          addNotification('Erreur lors de l\'importation', 'error')
        }
      }

      // Reset input so the same file can be imported again if needed
      e.target.value = null
    }

    reader.readAsText(file)
  }

  const handleExportCSV = () => {
    if (books.length === 0) {
      addNotification('Aucun livre à exporter', 'info')
      return
    }

    const headers = ['Titre', 'Auteur', 'Statut', 'Emprunteur', 'Date Emprunt', 'Date Retour']
    const csvContent = [
      headers.join(';'),
      ...books.map(book => [
        `"${book.title.replace(/"/g, '""')}"`,
        `"${book.author.replace(/"/g, '""')}"`,
        book.status === 'read' ? 'Disponible' : 'Emprunté',
        book.borrower ? `"${book.borrower.name.replace(/"/g, '""')}"` : '',
        book.borrower ? book.borrower.date : '',
        book.borrower ? (book.borrower.dueDate || '') : ''
      ].join(';'))
    ].join('\n')

    const blob = new Blob(["\ufeff" + csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.setAttribute('href', url)
    link.setAttribute('download', `bibliotheque_export_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    addNotification('Export CSV réussi !')
  }

  const filteredBooks = books.filter(book => {
    const matchesSearch = book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.author.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = currentCategory === 'all' || book.status === 'unread';
    return matchesSearch && matchesCategory;
  })

  const renderNotifications = () => {
    return (
      <div className="toast-container">
        {notifications.map(notification => (
          <div key={notification.id} className={`toast \${notification.type || ''}`}>
            <span className="toast-icon">
              {notification.type === 'success' ? '✅' : 'ℹ️'}
            </span>
            <span className="toast-message">{notification.message}</span>
          </div>
        ))}
      </div>
    );
  };

  if (!isAuthenticated) {
    return (
      <>
        <Login onLogin={handleLogin} />
        {renderNotifications()}
      </>
    );
  }

  return (
    <div className="app-container">
      <Sidebar 
        user={user}
        currentCategory={currentCategory}
        onCategoryChange={setCurrentCategory}
        onLogout={handleLogout}
      />

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
                <span className="icon">📥</span> Import CSV
              </button>
              <button className="btn-secondary" onClick={handleExportCSV}>
                <span className="icon">📤</span> Export CSV
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
          {loading ? (
            <div className="empty-state">
              <p>Chargement des livres depuis Supabase...</p>
            </div>
          ) : filteredBooks.length > 0 ? (
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
              <p>{searchQuery ? `Aucun livre trouvé pour "\${searchQuery}"` : "Aucun livre dans votre bibliothèque"}</p>
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

      {renderNotifications()}
    </div>
  )
}

export default App
