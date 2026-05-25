import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Pizza } from 'lucide-react';
import { useMenu } from '../../../contexts/MenuContext';
import { formatCurrency } from '../../../utils/formatCurrency';
import StepCard from '../shared/StepCard';
import { Button } from '@/components/ui/button';

/**
 * Passo do wizard para seleção de sabores da pizza.
 * Suporta divisão (1 ou 2 sabores) conforme order.division.
 * Quando 2 sabores, mostra indicadores visuais de lado (Esquerda/Direita).
 */
export default function StepFlavors({ order, onToggleFlavor, onNext, onBack }) {
  const { flavors } = useMenu();
  const selectedCount = order.flavors.length;
  const maxFlavors = order.division;
  const isSelected = (flavor) => order.flavors.some((f) => f.id === flavor.id);
  const getFlavorIndex = (flavor) => order.flavors.findIndex((f) => f.id === flavor.id);

  // Labels para indicar posição visual (Esquerda/Direita no preview)
  const positionLabels = ['Esquerda', 'Direita'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2">
          <Pizza className="w-6 h-6 text-orange-500 dark:text-orange-400" />
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Escolha os Sabores</h2>
        </div>

        {/* Counter badge */}
        <motion.div
          key={selectedCount}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10"
        >
          <span className="text-sm text-slate-600 dark:text-zinc-300">
            <span className="text-orange-600 dark:text-orange-400 font-bold">{selectedCount}</span>
            {' '}de{' '}
            <span className="font-bold">{maxFlavors}</span>
            {' '}selecionado{maxFlavors > 1 ? '(s)' : ''}
          </span>
        </motion.div>

        {/* Hint para meio-a-meio */}
        {maxFlavors === 2 && selectedCount < 2 && (
          <p className="text-xs text-slate-500 dark:text-zinc-500">
            Selecione {2 - selectedCount} sabor{2 - selectedCount > 1 ? 'es' : ''} para pizza meio a meio
          </p>
        )}
      </div>

      {/* Flavor grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {flavors.map((flavor) => {
          const selected = isSelected(flavor);
          const idx = getFlavorIndex(flavor);

          return (
            <StepCard
              key={flavor.id}
              selected={selected}
              onClick={() => onToggleFlavor(flavor)}
              className="!p-0 overflow-hidden"
            >
              {/* Position badge (for half-and-half) */}
              {selected && maxFlavors === 2 && idx >= 0 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="absolute top-2 left-2 z-10 px-2 py-0.5 rounded-full bg-orange-500 text-white text-[10px] font-bold shadow-lg"
                >
                  {positionLabels[idx]}
                </motion.div>
              )}

              {/* Flavor image */}
              <div className="relative w-full h-32 overflow-hidden rounded-t-xl">
                <img
                  src={flavor.image}
                  alt={flavor.name}
                  className="w-full h-full object-cover"
                />
                {/* Category badge */}
                <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded-full bg-white/90 dark:bg-black/60 backdrop-blur-sm border border-slate-200 dark:border-white/10">
                  <span className="text-[10px] font-medium text-slate-700 dark:text-zinc-200 capitalize">
                    {flavor.category}
                  </span>
                </div>
              </div>

              {/* Flavor info */}
              <div className="p-4 space-y-1">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-slate-900 dark:text-white">{flavor.name}</h3>
                  <span className={`font-bold text-sm ${flavor.price === 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-orange-600 dark:text-orange-400'}`}>
                    {flavor.price === 0 ? 'Incluso' : `+ ${formatCurrency(flavor.price)}`}
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-zinc-400 line-clamp-2">{flavor.description}</p>
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
          iconRight={ChevronRight}
          onClick={onNext}
          disabled={selectedCount === 0}
        >
          Avançar
        </Button>
      </div>
    </div>
  );
}
