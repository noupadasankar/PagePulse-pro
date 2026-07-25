import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
      <h2 className="text-8xl font-black text-transparent bg-clip-text bg-gradient-to-br from-gray-600 to-gray-800 mb-4">404</h2>
      <h3 className="text-2xl font-bold text-white mb-4">Page Not Found</h3>
      <p className="text-gray-400 mb-8 max-w-md">
        Could not find requested resource. The page might have been removed or the URL is incorrect.
      </p>
      <Link 
        href="/"
        className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
      >
        Return Home
      </Link>
    </div>
  );
}
