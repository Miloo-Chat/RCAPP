import { Link } from 'react-router-dom'
import ArticleLayout from '../../components/ArticleLayout'

export default function OnlineHarassment({ theme, onToggleTheme }) {
  const tableOfContents = [
    { id: 'immediate-actions', label: '1. Immediate Containment: Sever the Connection' },
    { id: 'preserve-evidence', label: '2. Preserving Digital Evidence' },
    { id: 'extortion-response', label: '3. Responding to Extortion or Sextortion' },
    { id: 'reporting-authorities', label: '4. When and How to Contact Authorities' },
    { id: 'emotional-recovery', label: '5. Emotional Reset & Support Resources' },
  ]

  const relatedArticles = [
    {
      url: '/blog/how-to-report-and-block-abusive-users',
      title: 'How to Report and Block Abusive Users on Miloo',
      blurb: 'Detailed walkthrough of reporting categories, blocklists, and hardware bans.',
      readTime: '6 min read',
    },
    {
      url: '/blog/stay-safe-talking-to-strangers-online',
      title: 'How to Stay Safe Talking to Strangers Online: The Complete Modern Guide',
      blurb: 'Information firewalls, off-platform migration warnings, and setting boundaries.',
      readTime: '7 min read',
    },
    {
      url: '/blog/how-to-spot-scams-on-chat-sites',
      title: 'How to Spot Scams and Fake Profiles on Random Chat Sites',
      blurb: 'Detecting virtual webcam loops, phishing tricks, and extortion bots.',
      readTime: '6 min read',
    },
  ]

  return (
    <ArticleLayout
      title="What to Do If Someone Harasses You Online: Action Steps"
      description="Action plan for handling cyber harassment, threats, or extortion. Learn evidence preservation, platform reporting, and international legal support hotlines."
      url="https://miloo.chat/blog/what-to-do-if-someone-harasses-you-online"
      category="Digital Defense & Safety"
      datePublished="2026-09-26"
      dateModified="2026-11-03"
      readTime="6 min read"
      tableOfContents={tableOfContents}
      relatedArticles={relatedArticles}
      ogSlug="blog-what-to-do-if-someone-harasses-you-online"
      theme={theme}
      onToggleTheme={onToggleTheme}
    >
      <p>
        Encountering harassment, predatory intimidation, or aggressive conduct online can be startling and emotionally taxing. When an anonymous stranger turns toxic or threatens extortion, knowing exactly what steps to take transforms panic into calm, methodical control. On Miloo, every chat is with a real person, which means human accountability and respectful behavior are required at all times.
      </p>
      <p>
        At Miloo, we maintain an uncompromising zero-tolerance policy against cyber harassment, hate speech, sexual exploitation, and blackmail. While our automated filters block most toxic signals before delivery, bad actors occasionally attempt aggressive tactics. Here is your definitive action plan if someone attempts to harass or extort you online. For platform safety policies, review our <Link to="/safety">Safety Center</Link> and read our <Link to="/community-guidelines">Community Guidelines</Link>.
      </p>

      <h2 id="immediate-actions">1. Immediate Containment: Sever the Connection</h2>
      <p>
        The first and most critical rule of dealing with internet trolls and harassers is <strong>never feed the aggression</strong>. Harassers seek a reaction—anger, panic, tears, or pleas. Denying them an emotional reward deprives them of leverage.
      </p>
      <ol>
        <li><strong>Do Not Retaliate:</strong> Do not insult, argue with, or attempt to reason with the abuser. Anything you type can be screenshotted out of context.</li>
        <li><strong>Click Skip or Escape:</strong> Immediately disconnect the call or text chat. Severing the peer connection wipes ephemeral memory instantly.</li>
        <li><strong>Click Block User:</strong> Ensure the user’s identifier is quarantined from pairing with you again.</li>
      </ol>
      <p>
        Learn how our infrastructure handles this in our <Link to="/blog/how-to-report-and-block-abusive-users">guide to reporting and blocking users</Link>.
      </p>

      <h2 id="preserve-evidence">2. Preserving Digital Evidence</h2>
      <p>
        If the behavior crosses into severe legal territory—such as death threats, bomb threats, doxxing of home addresses, or financial blackmail—documenting the interaction before detaching is crucial:
      </p>
      <ul>
        <li><strong>Take Full Screenshots:</strong> Capture the entire browser window showing the date, time, and visible session ID.</li>
        <li><strong>Record External Handles:</strong> If the harasser pasted third-party handles (Telegram, Discord, Instagram, Bitcoin wallet addresses), ensure these are clearly captured in the screenshot.</li>
        <li><strong>Submit a Report on Miloo:</strong> Click <strong>Report User</strong>, select Threats or Harassment, and include brief notes. This stores the backend telemetry for our safety desk.</li>
      </ul>

      <h2 id="extortion-response">3. Responding to Extortion or Sextortion</h2>
      <p>
        If an operative claims they recorded you and threatens to distribute footage to your friends or employers unless you pay money:
      </p>
      <ul>
        <li><strong>NEVER PAY:</strong> Paying money does not make the extortionist delete the footage. In fact, sending money proves you can be exploited, causing them to demand exponentially larger sums.</li>
        <li><strong>Lock Down Your Social Media:</strong> Immediately set your external social profiles (Instagram, Facebook, LinkedIn) to private. Restrict message requests from non-friends and turn off friend list visibility.</li>
        <li><strong>Report the Extortion to Platform Desks:</strong> Use our <Link to="/transparency">Transparency Center</Link> and <Link to="/contact">Contact Desk</Link> to alert our security team.</li>
      </ul>

      <h2 id="reporting-authorities">4. When and How to Contact Authorities</h2>
      <p>
        Certain offenses require immediate law enforcement escalation:
      </p>
      <ul>
        <li><strong>United States:</strong> File an IC3 complaint with the FBI at <a href="https://www.ic3.gov" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)' }}>ic3.gov</a>. For incidents involving minors, file a report with NCMEC at <a href="https://www.cybertipline.org" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)' }}>cybertipline.org</a>.</li>
        <li><strong>United Kingdom:</strong> Report to Action Fraud UK or contact the police non-emergency line at 101.</li>
        <li><strong>India:</strong> File a formal report at the National Cyber Crime Reporting Portal at <a href="https://cybercrime.gov.in" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)' }}>cybercrime.gov.in</a> or dial 1930 for the national financial cyber fraud helpline. Contact our Grievance Officer via details in our <Link to="/terms">Terms of Service</Link>.</li>
        <li><strong>International:</strong> Contact your local police cyber division and provide your preserved screenshot records.</li>
      </ul>

      <h2 id="emotional-recovery">5. Emotional Reset & Support Resources</h2>
      <p>
        Experiencing harassment is never your fault. Digital predators rely on shock value to make victims feel isolated. Remember that you are in control of your digital boundaries:
      </p>
      <ul>
        <li>Take a break from screens and step outside into natural air.</li>
        <li>Confide in a trusted friend, family member, or mental health professional.</li>
        <li>Remember that online encounters on Miloo are strictly ephemeral. You are safe, you are supported, and our moderation desk is committed to keeping this space clean. Check our <Link to="/faq">FAQ</Link> for additional assistance.</li>
      </ul>
    </ArticleLayout>
  )
}
