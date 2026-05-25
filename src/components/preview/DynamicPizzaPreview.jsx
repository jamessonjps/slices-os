import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatCurrency } from '../../utils/formatCurrency';
import PriceDisplay from './PriceDisplay';

/**
 * DynamicPizzaPreview — Visualizador Dinâmico da Pizza
 *
 * Empilha camadas de imagens .webp com position absolute:
 *   z-0  → Tábua de Madeira (sempre visível)
 *   z-10 → Base da Pizza (massa + borda unificada)
 *   z-20 → Sabores (com clip-path para meio-a-meio)
 *   z-25 → Linha divisória (2 sabores)
 *
 * Visual Rollback:
 *   Step 0–1 (Tamanho/Divisão) → Apenas Tábua + Placeholder
 *   Step 2–3 (Massa/Borda)     → Tábua + Base animada
 *   Step 4+  (Sabores em diante) → Tábua + Base + Recheios
 */
export default function DynamicPizzaPreview({ order, currentStep = 7, totalPrice = 0 }) {
  const { size, crust, border, flavors, division } = order;

  // ── Visual Rollback Flags ──
  const showBase = currentStep >= 2;
  const showFlavors = currentStep >= 4;

  // ── Imagem da Base (combinação massa × borda) ──
  const crustType = crust ? crust.id : 'tradicional';
  const hasBorder = border && border.id !== 'sem-borda' && currentStep >= 3;
  const baseImageSrc = `/pizza/bases/base-${crustType}-${hasBorder ? 'recheada' : 'plana'}.webp`;

  // ── Preço Visível (rollback-aware) ──
  const visiblePrice = useMemo(() => {
    let total = 0;
    if (size) total += size.basePrice;
    if (currentStep >= 2 && crust && crust.price) total += crust.price;
    if (currentStep >= 3 && border && border.price) total += border.price;
    if (currentStep >= 4 && flavors.length > 0) {
      if (flavors.length === 1) total += flavors[0].price;
      else if (flavors.length === 2) total += Math.max(flavors[0].price, flavors[1].price);
    }
    if (currentStep >= 5) order.extras.forEach(e => { total += e.price; });
    if (currentStep >= 6) order.beverages.forEach(b => { total += b.price * (b.qty || 1); });
    return total;
  }, [order, currentStep, size, crust, border, flavors]);

  // ── Escala dinâmica por tamanho ──
  const scaleMap = { pequena: 0.75, media: 0.88, grande: 1.0 };
  const currentScale = size ? scaleMap[size.id] || 0.88 : 0.88;

  return (
    <div className="flex flex-col items-center justify-center h-full w-full px-4 py-4 lg:py-6">
      {/* ===== Container da Pizza (aspect-ratio 1:1) ===== */}
      <div className="pizza-container w-full max-w-[300px] lg:max-w-[380px]">
        {/* Sombra ambiente da tábua */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-orange-950/30 to-black/50 blur-3xl scale-110 -z-10" />

        {/* ── Camada z-0: Fundo Ambiente (Mesa + Tábua + Massa original) ── */}
        <img
          src="/pizza/bases/new-ambient-board.webp"
          alt="Ambiente Pizzeria"
          className="absolute top-1/2 left-1/2 z-0 pointer-events-none"
          style={{
            height: '190%', // Ajuste o zoom aqui (ex: 180%, 200%)
            width: 'auto',
            maxWidth: 'none',
            // Ajuste fino do centro:
            // Micro-ajuste: de -50.5% para -49.5% (move a pizza mais ~1.5mm para a esquerda)
            transform: 'translate(-49.5%, -50%)'
          }}
          draggable={false}
        />

        {/* ── Container Animado da Pizza (Escala de acordo com o Tamanho) ── */}
        <motion.div
          className="absolute inset-0 w-full h-full"
          animate={{ scale: currentScale }}
          transition={{ type: 'spring', stiffness: 180, damping: 22 }}
        >
          {/* ── Camada z-10: Base da Pizza (Massa + Borda) ── */}
          <AnimatePresence mode="wait">
            {showBase ? (
              <motion.img
                key={baseImageSrc}
                src={baseImageSrc}
                alt={`Base ${crustType} ${hasBorder ? 'recheada' : 'plana'}`}
                className="pizza-layer z-10"
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.85 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                draggable={false}
              />
            ) : (
              <motion.div
                key="placeholder-base"
                className="pizza-layer z-10 rounded-full border-2 border-dashed border-white/15"
                style={{
                  background: 'radial-gradient(circle, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)',
                }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              />
            )}
          </AnimatePresence>

          {/* ── Camada z-20: Sabores (Clipping para esconder a borda original do recheio) ── */}
          <div className="absolute inset-[6%] rounded-full overflow-hidden z-20 pointer-events-none">
            <AnimatePresence>
              {showFlavors && flavors.map((flavor, index) => {
                const clipClass =
                  division === 2
                    ? index === 0
                      ? 'clip-left'
                      : 'clip-right'
                    : '';

                return (
                  <motion.img
                    key={flavor.id}
                    src={flavor.image}
                    alt={flavor.name}
                    className={`absolute top-0 left-0 w-full h-full object-contain origin-center ${clipClass}`}
                    initial={{ opacity: 0, scale: 1.0 }}
                    animate={{ opacity: 1, scale: 1.16 }}
                    exit={{ opacity: 0, scale: 1.0 }}
                    transition={{ duration: 0.45, delay: index * 0.12, ease: [0.16, 1, 0.3, 1] }}
                    draggable={false}
                  />
                );
              })}
            </AnimatePresence>

            {/* ── Linha divisória para 2 sabores (movida para dentro do clip container) ── */}
            <AnimatePresence>
              {showFlavors && division === 2 && flavors.length === 2 && (
                <motion.div
                  className="absolute inset-0 z-[25] flex items-center justify-center pointer-events-none"
                  initial={{ opacity: 0, scaleY: 0 }}
                  animate={{ opacity: 1, scaleY: 1 }}
                  exit={{ opacity: 0, scaleY: 0 }}
                  transition={{ duration: 0.4, delay: 0.2 }}
                >
                  <div className="w-[2px] h-full bg-gradient-to-b from-transparent via-white/40 to-transparent shadow-[0_0_8px_rgba(255,255,255,0.15)]" />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* ── Placeholder "Monte sua Pizza" (Steps 0-1) ── */}
          <AnimatePresence>
            {!showBase && (
              <motion.div
                key="cta-placeholder"
                className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
              >
                <div className="text-center">
                  <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-black/40 border border-white/10 flex items-center justify-center backdrop-blur-md">
                    <svg className="w-7 h-7 text-zinc-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <circle cx="12" cy="12" r="10" />
                      <path d="M8 12l2-3 2 3M14 10l1.5 2" />
                      <circle cx="9" cy="9" r="1" fill="currentColor" />
                      <circle cx="15" cy="8" r="0.8" fill="currentColor" />
                      <circle cx="12" cy="14" r="0.8" fill="currentColor" />
                    </svg>
                  </div>
                  <p className="text-xs text-slate-200 dark:text-zinc-400 font-medium bg-black/40 px-4 py-1.5 rounded-full backdrop-blur-md">
                    Monte sua Pizza
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* ===== Preço e Info do Tamanho ===== */}
      <div className="relative z-20 mt-6 lg:mt-8 flex flex-col items-center gap-3">
        <PriceDisplay totalPrice={visiblePrice} />

        <AnimatePresence mode="wait">
          {size && (
            <motion.div
              key={size.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
              className="text-center"
            >
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-200 dark:bg-white/5 border border-slate-300 dark:border-white/10 text-xs text-slate-600 dark:text-zinc-400">
                {size.name} · {size.diameter} · {size.slices} fatias
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
