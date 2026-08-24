import { useState, useRef, useEffect } from 'react'
import { Send, User, Bot, Loader2, Target, Link as LinkIcon, FileText, ArrowRight } from 'lucide-react'
import axios from 'axios'
import { motion, AnimatePresence } from 'framer-motion'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  sources?: string[]
  confidenceScore?: number
  relatedEntities?: string[]
  suggestedFollowups?: string[]
}

export function ChatPanel() {
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', role: 'assistant', content: 'Hello! I am ECHO. Ask me anything about your organization, projects, or documents.' }
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSend = async (e?: React.FormEvent, forcedInput?: string) => {
    e?.preventDefault()
    const query = forcedInput || input
    if (!query.trim() || isLoading) return

    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: query }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setIsLoading(true)

    try {
      const res = await axios.post('http://localhost:8000/chat', { query })
      const botMsg: Message = { 
        id: (Date.now() + 1).toString(), 
        role: 'assistant', 
        content: res.data.answer,
        sources: res.data.sources,
        confidenceScore: res.data.confidence_score,
        relatedEntities: res.data.related_entities,
        suggestedFollowups: res.data.suggested_followups
      }
      setMessages(prev => [...prev, botMsg])
    } catch (error) {
      setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), role: 'assistant', content: 'Sorry, I encountered an error connecting to the knowledge base.' }])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-full bg-transparent relative">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-echo-dark/80 pointer-events-none z-10 bottom-20" />
      
      <div className="flex-1 overflow-y-auto p-4 space-y-6 pb-24 z-0">
        <AnimatePresence>
          {messages.map((msg) => (
            <motion.div 
              key={msg.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-lg ${msg.role === 'user' ? 'bg-echo-accent shadow-[0_0_10px_rgba(59,130,246,0.5)]' : 'bg-echo-card border border-echo-text/10'}`}>
                {msg.role === 'user' ? <User size={16} className="text-white" /> : <Bot size={16} className="text-echo-accent" />}
              </div>
              
              <div className={`flex flex-col gap-2 max-w-[85%] ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                <div className={`rounded-2xl px-4 py-3 shadow-lg ${msg.role === 'user' ? 'bg-echo-accent text-white rounded-tr-sm' : 'glass-panel !border-t-0 !border-l-0 !rounded-2xl !rounded-tl-sm text-echo-text'}`}>
                  <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                </div>

                {/* Rich Response Metadata */}
                {msg.role === 'assistant' && msg.confidenceScore !== undefined && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="flex flex-col gap-2 w-full mt-1">
                    
                    {/* Confidence Score */}
                    <div className="flex items-center gap-1.5 text-xs">
                      <Target size={12} className={msg.confidenceScore > 90 ? 'text-green-400' : 'text-yellow-400'} />
                      <span className="text-echo-text-muted">Confidence:</span>
                      <span className={`font-medium ${msg.confidenceScore > 90 ? 'text-green-400' : 'text-yellow-400'}`}>{msg.confidenceScore}%</span>
                    </div>

                    {/* Sources */}
                    {msg.sources && msg.sources.length > 0 && (
                      <div className="flex flex-wrap items-center gap-2 mt-1">
                        <FileText size={12} className="text-echo-text-muted" />
                        {msg.sources.map((src, i) => (
                          <span key={i} className="text-[10px] bg-echo-text/5 border border-echo-text/10 px-2 py-0.5 rounded-full text-echo-text-muted flex items-center gap-1 hover:bg-echo-text/10 cursor-pointer transition-colors">
                            {src}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Related Entities */}
                    {msg.relatedEntities && msg.relatedEntities.length > 0 && (
                      <div className="flex flex-wrap items-center gap-2 mt-1">
                        <LinkIcon size={12} className="text-echo-text-muted" />
                        {msg.relatedEntities.map((ent, i) => (
                          <span key={i} className="text-[10px] bg-blue-500/10 border border-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full hover:bg-blue-500/20 cursor-pointer transition-colors">
                            {ent}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Suggested Follow-ups */}
                    {msg.suggestedFollowups && msg.suggestedFollowups.length > 0 && (
                      <div className="flex flex-col gap-1.5 mt-3 border-t border-white/5 pt-3">
                        <span className="text-[10px] text-echo-text-muted uppercase tracking-wider mb-1">Suggested</span>
                        {msg.suggestedFollowups.map((suggestion, i) => (
                          <button 
                            key={i} 
                            onClick={() => handleSend(undefined, suggestion)}
                            className="text-left text-xs text-echo-accent bg-echo-accent/5 hover:bg-echo-accent/10 border border-echo-accent/20 px-3 py-1.5 rounded-lg flex items-center justify-between group transition-all"
                          >
                            <span className="truncate pr-2">{suggestion}</span>
                            <ArrowRight size={12} className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                          </button>
                        ))}
                      </div>
                    )}
                  </motion.div>
                )}
              </div>
            </motion.div>
          ))}
          {isLoading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-echo-card border border-echo-text/10 flex items-center justify-center shrink-0">
                <Bot size={16} className="text-echo-accent" />
              </div>
              <div className="glass-panel rounded-2xl px-4 py-3 flex items-center gap-2">
                <Loader2 className="animate-spin text-echo-accent" size={16} />
                <span className="text-sm text-echo-text-muted">ECHO is thinking...</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-4 glass-panel rounded-none border-x-0 border-b-0 z-20">
        <form onSubmit={handleSend} className="w-full">
          <label className="search-label w-full flex">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask ECHO anything..."
              required
            />
            <span className="slash-icon">/</span>
            <button 
              type="submit" 
              className="search-icon"
              disabled={isLoading}
            >
              <Send size={16} />
            </button>
          </label>
        </form>
      </div>
    </div>
  )
}
