import { useNavigate } from 'react-router';
import { ArrowLeft, Shield, ChevronDown, ChevronUp, ShoppingCart, QrCode, ChevronRight } from 'lucide-react';
import { useState, useEffect } from 'react';
import { storeService } from '@/services/store.service';
import { formatPrice } from '@/utils/formatters';

const memCategories = ['All', 'Signed Jerseys', 'Match Balls', 'Boots', 'Medals', 'Bibs', 'Equipment'];

function ItemDetail({ item, onBack }: { item: any; onBack: () => void }) {
  const [certExpanded, setCertExpanded] = useState(false);
  const [bought, setBought] = useState(false);

  if (bought) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 text-center">
        <div className="w-[70px] h-[70px] rounded-full bg-gradient-to-br from-[#c9115f] to-[#cd620e] flex items-center justify-center mb-4 shadow-[0_0_25px_rgba(201,17,95,0.4)]">
          <ShoppingCart className="w-[28px] h-[28px] text-white" />
        </div>
        <h2 className="text-white text-[20px] font-bold mb-2">Order Placed!</h2>
        <p className="text-[#99A1AF] text-[13px] mb-2">{item.title}</p>
        <p className="text-[#99A1AF] text-[13px] mb-6">Your authenticity certificate will be emailed within 24 hours.</p>
        <button onClick={onBack} className="rounded-full px-8 py-3 text-[#99A1AF] text-[14px] border border-[rgba(255,255,255,0.12)]">
          Back to Memorabilia
        </button>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto pb-[100px] no-scrollbar">
      <div className="relative h-[260px] bg-[#1a1a1f]">
        <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0b0b0f] to-transparent" />
      </div>

      <div className="px-4 pt-4">
        <div className="flex items-center gap-2 mb-2">
          {item.governance_state === 'approved' && (
            <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-[rgba(0,200,100,0.12)] border border-[rgba(0,200,100,0.25)] text-[#00c864]">
              ✓ Certified Authentic
            </span>
          )}
        </div>
        <h2 className="text-white text-[19px] font-bold leading-tight mb-1">{item.title}</h2>
        <p className="text-[#99A1AF] text-[13px] mb-4">By {item.athleteId || 'Athlete'}</p>

        {/* Certificate section */}
        <div className="bg-[#111116] rounded-[18px] border border-[rgba(255,255,255,0.06)] overflow-hidden mb-4">
          <button
            onClick={() => setCertExpanded(e => !e)}
            className="w-full flex items-center justify-between p-4"
          >
            <div className="flex items-center gap-2.5">
              <QrCode className="w-[16px] h-[16px] text-[#c9115f]" />
              <span className="text-white text-[13px] font-bold">Certificate of Authenticity</span>
            </div>
            {certExpanded ? <ChevronUp className="w-[15px] h-[15px] text-[#99A1AF]" /> : <ChevronDown className="w-[15px] h-[15px] text-[#99A1AF]" />}
          </button>

          {certExpanded && (
            <div className="px-4 pb-4 pt-1 border-t border-[rgba(255,255,255,0.04)]">
              <div className="flex flex-col gap-2">
                <div className="flex justify-between">
                  <span className="text-[#5a5a6a] text-[12px]">Serial Number</span>
                  <span className="text-white text-[12px] font-mono">AS-BIB-NTAC23</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#5a5a6a] text-[12px]">Verified Owner</span>
                  <span className="text-white text-[12px]">SportsFan Official Vault</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 px-4 py-4 bg-[#0b0b0f] border-t border-[rgba(255,255,255,0.06)] flex items-center justify-between">
        <div>
          <p className="text-[#5a5a6a] text-[10px] uppercase font-bold">Price</p>
          <p className="text-white text-[20px] font-black">{formatPrice(item.pricePaise)}</p>
        </div>
        <button
          onClick={() => setBought(true)}
          className="rounded-full px-8 py-3 text-white text-[14px] font-bold bg-gradient-to-r from-[#c9115f] to-[#cd620e] shadow-[0_0_20px_rgba(201,17,95,0.4)]"
        >
          Buy Now
        </button>
      </div>
    </div>
  );
}

export default function StoreMemorabilia() {
  const navigate = useNavigate();
  const [selectedItem, setSelectedItem] = useState<any | null>(null);
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    storeService.getProducts('memorabilia')
      .then((res) => {
        setItems(res);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching memorabilia:', err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="bg-black w-full flex justify-center min-h-screen">
      <div className="w-full max-w-[390px] bg-[#0b0b0f] relative flex flex-col min-h-screen">
        {/* Header */}
        <div className="sticky top-0 z-50 bg-[#0b0b0f] border-b border-[rgba(255,255,255,0.05)] h-[56px] flex items-center px-4 gap-3">
          <button
            onClick={() => selectedItem ? setSelectedItem(null) : navigate('/store')}
            className="w-[36px] h-[36px] rounded-full bg-[rgba(255,255,255,0.06)] flex items-center justify-center"
          >
            <ArrowLeft className="w-[18px] h-[18px] text-white" />
          </button>
          <div>
            <h1 className="text-white font-bold text-[17px]">Memorabilia</h1>
            {!selectedItem && <p className="text-[#99A1AF] text-[11px]">Own piece of track history</p>}
          </div>
        </div>

        {selectedItem ? (
          <ItemDetail item={selectedItem} onBack={() => setSelectedItem(null)} />
        ) : (
          <div className="flex-1 overflow-y-auto pb-[70px] no-scrollbar px-4 pt-4">
            {loading ? (
              <p className="text-center text-[#99A1AF] text-[12px] py-10">Loading items...</p>
            ) : items.length === 0 ? (
              <p className="text-center text-[#99A1AF] text-[12px] py-10">No items found.</p>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {items.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setSelectedItem(item)}
                    className="bg-[#111116] rounded-[16px] border border-[rgba(255,255,255,0.07)] overflow-hidden text-left active:scale-[0.98] transition-transform flex flex-col justify-between"
                  >
                    <div>
                      <div className="h-[120px] bg-[#1a1a1f] relative">
                        <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                      </div>
                      <div className="p-3">
                        <p className="text-white text-[12px] font-bold leading-tight mb-1 truncate">{item.title}</p>
                        <p className="text-[#5a5a6a] text-[10px]">{item.athleteId || 'Athlete'}</p>
                      </div>
                    </div>
                    <div className="p-3 pt-0 flex items-center justify-between">
                      <span className="text-[#c9115f] text-[12px] font-black">{formatPrice(item.pricePaise)}</span>
                      <span className="text-[#c9115f] text-[11px] font-bold">Buy →</span>
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
