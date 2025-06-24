'use client'

import { useState, useEffect } from 'react'
import { toast, Toaster } from 'react-hot-toast'
import { Search, Star, Sparkles } from 'lucide-react'

// Types
interface Agent {
  id: number
  name: string
  description: string
  category: string
  cost: number
  emoji: string
  rating: number
  reviews: number
  gradient: string
}

interface User {
  id: string
  name: string
  email: string
  credits: number
}

// Static data for POC
const AGENTS: Agent[] = [
  {
    id: 1,
    name: 'Smart Customer Support Agent',
    description: 'Automates customer inquiries with intelligent responses, reducing response time by 80% while maintaining high satisfaction rates.',
    category: 'customer-service',
    cost: 25,
    emoji: '🤖',
    rating: 4.9,
    reviews: 2300,
    gradient: 'from-blue-500 to-purple-600'
  },
  {
    id: 2,
    name: 'Data Analysis Agent',
    description: 'Processes complex datasets and generates actionable insights with automated reporting and visualization capabilities.',
    category: 'analytics',
    cost: 45,
    emoji: '📊',
    rating: 4.8,
    reviews: 1800,
    gradient: 'from-green-500 to-emerald-600'
  },
  {
    id: 3,
    name: 'Content Writing Agent',
    description: 'Creates high-quality, engaging content across multiple formats while maintaining brand voice and SEO optimization.',
    category: 'content',
    cost: 35,
    emoji: '✍️',
    rating: 4.7,
    reviews: 3100,
    gradient: 'from-orange-500 to-red-600'
  },
  {
    id: 4,
    name: 'Email Automation Agent',
    description: 'Manages email campaigns with personalized content, smart scheduling, and performance tracking for maximum engagement.',
    category: 'email',
    cost: 30,
    emoji: '📧',
    rating: 4.9,
    reviews: 2700,
    gradient: 'from-purple-500 to-pink-600'
  },
  {
    id: 5,
    name: 'Sales Assistant Agent',
    description: 'Qualifies leads, schedules meetings, and provides sales insights to accelerate your sales pipeline and close deals faster.',
    category: 'sales',
    cost: 40,
    emoji: '💰',
    rating: 4.6,
    reviews: 1900,
    gradient: 'from-indigo-500 to-blue-600'
  },
  {
    id: 6,
    name: 'Task Automation Agent',
    description: 'Streamlines repetitive workflows across multiple platforms, saving hours of manual work with intelligent automation.',
    category: 'utilities',
    cost: 20,
    emoji: '⚡',
    rating: 4.8,
    reviews: 4200,
    gradient: 'from-teal-500 to-cyan-600'
  }
]

const CATEGORIES = [
  { id: 'all', name: 'All Agents', emoji: '🤖' },
  { id: 'customer-service', name: 'Customer Service', emoji: '💬' },
  { id: 'analytics', name: 'Analytics', emoji: '📊' },
  { id: 'content', name: 'Content', emoji: '📝' },
  { id: 'email', name: 'Email', emoji: '📧' },
  { id: 'utilities', name: 'Utilities', emoji: '🔧' },
  { id: 'sales', name: 'Sales', emoji: '💰' }
]

// Simulated AI responses
const AI_RESPONSES: Record<string, string> = {
  'Smart Customer Support Agent': '✅ Customer Support Complete!\n\n📞 Inquiry: Product return request\n💡 Solution: Generated return label #RT-2024-1847\n📊 Resolution time: 2.3 minutes\n😊 Customer satisfaction: 98%\n\n🎯 Next steps: Follow-up email scheduled for 24 hours',
  'Data Analysis Agent': '📊 Data Analysis Complete!\n\n📈 Key Insights Found:\n• Revenue increased 23% this quarter\n• Top performing product: Premium Widget (+45%)\n• Peak sales time: 2-4 PM daily\n• Customer retention: 87% (+12%)\n\n💡 Recommendations:\n• Expand premium inventory\n• Schedule campaigns for peak hours',
  'Content Writing Agent': '✍️ Content Created Successfully!\n\n📄 Blog Post: "10 Productivity Hacks for Remote Teams"\n📝 Word count: 1,247 words\n🎯 SEO score: 94/100 (Excellent)\n📖 Readability: Grade A\n🔗 Internal links: 8 added\n\n📋 Meta description and social media snippets included!',
  'Email Automation Agent': '📧 Email Campaign Launched!\n\n📊 Campaign Stats:\n• 5,000 emails sent successfully\n• Open rate: 32% (+8% above average)\n• Click-through rate: 12%\n• Conversions: 47 sales generated\n\n🎯 A/B test winner: Subject line "Exclusive offer inside"\n⏰ Next campaign scheduled for Friday',
  'Sales Assistant Agent': '💰 Sales Task Complete!\n\n🎯 Lead Qualification Results:\n• 23 leads processed\n• 12 qualified prospects identified\n• 8 meetings scheduled this week\n• Pipeline value: $47,500\n\n📞 Top priority: TechCorp Inc. (90% close probability)\n📅 Next follow-up: Tomorrow 2 PM',
  'Task Automation Agent': '⚡ Automation Complete!\n\n🔗 Workflow Created:\n• Slack notifications → Notion database\n• Email attachments → Google Drive\n• Calendar events → Team updates\n\n⏱️ Time savings: 4.5 hours/week\n📈 Efficiency boost: +67%\n🎯 23 repetitive tasks eliminated'
}

