import { NavLink, Outlet } from "react-router-dom";
import { 
  Home, 
  Dumbbell, 
  Moon, 
  Brain, 
  MessageCircle, 
  BarChart3,
  Sparkles
} from "lucide-react";
import { motion } from "framer-motion";

const navItems = [
  { path: "/", icon: Home, label: "Dashboard" },
  { path: "/workout", icon: Dumbbell, label: "Workout" },
  { path: "/sleep", icon: Moon, label: "Sleep" },
  { path: "/meditation", icon: Brain, label: "Meditation" },
  { path: "/chat", icon: MessageCircle, label: "AI Coach" },
  { path: "/opik", icon: BarChart3, label: "Opik Metrics" },
];

export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 glass border-b border-white/5">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-3"
            >
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-foreground" data-testid="app-title">
                  Wellness AI
                </h1>
                <p className="text-xs text-muted-foreground">Your Personal Health Coach</p>
              </div>
            </motion.div>
            
            {/* Navigation */}
            <nav className="hidden md:flex items-center gap-1" data-testid="main-nav">
              {navItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === "/"}
                  className={({ isActive }) =>
                    `flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                      isActive
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                    }`
                  }
                  data-testid={`nav-${item.label.toLowerCase().replace(" ", "-")}`}
                >
                  <item.icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </NavLink>
              ))}
            </nav>
          </div>
        </div>
      </header>

      {/* Mobile Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 glass border-t border-white/5 px-2 py-2">
        <div className="flex items-center justify-around">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === "/"}
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all ${
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground"
                }`
              }
              data-testid={`mobile-nav-${item.label.toLowerCase().replace(" ", "-")}`}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-[10px]">{item.label}</span>
            </NavLink>
          ))}
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-6 py-8 pb-24 md:pb-8">
        <Outlet />
      </main>
    </div>
  );
}
