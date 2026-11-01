import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom'
import Home from './pages/Home'
import ChatRoom from './pages/ChatRoom'
import HowItWorks from './pages/HowItWorks'
import Safety from './pages/Safety'
import FAQ from './pages/FAQ'
import About from './pages/About'
import Contact from './pages/Contact'
import Privacy from './pages/Privacy'
import Terms from './pages/Terms'
import CommunityGuidelines from './pages/CommunityGuidelines'
import BlogIndex from './pages/blog/BlogIndex'
import StaySafeOnline from './pages/blog/StaySafeOnline'
import SpotScams from './pages/blog/SpotScams'
import PrivacyVideoChat from './pages/blog/PrivacyVideoChat'
import ReportBlockAbuse from './pages/blog/ReportBlockAbuse'
import GoodConversations from './pages/blog/GoodConversations'
import OnlineHarassment from './pages/blog/OnlineHarassment'
import OmegleAlternative from './pages/blog/OmegleAlternative'
import RandomVideoChatIndia from './pages/blog/RandomVideoChatIndia'
import StrangerChatIndia from './pages/blog/StrangerChatIndia'
import VideoChatNoSignup from './pages/blog/VideoChatNoSignup'
import NotFound from './pages/NotFound'
import AdminModeration from './pages/AdminModeration'
import AdSenseScript from './components/AdSenseScript'
import CookieBanner from './components/CookieBanner'
import AgeGateModal from './components/AgeGateModal'
import { trackEvent } from './utils/analytics'

