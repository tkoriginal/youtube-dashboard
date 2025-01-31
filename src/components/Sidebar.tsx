export default function Sidebar() {
  return (
    <aside className="w-full md:w-64 lg:w-80 bg-white border-t md:border-r border-gray-200 overflow-y-auto">
      <div className="p-4">
        <h1 className="text-xl font-bold text-gray-800 mb-4">Video Library</h1>

        {/* Search Bar */}
        <div className="mb-4">
          <input
            type="text"
            placeholder="Search videos..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg 
                focus:outline-none focus:ring-2 focus:ring-blue-500 
                placeholder-gray-400 text-gray-700"
          />
        </div>

        {/* Video List */}
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors"
            >
              <h3 className="font-medium text-gray-800 mb-1">
                Video Title {i + 1}
              </h3>
              <p className="text-sm text-gray-500 line-clamp-2">
                Video description placeholder text for demonstration purposes.
              </p>
            </div>
          ))}
        </div>
      </div>
    </aside>
  )
}