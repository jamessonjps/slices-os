import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, FileText, ShieldCheck, Scale, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import SliceOSFooter from '@/components/SliceOSFooter';

export default function TermsOfUse() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-50 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-6 flex items-center gap-4">
          <Link to="/">
            <Button variant="ghost" size="icon" className="rounded-full hover:bg-slate-100 dark:hover:bg-slate-800">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div className="flex items-center gap-3">
            <FileText className="w-6 h-6 text-red-600" />
            <h1 className="text-xl md:text-2xl font-black uppercase tracking-tighter">Termos de Uso</h1>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8 pb-32 space-y-8">
        <section className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <h2 className="text-lg font-bold flex items-center gap-2 mb-4 text-slate-900 dark:text-white">
            <Scale className="w-5 h-5 text-red-600" />
            1. Aceitação dos Termos
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            Ao acessar e utilizar o sistema <strong>SliceOS</strong> e a plataforma de pedidos, você concorda expressamente com estes Termos de Uso. 
            Se você não concorda com qualquer parte destes termos, por favor, não utilize nossos serviços. Estes termos regem a relação entre a Pizzaria e seus Clientes.
          </p>
        </section>

        <section className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <h2 className="text-lg font-bold flex items-center gap-2 mb-4 text-slate-900 dark:text-white">
            <ShieldCheck className="w-5 h-5 text-red-600" />
            2. Uso dos Serviços
          </h2>
          <ul className="list-disc list-inside text-sm text-slate-600 dark:text-slate-400 leading-relaxed space-y-2">
            <li>Nossa plataforma foi projetada para facilitar a escolha de produtos e a realização de pedidos de delivery e retirada.</li>
            <li>Você concorda em fornecer informações verdadeiras, precisas e completas ao realizar um pedido.</li>
            <li>O mau uso da plataforma, incluindo tentativas de fraude, realização de pedidos falsos (trote) ou ações de engenharia reversa, resultarão no bloqueio imediato do seu acesso e possíveis sanções legais.</li>
          </ul>
        </section>

        <section className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <h2 className="text-lg font-bold flex items-center gap-2 mb-4 text-slate-900 dark:text-white">
            <AlertCircle className="w-5 h-5 text-red-600" />
            3. Limitação de Responsabilidade e Disponibilidade
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            A disponibilidade dos produtos, prazos de entrega e valores finais dependem exclusivamente do estoque e operação local da pizzaria no momento do aceite do pedido.
            O SliceOS faz o possível para manter a plataforma sempre acessível, mas não se responsabiliza por indisponibilidades temporárias derivadas de problemas de conexão externa ou manutenção do sistema.
          </p>
        </section>

        <section className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <h2 className="text-lg font-bold flex items-center gap-2 mb-4 text-slate-900 dark:text-white">
            <FileText className="w-5 h-5 text-red-600" />
            4. Modificação dos Termos
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            Reservamo-nos o direito de alterar ou modificar estes Termos de Uso a qualquer momento. 
            É recomendável que o usuário revise esta página periodicamente para estar ciente de possíveis atualizações. O uso continuado da plataforma após as alterações caracteriza aceitação tácita das novas condições.
          </p>
        </section>

        <div className="text-center mt-12 text-xs text-slate-500">
          Última atualização: {new Date().toLocaleDateString('pt-BR')}
        </div>
      </div>
      <SliceOSFooter />
    </div>
  );
}
