import { Link } from 'react-router-dom'
import ArticleLayout from '../../components/ArticleLayout'

export default function PracticeLanguageStrangers({ theme, onToggleTheme }) {
  const tableOfContents = [
    { id: 'prepare', label: 'Prepare a Few Phrases' },
    { id: 'goals', label: 'Set Small Goals' },
    { id: 'mistakes', label: 'Welcome Mistakes' },
    { id: 'safety', label: 'Stay Safe While You Practice' },
  ]

  const relatedArticles = [
    {
      url: '/blog/stay-safe-talking-to-strangers-online',
      title: 'How to Stay Safe Talking to Strangers Online',
      blurb: 'Practical habits that keep you in control of every conversation.',
      readTime: '7 min read',
    },
    {
      url: '/blog/how-miloo-moderation-works',
      title: 'How Moderation Works on Miloo',
      blurb: 'The safety layers that run alongside every chat.',
      readTime: '6 min read',
    },
    {
      url: '/blog/protecting-privacy-in-video-chat',
      title: 'Protecting Your Privacy in Video Chat',
      blurb: 'A practical checklist for your webcam space and network.',
      readTime: '5 min read',
    },
  ]

  return (
    <ArticleLayout
      title="Practicing a New Language With Strangers Online"
      description="How to use spontaneous conversations to practice speaking a new language: preparation, simple goals, handling mistakes and staying safe."
      url="https://miloo.chat/blog/practicing-a-new-language-with-strangers"
      category="Conversations"
      datePublished="2026-11-07"
      dateModified="2026-11-07"
      readTime="5 min read"
      tableOfContents={tableOfContents}
      relatedArticles={relatedArticles}
      ogSlug="blog-stay-safe-talking-to-strangers-online"
      theme={theme}
      onToggleTheme={onToggleTheme}
    >
      <p>
        Reading and apps can teach vocabulary, but speaking with real people is what builds confidence. Random conversations can be a low-pressure way to practice, as long as you approach them with a plan.
      </p>

      <h2 id="prepare">Prepare a Few Phrases</h2>
      <p>
        Before you start, write down five or six phrases you want to use: a greeting, a way to say you are learning, a question about the other person and a polite goodbye. Having them ready removes the blank-page feeling that makes beginners freeze.
      </p>

      <h2 id="goals">Set Small Goals</h2>
      <p>
        Aim for one clear goal per session, such as asking three questions or learning five new words. Short sessions of fifteen minutes are easier to repeat than long ones, and they leave you energy to review what you learned.
      </p>

      <h2 id="mistakes">Welcome Mistakes</h2>
      <p>
        Most people are happy to help a learner. Tell them you are practicing and ask them to correct you gently. Keep a note of corrections and revisit them later, since repeated mistakes show you what to study next.
      </p>

      <h2 id="safety">Stay Safe While You Practice</h2>
      <p>
        The same safety rules apply as in any stranger chat: no personal details, no moving to other apps because someone insists, and Skip, Report or Block whenever you feel uncomfortable. Read our <Link to="/blog/stay-safe-talking-to-strangers-online">safety guide</Link> before you begin, and visit the <Link to="/safety">Safety Center</Link> for more.
      </p>

      <h2>Conclusion</h2>
      <p>
        Small, thoughtful habits make online conversation safer and more enjoyable. For more guidance, visit our <Link to="/safety">Safety Center</Link> or browse the <Link to="/blog">Miloo blog</Link>.
      </p>
    </ArticleLayout>
  )
}
