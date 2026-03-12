import type { ReactNode } from 'react';

interface SectionProps {
  title?: string;
  children: ReactNode;
}

export const Section = ({ title, children }: SectionProps) => (
  <div style={{ padding: '0 12px' }}>
    {title && (
      <div style={{
        padding: '12px 0 4px',
        fontSize: '11px',
        fontWeight: 'bold',
        textTransform: 'uppercase' as const,
        color: 'var(--gpSystemLighterGrey)',
        letterSpacing: '0.04em',
      }}>
        {title}
      </div>
    )}
    {children}
  </div>
);