export function AppRoutes() {
  const navigate = useNavigate()
  const location = useLocation()

  const [selectedMood, setSelectedMood] = useState('any')
  const [selectedIntent, setSelectedIntent] = useState('random')
  const [safeMode, setSafeMode] = useState(false)
  const [chatMode, setChatMode] = useState('video')
  const [ageGateOpen, setAgeGateOpen] = useState(false)

  const getInitialTheme = () => {
    try {
      const saved = localStorage.getItem('miloo-theme')
      if (saved) return saved
    } catch {
      // ignore
    }
    return 'dark'
  }
  const [theme, setTheme] = useState(getInitialTheme)

  useEffect(() => {
    try {
      document.documentElement.setAttribute('data-theme', theme)
      localStorage.setItem('miloo-theme', theme)
    } catch {
      // ignore
    }
  }, [theme])

  const toggleTheme = () => setTheme(t => (t === 'dark' ? 'light' : 'dark'))

  useEffect(() => {
    const handleEsc = (event) => {
      if (event.key === 'Escape' && location.pathname !== '/') {
        navigate('/')
      }
    }
    window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [location.pathname, navigate])

  const startTextChat = () => {
    goToChat({ mood: 'any', intent: 'random', safeMode: false, chatMode: 'text' })
  }

  const startVideoChat = () => {
    goToChat({ mood: 'any', intent: 'random', safeMode: false, chatMode: 'video' })
  }

  const goToChat = ({ mood, intent, safeMode: safe, chatMode: mode }) => {
    try {
      trackEvent('go_to_chat', { mood, intent, chatMode: mode || 'video' })
    } catch {
      // ignore
    }
    setSelectedMood(mood || 'any')
    setSelectedIntent(intent || 'random')
    setSafeMode(safe || false)
    setChatMode(mode || 'video')
    navigate('/chat')
  }

  const goHome = () => {
    setChatMode('video')
    navigate('/')
  }

  // Intercept direct navigation to /chat if age not confirmed
  const isChatRoute = location.pathname === '/chat'
  const isAgeVerified = typeof window !== 'undefined' && sessionStorage.getItem('miloo_age_confirmed') === 'true'

  return (
    <>
      {/* AdSense injected exclusively on allowed public content pages */}
      <AdSenseScript />

      {/* Global GDPR/AdSense Cookie & Privacy Consent Banner */}
      <CookieBanner />

      <Routes>
        {/* Core Public Pages */}
        <Route
          path="/"
          element={
            <Home
              onStartText={startTextChat}
              onStartVideo={startVideoChat}
              onTerms={() => navigate('/terms')}
              theme={theme}
              onToggleTheme={toggleTheme}
            />
          }
        />
        <Route
          path="/how-it-works"
          element={<HowItWorks theme={theme} onToggleTheme={toggleTheme} />}
        />
        <Route
          path="/safety"
          element={<Safety theme={theme} onToggleTheme={toggleTheme} />}
        />
        <Route
          path="/faq"
          element={<FAQ theme={theme} onToggleTheme={toggleTheme} />}
        />
        <Route
          path="/about"
          element={<About theme={theme} onToggleTheme={toggleTheme} />}
        />
        <Route
          path="/contact"
          element={<Contact theme={theme} onToggleTheme={toggleTheme} />}
        />

        {/* Legal & Compliance Pages */}
        <Route
          path="/privacy"
          element={<Privacy theme={theme} onToggleTheme={toggleTheme} />}
        />
        <Route
          path="/terms"
          element={<Terms theme={theme} onToggleTheme={toggleTheme} />}
        />
        <Route
          path="/community-guidelines"
          element={<CommunityGuidelines theme={theme} onToggleTheme={toggleTheme} />}
        />

        {/* Blog Publication & Original Articles */}
        <Route
          path="/blog"
          element={<BlogIndex theme={theme} onToggleTheme={toggleTheme} />}
        />
        <Route
          path="/blog/stay-safe-talking-to-strangers-online"
          element={<StaySafeOnline theme={theme} onToggleTheme={toggleTheme} />}
        />
        <Route
          path="/blog/how-to-spot-scams-on-chat-sites"
          element={<SpotScams theme={theme} onToggleTheme={toggleTheme} />}
        />
        <Route
          path="/blog/protecting-privacy-in-video-chat"
          element={<PrivacyVideoChat theme={theme} onToggleTheme={toggleTheme} />}
        />
        <Route
          path="/blog/how-to-report-and-block-abusive-users"
          element={<ReportBlockAbuse theme={theme} onToggleTheme={toggleTheme} />}
        />
        <Route
          path="/blog/tips-for-starting-good-conversation-with-stranger"
          element={<GoodConversations theme={theme} onToggleTheme={toggleTheme} />}
        />
        <Route
          path="/blog/what-to-do-if-someone-harasses-you-online"
          element={<OnlineHarassment theme={theme} onToggleTheme={toggleTheme} />}
        />
        <Route
          path="/blog/omegle-alternative"
          element={<OmegleAlternative theme={theme} onToggleTheme={toggleTheme} />}
        />
        <Route
          path="/blog/random-video-chat-india"
          element={<RandomVideoChatIndia theme={theme} onToggleTheme={toggleTheme} />}
        />
        <Route
          path="/blog/stranger-chat-india"
          element={<StrangerChatIndia theme={theme} onToggleTheme={toggleTheme} />}
        />
        <Route
          path="/blog/video-chat-no-signup"
          element={<VideoChatNoSignup theme={theme} onToggleTheme={toggleTheme} />}
        />

        {/* Private Real-Time Chat Room (Strictly 18+ Gate) */}
        <Route
          path="/chat"
          element={
            isAgeVerified ? (
              <ChatRoom
                mood={selectedMood || 'any'}
                intent={selectedIntent || 'random'}
                safeMode={safeMode}
                chatMode={chatMode}
                theme={theme}
                onToggleTheme={toggleTheme}
                onExit={goHome}
              />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />
        <Route
          path="/call"
          element={<Navigate to="/chat" replace />}
        />

        {/* Admin Moderation Portal */}
        <Route
          path="/admin"
          element={<AdminModeration theme={theme} onToggleTheme={toggleTheme} />}
        />

        {/* Catch-all 404 Not Found Page */}
        <Route
          path="*"
          element={<NotFound theme={theme} onToggleTheme={toggleTheme} />}
        />
      </Routes>
    </>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  )
}
