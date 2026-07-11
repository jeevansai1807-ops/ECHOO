import { useEffect, useState } from 'react'
import { AlertTriangle, Clock, FileText, Users, Hash, TrendingUp, TrendingDown, Minus } from 'lucide-react'
import axios from 'axios'
import { motion } from 'framer-motion'

export function OrganizationPulse() {
  const [pulse, setPulse] = useState<any>(null)
  
  useEffect(() => {
    // For MVP, we fetch from the mock endpoint or fallback to static if offline
    axios.get('http://localhost:8000/pulse').then(res => {
      setPulse(res.data)
    }).catch(() => {
      setPulse({
        risks: [{project: "Project Apollo", status: "At Risk", reason: "Budget Delay"}],
        deadlines: 5,
        new_documents: 12,
        active_team: "Engineering",
        discussed_project: "Project Apollo"
      })
    })
  }, [])

  if (!pulse) return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
      {[1,2,3,4,5].map(i => <div key={i} className="h-28 animate-pulse bg-echo-card/50 rounded-2xl border border-white/5"></div>)}
    </div>
  )

  const cards = [
    { 
      title: `${pulse.risks.length} project${pulse.risks.length > 1 ? 's' : ''} at risk`, 
      icon: <AlertTriangle className="text-red-400" size={24} />,
      bg: "bg-red-400/10",
      border: "border-red-400/20",
      hoverBorder: "hover:border-red-400/50 hover:shadow-[0_0_20px_rgba(248,113,113,0.2)]",
      trend: { value: "+1", type: "up", text: "since yesterday" }
    },
    { 
      title: `${pulse.deadlines} deadlines due`, 
      icon: <Clock className="text-yellow-400" size={24} />,
      bg: "bg-yellow-400/10",
      border: "border-yellow-400/20",
      hoverBorder: "hover:border-yellow-400/50 hover:shadow-[0_0_20px_rgba(250,204,21,0.2)]",
      trend: { value: "-2", type: "down", text: "this week" }
    },
    { 
      title: `${pulse.new_documents} new documents`, 
      icon: <FileText className="text-green-400" size={24} />,
      bg: "bg-green-400/10",
      border: "border-green-400/20",
      hoverBorder: "hover:border-green-400/50 hover:shadow-[0_0_20px_rgba(74,222,128,0.2)]",
      trend: { value: "+12", type: "up", text: "today" }
    },
    { 
      title: pulse.active_team,
      subtitle: "Most active team",
      icon: <Users className="text-blue-400" size={24} />,
      bg: "bg-blue-400/10",
      border: "border-blue-400/20",
      hoverBorder: "hover:border-blue-400/50 hover:shadow-[0_0_20px_rgba(59,130,246,0.2)]",
      trend: { value: "High", type: "neutral", text: "activity" }
    },
    { 
      title: pulse.discussed_project,
      subtitle: "Most discussed",
      icon: <Hash className="text-purple-400" size={24} />,
      bg: "bg-purple-400/10",
      border: "border-purple-400/20",
      hoverBorder: "hover:border-purple-400/50 hover:shadow-[0_0_20px_rgba(168,85,247,0.2)]",
      trend: { value: "Apollo", type: "neutral", text: "trending" }
    },
  ]

  const getTrendIcon = (type: string) => {
    if (type === 'up') return <TrendingUp size={12} className="text-red-400" />
    if (type === 'down') return <TrendingDown size={12} className="text-green-400" />
    return <Minus size={12} className="text-echo-text-muted" />
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
      {cards.map((card, i) => (
        <motion.div 
          key={i}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
          whileHover={{ y: -5, scale: 1.02 }}
          className={`p-4 rounded-2xl border ${card.bg} ${card.border} ${card.hoverBorder} transition-all duration-300 flex flex-col justify-between cursor-pointer group bg-echo-card/40 backdrop-blur-md`}
        >
          <div className="flex items-center justify-between mb-3">
            <div className={`p-2.5 rounded-xl bg-echo-dark/80 shadow-inner group-hover:scale-110 transition-transform duration-300`}>
              {card.icon}
            </div>
            {card.trend && (
              <div className="flex items-center gap-1 text-[10px] bg-white/5 px-2 py-1 rounded-full border border-white/5">
                {getTrendIcon(card.trend.type)}
                <span className="text-echo-text-muted">{card.trend.value}</span>
              </div>
            )}
          </div>
          <div>
            <h4 className="font-semibold text-echo-text leading-tight text-lg group-hover:text-echo-text transition-colors">{card.title}</h4>
            {card.subtitle && <p className="text-xs text-echo-text-muted mt-1 uppercase tracking-wider">{card.subtitle}</p>}
            {!card.subtitle && card.trend && <p className="text-[10px] text-echo-text-muted mt-1">{card.trend.text}</p>}
          </div>
        </motion.div>
      ))}
    </div>
  )
}
