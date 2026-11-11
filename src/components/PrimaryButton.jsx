import React from 'react';

export default function PrimaryButton({ children, onClick, className = '' }) {
  return (
    <button
      onClick={onClick}
      className={`bg-gold-500 text-navy-500 font-medium py-2 px-4 rounded-md hover:bg-gold-600 transition ${className}`}
    >
      {children}
    </button>
  );
}

