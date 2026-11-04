import { renderToString } from 'react-dom/server'
import { StaticRouter } from 'react-router'
import { AppRoutes } from './App'
import { AtmosphereProvider } from './context/AtmosphereContext'
import GlobalPaperGrain from './components/watercolor/GlobalPaperGrain'

export function render(url) {
  const html = renderToString(
    <StaticRouter location={url}>
      <AtmosphereProvider>
        <GlobalPaperGrain />
        <AppRoutes />
      </AtmosphereProvider>
    </StaticRouter>
  )
  return { html }
}
