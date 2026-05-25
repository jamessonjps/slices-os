import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Shield, Lock, EyeOff, FileKey } from 'lucide-react';
import { Button } from '@/components/ui/button';
import SliceOSFooter from '@/components/SliceOSFooter';

export default function PrivacyPolicy() {
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
            <Shield className="w-6 h-6 text-red-600" />
            <h1 className="text-xl md:text-2xl font-black uppercase tracking-tighter">Política de Privacidade</h1>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8 pb-32 space-y-8">
        
        <section className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <h2 className="text-lg font-bold flex items-center gap-2 mb-4 text-slate-900 dark:text-white">
            <FileKey className="w-5 h-5 text-red-600" />
            1. Coleta e Uso de Dados Pessoais
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-2">
            No <strong>SliceOS</strong>, coletamos apenas as informações estritamente necessárias para processar e entregar seus pedidos:
          </p>
          <ul className="list-disc list-inside text-sm text-slate-600 dark:text-slate-400 leading-relaxed space-y-1">
            <li><strong>Nome e Telefone (WhatsApp):</strong> Para identificação e contato sobre o status do pedido.</li>
            <li><strong>Endereço de Entrega:</strong> Exclusivamente para a logística de entrega dos pedidos (quando selecionada esta opção).</li>
          </ul>
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mt-2">
            Não coletamos dados sensíveis (como raça, religião ou orientação política), conforme as diretrizes da LGPD (Lei Geral de Proteção de Dados).
          </p>
        </section>

        <section className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <h2 className="text-lg font-bold flex items-center gap-2 mb-4 text-slate-900 dark:text-white">
            <EyeOff className="w-5 h-5 text-red-600" />
            2. Privacidade e Compartilhamento
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            As informações fornecidas não são vendidas, alugadas ou repassadas a terceiros em hipótese alguma.
            Seus dados são acessados unicamente pela equipe autorizada da pizzaria para a operação de entrega e atendimento.
          </p>
        </section>

        <section className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <h2 className="text-lg font-bold flex items-center gap-2 mb-4 text-slate-900 dark:text-white">
            <Lock className="w-5 h-5 text-red-600" />
            3. Segurança da Informação e Banco de Dados
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-3">
            O SliceOS leva a segurança dos seus dados muito a sério. Utilizamos arquitetura de ponta e aplicamos protocolos de segurança modernos:
          </p>
          <ul className="list-disc list-inside text-sm text-slate-600 dark:text-slate-400 leading-relaxed space-y-2">
            <li><strong>Row Level Security (RLS):</strong> Nosso banco de dados opera com regras rígidas de acesso em nível de linha, garantindo que usuários não autorizados ou anônimos não consigam alterar ou acessar dados de terceiros.</li>
            <li><strong>Criptografia em Trânsito:</strong> Toda a comunicação entre seu dispositivo e nossos servidores ocorre sobre canais seguros (HTTPS/TLS).</li>
            <li><strong>Políticas Restritas:</strong> Apenas os administradores (equipe da loja logada) possuem acesso de leitura e escrita ao banco de dados completo de clientes e pedidos.</li>
          </ul>
        </section>

        <section className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <h2 className="text-lg font-bold flex items-center gap-2 mb-4 text-slate-900 dark:text-white">
            <Shield className="w-5 h-5 text-red-600" />
            4. Seus Direitos (LGPD)
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            Você tem o direito de solicitar a exclusão, correção ou bloqueio dos seus dados pessoais armazenados na plataforma a qualquer momento. 
            Para isso, basta acessar a opção de exclusão de dados presente no sistema ou entrar em contato direto com o atendimento da pizzaria via WhatsApp.
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
