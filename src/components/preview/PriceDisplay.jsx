import { motion, AnimatePresence } from 'framer-motion';
import { formatCurrency } from '../../utils/formatCurrency';

/**
 * PriceDisplay — Exibe o preço total em tempo real.
 * Animação premium de transição ao mudar valor.
 */
export default function PriceDisplay({ totalPrice }) {
  const priceKey = totalPrice.toFixed(2);

  return (
    <div className="flex justify-center">
      <div className="inline-flex items-center gap-3 bg-orange-500 px-6 py-2.5 rounded-full shadow-[0_8px_30px_rgba(249,115,22,0.4)] border border-orange-400/50">
        <div className="flex flex-col items-end">
          <span className="text-[10px] font-bold text-orange-100 uppercase tracking-wider">
            A partir de
          </span>
          <AnimatePresence mode="wait">
            <motion.span
              key={priceKey}
              initial={{ opacity: 0, y: 10, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.9 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="text-2xl font-black text-white"
            >
              {totalPrice > 0 ? formatCurrency(totalPrice) : '—'}
            </motion.span>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
