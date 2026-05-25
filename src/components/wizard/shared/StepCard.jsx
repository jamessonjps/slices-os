import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

/**
 * Card genérico selecionável para opções do wizard.
 * Exibe borda animada, ícone de check e hover effects.
 */
export default function StepCard({
  selected = false,
  onClick,
  children,
  className = '',
  disabled = false,
}) {
  return (
    <motion.button
      type="button"
      onClick={disabled ? undefined : onClick}
      whileHover={!disabled ? { scale: 1.02, y: -2 } : {}}
      whileTap={!disabled ? { scale: 0.98 } : {}}
      className={`
        relative w-full text-left rounded-2xl p-4
        border-2 transition-all duration-300 cursor-pointer
        ${
          selected
            ? 'border-orange-500 bg-orange-50 dark:bg-orange-500/10 shadow-lg shadow-orange-500/10'
            : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:hover:border-white/20 dark:hover:bg-white/[0.07] shadow-sm dark:shadow-none'
        }
        ${disabled ? 'opacity-40 cursor-not-allowed' : ''}
        ${className}
      `}
    >
      {/* Indicador de seleção */}
      {selected && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="absolute top-3 right-3 w-6 h-6 rounded-full bg-orange-500 flex items-center justify-center"
        >
          <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />
        </motion.div>
      )}
      {children}
    </motion.button>
  );
}
