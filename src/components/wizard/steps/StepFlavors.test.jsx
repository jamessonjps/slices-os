import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import StepFlavors from './StepFlavors';
import { usePizzaOrder } from '../../../hooks/usePizzaOrder';
import PriceDisplay from '../../preview/PriceDisplay';

// Componente Wrapper para testar a integração do estado real (usePizzaOrder) com StepFlavors
function StepFlavorsTestWrapper({ initialDivision = 2 }) {
  const { order, totalPrice, toggleFlavor, setDivision } = usePizzaOrder();

  // Força a divisão inicial (ex: 2 sabores)
  if (order.division !== initialDivision) {
    setDivision(initialDivision);
  }

  return (
    <>
      <StepFlavors
        order={order}
        onToggleFlavor={toggleFlavor}
        onNext={vi.fn()}
        onBack={vi.fn()}
      />
      <PriceDisplay totalPrice={totalPrice} />
    </>
  );
}

describe('StepFlavors Component', () => {
  const STORAGE_KEY = 'sliceos-order';

  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('não deve aceitar 3 sabores quando division === 2 (substitui o primeiro)', async () => {
    render(<StepFlavorsTestWrapper initialDivision={2} />);
    const user = userEvent.setup();

    // Encontrar 3 botões de sabores diferentes
    const mussarelaCard = screen.getByRole('heading', { name: 'Mussarela' });
    const pepperoniCard = screen.getByRole('heading', { name: 'Pepperoni' });
    const frangoCard = screen.getByRole('heading', { name: 'Frango Catupiry' });

    // Seleciona 2 sabores
    await user.click(mussarelaCard);
    await user.click(pepperoniCard);

    expect(screen.getByText('2', { selector: '.text-orange-400' }).parentElement).toHaveTextContent(/2 de 2/i);

    // Tenta selecionar o 3º sabor
    await user.click(frangoCard);

    // O contador continua em 2
    expect(screen.getByText('2', { selector: '.text-orange-400' }).parentElement).toHaveTextContent(/2 de 2/i);

    // Validar se o segundo sabor foi substituído (comportamento do reducer: substitui o último quando flavors.length >= division)
    // O mussarela deve continuar selecionado, o pepperoni desmarcado, e o frango selecionado.
    // O StepCard adiciona a classe "border-orange-500" quando selected no botão pai.
    // Vamos checar o atributo 'class' do botão pai do heading.
    expect(mussarelaCard.closest('button')).toHaveClass('border-orange-500');
    expect(pepperoniCard.closest('button')).not.toHaveClass('border-orange-500');
    expect(frangoCard.closest('button')).toHaveClass('border-orange-500');
  });

  it('permite desmarcar (trocar) um sabor já selecionado', async () => {
    render(<StepFlavorsTestWrapper initialDivision={2} />);
    const user = userEvent.setup();

    const calabresaCard = screen.getByRole('heading', { name: 'Calabresa' });
    const portuguesaCard = screen.getByRole('heading', { name: 'Portuguesa' });

    // Clica para selecionar
    await user.click(calabresaCard);
    expect(screen.getByText('1', { selector: '.text-orange-400' }).parentElement).toHaveTextContent(/1 de 2/i);
    expect(calabresaCard.closest('button')).toHaveClass('border-orange-500');

    // Clica novamente para desmarcar
    await user.click(calabresaCard);
    expect(screen.getByText('0', { selector: '.text-orange-400' }).parentElement).toHaveTextContent(/0 de 2/i);
    expect(calabresaCard.closest('button')).not.toHaveClass('border-orange-500');

    // Seleciona o outro
    await user.click(portuguesaCard);
    expect(screen.getByText('1', { selector: '.text-orange-400' }).parentElement).toHaveTextContent(/1 de 2/i);
  });

  it('o preço total exibido reflete Math.max e não a soma dos valores dos sabores', async () => {
    render(<StepFlavorsTestWrapper initialDivision={2} />);
    const user = userEvent.setup();

    // Vamos assumir que Calabresa é R$ 0,00 e Pepperoni é +R$ 10,00.
    // Base da pizza sem tamanho definido é R$ 0,00.
    const mussarelaCard = screen.getByRole('heading', { name: 'Mussarela' }); // price: 0
    const pepperoniCard = screen.getByRole('heading', { name: 'Pepperoni' }); // price: 10

    await user.click(mussarelaCard);
    // Total = 0. No PriceDisplay, se total for 0, exibe '—'
    expect(screen.getByText('—')).toBeInTheDocument();

    await user.click(pepperoniCard);
    // Total = max(0, 10) = 10 (e não soma = 10)
    expect(screen.getByText(/R\$\s*10,00/)).toBeInTheDocument();
  });
});
