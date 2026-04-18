import FeatureCard from '../components/FeatureCard'

const features = [
  {
    title: 'Fast chat interface',
    description: 'Talk to the AI-powered support assistant and get quick answers.',
  },
  {
    title: 'Secure payments',
    description: 'Connect to the backend payment flow with ease and confidence.',
  },
  {
    title: 'Modern dashboard',
    description: 'A clean layout built for mobile and desktop devices.',
  },
]

export default function Home() {
  return (
    <section className="hero-section">
      <div className="hero-copy">
        <p className="eyebrow">Welcome to KuraLew</p>
        <h1>Build better conversations and payments in one app.</h1>
        <p className="hero-text">
          This project brings together chat, authentication, and payment flows in a
          modern React frontend. Navigate between pages to explore the layout and
          reusable components.
        </p>
      </div>
      <div className="feature-grid">
        {features.map((feature) => (
          <FeatureCard key={feature.title} {...feature} />
        ))}
      </div>
    </section>
  )
}
