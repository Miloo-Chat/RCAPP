import { Link } from 'react-router-dom'
import Navbar from './Navbar'
import Footer from './Footer'
import SEOHead from './SEOHead'
import WatercolorMiniBanner from './watercolor/WatercolorMiniBanner'
import { ARTICLE_AUTHOR } from '../config/site'

const withTz = (d) => (/T/.test(d) ? d : `${d}T00:00:00+05:30`)

export default function ArticleLayout({
  title,
  description,
  url,
  category = 'Digital Safety & Privacy',
  datePublished = '2026-09-01',
  dateModified = '2026-11-03',
  readTime = '7 min read',
  tableOfContents = [],
  relatedArticles = [],
  ogSlug,
  theme,
  onToggleTheme,
  children,
}) {
  const schemaJson = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: title,
    description: description,
    url: url,
    image: `https://miloo.chat/og/${ogSlug || 'blog'}.png`,
    datePublished: withTz(datePublished),
    dateModified: withTz(dateModified),
    author: {
      '@type': 'Person',
      jobTitle: 'Founder, Miloo',
      name: ARTICLE_AUTHOR.name,
      url: 'https://miloo.chat/about#team',
    },
    publisher: {
      '@type': 'Organization',
      name: 'Miloo',
      url: 'https://miloo.chat',
      logo: {
        '@type': 'ImageObject',
        url: 'https://miloo.chat/logo-symbol.svg',
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': url,
    },
  }

  return (
    <div className="page page-enter" style={{ background: 'var(--bg-0)' }}>
      <SEOHead
        title={`${title} — Miloo Blog`}
        description={description}
        canonicalUrl={url}
        ogType="article"
        ogImage={`https://miloo.chat/og/${ogSlug || 'blog'}.png`}
        schemaJson={schemaJson}
      />

      <Navbar theme={theme} onToggleTheme={onToggleTheme} />

      <WatercolorMiniBanner />

      <main
        className="container"
        style={{
          paddingTop: 'clamp(20px, 3.5vw, 40px)',
          paddingBottom: 'clamp(48px, 8vw, 80px)',
          maxWidth: 840,
        }}
      >
        {/* Breadcrumbs Navigation */}
        <nav aria-label="Breadcrumb" style={{ marginBottom: 24 }}>
          <ol
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 8,
              alignItems: 'center',
              listStyle: 'none',
              padding: 0,
              margin: 0,
              fontSize: 13,
              color: 'var(--text-3)',
            }}
          >
            <li>
              <Link to="/" style={{ color: 'var(--accent)', textDecoration: 'none' }}>
                Home
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li>
              <Link to="/blog" style={{ color: 'var(--accent)', textDecoration: 'none' }}>
                Blog
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li aria-current="page" style={{ color: 'var(--text-1)', fontWeight: 500 }}>
              {title.length > 40 ? `${title.slice(0, 40)}…` : title}
            </li>
          </ol>
        </nav>

        {/* Article Header */}
        <header style={{ marginBottom: 36, textAlign: 'left' }}>
          <div
            style={{
              display: 'inline-block',
              fontSize: '12px',
              fontWeight: 700,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: 'var(--accent)',
              marginBottom: 12,
            }}
          >
            {category}
          </div>

          <h1
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(28px, 3.8vw, 44px)',
              fontWeight: 500,
              lineHeight: 1.2,
              color: 'var(--text-1)',
              margin: '0 0 16px',
            }}
          >
            {title}
          </h1>

          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '8px 16px',
              alignItems: 'center',
              color: 'var(--text-3)',
              fontSize: '13px',
              lineHeight: 1.5,
            }}
          >
            <span>
              By{' '}
              <a
                href={ARTICLE_AUTHOR.teamAnchor}
                style={{
                  color: 'var(--accent)',
                  textDecoration: 'none',
                  fontWeight: 600,
                }}
              >
                {ARTICLE_AUTHOR.name}
              </a>
            </span>
            <span aria-hidden="true">·</span>
            <span>Last updated: November 3, 2026</span>
            <span aria-hidden="true">·</span>
            <span>{readTime}</span>
          </div>
        </header>

        {/* Table of Contents */}
        {tableOfContents.length > 0 && (
          <nav
            aria-label="Table of Contents"
            className="content-card"
            style={{
              background: 'var(--surface-1)',
              border: '1px solid var(--border-2)',
              borderRadius: 'var(--radius-lg)',
              padding: '20px 24px',
              marginBottom: 36,
            }}
          >
            <div
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 16,
                fontWeight: 600,
                color: 'var(--text-1)',
                marginBottom: 12,
              }}
            >
              In this article:
            </div>
            <ul
              style={{
                listStyle: 'none',
                padding: 0,
                margin: 0,
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
              }}
            >
              {tableOfContents.map((item, idx) => (
                <li key={item.id || idx}>
                  <a
                    href={`#${item.id}`}
                    style={{
                      fontSize: 14,
                      color: 'var(--text-2)',
                      textDecoration: 'none',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 8,
                      transition: 'color 0.2s ease',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--accent)')}
                    onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-2)')}
                  >
                    <span style={{ color: 'var(--accent)', fontSize: 12 }}>§{idx + 1}</span>
                    <span>{item.label}</span>
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        )}

        {/* Prose Body */}
        <article className="content-prose">{children}</article>

        {/* Visible Author Box */}
        <aside
          aria-label="About the author"
          className="content-card"
          style={{
            marginTop: 48,
            background: 'var(--surface-1)',
            border: '1px solid var(--border-2)',
            borderRadius: 'var(--radius-lg)',
            padding: '24px 28px',
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: '50%',
                backgroundColor: 'var(--surface-2)',
                border: '1.5px solid var(--border-2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 20,
              }}
              aria-hidden="true"
            >
              🛡️
            </div>
            <div>
              <div
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 17,
                  fontWeight: 600,
                  color: 'var(--text-1)',
                  margin: 0,
                }}
              >
                {ARTICLE_AUTHOR.name}
              </div>
              <div style={{ fontSize: 13, color: 'var(--text-3)' }}>
                {ARTICLE_AUTHOR.role}
              </div>
            </div>
          </div>
          <p style={{ margin: 0, fontSize: 14, color: 'var(--text-2)', lineHeight: 1.6 }}>
            {ARTICLE_AUTHOR.bio}
          </p>
          <div style={{ paddingTop: 4 }}>
            <Link
              to={ARTICLE_AUTHOR.teamAnchor}
              style={{
                fontSize: 13,
                color: 'var(--accent)',
                fontWeight: 600,
                textDecoration: 'none',
              }}
            >
              Learn about our editorial standards & review policy →
            </Link>
          </div>
        </aside>

        {/* Trust & Safety Cross-Links Box */}
        <div
          className="content-card"
          style={{
            marginTop: 24,
            padding: '16px 20px',
            background: 'transparent',
            border: '1px dashed var(--border-2)',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 12,
            fontSize: 13,
            color: 'var(--text-2)',
          }}
        >
          <span>
            Need help right now? Check our{' '}
            <Link to="/safety" style={{ color: 'var(--accent)', fontWeight: 600 }}>
              Safety Center
            </Link>{' '}
            or review the{' '}
            <Link to="/faq" style={{ color: 'var(--accent)', fontWeight: 600 }}>
              FAQ
            </Link>
            .
          </span>
          <Link
            to="/"
            style={{
              color: 'var(--text-1)',
              textDecoration: 'none',
              fontWeight: 500,
              fontSize: 13,
            }}
          >
            ← Back to Miloo Home
          </Link>
        </div>

        {/* 3 Related Articles Grid */}
        {relatedArticles.length > 0 && (
          <section style={{ marginTop: 48 }} aria-label="Related Articles">
            <h3
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 22,
                color: 'var(--text-1)',
                marginBottom: 20,
              }}
            >
              Related Safety & Privacy Guides
            </h3>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                gap: 16,
              }}
            >
              {relatedArticles.slice(0, 3).map((art, idx) => (
                <Link
                  key={art.url || idx}
                  to={art.url}
                  className="content-card"
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    textDecoration: 'none',
                    padding: 20,
                    borderRadius: 'var(--radius-lg)',
                    border: '1px solid var(--border-1)',
                    background: 'var(--surface-1)',
                    transition: 'transform 0.2s ease, border-color 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'var(--accent)'
                    e.currentTarget.style.transform = 'translateY(-2px)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'var(--border-1)'
                    e.currentTarget.style.transform = 'none'
                  }}
                >
                  <div>
                    <span
                      style={{
                        fontSize: 11,
                        textTransform: 'uppercase',
                        letterSpacing: '0.08em',
                        color: 'var(--accent)',
                        fontWeight: 700,
                      }}
                    >
                      {art.readTime || '5 min read'}
                    </span>
                    <h4
                      style={{
                        fontFamily: 'var(--font-display)',
                        fontSize: 17,
                        lineHeight: 1.3,
                        color: 'var(--text-1)',
                        margin: '8px 0 8px',
                      }}
                    >
                      {art.title}
                    </h4>
                    <p
                      style={{
                        margin: 0,
                        fontSize: 13,
                        lineHeight: 1.5,
                        color: 'var(--text-3)',
                      }}
                    >
                      {art.blurb}
                    </p>
                  </div>
                  <span
                    style={{
                      fontSize: 13,
                      fontWeight: 600,
                      color: 'var(--accent)',
                      marginTop: 14,
                    }}
                  >
                    Read guide →
                  </span>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  )
}

