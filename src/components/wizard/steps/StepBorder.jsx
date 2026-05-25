import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, CircleDot, CircleOff } from 'lucide-react';
import { useMenu } from '../../../contexts/MenuContext';
import { formatCurrency } from '../../../utils/formatCurrency';
import StepCard from '../shared/StepCard';
import { Button } from '@/components/ui/button';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.07 },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

/**
 * Passo — Escolha da Borda.
 * 'Sem Borda Recheada' é a primeira opção (vem do data).
 * Preço exibido somente quando > 0; caso contrário mostra "Incluso".
 */
export default function StepBorder({ order, onSelect, onNext, onBack }) {
  const { borders } = useMenu();
  const selectedId = order.border?.id;

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="text-center space-y-1">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Escolha a Borda</h2>
        <p className="text-sm text-slate-500 dark:text-zinc-400">
          Adicione uma borda recheada ou siga com a tradicional
        </p>
      </div>

      {/* Opções de borda */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 sm:grid-cols-2 gap-4"
      >
        {borders.map((border) => {
          const isSelected = selectedId === border.id;
          const isFree = border.price === 0;
          const IconComponent = isFree ? CircleOff : CircleDot;

          return (
            <motion.div key={border.id} variants={item}>
              <StepCard
                selected={isSelected}
                onClick={() => onSelect(border)}
              >
                <div className="flex items-center gap-4 py-3">
                  {/* Ícone */}
                  <div
                    className={`
                      flex items-center justify-center w-12 h-12 rounded-full shrink-0
                      ${isSelected ? 'bg-orange-500/20' : 'bg-slate-100 dark:bg-white/5'}
                      transition-colors duration-300
                    `}
                  >
                    <IconComponent
                      className={`
                        ${isSelected ? 'text-orange-500 dark:text-orange-400' : 'text-slate-400 dark:text-zinc-400'}
                        transition-colors duration-300
                      `}
                      size={24}
                      strokeWidth={1.5}
                    />
                  </div>

                  {/* Texto */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                      {border.name}
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-zinc-400 mt-0.5 truncate">
                      {border.description}
                    </p>
                  </div>

                  {/* Preço */}
                  <span
                    className={`
                      text-sm font-semibold shrink-0
                      ${isFree ? 'text-emerald-600 dark:text-emerald-400' : 'text-orange-600 dark:text-orange-400'}
                    `}
                  >
                    {isFree ? 'Incluso' : `+ ${formatCurrency(border.price)}`}
                  </span>
                </div>
              </StepCard>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Navegação */}
      <div className="flex justify-between pt-2">
        <Button variant="secondary" icon={ArrowLeft} onClick={onBack}>
          Voltar
        </Button>

        <Button
          iconRight={ArrowRight}
          disabled={!selectedId}
          onClick={onNext}
        >
          Próximo
        </Button>
      </div>
    </div>
  );
}
