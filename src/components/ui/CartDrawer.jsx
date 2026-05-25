import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash2, Pizza, ShoppingCart } from 'lucide-react';
import { useCart } from '../../contexts/CartContext';
import { formatCurrency } from '../../utils/formatCurrency';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { safeLocalStorage, safeJsonParse } from '@/utils/storage';

export default function CartDrawer({ isOpen, onClose }) {
  const { cartItems, removeFromCart, cartTotal, clearCart } = useCart();
  const navigate = useNavigate();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay Escuro */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
          />

          {/* Drawer Lateral */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 bottom-0 w-full sm:w-[400px] bg-surface-900 border-l border-white/10 shadow-2xl z-[70] flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-orange-500/10 flex items-center justify-center">
                  <ShoppingCart className="w-5 h-5 text-orange-400" />
                </div>
                <h2 className="text-xl font-bold text-white">Seu Pedido</h2>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-zinc-400 hover:text-white hover:bg-white/5 rounded-full transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Lista de Itens */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {cartItems.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-zinc-500 gap-4">
                  <ShoppingCart className="w-12 h-12 opacity-20" />
                  <p>Seu carrinho está vazio.</p>
                </div>
              ) : (
                cartItems.map((item, index) => (
                  <div
                    key={item.id}
                    className="p-4 rounded-2xl bg-white/5 border border-white/5 relative group"
                  >
                    <div className="flex gap-4">
                      <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center shrink-0">
                        <Pizza className="w-6 h-6 text-orange-400/80" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-bold text-white mb-1">
                          Pizza {item.size?.name || 'Personalizada'}
                        </h4>
                        <div className="text-xs text-zinc-400 space-y-0.5">
                          {item.flavors.length > 0 ? (
                            <p className="truncate">
                              {item.flavors.map((f) => f.name).join(' + ')}
                            </p>
                          ) : (
                            <p>Sem sabores</p>
                          )}
                          {item.crust && <p>Massa: {item.crust.name}</p>}
                          {item.border && item.border.price > 0 && <p>Borda: {item.border.name}</p>}
                        </div>
                        <div className="mt-3 font-bold text-orange-400">
                          {formatCurrency(item.totalPrice)}
                        </div>
                      </div>
                      
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="p-2 text-zinc-500 hover:text-red-400 hover:bg-red-400/10 rounded-xl transition-colors h-fit"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer / Total */}
            {cartItems.length > 0 && (
              <div className="p-6 border-t border-white/5 bg-zinc-950/50 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-zinc-400">Total do Pedido</span>
                  <span className="text-2xl font-bold text-white">
                    {formatCurrency(cartTotal)}
                  </span>
                </div>
                
                <Button
                  className="w-full !bg-emerald-500 hover:!bg-emerald-400 !text-white !py-4 cursor-pointer"
                  onClick={() => {
                    // 1. Mapear itens do Wizard para a estrutura plana de itens do Checkout
                    const checkoutItems = [];
                    cartItems.forEach((item) => {
                      // Calcular preço da pizza (subtraindo bebidas se houver)
                      const beverageTotal = item.beverages?.reduce((sum, b) => sum + (b.price * (b.qty || 1)), 0) || 0;
                      const pizzaPrice = item.totalPrice - beverageTotal;

                      // Montar nome descritivo completo da pizza personalizada
                      const flavorNames = item.flavors.map(f => f.name).join(' / ') || 'Personalizada';
                      const crustName = item.crust ? ` [Massa: ${item.crust.name}]` : '';
                      const borderName = item.border && item.border.id !== 'sem-borda' ? ` [Borda: ${item.border.name}]` : '';
                      const extrasName = item.extras?.length > 0 ? ` [Adicionais: ${item.extras.map(e => e.name).join(', ')}]` : '';
                      
                      const pizzaName = `Pizza ${item.size?.name || 'Personalizada'} - ${flavorNames}${crustName}${borderName}${extrasName}`;

                      checkoutItems.push({
                        type: 'pizza',
                        name: pizzaName,
                        price: pizzaPrice,
                        quantity: 1,
                        size: item.size?.slices || 8, // 6 ou 8 para o sufixo no Checkout
                        itemId: item.id
                      });

                      // Adicionar bebidas do Wizard como itens separados no Checkout
                      if (item.beverages && item.beverages.length > 0) {
                        item.beverages.forEach((bev) => {
                          checkoutItems.push({
                            type: 'drink',
                            name: bev.name,
                            price: bev.price,
                            quantity: bev.qty || 1,
                            itemId: bev.id
                          });
                        });
                      }
                    });

                    // 2. Mesclar com itens existentes no carrinho local do catálogo (se houver)
                    const existingCart = safeJsonParse(safeLocalStorage.get('cart'), []);
                    const mergedCart = [...existingCart, ...checkoutItems];
                    safeLocalStorage.set('cart', JSON.stringify(mergedCart));

                    // 3. Limpar carrinho temporário do Wizard e ir para o Checkout
                    clearCart();
                    onClose();
                    navigate(createPageUrl('Checkout'));
                  }}
                >
                  Finalizar Pagamento
                </Button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
