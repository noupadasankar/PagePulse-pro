export default function Loading() {
  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-16">
      <div className="animate-pulse flex flex-col space-y-8">
        {/* Hero Skeleton */}
        <div className="flex flex-col items-center space-y-4 pt-10">
          <div className="h-6 bg-gray-800 rounded-full w-48"></div>
          <div className="h-16 bg-gray-800 rounded-xl w-3/4 max-w-2xl"></div>
          <div className="h-4 bg-gray-800 rounded-full w-1/2 max-w-md mt-4"></div>
          
          <div className="w-full max-w-2xl h-24 bg-gray-800 rounded-2xl mt-8"></div>
        </div>
        
        <div className="h-px bg-gray-800 w-full my-8"></div>

        {/* Content Skeleton */}
        <div className="space-y-4">
          <div className="h-8 bg-gray-800 rounded-md w-48 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-32 bg-gray-800 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
