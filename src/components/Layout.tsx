import Sidebar from './Sidebar'
import VideoPlayer from './VideoPlayer'
import { VideoProvider } from '@/context/VideoContext'

export default function Layout() {
  return (
    <VideoProvider>
      <div className="flex flex-col md:flex-row-reverse h-screen bg-gray-50">
        <VideoPlayer />
        <Sidebar />
      </div>
    </VideoProvider>
  )
}