import { motion } from 'framer-motion';
import { Circle } from 'lucide-react';
import { useMenu } from '../../../contexts/MenuContext';
import { formatCurrency } from '../../../utils/formatCurrency';
import StepCard from '../shared/StepCard';

const sizeIconMap = {
  pequena: 28,
  media: 36,
  grande: 44,
};

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

/**
 * Passo 1 — Escolha do tamanho da pizza.
 * Auto-advance: ao clicar, seleciona e avança automaticamente.
 */
export default function StepSize({ order, onSelect, onNext, onBack }) {
  const { sizes } = useMenu();
  const handleSelect = (size) => {
    onSelect(size);
    onNext();
  };

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="text-center space-y-1">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Escolha o Tamanho</h2>
        <p className="text-sm text-slate-500 dark:text-zinc-400">
          Selecione o tamanho ideal para a sua fome
        </p>
      </div>

      {/* Grid de tamanhos */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-3 gap-4"
      >
        {sizes.map((size) => {
          const iconSize = sizeIconMap[size.id] ?? 36;
          const isSelected = order.size?.id === size.id;

          return (
            <motion.div key={size.id} variants={item}>
              <StepCard
                selected={isSelected}
                onClick={() => handleSelect(size)}
              >
                <div className="flex flex-col items-center text-center gap-3 py-4">
                  {/* Ícone */}
                  <div
                    className={`
                      flex items-center justify-center w-16 h-16 rounded-full
                      ${isSelected ? 'bg-orange-500/20' : 'bg-slate-100 dark:bg-white/5'}
                      transition-colors duration-300
                    `}
                  >
                    <Circle
                      className={`
                        ${isSelected ? 'text-orange-500 dark:text-orange-400' : 'text-slate-400 dark:text-zinc-400'}
                        transition-colors duration-300
                      `}
                      size={iconSize}
                      strokeWidth={1.5}
                    />
                  </div>

                  {/* Nome e diâmetro */}
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                      {size.name}
                    </h3>
                    <span className="text-xs text-slate-500 dark:text-zinc-500">
                      {size.diameter}
                    </span>
                  </div>

                  {/* Fatias */}
                  <span className="text-sm text-slate-500 dark:text-zinc-400">
                    {size.slices} fatias
                  </span>

                  {/* Preço */}
                  <span className="text-lg font-bold text-orange-600 dark:text-orange-400">
                    {formatCurrency(size.basePrice)}
                  </span>

                  {/* Nota para Pequena */}
                  {size.id === 'pequena' && (
                    <span className="text-[10px] text-slate-400 dark:text-zinc-500 font-medium">
                      Apenas 1 sabor
                    </span>
                  )}
                </div>
              </StepCard>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}
