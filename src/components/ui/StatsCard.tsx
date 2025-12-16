'use client';

import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  delay?: number;
}

export function StatsCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  delay = 0,
}: StatsCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className="card p-6 glow-border"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-[var(--text-muted)] mb-1">{title}</p>
          <p className="text-2xl font-bold text-[var(--text-primary)]">{value}</p>
          {subtitle && (
            <p className="text-xs text-[var(--text-muted)] mt-1">{subtitle}</p>
          )}
          {trend && (
            <div className="flex items-center gap-1 mt-2">
              <span
                className={`text-xs font-medium ${
                  trend.isPositive
                    ? 'text-[var(--accent-success)]'
                    : 'text-[var(--accent-error)]'
                }`}
              >
                {trend.isPositive ? '+' : ''}
                {trend.value}%
              </span>
              <span className="text-xs text-[var(--text-muted)]">24h</span>
            </div>
          )}
        </div>
        <div className="p-3 rounded-xl bg-gradient-to-br from-[var(--accent-primary)]/10 to-[var(--accent-secondary)]/10">
          <Icon className="w-6 h-6 text-[var(--accent-primary)]" />
        </div>
      </div>
    </motion.div>
  );
}

