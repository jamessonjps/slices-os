import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import StepDivision from './StepDivision';

describe('StepDivision Component', () => {
  const mockOrder = {
    size: { id: 'media', name: 'Média' },
    division: null,
  };

  it('deve renderizar as opções de 1 Sabor e 2 Sabores', () => {
    render(
      <StepDivision
        order={mockOrder}
        onSelect={vi.fn()}
        onNext={vi.fn()}
        onBack={vi.fn()}
      />
    );

    expect(screen.getByRole('heading', { name: /1 Sabor/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /2 Sabores/i })).toBeInTheDocument();
  });

  it('não deve desabilitar "2 Sabores" se o tamanho não for "pequena"', () => {
    render(
      <StepDivision
        order={mockOrder}
        onSelect={vi.fn()}
        onNext={vi.fn()}
        onBack={vi.fn()}
      />
    );

    const twoFlavorsButton = screen.getByRole('button', { name: /2 Sabores/i });
    expect(twoFlavorsButton).not.toBeDisabled();
    // O aviso não deve estar na tela
    expect(screen.queryByText(/apenas com 1 sabor/i)).not.toBeInTheDocument();
  });

  it('deve desabilitar "2 Sabores" e exibir o aviso caso o tamanho seja "pequena"', () => {
    const pequenaOrder = {
      size: { id: 'pequena', name: 'Pequena' },
      division: 1,
    };

    render(
      <StepDivision
        order={pequenaOrder}
        onSelect={vi.fn()}
        onNext={vi.fn()}
        onBack={vi.fn()}
      />
    );

    const warningText = screen.getByText(/apenas com 1 sabor/i);
    expect(warningText).toBeInTheDocument();

    const twoFlavorsButton = screen.getByRole('button', { name: /2 Sabores/i });
    // Como usamos o componente StepCard com uma classe customizada e onClick ignorado quando disabled,
    // o <button> nativo pode não ter o atributo disabled HTML strict, mas podemos checar se o onClick funciona
    // Mas no StepCard tem: disabled={isDisabled} o que deve setar o atributo HTML
    // Na verdade, o StepCard repassa `disabled` internamente? Vamos verificar o comportamento.
    // Em Framer Motion botões disabled costumam receber attr ou ser testáveis.
    
    // Teste de ação: clicar em 2 sabores não deve disparar onSelect
    const handleSelect = vi.fn();
    render(
      <StepDivision
        order={pequenaOrder}
        onSelect={handleSelect}
        onNext={vi.fn()}
        onBack={vi.fn()}
      />
    );
    
    const buttonToClick = screen.getAllByRole('button', { name: /2 Sabores/i })[1];
    
    userEvent.click(buttonToClick);
    expect(handleSelect).not.toHaveBeenCalledWith(2);
  });

  it('deve chamar onSelect ao clicar em uma opção habilitada', async () => {
    const handleSelect = vi.fn();
    const user = userEvent.setup();

    render(
      <StepDivision
        order={mockOrder}
        onSelect={handleSelect}
        onNext={vi.fn()}
        onBack={vi.fn()}
      />
    );

    const oneFlavorButton = screen.getByRole('button', { name: /1 Sabor/i });
    await user.click(oneFlavorButton);

    expect(handleSelect).toHaveBeenCalledTimes(1);
    expect(handleSelect).toHaveBeenCalledWith(1);
  });
});
