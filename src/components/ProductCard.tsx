import React from 'react';
import { ShoppingBag, ArrowUpRight } from 'lucide-react';

export interface Product3D {
  id: string;
  nombre: string;
  descripcion: string;
  precio: number;
  peso_estimado: number | null;
  tiempo_impresion: number | null;
  material_sugerido: string;
  imagen_url: string;
  stock: number;
  destacado: boolean;
}

interface ProductCardProps {
  product: Product3D;
}

export default function ProductCard({ product }: ProductCardProps) {
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(val);
  };

  const getWhatsAppLink = (productName: string) => {
    const phone = '5491122334455'; // Prefilled admin phone number
    const message = `Hola! Estoy interesado en el modelo impreso en 3D "${productName}". ¿Tienen disponibilidad en stock?`;
    return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
  };

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-xl border border-white/5 bg-[#0e1017] transition-all hover:border-blue-500/30 hover:shadow-2xl hover:shadow-blue-500/5 hover:-translate-y-1">
      {/* Product Image */}
      <div className="relative aspect-square overflow-hidden bg-slate-900">
        <img
          src={product.imagen_url || 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400'}
          alt={product.nombre}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0e1017]/90 via-transparent to-transparent opacity-60" />
        
        {/* Material suggestion Badge */}
        <span className="absolute left-3 top-3 inline-flex items-center rounded-md bg-[#090a0f]/90 px-2.5 py-1 text-xs font-semibold text-blue-400 border border-white/5">
          {product.material_sugerido}
        </span>

        {/* Stock status indicator */}
        {product.stock === 0 ? (
          <span className="absolute right-3 top-3 inline-flex items-center rounded-md bg-red-600/90 px-2 py-0.5 text-[10px] font-bold text-white uppercase">
            Agotado
          </span>
        ) : product.stock < 5 ? (
          <span className="absolute right-3 top-3 inline-flex items-center rounded-md bg-amber-500/90 px-2 py-0.5 text-[10px] font-bold text-black uppercase">
            Últimas {product.stock}
          </span>
        ) : null}
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-4">
        <div className="flex-1">
          <h3 className="font-outfit text-base font-bold text-white group-hover:text-blue-400 transition-colors">
            {product.nombre}
          </h3>
          <p className="mt-1.5 text-xs text-slate-400 line-clamp-2 leading-relaxed">
            {product.descripcion}
          </p>

          {/* Technical Specifications preview */}
          {(product.peso_estimado || product.tiempo_impresion) && (
            <div className="mt-3 flex gap-4 text-[10px] text-slate-500 border-t border-white/5 pt-2">
              {product.peso_estimado && (
                <span>
                  Peso: <strong className="text-slate-400">{product.peso_estimado}g</strong>
                </span>
              )}
              {product.tiempo_impresion && (
                <span>
                  Impresión: <strong className="text-slate-400">{Math.round(product.tiempo_impresion / 60)}h</strong>
                </span>
              )}
            </div>
          )}
        </div>

        {/* Price & Call to Action */}
        <div className="mt-4 flex items-center justify-between border-t border-white/5 pt-3">
          <div className="flex flex-col">
            <span className="text-slate-500 text-[10px] uppercase font-semibold">Precio</span>
            <span className="text-lg font-extrabold text-white">
              {formatCurrency(product.precio)}
            </span>
          </div>
          
          <a
            href={getWhatsAppLink(product.nombre)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600/10 text-blue-400 border border-blue-500/15 hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all shadow-md group-hover:shadow-blue-500/10"
            title="Consultar por WhatsApp"
          >
            <ShoppingBag className="h-4 w-4" />
          </a>
        </div>
      </div>
    </div>
  );
}
