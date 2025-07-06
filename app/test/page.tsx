'use client';

import React, { useState } from 'react';

type Props = {
  title?: string;
};

const TestPage: React.FC<Props> = ({ title }) => {
  const [count, setCount] = useState(0);

  const increment = () => {
    setCount(count + 1);
  };

  return (
    <div className="p-4 bg-gray-100">
      <h1 className="text-3xl font-bold mb-2">{title ?? 'Testpagina'}</h1>
      <p>Sla dit bestand op om ESLint & Prettier te testen.</p>
      <button onClick={increment} className="mt-4 px-4 py-2 bg-green-600 text-white rounded">
        Klik me: {count}
      </button>
    </div>
  );
};

export default TestPage;
