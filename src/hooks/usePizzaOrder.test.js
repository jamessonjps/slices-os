import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { usePizzaOrder } from './usePizzaOrder';

describe('usePizzaOrder Hook', () => {
  const STORAGE_KEY = 'sliceos-order';

  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('deve calcular o preço corretamente com 1 sabor', () => {
    const { result } = renderHook(() => usePizzaOrder());

    act(() => {
      result.current.setSize({ id: 'media', basePrice: 39.90 });
      result.current.setDivision(1);
      result.current.toggleFlavor({ id: 'pepperoni', price: 10.00 });
    });

    // 39.90 (base) + 10.00 (sabor)
    expect(result.current.totalPrice).toBeCloseTo(49.90);
  });

  it('deve calcular o preço com 2 sabores usando Math.max (não a soma)', () => {
    const { result } = renderHook(() => usePizzaOrder());

    act(() => {
      result.current.setSize({ id: 'grande', basePrice: 49.90 });
      result.current.setDivision(2);
      result.current.toggleFlavor({ id: 'pepperoni', price: 10.00 });
      result.current.toggleFlavor({ id: 'camarao', price: 20.00 });
    });

    // 49.90 (base) + max(10, 20) = 49.90 + 20.00 = 69.90
    expect(result.current.totalPrice).toBeCloseTo(69.90);
  });

  it('não deve quebrar o cálculo se a borda ou massa forem null', () => {
    const { result } = renderHook(() => usePizzaOrder());

    act(() => {
      result.current.setSize({ id: 'media', basePrice: 39.90 });
      // Mantendo crust e border null (initial state)
      result.current.toggleFlavor({ id: 'mussarela', price: 0 });
    });

    expect(result.current.order.crust).toBeNull();
    expect(result.current.order.border).toBeNull();
    expect(result.current.totalPrice).toBeCloseTo(39.90);
  });

  it('deve calcular corretamente bebidas com qty > 1', () => {
    const { result } = renderHook(() => usePizzaOrder());

    act(() => {
      result.current.setSize({ id: 'pequena', basePrice: 29.90 });
      result.current.toggleFlavor({ id: 'mussarela', price: 0 });
      result.current.setBeverageQty({ id: 'coca', price: 8.00 }, 3); // 3x Coca-Cola (8 * 3 = 24)
    });

    // 29.90 + 24.00 = 53.90
    expect(result.current.totalPrice).toBeCloseTo(53.90);
  });

  it('deve hidratar o estado inicial a partir do localStorage', () => {
    // Preparar o localStorage ANTES de renderizar o hook
    const savedOrder = {
      size: { id: 'media', basePrice: 39.90 },
      division: 2,
      crust: null,
      border: { id: 'catupiry', price: 5.00 },
      flavors: [{ id: 'marguerita', price: 5.00 }],
      extras: [],
      beverages: [],
    };
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(savedOrder));

    const { result } = renderHook(() => usePizzaOrder());

    expect(result.current.order.size.id).toBe('media');
    expect(result.current.order.division).toBe(2);
    expect(result.current.order.border.id).toBe('catupiry');
    expect(result.current.order.flavors).toHaveLength(1);
    
    // 39.90 + 5.00 (borda) + 5.00 (sabor) = 49.90
    expect(result.current.totalPrice).toBeCloseTo(49.90);
  });
});
