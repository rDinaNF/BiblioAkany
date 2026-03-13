import React, { useState, useEffect } from 'react';

const BorrowModal = ({ isOpen, onClose, onSave, bookTitle }) => {
  const [borrowerData, setBorrowerData] = useState({
    name: '',
    date: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    if (isOpen) {
      setBorrowerData({
        name: '',
        date: new Date().toISOString().split('T')[0],
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (borrowerData.name.trim()) {
      onSave(borrowerData);
      onClose();
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Emprunter : {bookTitle}</h2>
          <button className="btn-close" onClick={onClose}>&times;</button>
        </div>
        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label>Nom de l'emprunteur</label>
            <input
              type="text"
              required
              autoFocus
              value={borrowerData.name}
              onChange={e => setBorrowerData({ ...borrowerData, name: e.target.value })}
              placeholder="Ex: Dina Niaina"
            />
          </div>
          <div className="form-group">
            <label>Date de l'emprunt</label>
            <input
              type="date"
              required
              value={borrowerData.date}
              onChange={e => setBorrowerData({ ...borrowerData, date: e.target.value })}
            />
          </div>
          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>Annuler</button>
            <button type="submit" className="btn-primary">Confirmer l'emprunt</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BorrowModal;
