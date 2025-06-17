export default function Loader() {
  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="flex flex-col items-center gap-4">
        {/* Main Spinner */}
        <div className="relative">
          <div className="w-16 h-16 border-4 border-gray-200 rounded-full animate-spin border-t-blue-600"></div>
          <div className="absolute inset-0 w-16 h-16 border-4 border-transparent rounded-full animate-ping border-t-blue-400"></div>
        </div>
        
        {/* Loading Text */}
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-700 mb-1">Loading</h3>
          <p className="text-sm text-gray-500">Please wait while we prepare your dashboard</p>
        </div>
        
        {/* Progress Dots */}
        <div className="flex gap-1">
          <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>
      </div>
    </div>
  );
}