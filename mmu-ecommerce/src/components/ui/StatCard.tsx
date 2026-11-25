import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

type ChangeType = 'up' | 'down' | 'neutral';

interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: ChangeType;
  icon: React.ReactNode;
  /** Tailwind bg color class applied to the icon container, e.g. "bg-henna-100" */
  color?: string;
}

const changeConfig: Record<ChangeType, { icon: React.ReactNode; textClass: string }> = {
  up: {
    icon: <TrendingUp size={13} />,
    textClass: 'text-green-600',
  },
  down: {
    icon: <TrendingDown size={13} />,
    textClass: 'text-red-500',
  },
  neutral: {
    icon: <Minus size={13} />,
    textClass: 'text-gray-400',
  },
};

/**
 * Summary metric card for the admin dashboard.
 */
const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  change,
  changeType = 'neutral',
  icon,
  color = 'bg-henna-100',
}) => {
  const cfg = changeConfig[changeType];

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex items-start gap-4 hover:shadow-md transition-shadow duration-200">
      {/* Icon */}
      <div
        className={`${color} flex items-center justify-center rounded-lg w-11 h-11 flex-shrink-0`}
      >
        <span className="text-henna-600">{icon}</span>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-gray-400 uppercase tracking-wider truncate">
          {title}
        </p>
        <p className="text-2xl font-bold text-gray-800 mt-0.5 leading-tight">{value}</p>

        {change && (
          <div className={`flex items-center gap-1 mt-1.5 text-xs font-medium ${cfg.textClass}`}>
            {cfg.icon}
            <span>{change}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default StatCard;
