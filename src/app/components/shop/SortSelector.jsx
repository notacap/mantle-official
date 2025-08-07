'use client';

export default function SortSelector({ value, onChange }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'flex-end',
      gap: '0.5rem',
      marginBottom: '1.5rem'
    }}>
      <label 
        htmlFor="sort-select"
        style={{
          fontSize: '0.875rem',
          fontWeight: '500',
          color: '#374151'
        }}
      >
        Sort by:
      </label>
      <select
        id="sort-select"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          padding: '0.5rem 0.75rem',
          fontSize: '0.875rem',
          border: '1px solid #d1d5db',
          borderRadius: '0.375rem',
          backgroundColor: '#fff',
          cursor: 'pointer',
          outline: 'none'
        }}
        onFocus={(e) => {
          e.target.style.borderColor = '#9CB24D';
          e.target.style.boxShadow = '0 0 0 3px rgba(156, 178, 77, 0.1)';
        }}
        onBlur={(e) => {
          e.target.style.borderColor = '#d1d5db';
          e.target.style.boxShadow = 'none';
        }}
      >
        <option value="default">Best Selling</option>
        <option value="highest-reviewed">Highest Reviewed</option>
        <option value="price-low-high">Price: Low to High</option>
        <option value="price-high-low">Price: High to Low</option>
      </select>
    </div>
  );
}