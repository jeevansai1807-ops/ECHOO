import { useState, useEffect } from 'react'
import { Activity, Folder, Users, LayoutDashboard, Settings, MessageSquare, Upload, Search, Bell, Sparkles } from 'lucide-react'
import { OrganizationPulse } from './components/OrganizationPulse'
import { KnowledgeGraph } from './components/KnowledgeGraph'
import { ChatPanel } from './components/ChatPanel'
import { FileUpload } from './components/FileUpload'
import { LoadingScreen } from './components/LoadingScreen'

function App() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simulate initial system connection loading
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 3000)
    return () => clearTimeout(timer)
  }, [])

  if (isLoading) {
    return <LoadingScreen />
  }

  return (
    <div className="flex h-screen w-full bg-echo-dark text-echo-text overflow-hidden transition-colors duration-500">
      {/* Sidebar */}
      <aside className="w-64 bg-echo-card/40 backdrop-blur-xl border-r border-white/10 flex flex-col z-20 shadow-[4px_0_24px_rgba(0,0,0,0.2)]">
        <div className="p-6 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-echo-accent flex items-center justify-center shadow-[0_0_15px_rgba(59,130,246,0.5)]">
            <Sparkles size={18} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-wider text-echo-text">ECHO</h1>
            <p className="text-[10px] text-echo-text-muted uppercase tracking-widest leading-none mt-1">Cognitive Hub</p>
          </div>
        </div>
        
        <nav className="flex-1 px-4 space-y-1.5 mt-2">
          <NavItem icon={<LayoutDashboard size={18}/>} label="Dashboard" active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
          <NavItem icon={<Upload size={18}/>} label="Upload Data" active={activeTab === 'upload'} onClick={() => setActiveTab('upload')} />
          <NavItem icon={<Folder size={18}/>} label="Projects" active={activeTab === 'projects'} onClick={() => setActiveTab('projects')} />
          <NavItem icon={<Users size={18}/>} label="Team" active={activeTab === 'team'} onClick={() => setActiveTab('team')} />
          <NavItem icon={<Activity size={18}/>} label="Analytics" active={activeTab === 'analytics'} onClick={() => setActiveTab('analytics')} />
        </nav>
        
        <div className="p-4 border-t border-white/10">
          <NavItem icon={<Settings size={18}/>} label="Settings" active={false} onClick={() => {}} />
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col relative overflow-y-auto">
        {/* Top Navbar */}
        <header className="sticky top-0 z-10 bg-echo-dark/50 backdrop-blur-md border-b border-white/5 px-6 py-4 flex items-center justify-between">
          <div className="relative w-full max-w-xl group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-echo-text-muted group-focus-within:text-echo-accent transition-colors" size={18} />
            <input 
              type="text" 
              placeholder="Search projects, people, documents, meetings..." 
              className="w-full bg-white/5 border border-white/10 rounded-full pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-echo-accent focus:bg-white/10 transition-all shadow-inner"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-50">
              <kbd className="bg-white/10 px-1.5 py-0.5 rounded text-[10px] border border-white/20">Ctrl</kbd>
              <kbd className="bg-white/10 px-1.5 py-0.5 rounded text-[10px] border border-white/20">K</kbd>
            </div>
          </div>
          
          <div className="flex items-center gap-4 ml-4">
            <ThemeToggle />
            <button className="relative p-2 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors text-echo-text-muted hover:text-echo-text">
              <Bell size={20} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full shadow-[0_0_8px_rgba(239,68,68,0.8)]"></span>
            </button>
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 border-2 border-white/10 flex items-center justify-center text-sm font-medium cursor-pointer">
              JD
            </div>
          </div>
        </header>

        {activeTab === 'dashboard' && (
          <div className="p-6 h-full flex flex-col gap-6">
            {/* Pulse */}
            <OrganizationPulse />

            {/* Graph Area */}
            <div className="flex-1 bg-echo-card/30 backdrop-blur-md border border-white/10 rounded-2xl overflow-hidden relative min-h-[500px] shadow-[inset_0_0_40px_rgba(0,0,0,0.2)]">
              <div className="absolute top-4 left-4 z-10 flex items-center gap-3">
                <h3 className="font-semibold text-lg bg-echo-dark/80 px-4 py-1.5 rounded-lg backdrop-blur-md border border-white/10 shadow-lg">Knowledge Graph</h3>
                <span className="text-xs text-echo-text-muted bg-white/5 px-2 py-1 rounded-md border border-white/5">Click nodes to explore relationships</span>
              </div>
              <KnowledgeGraph />
            </div>
          </div>
        )}

        {activeTab === 'upload' && (
           <div className="p-6 h-full flex flex-col items-center justify-center">
             <FileUpload />
           </div>
        )}

        {/* Other tabs placeholder */}
        {['projects', 'team', 'analytics'].includes(activeTab) && (
          <div className="p-6 flex items-center justify-center h-full text-echo-text-muted">
             <div className="text-center">
               <div className="w-16 h-16 rounded-full bg-black/5 dark:bg-white/5 flex items-center justify-center mx-auto mb-4">
                 <Sparkles className="text-echo-accent opacity-50" size={24} />
               </div>
               <h3 className="text-xl font-medium text-echo-text mb-2">{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Module</h3>
               <p>Coming Soon</p>
             </div>
          </div>
        )}
      </main>

      {/* Right Panel - AI Chat */}
      <aside className="w-96 bg-echo-card/40 backdrop-blur-xl border-l border-white/10 flex flex-col z-20 shadow-[-4px_0_24px_rgba(0,0,0,0.2)]">
        <div className="p-4 border-b border-white/10 flex items-center gap-3 bg-echo-dark/30">
          <div className="w-8 h-8 rounded-full bg-echo-accent/20 flex items-center justify-center">
             <MessageSquare className="text-echo-accent" size={16} />
          </div>
          <div>
            <h2 className="font-semibold text-sm">ECHO Assistant</h2>
            <p className="text-[10px] text-green-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 shadow-[0_0_5px_#4ade80]"></span> Online
            </p>
          </div>
        </div>
        <div className="flex-1 overflow-hidden">
          <ChatPanel />
        </div>
      </aside>
    </div>
  )
}

