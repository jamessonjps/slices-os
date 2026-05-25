import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { useMenu } from '../../../contexts/MenuContext';
import { formatCurrency } from '../../../utils/formatCurrency';
import StepCard from '../shared/StepCard';
import { Button } from '@/components/ui/button';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

/**
 * Passo — Tipo de Massa.
 * Exibe opções de massa com imagem, nome, descrição e preço.
 */
export default function StepCrust({ order, onSelect, onNext, onBack }) {
  const { crusts } = useMenu();
  const selectedId = order.crust?.id;

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="text-center space-y-1">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Tipo de Massa</h2>
        <p className="text-sm text-slate-500 dark:text-zinc-400">
          Escolha a base perfeita para sua pizza
        </p>
      </div>

      {/* Opções de massa */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 sm:grid-cols-2 gap-4"
      >
        {crusts.map((crust) => {
          const isSelected = selectedId === crust.id;
          const isFree = crust.price === 0;

          return (
            <motion.div key={crust.id} variants={item}>
              <StepCard
                selected={isSelected}
                onClick={() => onSelect(crust)}
              >
                <div className="flex flex-col items-center text-center gap-4 py-4">
                  {/* Imagem da massa */}
                  <div className="w-full aspect-[16/9] rounded-xl overflow-hidden bg-slate-100 dark:bg-white/5 p-2 flex items-center justify-center">
                    <img
                      src={crust.image}
                      alt={crust.name}
                      className="w-full h-full object-contain"
                    />
                  </div>

                  {/* Texto */}
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                      {crust.name}
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-zinc-400 mt-1">
                      {crust.description}
                    </p>
                  </div>

                  {/* Preço */}
                  <span
                    className={`
                      text-sm font-bold px-3 py-1 rounded-full
                      ${isFree
                        ? 'text-emerald-600 bg-emerald-500/10 dark:text-emerald-400 dark:bg-emerald-500/10'
                        : 'text-orange-600 bg-orange-500/10 dark:text-orange-400 dark:bg-orange-500/10'
                      }
                    `}
                  >
                    {isFree ? 'Incluso' : `+ ${formatCurrency(crust.price)}`}
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
