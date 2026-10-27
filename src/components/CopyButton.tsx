"use client";

import React from 'react';

interface CopyButtonProps {
  /** Text to copy to clipboard */
  text: string;
  /** Optional button label */
  label?: string;
}

export default function CopyButton({ text, label = 'Copy' }: CopyButtonProps) {
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      console.log('Copied to clipboard');
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="px-2 py-1 bg-gray-800 rounded hover:bg-gray-700"
    >
      {label}
    </button>
  );
}