function NavItem({ icon, label, active, onClick }: { icon: React.ReactNode, label: string, active: boolean, onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative overflow-hidden ${
        active 
          ? 'bg-echo-accent/10 text-echo-accent font-medium border border-echo-accent/20' 
          : 'text-echo-text-muted hover:bg-white/5 hover:text-echo-text border border-transparent'
      }`}
    >
      {active && (
        <div className="absolute inset-0 bg-gradient-to-r from-echo-accent/10 to-transparent pointer-events-none" />
      )}
      <div className={`transition-transform duration-200 ${active ? 'scale-110' : 'group-hover:scale-110'}`}>
        {icon}
      </div>
      <span className="relative z-10">{label}</span>
    </button>
  )
}

function ThemeToggle() {
  const [isLight, setIsLight] = useState(false);
  
  useEffect(() => {
    // Default to dark mode (isLight = false)
    document.documentElement.classList.add('dark');
  }, []);

  const toggleTheme = () => {
    const nextState = !isLight;
    setIsLight(nextState);
    if (nextState) {
      document.documentElement.classList.remove('dark');
    } else {
      document.documentElement.classList.add('dark');
    }
  };

  return (
    <label className="cosmic-toggle scale-[0.3] origin-right mr-2 mt-[-5px]">
      <input type="checkbox" className="toggle" checked={isLight} onChange={toggleTheme} />
      <div className="slider">
        <div className="cosmos"></div>
        <div className="energy-line"></div>
        <div className="energy-line"></div>
        <div className="energy-line"></div>
        <div className="particles">
          <div className="particle" style={{ "--angle": "0deg" } as any}></div>
          <div className="particle" style={{ "--angle": "60deg" } as any}></div>
          <div className="particle" style={{ "--angle": "120deg" } as any}></div>
          <div className="particle" style={{ "--angle": "180deg" } as any}></div>
          <div className="particle" style={{ "--angle": "240deg" } as any}></div>
          <div className="particle" style={{ "--angle": "300deg" } as any}></div>
        </div>
        <div className="toggle-orb">
          <div className="inner-orb"></div>
          <div className="ring"></div>
        </div>
      </div>
    </label>
  );
}

export default App
