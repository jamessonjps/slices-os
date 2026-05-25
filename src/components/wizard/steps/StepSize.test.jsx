import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import StepSize from './StepSize';

describe('StepSize Component', () => {
  const mockOrder = {
    size: null,
    flavors: [],
    crust: null,
    edge: null,
    extras: [],
    beverages: [],
  };

  it('deve renderizar os tamanhos Pequena, Média e Grande', () => {
    render(
      <StepSize
        order={mockOrder}
        onSelect={vi.fn()}
        onNext={vi.fn()}
        onBack={vi.fn()}
      />
    );

    expect(screen.getByRole('heading', { name: /Pequena/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Média/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Grande/i })).toBeInTheDocument();
  });

  it('deve exibir a quantidade de fatias e o preço correto para cada tamanho', () => {
    render(
      <StepSize
        order={mockOrder}
        onSelect={vi.fn()}
        onNext={vi.fn()}
        onBack={vi.fn()}
      />
    );

    // Pequena: 4 fatias, R$ 29,90
    expect(screen.getByText('4 fatias')).toBeInTheDocument();
    expect(screen.getByText(/29,90/)).toBeInTheDocument();

    // Média: 6 fatias, R$ 39,90
    expect(screen.getByText('6 fatias')).toBeInTheDocument();
    expect(screen.getByText(/39,90/)).toBeInTheDocument();

    // Grande: 8 fatias, R$ 49,90
    expect(screen.getByText('8 fatias')).toBeInTheDocument();
    expect(screen.getByText(/49,90/)).toBeInTheDocument();
  });

  it('deve chamar onSelect e onNext ao clicar em uma opção de tamanho', async () => {
    const handleSelect = vi.fn();
    const handleNext = vi.fn();

    render(
      <StepSize
        order={mockOrder}
        onSelect={handleSelect}
        onNext={handleNext}
        onBack={vi.fn()}
      />
    );

    const user = userEvent.setup();
    const sizeCard = screen.getByRole('button', { name: /grande 35cm 8 fatias/i });
    
    await user.click(sizeCard);

    expect(handleSelect).toHaveBeenCalledTimes(1);
    expect(handleSelect).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'grande', name: 'Grande' })
    );
    expect(handleNext).toHaveBeenCalledTimes(1);
  });

  it('deve indicar visualmente se um tamanho já estiver selecionado', () => {
    const selectedOrder = {
      ...mockOrder,
      size: {
        id: 'media',
        name: 'Média',
        basePrice: 39.90,
        slices: 6,
        diameter: '30cm',
      },
    };

    render(
      <StepSize
        order={selectedOrder}
        onSelect={vi.fn()}
        onNext={vi.fn()}
        onBack={vi.fn()}
      />
    );

    // O botão selecionado deve ter classes de estilo ativo do Tailwind (como border-orange-500)
    const mediaCard = screen.getByRole('button', { name: /média 30cm 6 fatias/i });
    expect(mediaCard).toHaveClass('border-orange-500');
  });
});
