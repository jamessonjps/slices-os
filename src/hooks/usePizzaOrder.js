import { useReducer, useMemo, useCallback, useEffect } from 'react';

const STORAGE_KEY = 'sliceos-order';

const initialOrder = {
  size: null,
  division: 1,
  crust: null,
  border: null,
  flavors: [],
  extras: [],
  beverages: [],
};

/**
 * Tenta recuperar o pedido salvo no localStorage.
 * Retorna initialOrder se não encontrar ou houver erro.
 */
function loadSavedOrder() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      // Validação básica — garante que tem a estrutura esperada
      if (parsed && typeof parsed === 'object' && 'division' in parsed) {
        return { ...initialOrder, ...parsed };
      }
    }
  } catch {
    // Silently fail — localStorage pode estar indisponível
  }
  return initialOrder;
}

/**
 * Salva o pedido no localStorage.
 */
function saveOrder(order) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(order));
  } catch {
    // Silently fail
  }
}

/**
 * Limpa o pedido salvo do localStorage.
 */
function clearSavedOrder() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Silently fail
  }
}

function orderReducer(state, action) {
  switch (action.type) {
    case 'SET_SIZE':
      return {
        ...state,
        size: action.payload,
        // Se Pequena, forçar 1 sabor e limpar sabores excedentes
        division: action.payload.id === 'small' ? 1 : state.division,
        flavors:
          action.payload.id === 'small' && state.flavors.length > 1
            ? [state.flavors[0]]
            : state.flavors,
      };

    case 'SET_DIVISION':
      return {
        ...state,
        division: action.payload,
        // Se voltar para 1, manter só o primeiro sabor
        flavors: action.payload === 1 ? state.flavors.slice(0, 1) : state.flavors,
      };

    case 'SET_CRUST':
      return { ...state, crust: action.payload };

    case 'SET_BORDER':
      return { ...state, border: action.payload };

    case 'SET_FLAVORS':
      return { ...state, flavors: action.payload };

    case 'TOGGLE_FLAVOR': {
      const flavor = action.payload;
      const exists = state.flavors.find((f) => f.id === flavor.id);

      if (exists) {
        return { ...state, flavors: state.flavors.filter((f) => f.id !== flavor.id) };
      }

      if (state.flavors.length >= state.division) {
        // Substituir o último sabor se já atingiu o limite
        if (state.division === 1) {
          return { ...state, flavors: [flavor] };
        }
        return { ...state, flavors: [state.flavors[0], flavor] };
      }

      return { ...state, flavors: [...state.flavors, flavor] };
    }

    case 'TOGGLE_EXTRA': {
      const extra = action.payload;
      const exists = state.extras.find((e) => e.id === extra.id);
      if (exists) {
        return { ...state, extras: state.extras.filter((e) => e.id !== extra.id) };
      }
      return { ...state, extras: [...state.extras, extra] };
    }

    case 'SET_BEVERAGE_QTY': {
      const { beverage, qty } = action.payload;
      if (qty <= 0) {
        return {
          ...state,
          beverages: state.beverages.filter((b) => b.id !== beverage.id),
        };
      }
      const exists = state.beverages.find((b) => b.id === beverage.id);
      if (exists) {
        return {
          ...state,
          beverages: state.beverages.map((b) =>
            b.id === beverage.id ? { ...b, qty } : b
          ),
        };
      }
      return {
        ...state,
        beverages: [...state.beverages, { ...beverage, qty }],
      };
    }

    case 'RESET':
      return { ...initialOrder };

    case 'LOAD':
      return { ...initialOrder, ...action.payload };

    default:
      return state;
  }
}

/**
 * Hook customizado para gerenciar o estado do pedido de pizza
 * com persistência em localStorage e cálculo de preço em tempo real.
 */
export function usePizzaOrder() {
  const [order, dispatch] = useReducer(orderReducer, null, loadSavedOrder);

  // Persistir no localStorage a cada mudança de estado
  useEffect(() => {
    saveOrder(order);
  }, [order]);

  const totalPrice = useMemo(() => {
    let total = 0;

    // Preço base do tamanho
    if (order.size) {
      total += order.size.basePrice;
    }

    // Preço da massa
    if (order.crust && order.crust.price) {
      total += order.crust.price;
    }

    // Preço da borda
    if (order.border && order.border.price) {
      total += order.border.price;
    }

    // Preço dos sabores baseados no tamanho
    if (order.size && order.flavors.length > 0) {
      const getFlavorPrice = (flavor) => {
        const sizeKey = `price_${order.size.id}`; // ex: price_pequena, price_media
        return flavor[sizeKey] || 0;
      };

      if (order.flavors.length === 1) {
        total += getFlavorPrice(order.flavors[0]);
      } else if (order.flavors.length === 2) {
        total += Math.max(getFlavorPrice(order.flavors[0]), getFlavorPrice(order.flavors[1]));
      }
    }

    // Preço dos adicionais
    for (const extra of order.extras) {
      total += extra.price;
    }

    // Preço das bebidas
    for (const bev of order.beverages) {
      total += bev.price * (bev.qty || 1);
    }

    return total;
  }, [order]);

  const setSize = useCallback((size) => dispatch({ type: 'SET_SIZE', payload: size }), []);
  const setDivision = useCallback((div) => dispatch({ type: 'SET_DIVISION', payload: div }), []);
  const setCrust = useCallback((crust) => dispatch({ type: 'SET_CRUST', payload: crust }), []);
  const setBorder = useCallback((border) => dispatch({ type: 'SET_BORDER', payload: border }), []);
  const setFlavors = useCallback((flavors) => dispatch({ type: 'SET_FLAVORS', payload: flavors }), []);
  const toggleFlavor = useCallback((flavor) => dispatch({ type: 'TOGGLE_FLAVOR', payload: flavor }), []);
  const toggleExtra = useCallback((extra) => dispatch({ type: 'TOGGLE_EXTRA', payload: extra }), []);
  const setBeverageQty = useCallback(
    (beverage, qty) => dispatch({ type: 'SET_BEVERAGE_QTY', payload: { beverage, qty } }),
    []
  );
  const resetOrder = useCallback(() => {
    clearSavedOrder();
    dispatch({ type: 'RESET' });
  }, []);

  return {
    order,
    totalPrice,
    setSize,
    setDivision,
    setCrust,
    setBorder,
    setFlavors,
    toggleFlavor,
    toggleExtra,
    setBeverageQty,
    resetOrder,
  };
}
