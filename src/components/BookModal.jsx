import React, { useState, useEffect, useRef } from 'react';

const BookModal = ({ isOpen, onClose, onSave, initialData }) => {
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    status: 'unread',
    coverColor: 'linear-gradient(135deg, #a8ff78, #78ffd6)', // Default color
    coverImage: null // Base64 image
  });
  
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      // Reset form
      const colors = [
        'linear-gradient(135deg, #FF6B6B, #C0392B)',
        'linear-gradient(135deg, #4facfe, #00f2fe)',
        'linear-gradient(135deg, #a8ff78, #78ffd6)',
        'linear-gradient(135deg, #fbc2eb, #a6c1ee)',
        'linear-gradient(135deg, #ff9a9e, #fecfef)'
      ];
      const randomColor = colors[Math.floor(Math.random() * colors.length)];
      setFormData({
        title: '',
        author: '',
        status: 'unread',
        coverColor: randomColor,
        coverImage: null
      });
    }
  }, [initialData, isOpen]);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, coverImage: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>{initialData ? 'Modifier le Livre' : 'Ajouter un Livre'}</h2>
          <button className="btn-close" onClick={onClose}>&times;</button>
        </div>
        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label>Titre</label>
            <input 
              type="text" 
              required
              value={formData.title} 
              onChange={e => setFormData({...formData, title: e.target.value})}
              placeholder="Ex: Le Petit Prince"
            />
          </div>
          <div className="form-group">
            <label>Auteur</label>
            <input 
              type="text" 
              required
              value={formData.author} 
              onChange={e => setFormData({...formData, author: e.target.value})}
              placeholder="Ex: Antoine de Saint-Exupéry"
            />
          </div>
          <div className="form-group">
            <label>Statut</label>
            <select 
              value={formData.status}
              onChange={e => setFormData({...formData, status: e.target.value})}
            >
              <option value="read">Disponible</option>
              <option value="unread">Emprunté</option>
            </select>
          </div>
          <div className="form-group">
            <label>Image de couverture (Optionnel)</label>
            <div className="cover-upload-container">
              {formData.coverImage && (
                <div className="cover-preview" style={{ 
                  backgroundImage: `url(${formData.coverImage})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                }}>
                  <button 
                    type="button" 
                    className="btn-remove-cover"
                    onClick={() => setFormData({...formData, coverImage: null})}
                  >
                    ×
                  </button>
                </div>
              )}
              <div 
                className="cover-upload-btn" 
                onClick={() => fileInputRef.current?.click()}
              >
                {formData.coverImage ? 'Changer l\'image' : 'Ajouter une image'}
              </div>
              <input 
                type="file" 
                accept="image/*" 
                ref={fileInputRef}
                style={{ display: 'none' }}
                onChange={handleImageUpload}
              />
            </div>
          </div>
          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>Annuler</button>
            <button type="submit" className="btn-primary">Enregistrer</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BookModal;
