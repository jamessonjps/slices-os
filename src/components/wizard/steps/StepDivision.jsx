import { motion } from 'framer-motion';
import { Circle, Slice, ArrowLeft, ArrowRight, Info } from 'lucide-react';
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

const divisionOptions = [
  {
    value: 1,
    label: '1 Sabor',
    description: 'Pizza inteira de um sabor',
    Icon: Circle,
  },
  {
    value: 2,
    label: '2 Sabores',
    description: 'Metade de cada sabor',
    Icon: Slice,
  },
];

/**
 * Passo 2 — Quantos sabores na pizza.
 * Se o tamanho for "pequena", o parent deve pular este passo,
 * mas exibimos uma nota visual caso seja renderizado.
 */
export default function StepDivision({ order, onSelect, onNext, onBack }) {
  const isPequena = order.size?.id === 'pequena';
  const selected = order.division;

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="text-center space-y-1">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Quantos Sabores?</h2>
        <p className="text-sm text-slate-500 dark:text-zinc-400">
          Escolha entre pizza inteira ou meio a meio
        </p>
      </div>

      {/* Nota para tamanho pequena */}
      {isPequena && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 rounded-xl border border-orange-500/30 bg-orange-500/10 px-4 py-3"
        >
          <Info className="w-5 h-5 text-orange-400 shrink-0" />
          <p className="text-sm text-orange-300">
            Pizzas no tamanho <strong>Pequena</strong> estão disponíveis apenas
            com 1 sabor.
          </p>
        </motion.div>
      )}

      {/* Opções */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 sm:grid-cols-2 gap-4"
      >
        {divisionOptions.map((opt) => {
          const isSelected = selected === opt.value;
          const isDisabled = isPequena && opt.value === 2;

          return (
            <motion.div key={opt.value} variants={item}>
              <StepCard
                selected={isSelected}
                disabled={isDisabled}
                onClick={() => onSelect(opt.value)}
              >
                <div className="flex flex-col items-center text-center gap-3 py-6">
                  <div
                    className={`
                      flex items-center justify-center w-16 h-16 rounded-full
                      ${isSelected ? 'bg-orange-500/20' : 'bg-slate-100 dark:bg-white/5'}
                      transition-colors duration-300
                    `}
                  >
                    <opt.Icon
                      className={`
                        ${isSelected ? 'text-orange-500 dark:text-orange-400' : 'text-slate-400 dark:text-zinc-400'}
                        transition-colors duration-300
                      `}
                      size={32}
                      strokeWidth={1.5}
                    />
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                      {opt.label}
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-zinc-400 mt-1">
                      {opt.description}
                    </p>
                  </div>
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
          disabled={!selected}
          onClick={onNext}
        >
          Próximo
        </Button>
      </div>
    </div>
  );
}
