import { motion } from 'framer-motion';
import {
  ChevronLeft,
  ShoppingCart,
  Pencil,
  Pizza,
  CircleDot,
  Circle,
  Sparkles,
  CupSoda,
  Layers,
} from 'lucide-react';
import { formatCurrency } from '../../../utils/formatCurrency';
import { Button } from '@/components/ui/button';

/**
 * Seção individual do resumo com título, botão de edição e conteúdo.
 */
function SummarySection({ icon: Icon, title, stepIndex, onGoToStep, children }) {
  return (
    <div className="py-4 border-b border-slate-200 dark:border-white/10 last:border-b-0">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4 text-orange-500 dark:text-orange-400" />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
            {title}
          </span>
        </div>
        {stepIndex !== undefined && (
          <motion.button
            type="button"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => onGoToStep(stepIndex)}
            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 transition-colors cursor-pointer"
            title={`Editar ${title.toLowerCase()}`}
          >
            <Pencil className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-400" />
          </motion.button>
        )}
      </div>
      <div className="space-y-1 pl-6">{children}</div>
    </div>
  );
}

/**
 * Linha individual de item do resumo.
 */
function SummaryLine({ label, value, note }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-slate-600 dark:text-zinc-300">
        {label}
        {note && <span className="text-xs text-slate-400 dark:text-zinc-500 ml-1">({note})</span>}
      </span>
      <span className="text-slate-900 dark:text-zinc-200 font-medium">{value}</span>
    </div>
  );
}

/**
 * Passo final do wizard: resumo completo do pedido com estilo de recibo.
 */
export default function StepSummary({ order, totalPrice, onFinalize, onBack, onGoToStep }) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-1">
        <div className="inline-flex items-center gap-2">
          <ShoppingCart className="w-6 h-6 text-orange-500 dark:text-orange-400" />
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Resumo do Pedido</h2>
        </div>
      </div>

      {/* Receipt card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="glass-card rounded-2xl p-6 bg-slate-50 border border-slate-200 dark:bg-white/5 dark:border-white/10 backdrop-blur-xl"
      >
        {/* TAMANHO */}
        <SummarySection icon={Pizza} title="Tamanho" stepIndex={0} onGoToStep={onGoToStep}>
          {order.size && (
            <>
              <SummaryLine
                label={order.size.name}
                value={formatCurrency(order.size.basePrice)}
              />
              {order.size.diameter && (
                <p className="text-xs text-slate-500 dark:text-zinc-500">{order.size.diameter}</p>
              )}
            </>
          )}
        </SummarySection>

        {/* MASSA */}
        <SummarySection icon={Layers} title="Massa" stepIndex={2} onGoToStep={onGoToStep}>
          {order.crust && (
            <SummaryLine
              label={order.crust.name}
              value={order.crust.price ? formatCurrency(order.crust.price) : 'Incluso'}
            />
          )}
        </SummarySection>

        {/* BORDA */}
        <SummarySection icon={CircleDot} title="Borda" stepIndex={3} onGoToStep={onGoToStep}>
          {order.border && (
            <SummaryLine
              label={order.border.name}
              value={order.border.price ? formatCurrency(order.border.price) : 'Incluso'}
            />
          )}
        </SummarySection>

        {/* SABORES */}
        <SummarySection icon={Circle} title="Sabores" stepIndex={4} onGoToStep={onGoToStep}>
          {order.flavors.length > 0 ? (
            order.flavors.map((flavor) => (
              <SummaryLine
                key={flavor.id}
                label={flavor.name}
                value={flavor.price === 0 ? 'Incluso' : formatCurrency(flavor.price)}
                note={order.flavors.length === 2 ? 'valor do maior' : undefined}
              />
            ))
          ) : (
            <p className="text-sm text-slate-500 dark:text-zinc-500">Nenhum</p>
          )}
          {order.flavors.length === 2 && (
            <p className="text-[10px] text-slate-400 dark:text-zinc-500 mt-1">
              * Cobrado apenas o sabor de maior valor
            </p>
          )}
        </SummarySection>

        {/* ADICIONAIS */}
        <SummarySection icon={Sparkles} title="Adicionais" stepIndex={5} onGoToStep={onGoToStep}>
          {order.extras.length > 0 ? (
            order.extras.map((extra) => (
              <SummaryLine
                key={extra.id}
                label={extra.name}
                value={formatCurrency(extra.price)}
              />
            ))
          ) : (
            <p className="text-sm text-slate-500 dark:text-zinc-500">Nenhum</p>
          )}
        </SummarySection>

        {/* BEBIDAS */}
        <SummarySection icon={CupSoda} title="Bebidas" stepIndex={6} onGoToStep={onGoToStep}>
          {order.beverages.length > 0 ? (
            order.beverages.map((bev) => (
              <SummaryLine
                key={bev.id}
                label={`${bev.name} × ${bev.qty}`}
                value={formatCurrency(bev.price * bev.qty)}
              />
            ))
          ) : (
            <p className="text-sm text-slate-500 dark:text-zinc-500">Nenhuma</p>
          )}
        </SummarySection>

        {/* Total */}
        <div className="pt-4 mt-2 border-t-2 border-slate-200 dark:border-white/20">
          <div className="flex items-center justify-between">
            <span className="text-lg font-bold text-slate-900 dark:text-white">Total</span>
            <motion.span
              key={totalPrice}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-2xl font-extrabold text-orange-600 dark:text-orange-400"
            >
              {formatCurrency(totalPrice)}
            </motion.span>
          </div>
        </div>
      </motion.div>

      {/* Actions */}
      <div className="flex flex-col gap-3 pt-2">
        <Button
          onClick={onFinalize}
          icon={ShoppingCart}
          className="!bg-gradient-to-r !from-orange-500 !to-orange-600 !shadow-lg !shadow-orange-500/25 hover:!shadow-orange-500/40 w-full text-base py-4"
        >
          Adicionar ao Carrinho
        </Button>
        <Button variant="ghost" icon={ChevronLeft} onClick={onBack} className="self-start">
          Voltar e Editar
        </Button>
      </div>
    </div>
  );
}
