import React, { useState, useEffect } from 'react';
import ProductCard, { Product3D } from './ProductCard';

interface ProductGridProps {
  initialProducts: Product3D[];
}

export default function ProductGrid({ initialProducts }: ProductGridProps) {
  const [products, setProducts] = useState<Product3D[]>(initialProducts);
  const [selectedMaterial, setSelectedMaterial] = useState('Todos');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    // Check if we are running in mock mode and have saved items in localStorage
    const isMockMode = !import.meta.env.PUBLIC_SUPABASE_URL || import.meta.env.PUBLIC_SUPABASE_URL === 'tu_url';
    if (isMockMode) {
      const saved = localStorage.getItem('mock_products_3d');
      if (saved) {
        try {
          setProducts(JSON.parse(saved));
        } catch (e) {
          console.error("Error parsing mock products from localStorage", e);
        }
      }
    }
  }, []);

  // Filter logic
  const filteredProducts = products.filter(product => {
    const matchesSearch = 
      product.nombre.toLowerCase().includes(searchQuery.toLowerCase()) || 
      product.descripcion.toLowerCase().includes(searchQuery.toLowerCase());
      
    const matchesMaterial = 
      selectedMaterial === 'Todos' || 
      product.material_sugerido.toLowerCase().startsWith(selectedMaterial.toLowerCase());

    return matchesSearch && matchesMaterial;
  });

  // Extract unique materials dynamically
  const materialsList = ['Todos', ...new Set(products.map(p => p.material_sugerido.split(' ')[0]))];

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      {/* Filters Sidebar */}
      <aside className="w-full lg:w-64 shrink-0">
        <div className="sticky top-24 space-y-6 rounded-xl border border-white/5 bg-[#0e1017] p-6">
          <div>
            <h2 className="text-xs font-semibold uppercase text-slate-400 tracking-wider">Filtrar por Material</h2>
            <div className="mt-3 flex flex-wrap lg:flex-col gap-2">
              {materialsList.map((material) => {
                const isActive = selectedMaterial === material;
                return (
                  <button
                    key={material}
                    type="button"
                    onClick={() => setSelectedMaterial(material)}
                    className={`text-left px-3 py-2 rounded-lg text-xs font-medium border transition-all capitalize ${
                      isActive 
                        ? 'bg-blue-600/10 border-blue-500/30 text-blue-400 font-semibold' 
                        : 'bg-[#07080b] border-white/5 text-slate-400 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    {material}
                  </button>
                );
              })}
            </div>
          </div>
          
          <div className="border-t border-white/5 pt-4">
            <h2 class="text-xs font-semibold uppercase text-slate-400 tracking-wider">Búsqueda rápida</h2>
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Ej: soporte, engranaje..." 
              className="mt-3 w-full h-9 rounded-lg border border-white/10 bg-[#07080b] px-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>
      </aside>

      {/* Product Grid */}
      <div className="flex-1">
        {filteredProducts.length === 0 ? (
          <div className="text-center py-20 text-slate-500">
            No se encontraron productos con los filtros seleccionados.
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
