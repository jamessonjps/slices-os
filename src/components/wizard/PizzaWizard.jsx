import { useState, useCallback, useMemo, useEffect } from 'react';
import { usePizzaOrder } from '../../hooks/usePizzaOrder';
import { useCart } from '../../contexts/CartContext';
import DynamicPizzaPreview from '../preview/DynamicPizzaPreview';

import { useNavigate } from 'react-router-dom';
import { X } from 'lucide-react';
import { safeLocalStorage, safeJsonParse } from '@/utils/storage';
import { createPageUrl } from '@/utils';

import WizardNav from './WizardNav';
import StepTransition from './shared/StepTransition';

import StepSize from './steps/StepSize';
import StepDivision from './steps/StepDivision';
import StepCrust from './steps/StepCrust';
import StepBorder from './steps/StepBorder';
import StepFlavors from './steps/StepFlavors';
import StepExtras from './steps/StepExtras';
import StepBeverages from './steps/StepBeverages';
import StepSummary from './steps/StepSummary';

import CartFloatingButton from '../ui/CartFloatingButton';
import CartDrawer from '../ui/CartDrawer';

const TOTAL_STEPS = 8;

export default function PizzaWizard() {
  const {
    order,
    totalPrice,
    setSize,
    setDivision,
    setCrust,
    setBorder,
    toggleFlavor,
    toggleExtra,
    setBeverageQty,
    resetOrder,
  } = usePizzaOrder();

  const { addToCart } = useCart();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const navigate = useNavigate();

  const [currentStep, setCurrentStep] = useState(() => {
    try {
      const saved = localStorage.getItem('sliceos-step');
      if (saved) {
        const parsed = parseInt(saved, 10);
        if (!isNaN(parsed)) {
          return Math.min(Math.max(parsed, 0), TOTAL_STEPS - 1);
        }
      }
      return 0;
    } catch {
      return 0;
    }
  });
  const [direction, setDirection] = useState(1); // 1 = avançando, -1 = voltando

  // Persistir passo atual no localStorage
  useEffect(() => {
    try {
      localStorage.setItem('sliceos-step', String(currentStep));
    } catch { /* silently fail */ }
  }, [currentStep]);

  // Determina quais passos devem ser pulados
  const skippedSteps = useMemo(() => {
    const skipped = [];
    if (order.size?.id === 'pequena') {
      skipped.push(1);
    }
    return skipped;
  }, [order.size]);

  const goNext = useCallback(() => {
    setDirection(1);
    setCurrentStep((prev) => {
      let next = prev + 1;
      while (next < TOTAL_STEPS && skippedSteps.includes(next)) {
        next++;
      }
      return Math.min(next, TOTAL_STEPS - 1);
    });
  }, [skippedSteps]);

  const goBack = useCallback(() => {
    setDirection(-1);
    setCurrentStep((prev) => {
      let next = prev - 1;
      while (next >= 0 && skippedSteps.includes(next)) {
        next--;
      }
      // Se voltar para a Massa (2) ou anterior, limpar a borda
      if (next <= 2 && order.border) {
        setBorder(null);
      }
      return Math.max(next, 0);
    });
  }, [skippedSteps, order.border, setBorder]);

  const goToStep = useCallback(
    (step) => {
      setDirection(step < currentStep ? -1 : 1);
      setCurrentStep(step);
    },
    [currentStep]
  );

  const handleSetSize = useCallback(
    (size) => {
      setSize(size);
      if (size.id === 'pequena') {
        setDivision(1);
      }
    },
    [setSize, setDivision]
  );

  // Finalizar = Adicionar ao Carrinho Global e ir para Checkout
  const handleFinalize = useCallback(() => {
    // Recupera carrinho atual
    const savedCart = safeLocalStorage.get('cart');
    const cart = Array.isArray(safeJsonParse(savedCart, [])) ? safeJsonParse(savedCart, []) : [];

    // 1. Adicionar a Pizza
    let pizzaName = `Pizza ${order.size?.name || 'Personalizada'}`;
    if (order.flavors.length > 0) {
      if (order.flavors.length === 1) {
        pizzaName += ` de ${order.flavors[0].name}`;
      } else {
        pizzaName += ` Meio a Meio (${order.flavors.map(f => f.name).join(' e ')})`;
      }
    }
    if (order.border && order.border.id !== 'sem-borda') {
      pizzaName += ` com ${order.border.name}`;
    }

    // Calcula o preço base da pizza (sabores + massa + borda)
    let pizzaPrice = 0;
    if (order.flavors.length > 0) {
      pizzaPrice += Math.max(...order.flavors.map(f => f.price || 0));
    }
    if (order.crust && order.crust.price) pizzaPrice += order.crust.price;
    if (order.border && order.border.price) pizzaPrice += order.border.price;

    cart.push({
      id: crypto.randomUUID(),
      name: pizzaName,
      price: pizzaPrice,
      quantity: 1,
      type: 'pizza',
      size: order.size?.slices || 8
    });

    // 2. Adicionar Adicionais (Extras)
    order.extras.forEach(extra => {
      cart.push({
        id: crypto.randomUUID(),
        name: `Adicional: ${extra.name}`,
        price: extra.price,
        quantity: 1,
        type: 'extra'
      });
    });

    // 3. Adicionar Bebidas
    order.beverages.forEach(bev => {
      cart.push({
        id: crypto.randomUUID(),
        name: bev.name,
        price: bev.price,
        quantity: bev.qty,
        type: 'beverage'
      });
    });

    // Salvar e redirecionar
    safeLocalStorage.set('cart', JSON.stringify(cart));
    
    resetOrder();
    setCurrentStep(0);
    try { localStorage.removeItem('sliceos-step'); } catch { /* noop */ }
    
    navigate('/checkout'); // createPageUrl('Checkout') se base path for custom, mas /checkout padrão
  }, [order, totalPrice, resetOrder, navigate]);

  const renderStep = () => {
    switch (currentStep) {
      case 0: return <StepSize order={order} onSelect={handleSetSize} onNext={goNext} onBack={goBack} />;
      case 1: return <StepDivision order={order} onSelect={setDivision} onNext={goNext} onBack={goBack} />;
      case 2: return <StepCrust order={order} onSelect={setCrust} onNext={goNext} onBack={goBack} />;
      case 3: return <StepBorder order={order} onSelect={setBorder} onNext={goNext} onBack={goBack} />;
      case 4: return <StepFlavors order={order} onToggleFlavor={toggleFlavor} onNext={goNext} onBack={goBack} />;
      case 5: return <StepExtras order={order} onToggleExtra={toggleExtra} onNext={goNext} onBack={goBack} />;
      case 6: return <StepBeverages order={order} onSetBeverageQty={setBeverageQty} onNext={goNext} onBack={goBack} />;
      case 7: return <StepSummary order={order} totalPrice={totalPrice} onFinalize={handleFinalize} onBack={goBack} onGoToStep={goToStep} />;
      default: return null;
    }
  };

  return (
    <>
      <CartFloatingButton onClick={() => setIsCartOpen(true)} />
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
      
      <div className="min-h-screen flex flex-col lg:flex-row relative">
        {/* ========================================
            COLUNA ESQUERDA — Visualizador (Preview)
            ======================================== */}
        <div
          className="
            sticky top-0 z-30
            h-[46vh] lg:h-screen
            w-full lg:w-[45%] lg:fixed lg:left-0
            bg-slate-100 dark:bg-zinc-900
            border-b border-slate-200 dark:border-white/5 lg:border-b-0 lg:border-r lg:dark:border-white/5
            flex flex-col items-center justify-center
            overflow-hidden
          "
        >
          {/* Botão Fechar (Desktop / Mobile) */}
          <button
            onClick={() => navigate('/')}
            className="absolute top-4 left-4 z-50 p-2 rounded-full bg-white/50 dark:bg-black/20 hover:bg-white dark:hover:bg-black/40 backdrop-blur-md transition-colors text-slate-600 dark:text-zinc-300 shadow-sm border border-slate-200 dark:border-white/10"
            title="Voltar ao início"
          >
            <X className="w-5 h-5" />
          </button>
          {/* Background: cor sólida de base */}
          <div className="absolute inset-0 bg-slate-100 dark:bg-zinc-950 transition-colors" />
          {/* Overlay escuro para contraste (mais suave no modo claro) */}
          <div className="absolute inset-0 bg-black/10 dark:bg-black/50 transition-colors" />

          {/* Brilho ambiente decorativo */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-1/4 left-1/3 w-72 h-72 bg-orange-500/6 rounded-full blur-[100px]" />
            <div className="absolute bottom-1/3 right-1/4 w-56 h-56 bg-amber-500/5 rounded-full blur-[80px]" />
          </div>

          {/* Preview da pizza e Preço */}
          <div className="relative z-10 flex-1 flex flex-col items-center justify-center w-full px-4">
            <DynamicPizzaPreview order={order} currentStep={currentStep} totalPrice={totalPrice} />
          </div>
        </div>

        {/* ========================================
            COLUNA DIREITA — Wizard (Steps)
            ======================================== */}
        <div
          className="
            flex-1
            lg:ml-[45%]
            min-h-[54vh] lg:min-h-screen
            flex flex-col
            bg-white dark:bg-zinc-900 text-slate-900 dark:text-white transition-colors
          "
        >
          {/* Stepper / Navegação */}
          <div className="sticky top-0 z-20 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border-b border-slate-200 dark:border-white/5 lg:top-0 transition-colors">
            <WizardNav
              currentStep={currentStep}
              totalSteps={TOTAL_STEPS}
              skippedSteps={skippedSteps}
            />
          </div>

          {/* Conteúdo do passo atual */}
          <div className="flex-1 p-4 lg:p-8 overflow-y-auto">
            <StepTransition stepKey={currentStep} direction={direction}>
              {renderStep()}
            </StepTransition>
          </div>
        </div>
      </div>
    </>
  );
}
