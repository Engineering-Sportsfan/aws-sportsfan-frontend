import { useNavigate } from 'react-router';
import { ArrowLeft, Shield, ChevronDown, ChevronUp, ShoppingCart, QrCode, ChevronRight } from 'lucide-react';
import { useState } from 'react';

const memCategories = ['All', 'Signed Jerseys', 'Match Balls', 'Boots', 'Medals', 'Bibs', 'Equipment'];

const items = [
  {
    id: 1,
    title: 'Signed Javelin Training Jersey',
    athlete: 'Neeraj Chopra',
    category: 'Signed Jerseys',
    price: '₹14,999',
    certified: true,
    serialNo: 'NC-2024-JT-001',
    ownerHistory: ['National Athletics Museum', 'Private collector (2022)', 'Current listing'],
    image: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=400&h=400&fit=crop&auto=format',
  },
  {
    id: 2,
    title: 'CWG 2022 Gold Medal Replica',
    athlete: 'Neeraj Chopra',
    category: 'Medals',
    price: '₹8,999',
    certified: true,
    serialNo: 'CWG22-MED-NJC',
    ownerHistory: ['Commonwealth Games collection', 'AFI archive', 'Current listing'],
    image: 'https://images.unsplash.com/photo-1607962837359-5e7e89f86776?w=400&h=400&fit=crop&auto=format',
  },
  {
    id: 3,
    title: 'Signed Steeplechase Race Bib',
    athlete: 'Avinash Sable',
    category: 'Bibs',
    price: '₹3,499',
    certified: true,
    serialNo: 'AS-BIB-NTAC23',
    ownerHistory: ['National Track & Field Championship 2023', 'Current listing'],
    image: 'https://images.unsplash.com/photo-1571019613576-2b22c76fd955?w=400&h=400&fit=crop&auto=format',
  },
  {
    id: 4,
    title: 'Athletics Training Spike Shoes',
    athlete: 'Tejaswin Shankar',
    category: 'Boots',
    price: '₹6,299',
    certified: false,
    serialNo: '',
    ownerHistory: [],
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop&auto=format',
  },
  {
    id: 5,
    title: 'World Athletics Championship Ball',
    athlete: 'Indian Athletics Team',
    category: 'Match Balls',
    price: '₹11,500',
    certified: true,
    serialNo: 'WAC23-BALL-IND',
    ownerHistory: ['World Athletics Championship Budapest 2023', 'AFI archive', 'Current listing'],
    image: 'https://images.unsplash.com/photo-1526676037777-05a232554f77?w=400&h=400&fit=crop&auto=format',
  },
  {
    id: 6,
    title: 'Signed Long Jump Pit Flag',
    athlete: 'Murali Sreeshankar',
    category: 'Equipment',
    price: '₹4,999',
    certified: true,
    serialNo: 'MS-FLAG-NTAC24',
    ownerHistory: ['National Athletics Championship 2024', 'Current listing'],
    image: 'https://images.unsplash.com/photo-1594737625785-a6cbdabd333c?w=400&h=400&fit=crop&auto=format',
  },
];

