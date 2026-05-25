import { motion } from 'framer-motion';
import {
  Ruler,
  Slice,
  CircleDot,
  Donut,
  Pizza,
  Sparkles,
  GlassWater,
  ShoppingCart,
} from 'lucide-react';

const STEP_ICONS = [Ruler, Slice, CircleDot, Donut, Pizza, Sparkles, GlassWater, ShoppingCart];
const STEP_LABELS = [
  'Tamanho',
  'Divisão',
  'Massa',
  'Borda',
  'Sabores',
  'Adicionais',
  'Bebidas',
  'Resumo',
];

/**
 * Indicador de progresso do wizard com ícones e barra de progresso.
 */
export default function WizardNav({ currentStep, totalSteps, skippedSteps = [] }) {
  const progress = ((currentStep) / (totalSteps - 1)) * 100;

  // Filtra passos pulados para exibição
  const visibleSteps = STEP_LABELS.map((label, index) => ({
    label,
    index,
    Icon: STEP_ICONS[index],
    skipped: skippedSteps.includes(index),
  })).filter((s) => !s.skipped);

  return (
    <div className="w-full px-4 py-3">
      {/* Barra de progresso */}
      <div className="relative h-1 bg-slate-200 dark:bg-white/10 rounded-full mb-4 overflow-hidden transition-colors">
        <motion.div
          className="absolute inset-y-0 left-0 bg-gradient-to-r from-orange-500 to-red-500 rounded-full"
          animate={{ width: `${progress}%` }}
          transition={{ type: 'spring', stiffness: 200, damping: 25 }}
        />
      </div>

      {/* Steps */}
      <div className="flex items-center justify-between gap-1">
        {visibleSteps.map(({ label, index, Icon }) => {
          const isActive = index === currentStep;
          const isCompleted = index < currentStep;

          return (
            <div key={index} className="flex flex-col items-center gap-1.5 flex-1 min-w-0">
              <motion.div
                animate={{
                  scale: isActive ? 1.15 : 1,
                }}
                className={`
                  step-dot w-8 h-8 rounded-full flex items-center justify-center transition-colors
                  ${isActive ? 'bg-orange-500/20' : isCompleted ? 'bg-orange-500/10' : 'bg-slate-100 dark:bg-white/5'}
                  ${isActive ? 'active' : ''}
                `}
              >
                <Icon
                  className={`w-3.5 h-3.5 transition-colors duration-300 ${
                    isActive
                      ? 'text-orange-500 dark:text-orange-400'
                      : isCompleted
                      ? 'text-orange-600/70 dark:text-orange-500/70'
                      : 'text-slate-400 dark:text-zinc-600'
                  }`}
                />
              </motion.div>
              <span
                className={`text-[10px] font-medium truncate transition-colors duration-300 ${
                  isActive
                    ? 'text-orange-600 dark:text-orange-400'
                    : isCompleted
                    ? 'text-slate-500 dark:text-zinc-400'
                    : 'text-slate-400 dark:text-zinc-600'
                }`}
              >
                {label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
