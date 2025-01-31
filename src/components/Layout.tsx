import VideoPlayer from './VideoPlayer'
import Sidebar from './Sidebar'

export default function Layout() {
  return (
    <div className="flex flex-col md:flex-row-reverse h-screen bg-gray-50">
      <VideoPlayer />
      <Sidebar />
    </div>
  )
}