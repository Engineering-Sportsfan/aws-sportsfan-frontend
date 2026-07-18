import { useNavigate } from 'react-router';
import { ArrowLeft, ChevronRight, ShoppingCart, Star } from 'lucide-react';
import { useState, useEffect } from 'react';
import { storeService } from '@/services/store.service';
import { formatPrice } from '@/utils/formatters';

function ProductDetail({ product, onBack, onBuy }: { product: any; onBack: () => void; onBuy: () => void }) {
  const [selectedSize, setSelectedSize] = useState<string | null>(null);

  return (
    <div className="flex-1 overflow-y-auto pb-[100px] no-scrollbar">
      <div className="relative h-[280px] bg-white flex items-center justify-center">
        <img src={product.image} alt={product.title} className="max-h-full object-contain" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0b0b0f] to-transparent" />
      </div>

      <div className="px-4 pt-4">
        <p className="text-[#c9115f] text-[11px] font-bold uppercase tracking-wider mb-0.5">{product.brand || 'Brand Partner'}</p>
        <h2 className="text-white text-[19px] font-bold leading-tight mb-2">{product.title}</h2>
        <div className="flex items-center gap-1.5 mb-5">
          <Star className="w-[12px] h-[12px] text-[#FFD700] fill-[#FFD700]" />
          <span className="text-[#FFD700] text-[12px] font-bold">{product.rating || 4.7}</span>
          <span className="text-[#5a5a6a] text-[11px]">({product.reviews || 80} reviews)</span>
        </div>

        {/* Sizes */}
        <div className="mb-6">
          <p className="text-white text-[12px] font-bold mb-2">Select Size</p>
          <div className="flex gap-2 flex-wrap">
            {['UK 7', 'UK 8', 'UK 9', 'UK 10'].map((sz) => (
              <button
                key={sz}
                onClick={() => setSelectedSize(sz)}
                className={`px-4 py-2 border rounded-full text-[12px] font-bold ${selectedSize === sz ? 'bg-white border-white text-black' : 'bg-transparent border-[rgba(255,255,255,0.1)] text-white'
                  }`}
              >
                {sz}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Checkout Row */}
      <div className="absolute bottom-0 left-0 right-0 px-4 py-4 bg-[#0b0b0f] border-t border-[rgba(255,255,255,0.06)] flex items-center justify-between">
        <div>
          <p className="text-[#5a5a6a] text-[10px] uppercase font-bold">Deal Price</p>
          <p className="text-white text-[20px] font-black">{formatPrice(product.pricePaise)}</p>
        </div>
        <button
          onClick={onBuy}
          disabled={!selectedSize}
          className="rounded-full px-8 py-3.5 text-white text-[14px] font-bold bg-gradient-to-r from-[#c9115f] to-[#cd620e] shadow-[0_0_20px_rgba(201,17,95,0.4)] disabled:opacity-40"
        >
          Claim Deal
        </button>
      </div>
    </div>
  );
}

export default function StoreBrands() {
  const navigate = useNavigate();
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [bought, setBought] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [allProducts, allBrands] = await Promise.all([
          storeService.getProducts(),
          storeService.getBrandDeals(),
        ]);
        const merchantItems = allProducts.filter(p => p.category === 'brands');
        setProducts(merchantItems);
        setBrands(allBrands);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const handleBuy = () => {
    setBought(true);
  };

  if (bought) {
    return (
      <div className="bg-black w-full flex justify-center min-h-screen">
        <div className="w-full max-w-[390px] bg-[#0b0b0f] flex flex-col items-center justify-center px-6 py-12 text-center">
          <div className="w-[70px] h-[70px] rounded-full bg-gradient-to-br from-[#c9115f] to-[#cd620e] flex items-center justify-center mb-4 shadow-[0_0_25px_rgba(201,17,95,0.4)]">
            <ShoppingCart className="w-[28px] h-[28px] text-white" />
          </div>
          <h2 className="text-white text-[20px] font-bold mb-2">Order Placed!</h2>
          <p className="text-[#99A1AF] text-[13px] mb-6">Your order has been sent to our courier partner. tracking details will follow.</p>
          <button
            onClick={() => { setBought(false); setSelectedProduct(null); }}
            className="rounded-full px-8 py-3 text-white text-[14px] font-bold bg-gradient-to-r from-[#c9115f] to-[#cd620e]"
          >
            Back to Brands
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-black w-full flex justify-center min-h-screen">
      <div className="w-full max-w-[390px] bg-[#0b0b0f] relative flex flex-col min-h-screen">
        {/* Header */}
        <div className="sticky top-0 z-50 bg-[#0b0b0f] border-b border-[rgba(255,255,255,0.05)] h-[56px] flex items-center px-4 gap-3">
          <button
            onClick={() => selectedProduct ? setSelectedProduct(null) : navigate('/store')}
            className="w-[36px] h-[36px] rounded-full bg-[rgba(255,255,255,0.06)] flex items-center justify-center"
          >
            <ArrowLeft className="w-[18px] h-[18px] text-white" />
          </button>
          <div>
            <h1 className="text-white font-bold text-[17px]">Brand Deals</h1>
            {!selectedProduct && <p className="text-[#99A1AF] text-[11px]">Exclusive offers from partner brands</p>}
          </div>
        </div>

        {selectedProduct ? (
          <ProductDetail product={selectedProduct} onBack={() => setSelectedProduct(null)} onBuy={handleBuy} />
        ) : (
          <div className="flex-1 overflow-y-auto pb-[70px] no-scrollbar px-4 pt-4">
            {/* Brands Scroll */}
            <div className="flex gap-2.5 overflow-x-auto no-scrollbar pb-4">
              {brands.map((b) => (
                <div
                  key={b.id}
                  className="flex-shrink-0 w-[110px] rounded-[16px] p-3 text-center border border-[rgba(255,255,255,0.06)]"
                  style={{ background: '#111116' }}
                >
                  <span className="text-[20px] mb-1 block">{b.logo}</span>
                  <p className="text-white text-[11px] font-bold truncate">{b.name}</p>
                  <p className="text-[#c9115f] text-[9px] font-bold mt-0.5">{b.offer}</p>
                </div>
              ))}
              </div>

              {/* Products grid */}
              <h3 className="text-white text-[14px] font-bold mb-3">Trending Gear</h3>
              {loading ? (
                <p className="text-center text-[#99A1AF] text-[12px] py-10">Loading gear...</p>
              ) : products.length === 0 ? (
                <p className="text-center text-[#99A1AF] text-[12px] py-10">No items available.</p>
              ) : (
                    <div className="grid grid-cols-2 gap-3">
                      {products.map((p) => (
                        <button
                          key={p.id}
                          onClick={() => setSelectedProduct(p)}
                          className="bg-[#111116] rounded-[16px] border border-[rgba(255,255,255,0.07)] overflow-hidden text-left active:scale-[0.98] transition-transform flex flex-col justify-between"
                        >
                          <div>
                            <div className="h-[120px] bg-[#1a1a1f] relative">
                              <img src={p.image} alt={p.title} className="w-full h-full object-cover" />
                            </div>
                            <div className="p-3">
                              <p className="text-[#c9115f] text-[9px] font-bold uppercase tracking-wider">{p.brand || 'Brand Partner'}</p>
                              <p className="text-white text-[12px] font-bold leading-tight mb-1 truncate">{p.title}</p>
                            </div>
                    </div>
                          <div className="p-3 pt-0 flex items-center justify-between">
                            <span className="text-white text-[13px] font-black">{formatPrice(p.pricePaise)}</span>
                            <span className="text-[#c9115f] text-[11px] font-bold">Claim →</span>
                          </div>
                        </button>
                      ))}
                    </div>
              )}
          </div>
        )}
      </div>
    </div>
  );
}
