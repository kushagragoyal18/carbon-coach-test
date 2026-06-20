/**
 * Footer — Minimal footer with privacy notice.
 */

import { Shield } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="app-footer" role="contentinfo">
      <p>
        <span className="app-footer__privacy">
          <Shield size={12} />
          Zero PII collected
        </span>
        {' · '}
        All data stays on your device. History keyed by anonymous device UUID.
      </p>
      <p style={{ marginTop: 'var(--space-2)' }}>
        CarbonCoach © {new Date().getFullYear()} · Built with 🌱 for a greener commute
      </p>
    </footer>
  );
}
