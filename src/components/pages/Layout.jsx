import { Outlet } from "react-router-dom"
import BottomNavigation from "@/components/organisms/BottomNavigation"

const Layout = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Main Content */}
      <div className="pb-20">
        <Outlet />
      </div>
      
      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  )
}

export default Layout