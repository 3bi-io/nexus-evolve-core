import { motion } from 'framer-motion';

interface EmptyStateIllustrationProps {
  type: 'no-data' | 'no-results' | 'getting-started' | 'error';
}

export function EmptyStateIllustration({ type }: EmptyStateIllustrationProps) {
  return (
    <svg
      width="200"
      height="200"
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="mx-auto"
    >
      {type === 'no-data' && (
        <g>
          <motion.circle
            cx="100"
            cy="100"
            r="80"
            stroke="hsl(var(--primary))"
            strokeWidth="2"
            fill="none"
            strokeDasharray="5,5"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 0.3, scale: 1 }}
            transition={{ duration: 0.5 }}
          />
          <motion.path
            d="M70 100 L90 120 L130 80"
            stroke="hsl(var(--primary))"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 0.6 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          />
          <motion.circle
            cx="100"
            cy="100"
            r="8"
            fill="hsl(var(--primary))"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.3, delay: 0.8 }}
          />
        </g>
      )}

      {type === 'no-results' && (
        <g>
          <motion.circle
            cx="80"
            cy="80"
            r="40"
            stroke="hsl(var(--primary))"
            strokeWidth="3"
            fill="none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            transition={{ duration: 0.5 }}
          />
          <motion.line
            x1="110"
            y1="110"
            x2="140"
            y2="140"
            stroke="hsl(var(--primary))"
            strokeWidth="3"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          />
          <motion.line
            x1="60"
            y1="60"
            x2="100"
            y2="100"
            stroke="hsl(var(--primary))"
            strokeWidth="2"
            strokeLinecap="round"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.3 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          />
        </g>
      )}

      {type === 'getting-started' && (
        <g>
          <motion.circle
            cx="100"
            cy="60"
            r="30"
            fill="hsl(var(--primary))"
            opacity="0.2"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5 }}
          />
          <motion.rect
            x="70"
            y="100"
            width="60"
            height="60"
            rx="8"
            fill="hsl(var(--primary))"
            opacity="0.2"
            initial={{ y: 200 }}
            animate={{ y: 100 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          />
          <motion.path
            d="M90 130 L100 140 L120 120"
            stroke="hsl(var(--primary))"
            strokeWidth="3"
            strokeLinecap="round"
            fill="none"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          />
        </g>
      )}

      {type === 'error' && (
        <g>
          <motion.circle
            cx="100"
            cy="100"
            r="60"
            stroke="hsl(var(--destructive))"
            strokeWidth="3"
            fill="none"
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ duration: 0.5 }}
          />
          <motion.line
            x1="80"
            y1="80"
            x2="120"
            y2="120"
            stroke="hsl(var(--destructive))"
            strokeWidth="3"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.3, delay: 0.3 }}
          />
          <motion.line
            x1="120"
            y1="80"
            x2="80"
            y2="120"
            stroke="hsl(var(--destructive))"
            strokeWidth="3"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.3, delay: 0.5 }}
          />
        </g>
      )}
    </svg>
  );
}