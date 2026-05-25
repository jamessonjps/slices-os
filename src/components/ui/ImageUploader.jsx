import React, { useRef, useState } from 'react';
import { Upload, Image as ImageIcon, X } from 'lucide-react';

export default function ImageUploader({ value, onChange, className = '' }) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const handleFile = (file) => {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Por favor, selecione um arquivo de imagem válido (PNG, JPG, WEBP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      onChange(e.target.result); // Base64 string
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    handleFile(file);
  };

  return (
    <div className={`space-y-3 ${className}`}>
      <label className="block text-sm font-medium text-zinc-400">Imagem do Sabor</label>

      {/* Recomendações */}
      <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-3 text-xs text-orange-200/80">
        <p className="font-semibold mb-1">Recomendações Predefinidas:</p>
        <ul className="list-disc pl-4 space-y-0.5">
          <li>Use formato <strong>PNG</strong> ou <strong>WebP</strong>.</li>
          <li>Fundo <strong>transparente</strong> (recorte a pizza antes).</li>
          <li>Proporção geométrica recomendada: <strong>1:1 (Quadrada)</strong>.</li>
          <li>Resolução ideal: 800x800px.</li>
        </ul>
      </div>

      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !value && fileInputRef.current?.click()}
        className={`
          relative border-2 border-dashed rounded-2xl p-6 transition-all cursor-pointer
          flex flex-col items-center justify-center min-h-[160px]
          ${isDragging ? 'border-orange-500 bg-orange-500/5' : 'border-white/10 hover:border-orange-500/50 bg-black/20'}
          ${value ? 'cursor-default' : ''}
        `}
      >
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept="image/png, image/jpeg, image/webp"
          onChange={(e) => handleFile(e.target.files[0])}
        />

        {value ? (
          <div className="relative w-full flex justify-center">
            <img src={value} alt="Preview" className="h-32 object-contain" />
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onChange('');
                if (fileInputRef.current) fileInputRef.current.value = '';
              }}
              className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white p-1 rounded-full shadow-lg transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center text-center space-y-2 pointer-events-none">
            <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-2">
              <Upload className="w-6 h-6 text-zinc-400" />
            </div>
            <p className="text-sm font-medium text-white">Clique para fazer upload</p>
            <p className="text-xs text-zinc-500">ou arraste e solte sua imagem aqui</p>
          </div>
        )}
      </div>
    </div>
  );
}
