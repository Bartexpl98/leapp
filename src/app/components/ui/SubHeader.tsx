// src/components/SubHeader.tsx
//Note: Probably delete
import Link from 'next/link';

export default function SubHeader() {
  return (
    <div className="bg-gray-500 px-4 py-1 border-b border-gray-300">
      <nav className="flex items-center justify-between max-w-7xl mx-auto">
        <Link href="/" className="text-blue-600ut"> Home </Link>
        <Link href="/" className="text-blue-600ut"> Dashboard</Link>
      </nav>
    </div>
  );
}
//
