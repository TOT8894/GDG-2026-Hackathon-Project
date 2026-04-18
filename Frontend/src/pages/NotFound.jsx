import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <section className="page-section not-found">
      <div className="page-panel">
        <h1>Page not found</h1>
        <p>The route you tried does not exist yet.</p>
        <Link className="button-link" to="/">
          Go back home
        </Link>
      </div>
    </section>
  )
}
