import { useState, useCallback, useEffect } from 'react'
import { UploadCloud, File, CheckCircle, ArrowRight } from 'lucide-react'
import axios from 'axios'
import { motion, AnimatePresence } from 'framer-motion'

export function FileUpload() {
  const [isDragging, setIsDragging] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [uploadState, setUploadState] = useState<'idle' | 'uploading' | 'processing' | 'success'>('idle')
  const [progress, setProgress] = useState(0)

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const onDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setFile(e.dataTransfer.files[0])
      setUploadState('idle')
    }
  }, [])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0])
      setUploadState('idle')
    }
  }

  // Simulate progress bar
  useEffect(() => {
    let interval: any;
    if (uploadState === 'uploading') {
      interval = setInterval(() => {
        setProgress(p => {
          if (p >= 90) {
            setUploadState('processing')
            return 90;
          }
          return p + 10;
        })
      }, 300)
    } else if (uploadState === 'processing') {
      interval = setInterval(() => {
        setProgress(p => {
          if (p >= 100) {
            clearInterval(interval)
            return 100;
          }
          return p + 2;
        })
      }, 100)
    }
    return () => clearInterval(interval)
  }, [uploadState])

  const handleUpload = async () => {
    if (!file) return
    setUploadState('uploading')
    setProgress(0)
    
    const formData = new FormData()
    formData.append('file', file)

    try {
      await axios.post('http://localhost:8000/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      setTimeout(() => {
        setUploadState('success')
        setProgress(100)
      }, 1500) // Mocking delay for processing animation
    } catch (error) {
      console.error("Upload failed", error)
      alert("Upload failed. Please check the backend connection.")
      setUploadState('idle')
    }
  }

  const reset = () => {
    setFile(null)
    setUploadState('idle')
    setProgress(0)
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-4xl font-bold mb-3 bg-gradient-to-r from-echo-text to-echo-text-muted bg-clip-text text-transparent">Upload Knowledge</h2>
        <p className="text-echo-text-muted text-lg">Upload PDFs, TXTs, or DOCX files. ECHO will automatically extract entities and build relationships.</p>
      </div>

      <motion.div 
        className={`border-2 border-dashed rounded-3xl p-12 text-center transition-all duration-300 relative overflow-hidden glass-panel shadow-2xl ${
          isDragging 
            ? 'border-echo-accent bg-echo-accent/10 scale-[1.02]' 
            : 'border-echo-text/20 hover:border-echo-text/40 hover:bg-echo-card/60'
        }`}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <AnimatePresence mode="wait">
          {!file ? (
            <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center">
              <div className="w-24 h-24 rounded-full bg-echo-card/50 flex items-center justify-center mb-6 shadow-inner border border-echo-text/10">
                <UploadCloud size={48} className="text-echo-accent opacity-80" />
              </div>
              <h3 className="text-2xl font-semibold mb-2">Drag & Drop files here</h3>
              <p className="text-echo-text-muted mb-8">or</p>
              <label className="bg-echo-accent hover:bg-blue-600 text-white px-8 py-3 rounded-full cursor-pointer transition-all shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:shadow-[0_0_30px_rgba(59,130,246,0.6)] font-medium">
                Browse Files
                <input type="file" className="hidden" accept=".pdf,.txt,.docx" onChange={handleFileChange} />
              </label>
            </motion.div>
          ) : (
            <motion.div key="file" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center w-full max-w-md mx-auto">
              <div className="w-20 h-20 rounded-2xl bg-echo-card/80 flex items-center justify-center mb-6 border border-echo-text/10 shadow-lg relative">
                {uploadState === 'success' 
                  ? <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}><CheckCircle size={40} className="text-green-400" /></motion.div>
                  : <File size={40} className="text-echo-accent" />
                }
                
                {/* Ping animation during processing */}
                {uploadState === 'processing' && (
                  <span className="absolute flex h-full w-full">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-2xl bg-echo-accent opacity-20"></span>
                  </span>
                )}
              </div>
              
              <h3 className="text-xl font-medium mb-1 truncate w-full">{file.name}</h3>
              <p className="text-sm text-echo-text-muted mb-8">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
              
              {uploadState !== 'idle' && (
                <div className="w-full mb-8">
                  <div className="flex justify-between text-xs text-echo-text-muted mb-2">
                    <span>{uploadState === 'uploading' ? 'Uploading...' : uploadState === 'processing' ? 'Extracting Entities & AI Processing...' : 'Upload Complete'}</span>
                    <span>{progress}%</span>
                  </div>
                  <div className="w-full h-2 bg-echo-text/10 rounded-full overflow-hidden">
                    <motion.div 
                      className={`h-full ${uploadState === 'success' ? 'bg-green-400' : 'bg-echo-accent'}`}
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 0.2 }}
                    />
                  </div>
                </div>
              )}

              {uploadState === 'idle' && (
                <div className="flex gap-4 w-full">
                  <button onClick={reset} className="flex-1 py-3 rounded-full border border-echo-text/20 hover:bg-echo-text/5 transition-colors">
                    Cancel
                  </button>
                  <button onClick={handleUpload} className="flex-1 py-3 rounded-full bg-echo-accent text-white hover:bg-blue-600 transition-colors font-medium shadow-[0_0_15px_rgba(59,130,246,0.4)]">
                    Process Document
                  </button>
                </div>
              )}

              {uploadState === 'success' && (
                <div className="flex gap-4 w-full mt-4">
                  <button onClick={reset} className="flex-1 py-3 rounded-full border border-echo-text/20 hover:bg-echo-text/5 transition-colors">
                    Upload Another
                  </button>
                  <button className="flex-1 py-3 rounded-full bg-green-500 text-white hover:bg-green-600 transition-colors font-medium shadow-[0_0_15px_rgba(34,197,94,0.4)] flex items-center justify-center gap-2 group">
                    View in Graph <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}
