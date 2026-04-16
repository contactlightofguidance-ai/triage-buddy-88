import { Activity, Plus, BarChart3, ListOrdered, Moon, Sun } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

const AppHeader = () => {
  const location = useLocation();
  const [dark, setDark] = useState(() => {
    if (typeof window === "undefined") return false;
    const stored = localStorage.getItem("theme");
    if (stored) return stored === "dark";
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  }
  );

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem("theme", dark ? "dark" : "light");
  }, [dark]);

  const navItems = [
    { to: "/dashboard", label: "Dashboard", icon: BarChart3 },
    { to: "/patients", label: "File d'attente", icon: ListOrdered },
  ];

  return (
    <header className="glass-header sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-xl medical-gradient flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
            <Activity className="w-[18px] h-[18px] text-primary-foreground" />
          </div>
          <div className="hidden sm:block">
            <h1 className="text-sm font-bold text-foreground leading-tight">Ticket Assist</h1>
            <p className="text-[11px] text-muted-foreground leading-tight">Triage intelligent</p>
          </div>
        </Link>

        <nav className="flex items-center gap-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.to;
            return (
              <Link key={item.to} to={item.to}>
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "gap-1.5 text-xs font-medium h-8 px-3",
                    isActive
                      ? "bg-primary/10 text-primary hover:bg-primary/15"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <item.icon className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{item.label}</span>
                </Button>
              </Link>
            );
          })}

          <Link to="/">
            <Button size="sm" className="gap-1.5 text-xs font-semibold h-8 px-3 ml-1 shadow-sm">
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Nouveau patient</span>
            </Button>
          </Link>

          <Button
            variant="ghost"
            size="icon"
            className="w-8 h-8 ml-1 text-muted-foreground"
            onClick={() => setDark(!dark)}
          >
            {dark ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
          </Button>
        </nav>
      </div>
    </header>
  );
};

export default AppHeader;