function ItemDetail({ item, onBack }: { item: typeof items[0]; onBack: () => void }) {
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
        {item.certified && (
          <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-[rgba(0,0,0,0.7)] backdrop-blur-sm rounded-full px-3 py-1.5">
            <Shield className="w-[11px] h-[11px] text-[#00c864]" />
            <span className="text-[#00c864] text-[10px] font-bold">Certified</span>
          </div>
        )}
      </div>

      <div className="px-4 pt-4">
        <p className="text-[#99A1AF] text-[12px] mb-1">{item.athlete}</p>
        <h2 className="text-white text-[20px] font-bold leading-tight mb-4">{item.title}</h2>

        {item.certified && (
          <div className="mb-5">
            <button
              onClick={() => setCertExpanded(!certExpanded)}
              className="w-full flex items-center justify-between rounded-[14px] p-4 border border-[rgba(0,200,100,0.2)]"
              style={{ background: 'rgba(0,200,100,0.06)' }}
            >
              <div className="flex items-center gap-2">
                <Shield className="w-[15px] h-[15px] text-[#00c864]" />
                <span className="text-white text-[13px] font-semibold">Authenticity Certificate</span>
              </div>
              {certExpanded ? <ChevronUp className="w-[14px] h-[14px] text-[#99A1AF]" /> : <ChevronDown className="w-[14px] h-[14px] text-[#99A1AF]" />}
            </button>
            {certExpanded && (
              <div className="mt-3 rounded-[14px] p-4 border border-[rgba(255,255,255,0.06)]" style={{ background: '#111116' }}>
                <div className="flex flex-col gap-3">
                  <div>
                    <p className="text-[#99A1AF] text-[10px] uppercase tracking-wide mb-1">Serial Number</p>
                    <p className="text-white text-[14px] font-mono font-semibold">{item.serialNo}</p>
                  </div>
                  <div>
                    <p className="text-[#99A1AF] text-[10px] uppercase tracking-wide mb-2">Ownership History</p>
                    <div className="flex flex-col gap-1.5">
                      {item.ownerHistory.map((owner, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <div className="w-[6px] h-[6px] rounded-full bg-gradient-to-r from-[#c9115f] to-[#cd620e] flex-shrink-0" />
                          <span className="text-[#c8c8d0] text-[12px]">{owner}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="flex justify-center pt-2">
                    <div className="w-[80px] h-[80px] rounded-[10px] bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.08)] flex items-center justify-center">
                      <QrCode className="w-[40px] h-[40px] text-[#c9115f]" />
                    </div>
                  </div>
                  <p className="text-[#4a4a5a] text-[10px] text-center">Scan to verify on AFI registry</p>
                </div>
              </div>
            )}
          </div>
        )}

        <p className="text-[#a8a8b8] text-[13px] leading-relaxed">
          Authentic {item.category.toLowerCase()} from {item.athlete}'s collection.
          {item.certified ? ' Comes with full authenticity certificate and AFI provenance record.' : ' Verified item from the athlete\'s personal collection.'}
        </p>
      </div>

      <div
        className="absolute bottom-0 left-0 right-0 px-4 py-4"
        style={{ background: 'linear-gradient(to top, #0b0b0f 85%, transparent)', borderTop: '1px solid rgba(255,255,255,0.06)' }}
      >
        <div className="flex items-center gap-3">
          <div>
            <p className="text-[#99A1AF] text-[11px]">Price</p>
            <p className="text-[20px] font-bold" style={{ background: 'linear-gradient(135deg,#c9115f,#cd620e)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              {item.price}
            </p>
          </div>
          <button
            onClick={() => setBought(true)}
            className="flex-1 rounded-full py-3.5 text-white text-[15px] font-bold flex items-center justify-center gap-2"
            style={{ background: 'linear-gradient(135deg,#c9115f,#cd620e)', boxShadow: '0 0 20px rgba(201,17,95,0.4)' }}
          >
            <ShoppingCart className="w-[16px] h-[16px]" />
            Buy Now
          </button>
        </div>
      </div>
    </div>
  );
}

export default function StoreMemorabilia() {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState('All');
  const [selectedItem, setSelectedItem] = useState<typeof items[0] | null>(null);

  const filtered = activeCategory === 'All' ? items : items.filter(i => i.category === activeCategory);

  return (
    <div className="bg-black w-full flex justify-center min-h-screen">
      <div className="w-full max-w-[390px] bg-[#0b0b0f] relative flex flex-col min-h-screen">
        <div className="sticky top-0 z-50 bg-[#0b0b0f] border-b border-[rgba(255,255,255,0.05)]">
          <div className="h-[56px] flex items-center px-4 gap-3">
            <button
              onClick={() => selectedItem ? setSelectedItem(null) : navigate('/store')}
              className="w-[36px] h-[36px] rounded-full bg-[rgba(255,255,255,0.06)] flex items-center justify-center"
            >
              <ArrowLeft className="w-[18px] h-[18px] text-white" />
            </button>
            <div>
              <h1 className="text-white font-bold text-[17px]">{selectedItem ? selectedItem.title : 'Memorabilia'}</h1>
              {!selectedItem && <p className="text-[#99A1AF] text-[11px]">Certified sports collectibles</p>}
            </div>
          </div>
          {!selectedItem && (
            <div className="flex gap-2 overflow-x-auto no-scrollbar px-4 pb-3">
              {memCategories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className="flex-shrink-0 px-3 py-1 rounded-full text-[11px] font-semibold border transition-all"
                  style={activeCategory === cat ? {
                    background: 'linear-gradient(135deg,#c9115f,#cd620e)',
                    border: '1px solid transparent',
                    color: 'white',
                  } : {
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    color: '#99A1AF',
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}
        </div>

        {selectedItem ? (
          <ItemDetail item={selectedItem} onBack={() => setSelectedItem(null)} />
        ) : (
          <div className="flex-1 overflow-y-auto pb-6 no-scrollbar">
            <div className="grid grid-cols-2 gap-3 px-4 pt-4">
              {filtered.map(item => (
                <button
                  key={item.id}
                  onClick={() => setSelectedItem(item)}
                  className="bg-[#111116] rounded-[16px] border border-[rgba(255,255,255,0.07)] overflow-hidden text-left active:scale-[0.98] transition-transform"
                >
                  <div className="relative h-[130px] bg-[#1a1a1f]">
                    <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                    {item.certified && (
                      <div className="absolute top-2 right-2 w-[22px] h-[22px] rounded-full bg-[#00c864] flex items-center justify-center">
                        <Shield className="w-[11px] h-[11px] text-white" />
                      </div>
                    )}
                  </div>
                  <div className="p-3">
                    <p className="text-[#99A1AF] text-[10px] mb-0.5">{item.athlete}</p>
                    <p className="text-white text-[12px] font-semibold leading-tight">{item.title}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#c9115f] to-[#cd620e] text-[13px] font-bold">{item.price}</span>
                      <ChevronRight className="w-[12px] h-[12px] text-[#4a4a5a]" />
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
