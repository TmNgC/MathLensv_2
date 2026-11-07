import { HashRouter, Navigate, Route, Routes, useParams } from 'react-router-dom'
import { Home } from './pages/Home'
import { QuizSpace } from './pages/QuizSpace'
import { Leaderboard } from './pages/Leaderboard'
import { LiveHost } from './pages/LiveHost'
import { LivePlay } from './pages/LivePlay'
import { UserGate } from './components/UserGate'
import { LessonShell } from './components/LessonShell'
import { lessonById } from './content'
import { LangProvider } from './i18n/LangContext'

function LessonRoute({ mode = 'visual' }: { mode?: 'visual' | 'theory' }) {
  const { id } = useParams()
  const lesson = id ? lessonById(id) : undefined
  if (!lesson) return <Navigate to="/" replace />
  if (mode === 'theory' && !lesson.theory) return <Navigate to={`/lesson/${lesson.id}`} replace />
  return <LessonShell lesson={lesson} mode={mode} />
}

export default function App() {
  return (
    <LangProvider>
      <HashRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/quiz" element={<QuizSpace />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/live" element={<LiveHost />} />
          <Route path="/play" element={<LivePlay />} />
          <Route path="/play/:pin" element={<LivePlay />} />
          <Route path="/lesson/:id" element={<LessonRoute />} />
          <Route path="/lesson/:id/theory" element={<LessonRoute mode="theory" />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <UserGate />
      </HashRouter>
    </LangProvider>
  )
}
