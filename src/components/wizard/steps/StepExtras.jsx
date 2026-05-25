import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Sparkles, Check } from 'lucide-react';
import { useMenu } from '../../../contexts/MenuContext';
import { formatCurrency } from '../../../utils/formatCurrency';
import StepCard from '../shared/StepCard';
import { Button } from '@/components/ui/button';

/**
 * Passo do wizard para seleção de adicionais (opcional).
 * O usuário pode pular sem selecionar nenhum extra.
 */
export default function StepExtras({ order, onToggleExtra, onNext, onBack }) {
  const { extras } = useMenu();
  const hasExtras = order.extras.length > 0;
  const isSelected = (extra) => order.extras.some((e) => e.id === extra.id);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-1">
        <div className="inline-flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-orange-500 dark:text-orange-400" />
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Adicionais</h2>
        </div>
        <p className="text-sm text-slate-500 dark:text-zinc-400">
          Turbine sua pizza com extras (opcional)
        </p>
      </div>

      {/* Extras list */}
      <div className="flex flex-col gap-3">
        {extras.map((extra) => {
          const selected = isSelected(extra);

          return (
            <StepCard
              key={extra.id}
              selected={selected}
              onClick={() => onToggleExtra(extra)}
            >
              <div className="flex items-center justify-between gap-4">
                {/* Toggle indicator */}
                <div
                  className={`
                    flex-shrink-0 w-6 h-6 rounded-lg border-2 flex items-center justify-center
                    transition-all duration-200
                    ${
                      selected
                        ? 'bg-orange-500 border-orange-500'
                        : 'border-slate-300 bg-white dark:border-white/20 dark:bg-white/5'
                    }
                  `}
                >
                  <AnimatePresence>
                    {selected && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                      >
                        <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-slate-900 dark:text-white">{extra.name}</h3>
                  <p className="text-xs text-slate-500 dark:text-zinc-400">{extra.description}</p>
                </div>

                {/* Price */}
                <span className="text-orange-600 dark:text-orange-400 font-bold text-sm whitespace-nowrap">
                  + {formatCurrency(extra.price)}
                </span>
              </div>
            </StepCard>
          );
        })}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between pt-4">
        <Button variant="ghost" icon={ChevronLeft} onClick={onBack}>
          Voltar
        </Button>
        <Button
          onClick={onNext}
          iconRight={ChevronRight}
        >
          {hasExtras ? 'Avançar' : 'Pular'}
        </Button>
      </div>
    </div>
  );
}