// Hooks
function useLocalStorage<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(initialValue)

  useEffect(() => {
    const item = window.localStorage.getItem(key)
    if (item) {
      setValue(JSON.parse(item))
    }
  }, [key])

  const setStoredValue = (value: T) => {
    setValue(value)
    window.localStorage.setItem(key, JSON.stringify(value))
  }

  return [value, setStoredValue] as const
}

export default function HomePage() {
  // State management
  const [user, setUser] = useLocalStorage<User | null>('user', null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [isProcessing, setIsProcessing] = useState<number | null>(null)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login')
  const [showResultModal, setShowResultModal] = useState(false)
  const [lastResult, setLastResult] = useState('')

  // Filtered agents
  const filteredAgents = AGENTS.filter(agent => {
    const matchesCategory = selectedCategory === 'all' || agent.category === selectedCategory
    const matchesSearch = agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         agent.description.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesCategory && matchesSearch
  })

  // Simulate agent usage
  const useAgent = async (agent: Agent) => {
    if (!user) {
      setShowAuthModal(true)
      return
    }

    if (user.credits < agent.cost) {
      toast.error(`Insufficient credits! You need ${agent.cost} credits but only have ${user.credits}.`)
      return
    }

    setIsProcessing(agent.id)
    toast.loading('Agent is processing your request...', { duration: 2000 })

    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 1000))

    // Update user credits
    const updatedUser = { ...user, credits: user.credits - agent.cost }
    setUser(updatedUser)

    // Show result
    setLastResult(AI_RESPONSES[agent.name] || 'Task completed successfully! ✅')
    setShowResultModal(true)
    setIsProcessing(null)

    toast.success(`${agent.name} completed! ${agent.cost} credits used.`)
  }

  // Auth functions
  const handleAuth = (email: string, password: string, name?: string) => {
    const newUser: User = {
      id: Math.random().toString(36).substr(2, 9),
      name: name || email.split('@')[0],
      email,
      credits: 1000 // Give new users 1000 credits
    }
    setUser(newUser)
    setShowAuthModal(false)
    toast.success(`Welcome ${newUser.name}! You have 1,000 credits to start.`)
  }

  const logout = () => {
    setUser(null)
    toast.success('Logged out successfully')
  }

  return (
    <div className="min-h-screen" style={{
      background: 'linear-gradient(135deg, #f6f8ff 0%, #e8f0fe 50%, #f0f7ff 100%)'
    }}>
      <Toaster position="top-right" />
      
      {/* Navigation */}
      <nav className="sticky top-0 z-50 px-6 py-5" style={{
        backdropFilter: 'blur(30px)',
        background: 'rgba(255, 255, 255, 0.9)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.2)'
      }}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-10">
            <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              AgentHub
            </div>
            <div className="hidden md:flex space-x-8">
              <a href="#" className="text-purple-600 font-semibold">Agents</a>
              <a href="#" className="text-gray-600 hover:text-purple-600 font-medium transition-colors">Categories</a>
              <a href="#" className="text-gray-600 hover:text-purple-600 font-medium transition-colors">Pricing</a>
            </div>
          </div>
          <div className="flex items-center space-x-6">
            {user ? (
              <>
                <div className="px-6 py-3 rounded-2xl font-bold text-lg text-white" style={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  boxShadow: '0 8px 25px rgba(102, 126, 234, 0.3)'
                }}>
                  <Sparkles className="inline w-4 h-4 mr-2" />
                  {user.credits.toLocaleString()} Credits
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-11 h-11 rounded-2xl flex items-center justify-center text-white font-bold" style={{
                    background: 'linear-gradient(135deg, #ec4899 0%, #be185d 100%)'
                  }}>
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-gray-900 font-semibold">{user.name}</span>
                  <button 
                    onClick={logout}
                    className="text-sm text-gray-600 hover:text-gray-800"
                  >
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <>
                <button 
                  onClick={() => { setAuthMode('login'); setShowAuthModal(true) }}
                  className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
                >
                  Sign In
                </button>
                <button 
                  onClick={() => { setAuthMode('register'); setShowAuthModal(true) }}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2.5 rounded-full font-medium hover:shadow-lg transition-all duration-300 hover:scale-105"
                >
                  Get Started
                </button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative px-6 py-16 overflow-hidden">
        <div className="max-w-7xl mx-auto text-center relative">
          {/* Floating Elements */}
          <div className="absolute top-10 left-20 w-20 h-20 bg-purple-300/30 rounded-full animate-bounce" style={{ animationDuration: '6s' }}></div>
          <div className="absolute top-20 right-32 w-16 h-16 bg-blue-300/30 rounded-full animate-bounce" style={{ animationDuration: '8s', animationDelay: '2s' }}></div>
          <div className="absolute bottom-20 left-1/3 w-12 h-12 bg-pink-300/30 rounded-full animate-bounce" style={{ animationDuration: '7s', animationDelay: '4s' }}></div>
          
          <h1 className="text-6xl md:text-7xl font-bold mb-8 leading-tight">
            <span className="bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent">
              AI Agents
            </span>
            <br />
            <span className="text-gray-800">Marketplace</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-12 leading-relaxed">
            Discover, deploy, and scale AI agents designed to automate your business processes. 
            From customer service to data analysis, find the perfect AI solution for your needs.
          </p>
          
          {/* Search */}
          <div className="max-w-2xl mx-auto mb-16">
            <div className="relative">
              <input 
                type="text" 
                placeholder="Search AI agents..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-8 py-5 rounded-3xl text-lg focus:outline-none focus:ring-2 focus:ring-purple-500 shadow-xl"
                style={{
                  backdropFilter: 'blur(20px)',
                  background: 'rgba(255, 255, 255, 0.8)',
                  border: '1px solid rgba(255, 255, 255, 0.3)'
                }}
              />
              <Search className="absolute right-6 top-6 w-6 h-6 text-gray-400" />
            </div>
          </div>

          {/* Category Filters */}
          <div className="flex flex-wrap justify-center gap-4 mb-16">
            {CATEGORIES.map(category => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-6 py-3 rounded-2xl font-semibold shadow-lg transition-all duration-300 ${
                  selectedCategory === category.id 
                    ? 'text-white' 
                    : 'text-gray-700 hover:scale-105'
                }`}
                style={{
                  backdropFilter: 'blur(10px)',
                  background: selectedCategory === category.id 
                    ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                    : 'rgba(255, 255, 255, 0.7)'
                }}
              >
                <span className="mr-2">{category.emoji}</span>
                {category.name}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Agents Grid */}
      <section className="px-6 pb-20">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredAgents.map(agent => (
              <div
                key={agent.id}
                className="rounded-3xl p-8 shadow-xl border border-gray-100 transition-all duration-500 hover:scale-105 hover:shadow-2xl"
                style={{
                  backdropFilter: 'blur(30px)',
                  background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.7))',
                  border: '1px solid rgba(255, 255, 255, 0.3)'
                }}
              >
                <div className="flex items-start justify-between mb-6">
                  <div className={`w-16 h-16 bg-gradient-to-r ${agent.gradient} rounded-2xl flex items-center justify-center shadow-lg`}>
                    <span className="text-2xl">{agent.emoji}</span>
                  </div>
                  <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium capitalize">
                    {agent.category.replace('-', ' ')}
                  </span>
                </div>
                
                <h3 className="text-xl font-bold text-gray-900 mb-3">{agent.name}</h3>
                <p className="text-gray-600 mb-6 leading-relaxed text-sm">{agent.description}</p>
                
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <div className="flex text-yellow-400">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`w-4 h-4 ${i < Math.floor(agent.rating) ? 'fill-current' : ''}`} />
                      ))}
                    </div>
                    <span className="text-sm text-gray-600">({agent.rating}) • {agent.reviews.toLocaleString()}</span>
                  </div>
                </div>
                
                <div className="text-white px-3 py-2 rounded-xl font-bold text-center mb-4 text-sm" style={{
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  boxShadow: '0 4px 12px rgba(16, 185, 129, 0.25)'
                }}>
                  {agent.cost} Credits per use
                </div>
                
                <button
                  onClick={() => useAgent(agent)}
                  disabled={isProcessing === agent.id}
                  className="w-full text-white py-3 rounded-xl font-bold text-sm transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    background: isProcessing === agent.id 
                      ? 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)'
                      : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)'
                  }}
                >
                  {isProcessing === agent.id ? 'Processing...' : 'Use Now'}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Auth Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6" style={{
          backdropFilter: 'blur(20px)',
          background: 'rgba(0, 0, 0, 0.5)'
        }}>
          <div className="bg-white rounded-3xl p-10 max-w-md w-full shadow-2xl border border-gray-200">
            <h3 className="text-3xl font-bold text-gray-900 mb-6 text-center">
              {authMode === 'login' ? 'Welcome Back!' : 'Get Started'}
            </h3>
            <form onSubmit={(e) => {
              e.preventDefault()
              const formData = new FormData(e.currentTarget)
              const email = formData.get('email') as string
              const password = formData.get('password') as string
              const name = formData.get('name') as string
              handleAuth(email, password, name)
            }}>
              {authMode === 'register' && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                  <input
                    name="name"
                    type="text"
                    placeholder="Enter your full name"
                    required
                    style={{
                      backgroundColor: '#ffffff',
                      color: '#1f2937',
                      border: '2px solid #d1d5db'
                    }}
                    className="w-full px-4 py-3 rounded-xl focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-colors placeholder:text-gray-400"
                  />
                </div>
              )}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                <input
                  name="email"
                  type="email"
                  placeholder="Enter your email"
                  required
                  style={{
                    backgroundColor: '#ffffff',
                    color: '#1f2937',
                    border: '2px solid #d1d5db'
                  }}
                  className="w-full px-4 py-3 rounded-xl focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-colors placeholder:text-gray-400"
                />
              </div>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                <input
                  name="password"
                  type="password"
                  placeholder="Enter your password"
                  required
                  style={{
                    backgroundColor: '#ffffff',
                    color: '#1f2937',
                    border: '2px solid #d1d5db'
                  }}
                  className="w-full px-4 py-3 rounded-xl focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-colors placeholder:text-gray-400"
                />
              </div>
              <button
                type="submit"
                className="w-full text-white py-3 rounded-xl font-bold mb-4 transition-all duration-300 hover:scale-105 hover:shadow-lg"
                style={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                }}
              >
                {authMode === 'login' ? 'Sign In' : 'Create Account'}
              </button>
            </form>
            <div className="text-center">
              <button
                onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}
                className="text-purple-600 hover:text-purple-700 font-medium transition-colors"
              >
                {authMode === 'login' ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
              </button>
              <br />
              <button
                onClick={() => setShowAuthModal(false)}
                className="text-gray-500 hover:text-gray-700 mt-3 text-sm transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Result Modal */}
      {showResultModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6" style={{
          backdropFilter: 'blur(20px)',
          background: 'rgba(0, 0, 0, 0.3)'
        }}>
          <div className="rounded-3xl p-10 max-w-lg w-full shadow-2xl" style={{
            backdropFilter: 'blur(30px)',
            background: 'rgba(255, 255, 255, 0.95)',
            border: '1px solid rgba(255, 255, 255, 0.3)'
          }}>
            <div className="text-center mb-6">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-4xl">🎉</span>
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-4">Task Complete!</h3>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 mb-6">
              <pre className="text-sm text-gray-700 whitespace-pre-wrap font-mono">{lastResult}</pre>
            </div>
            <button
              onClick={() => setShowResultModal(false)}
              className="w-full text-white py-3 rounded-xl font-bold transition-all duration-300 hover:scale-105"
              style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
              }}
            >
              Continue
            </button>
          </div>
        </div>
      )}
    </div>
  )
}