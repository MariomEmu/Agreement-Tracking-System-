import React, { useState } from 'react';
 
export default function SearchBar() {
  const [searchTerm, setSearchTerm] = useState('');
 
  return (
    <div
      style={{
        marginBottom: '1.5rem',
        display: 'flex',
        gap: '0.5rem',
        maxWidth: '600px',
      }}
    >
      <input
        type="text"
        placeholder="Search by party/vendor..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        style={{
          flex: 1,
          padding: '0.5rem',
          borderRadius: '4px',
          border: '1px solid #ccc',
          fontSize: '1rem',
        }}
      />
      <button
        style={{
          padding: '0.5rem 1rem',
          borderRadius: '4px',
          background: '#007bff',
          color: '#fff',
          border: 'none',
          cursor: 'pointer',
        }}
      >
        Search
      </button>
    </div>
  );
}