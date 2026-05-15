import React from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

/**
 * @param {{ order: any; settings?: any }} props
 */
export default function PrintableTicket({ order, settings }) {
  if (!order) return null;

  const createdDate = new Date(order.created_date);
  const items = order.items || [];

  return (
    <div className="printable-ticket hidden print:block bg-white text-black p-4 font-mono text-sm leading-tight w-[80mm] mx-auto">
      <style>{`
        @media print {
          @page {
            margin: 0;
            size: 80mm auto;
          }
          body {
            margin: 0;
            padding: 0;
            -webkit-print-color-adjust: exact;
          }
          .printable-ticket {
            display: block !important;
            width: 80mm !important;
            padding: 5mm;
            box-sizing: border-box;
          }
          /* Esconder todo o resto */
          body > *:not(.printable-ticket) {
            display: none !important;
          }
          /* Garantir que o container do React n\u00E3o quebre o layout */
          #root, #root > div {
            display: block !important;
          }
        }
      `}</style>

      {/* Cabe\u00E7alho */}
      <div className="text-center mb-4">
        <h1 className="text-xl font-black uppercase">PIZZA MILANO</h1>
        <p className="text-xs">{settings?.whatsapp_number || ''}</p>
        <div className="border-b border-dashed border-black my-2"></div>
        <p className="text-[10px] uppercase">Comanda de Produ\u00E7\u00E3o</p>
        <h2 className="text-4xl font-black mt-1">#{order.id.slice(0, 8).toUpperCase()}</h2>
        <p className="text-[10px] mt-1">
          {format(createdDate, "dd/MM/yyyy 'as' HH:mm", { locale: ptBR })}
        </p>
      </div>

      <div className="border-b border-dashed border-black my-2"></div>

      {/* Itens */}
      <div className="space-y-3">
        {items.map((item, idx) => (
          <div key={idx}>
            <div className="flex justify-between font-bold text-base">
              <span>{item.quantity}x {item.name.toUpperCase()}</span>
            </div>
            {/* Detalhes de Pizza (Sabores, Tamanho) */}
            {(item.flavors || []).length > 0 && (
              <div className="ml-4 text-xs italic">
                {item.flavors.map((f, fi) => (
                  <div key={fi}>- {f}</div>
                ))}
              </div>
            )}
            {item.size && (
              <div className="ml-4 text-[10px] uppercase">
                Tamanho: {item.size === 6 ? 'P (6 fatias)' : 'M (8 fatias)'}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="border-b border-dashed border-black my-2"></div>

      {/* Observa\u00E7\u00F5es */}
      {order.notes && (
        <div className="mb-4">
          <p className="text-[10px] font-bold uppercase mb-1">OBSERVA\u00C7\u00D5ES:</p>
          <div className="bg-slate-100 p-2 border border-black font-bold">
            {order.notes.toUpperCase()}
          </div>
        </div>
      )}

      {/* Entrega / Cliente */}
      <div className="text-xs space-y-1">
        <p><strong>CLIENTE:</strong> {order.customer_name.toUpperCase()}</p>
        <p><strong>FONE:</strong> {order.customer_phone}</p>
        <div className="border-b border-dashed border-black my-2"></div>
        <p><strong>TIPO:</strong> {order.delivery_type === 'delivery' ? 'ENTREGA' : 'RETIRADA NO LOCAL'}</p>
        {order.delivery_type === 'delivery' && (
          <div className="mt-2 bg-slate-50 p-1 border border-black">
            <p className="font-bold uppercase">ENDERE\u00C7O:</p>
            <p className="text-base font-bold leading-tight uppercase">
              {order.address_text || 'N\u00C3O INFORMADO'}
            </p>
          </div>
        )}
      </div>

      <div className="border-b border-dashed border-black my-4"></div>

      {/* Rodap\u00E9 */}
      <div className="text-center text-[10px] uppercase">
        <p>Obrigado pela prefer\u00EAncia!</p>
        <p className="font-bold">SliceOS - www.sliceos.com.br</p>
      </div>
      
      {/* Espa\u00E7o extra para corte da impressora */}
      <div className="h-12"></div>
    </div>
  );
}
