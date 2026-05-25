import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, CupSoda, Minus, Plus } from 'lucide-react';
import { useMenu } from '../../../contexts/MenuContext';
import { formatCurrency } from '../../../utils/formatCurrency';
import StepCard from '../shared/StepCard';
import { Button } from '@/components/ui/button';

/**
 * Passo do wizard para seleção de bebidas com controle de quantidade (opcional).
 */
export default function StepBeverages({ order, onSetBeverageQty, onNext, onBack }) {
  const { beverages } = useMenu();
  const hasBeverages = order.beverages.length > 0;

  const getQty = (beverage) =>
    order.beverages.find((b) => b.id === beverage.id)?.qty || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-1">
        <div className="inline-flex items-center gap-2">
          <CupSoda className="w-6 h-6 text-orange-500 dark:text-orange-400" />
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Bebidas</h2>
        </div>
        <p className="text-sm text-slate-500 dark:text-zinc-400">
          Acompanhe sua pizza (opcional)
        </p>
      </div>

      {/* Beverages grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {beverages.map((beverage) => {
          const qty = getQty(beverage);
          const isActive = qty > 0;

          return (
            <motion.div
              key={beverage.id}
              whileHover={{ scale: 1.02, y: -2 }}
              className={`
                relative rounded-2xl overflow-hidden border-2 transition-all duration-300
                ${
                  isActive
                    ? 'border-orange-500 bg-orange-50 dark:bg-orange-500/10 shadow-lg shadow-orange-500/10'
                    : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:hover:border-white/20 dark:hover:bg-white/[0.07]'
                }
              `}
            >
              {/* Beverage image */}
              <img
                src={beverage.image}
                alt={beverage.name}
                className="w-full h-28 object-cover rounded-t-xl"
              />

              {/* Volume badge */}
              <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-white/90 dark:bg-black/60 backdrop-blur-sm border border-slate-200 dark:border-white/10">
                <span className="text-[10px] font-semibold text-slate-700 dark:text-zinc-200">
                  {beverage.volume}
                </span>
              </div>

              {/* Info + controls */}
              <div className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-slate-900 dark:text-white">{beverage.name}</h3>
                  <span className="text-orange-600 dark:text-orange-400 font-bold text-sm">
                    {formatCurrency(beverage.price)}
                  </span>
                </div>

                {/* Quantity controls */}
                <div className="flex items-center justify-center gap-4">
                  <motion.button
                    type="button"
                    whileTap={{ scale: 0.85 }}
                    onClick={() => onSetBeverageQty(beverage, qty - 1)}
                    disabled={qty === 0}
                    className={`
                      w-8 h-8 rounded-lg flex items-center justify-center
                      transition-all duration-200 cursor-pointer
                      ${
                        qty === 0
                          ? 'bg-slate-100 text-slate-400 dark:bg-white/5 dark:text-zinc-600 cursor-not-allowed'
                          : 'bg-slate-200 text-slate-900 hover:bg-slate-300 dark:bg-white/10 dark:text-white dark:hover:bg-white/20'
                      }
                    `}
                  >
                    <Minus className="w-4 h-4" />
                  </motion.button>

                  <motion.span
                    key={qty}
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className={`
                      text-lg font-bold w-8 text-center
                      ${isActive ? 'text-orange-600 dark:text-orange-400' : 'text-slate-500 dark:text-zinc-500'}
                    `}
                  >
                    {qty}
                  </motion.span>

                  <motion.button
                    type="button"
                    whileTap={{ scale: 0.85 }}
                    onClick={() => onSetBeverageQty(beverage, qty + 1)}
                    disabled={qty >= 10}
                    className={`
                      w-8 h-8 rounded-lg flex items-center justify-center
                      transition-all duration-200 cursor-pointer
                      ${
                        qty >= 10
                          ? 'bg-slate-100 text-slate-400 dark:bg-white/5 dark:text-zinc-600 cursor-not-allowed'
                          : 'bg-slate-200 text-slate-900 hover:bg-slate-300 dark:bg-white/10 dark:text-white dark:hover:bg-white/20'
                      }
                    `}
                  >
                    <Plus className="w-4 h-4" />
                  </motion.button>
                </div>
              </div>
            </motion.div>
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
          {hasBeverages ? 'Avançar' : 'Pular'}
        </Button>
      </div>
    </div>
  );
}
