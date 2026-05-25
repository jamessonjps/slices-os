import { ShoppingBag } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../../contexts/CartContext';
import { formatCurrency } from '../../utils/formatCurrency';

export default function CartFloatingButton({ onClick }) {
  const { cartItems, cartTotal } = useCart();
  
  if (cartItems.length === 0) return null;

  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.8, y: -20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.8, y: -20 }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className="fixed top-4 right-4 lg:top-8 lg:right-8 z-50 flex items-center gap-3 bg-zinc-900/90 backdrop-blur-md border border-white/10 px-4 py-2.5 rounded-full shadow-2xl group cursor-pointer"
    >
      <div className="relative">
        <ShoppingBag className="w-5 h-5 text-orange-400 group-hover:text-orange-300 transition-colors" />
        <span className="absolute -top-2 -right-2 bg-orange-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
          {cartItems.length}
        </span>
      </div>
      
      <div className="hidden sm:flex flex-col items-start border-l border-white/10 pl-3">
        <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">
          Carrinho
        </span>
        <span className="text-sm font-bold text-white">
          {formatCurrency(cartTotal)}
        </span>
      </div>
    </motion.button>
  );
}
