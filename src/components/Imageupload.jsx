import React, { useState } from 'react';

const API_URL = 'http://127.0.0.1:8080';

// Переиспользуемый компонент загрузки картинки
// value — текущий путь, onChange(path) — колбэк при изменении
function ImageUpload({ value, onChange }) {
  const [uploading, setUploading] = useState(false);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await fetch(`${API_URL}/api/upload`, {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        const data = await response.json();
        onChange(data.path); // Подставляем путь автоматически
      } else {
        alert('Ошибка загрузки файла на сервер.');
      }
    } catch (error) {
      alert('Ошибка сети при загрузке файла.');
    }

    setUploading(false);
  };

  return (
    <div>
      <label className="form-label small fw-bold text-muted">Картинка</label>

      {/* Превью если путь уже есть */}
      {value && (
        <div className="mb-2">
          <img
            src={value.startsWith('http') ? value : `/mpv${value}`}
            alt="preview"
            className="rounded border"
            style={{ height: '80px', objectFit: 'contain', background: '#f8f9fa', display: 'block' }}
          />
        </div>
      )}

      {/* Поле ручного ввода пути */}
      <input
        type="text"
        className="form-control mb-2"
        placeholder="/images/headphones.jpg"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />

      {/* Кнопка загрузки файла */}
      <div className="d-flex align-items-center gap-2">
        <label className="btn btn-outline-secondary btn-sm fw-bold mb-0" style={{ cursor: 'pointer' }}>
          {uploading ? 'Загрузка...' : '📁 Выбрать файл'}
          <input
            type="file"
            accept=".jpg,.jpeg,.png,.webp"
            style={{ display: 'none' }}
            onChange={handleFileChange}
            disabled={uploading}
          />
        </label>
        {value && (
          <span className="text-muted small text-truncate" style={{ maxWidth: '200px' }}>
            {value}
          </span>
        )}
      </div>
    </div>
  );
}

export default ImageUpload;