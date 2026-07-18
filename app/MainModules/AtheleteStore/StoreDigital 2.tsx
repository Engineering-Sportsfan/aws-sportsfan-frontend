import { useNavigate } from 'react-router';
import { ArrowLeft, Play, FileText, Cpu, Download, ChevronRight, CheckCircle, BookOpen } from 'lucide-react';
import { useState, useEffect } from 'react';
import { storeService } from '@/services/store.service';
import { formatPrice } from '@/utils/formatters';

const typeIcons: Record<string, React.ReactNode> = {
  'Training Program': <FileText className="w-[14px] h-[14px] text-[#c9115f]" />,
  'Video Course': <Play className="w-[14px] h-[14px] text-[#cd620e]" />,
  'AI Report': <Cpu className="w-[14px] h-[14px] text-[#00c864]" />,
  'PDF Guide': <Download className="w-[14px] h-[14px] text-[#cd620e]" />,
};

function ProductDetail({ product, onBack, onBuy }: { product: any; onBack: () => void; onBuy: (id: string) => void }) {
  return (
    <div className="flex-1 overflow-y-auto pb-[100px] no-scrollbar">
      <div className="relative h-[200px]">
        <img src={product.image} alt={product.title} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0b0b0f] to-transparent" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-[56px] h-[56px] rounded-full bg-[rgba(0,0,0,0.6)] backdrop-blur-sm border border-[rgba(255,255,255,0.2)] flex items-center justify-center">
            <Play className="w-[22px] h-[22px] text-white fill-white ml-1" />
          </div>
        </div>
      </div>

      <div className="px-4 pt-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full text-white bg-[#c9115f]">
            {product.badge || 'Digital'}
          </span>
        </div>
        <h2 className="text-white text-[19px] font-bold leading-tight mb-1">{product.title}</h2>
        <p className="text-[#99A1AF] text-[13px] leading-relaxed mb-6">{product.description || 'Access training logs, routines and programs.'}</p>
      </div>

      <div className="absolute bottom-0 left-0 right-0 px-4 py-4 bg-[#0b0b0f] border-t border-[rgba(255,255,255,0.06)] flex items-center justify-between">
        <div>
          <p className="text-[#5a5a6a] text-[10px] uppercase font-bold">Total price</p>
          <p className="text-white text-[20px] font-black">{formatPrice(product.pricePaise)}</p>
        </div>
        <button
          onClick={() => onBuy(product.id)}
          className="rounded-full px-8 py-3.5 text-white text-[14px] font-bold bg-gradient-to-r from-[#c9115f] to-[#cd620e] shadow-[0_0_20px_rgba(201,17,95,0.4)]"
        >
          Get Program
        </button>
      </div>
    </div>
  );
}

export default function StoreDigital() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<'store' | 'library'>('store');
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [library, setLibrary] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    storeService.getProducts('digital')
      .then((res) => {
        setProducts(res);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching digital products:', err);
        setLoading(false);
      });
  }, []);

  const handleBuy = (id: string) => {
    const p = products.find(prod => prod.id === id);
    if (p) {
      setLibrary(prev => [...prev, { ...p, progress: 0 }]);
      setSelectedProduct(null);
      setTab('library');
    }
  };

  return (
    <div className="bg-black w-full flex justify-center min-h-screen">
      <div className="w-full max-w-[390px] bg-[#0b0b0f] relative flex flex-col min-h-screen">
        {/* Header */}
        <div className="sticky top-0 z-50 bg-[#0b0b0f] border-b border-[rgba(255,255,255,0.05)]">
          <div className="h-[56px] flex items-center px-4 gap-3">
            <button
              onClick={() => selectedProduct ? setSelectedProduct(null) : navigate('/store')}
              className="w-[36px] h-[36px] rounded-full bg-[rgba(255,255,255,0.06)] flex items-center justify-center"
            >
              <ArrowLeft className="w-[18px] h-[18px] text-white" />
            </button>
            <div className="flex-1">
              <h1 className="text-white font-bold text-[17px]">Digital Products</h1>
              {!selectedProduct && <p className="text-[#99A1AF] text-[11px]">Training blueprints & courses</p>}
            </div>
          </div>

          {!selectedProduct && (
            <div className="flex px-4 pb-2">
              <button
                onClick={() => setTab('store')}
                className={`flex-1 text-center py-2 text-[13px] font-bold border-b-2 ${
                  tab === 'store' ? 'border-[#c9115f] text-white' : 'border-transparent text-[#99A1AF]'
                }`}
              >
                Store Catalog
              </button>
              <button
                onClick={() => setTab('library')}
                className={`flex-1 text-center py-2 text-[13px] font-bold border-b-2 ${
                  tab === 'library' ? 'border-[#c9115f] text-white' : 'border-transparent text-[#99A1AF]'
                }`}
              >
                My Library ({library.length})
              </button>
            </div>
          )}
        </div>

        {selectedProduct ? (
          <ProductDetail product={selectedProduct} onBack={() => setSelectedProduct(null)} onBuy={handleBuy} />
        ) : (
          <div className="flex-1 overflow-y-auto pb-[70px] no-scrollbar px-4 pt-4">
            {tab === 'store' ? (
              loading ? (
                <p className="text-center text-[#99A1AF] text-[12px] py-10">Loading products...</p>
              ) : products.length === 0 ? (
                <p className="text-center text-[#99A1AF] text-[12px] py-10">No programs available.</p>
              ) : (
                <div className="flex flex-col gap-4">
                  {products.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => setSelectedProduct(p)}
                      className="w-full bg-[#111116] rounded-[18px] border border-[rgba(255,255,255,0.07)] overflow-hidden text-left active:scale-[0.98] transition-transform"
                    >
                      <div className="relative h-[120px] bg-[#1a1a1f]">
                        <img src={p.image} alt={p.title} className="w-full h-full object-cover" />
                      </div>
                      <div className="p-4">
                        <div className="flex items-center gap-1.5 mb-1">
                          {typeIcons[p.badge || 'Training Program']}
                          <span className="text-[#99A1AF] text-[10px] font-bold uppercase tracking-wider">{p.badge || 'Program'}</span>
                        </div>
                        <p className="text-white text-[14px] font-bold leading-tight mb-3 truncate">{p.title}</p>
                        <div className="flex justify-between items-center pt-2 border-t border-[rgba(255,255,255,0.05)]">
                          <span className="text-[#c9115f] text-[14px] font-black">{formatPrice(p.pricePaise)}</span>
                          <span className="text-[#c9115f] text-[11px] font-bold flex items-center gap-0.5">
                            Get Now <ChevronRight className="w-[12px] h-[12px]" />
                          </span>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )
            ) : (
              <div className="flex flex-col gap-3">
                {library.length === 0 ? (
                  <div className="py-12 text-center">
                    <BookOpen className="w-[36px] h-[36px] text-[#4a4a5a] mx-auto mb-3" />
                    <p className="text-[#5a5a6a] text-[12px]">Your active digital programs will appear here.</p>
                  </div>
                ) : (
                  library.map((item) => (
                    <div key={item.id} className="bg-[#111116] rounded-[18px] border border-[rgba(255,255,255,0.07)] p-4">
                      <p className="text-white text-[14px] font-bold leading-tight mb-2">{item.title}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-[#00c864] text-[11px] font-bold">Ready to Download</span>
                        <button className="px-4 py-1.5 bg-[rgba(201,17,95,0.12)] border border-[rgba(201,17,95,0.25)] rounded-full text-[#c9115f] text-[11px] font-bold flex items-center gap-1">
                          <Download className="w-[12px] h-[12px]" /> Open PDF
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
