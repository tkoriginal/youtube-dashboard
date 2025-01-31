export default function VideoPlayer() {
  return (
    <div className="md:flex-1 overflow-auto bg-gray-100 p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        {/* Video Player */}
        <div className="aspect-video bg-gray-200 rounded-xl overflow-hidden mb-6">
          <div className="w-full h-full flex items-center justify-center text-gray-500">
            Video Player Area
          </div>
        </div>

        {/* Video Controls */}
        <div className="bg-white p-4 rounded-xl shadow-sm">
          <div className="h-12 bg-gray-100 rounded-lg flex items-center justify-center text-gray-500">
            Video Controls
          </div>
        </div>
      </div>
    </div>
  )
}