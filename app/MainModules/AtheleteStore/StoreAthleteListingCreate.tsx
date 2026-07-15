import { useNavigate } from 'react-router';
import { ArrowLeft, Check, Upload, Tag, Shield, ShoppingBag, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { api } from '@/services/api';

export default function StoreAthleteListingCreate() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'digital',
    price: '',
    sport: 'Athletics',
    sourcing_model: 'afi_affiliated',
  });
  
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.price) {
      alert('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      // Send price as paise
      const pricePaise = Math.round(parseFloat(formData.price) * 100);
      
      const payload = {
        category: formData.category,
        title: formData.title,
        name: formData.title,
        description: formData.description,
        pricePaise,
        sport: formData.sport,
        sourcing_model: formData.sourcing_model,
        governance_state: 'approved', // Pre-approved in V1
        athleteId: 'mock-athlete-123',
        image: 'https://images.unsplash.com/photo-1517649763962-0c623066013b?w=400&h=300&fit=crop&auto=format',
      };

      // We need a POST /store/products endpoint in the backend
      await api.post('/store/products', payload);
      setSuccess(true);
    } catch (err: any) {
      alert(err.message || 'Failed to create listing');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="bg-black w-full flex justify-center min-h-screen">
        <div className="w-full max-w-[390px] bg-[#0b0b0f] relative flex flex-col min-h-screen justify-center items-center px-6 text-center">
          <div className="w-[72px] h-[72px] rounded-full bg-gradient-to-br from-[#c9115f] to-[#cd620e] flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(201,17,95,0.4)]">
            <Check className="w-[36px] h-[36px] text-white" strokeWidth={3} />
          </div>
          <h1 className="text-white text-[24px] font-black tracking-tight mb-2">Listing Active!</h1>
          <p className="text-[#99A1AF] text-[13px] mb-8">
            Your listing has been created and auto-approved by AFI. It is now live in the store catalog.
          </p>
          <button
            onClick={() => navigate('/store')}
            className="w-full bg-gradient-to-r from-[#c9115f] to-[#cd620e] rounded-full py-3.5 text-white text-[15px] font-bold shadow-[0_0_20px_rgba(201,17,95,0.4)]"
          >
            Go to Store
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
            onClick={() => navigate(-1)}
            className="w-[36px] h-[36px] rounded-full bg-[rgba(255,255,255,0.06)] flex items-center justify-center"
          >
            <ArrowLeft className="w-[18px] h-[18px] text-white" />
          </button>
          <div>
            <h1 className="text-white font-bold text-[17px]">Create Listing</h1>
            <p className="text-[#99A1AF] text-[11px]">List your athlete commerce products</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto pb-[88px] no-scrollbar px-4 pt-5">
          <div className="flex flex-col gap-4">
            
            {/* Title */}
            <div className="flex flex-col gap-1.5">
              <label className="text-white text-[12px] font-bold uppercase tracking-wider">Product Title *</label>
              <input
                required
                type="text"
                placeholder="e.g. Sprint Blueprints or Signed Spike Shoes"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full bg-[#111116] border border-[rgba(255,255,255,0.08)] rounded-[12px] px-4 py-3 text-white text-[13px] placeholder:text-[#5a5a6a] focus:outline-none focus:border-[#c9115f]"
              />
            </div>

            {/* Description */}
            <div className="flex flex-col gap-1.5">
              <label className="text-white text-[12px] font-bold uppercase tracking-wider">Description</label>
              <textarea
                rows={3}
                placeholder="Describe your item, coaching program, or experience details..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full bg-[#111116] border border-[rgba(255,255,255,0.08)] rounded-[12px] px-4 py-3 text-white text-[13px] placeholder:text-[#5a5a6a] focus:outline-none focus:border-[#c9115f]"
              />
            </div>

            {/* Category */}
            <div className="flex flex-col gap-1.5">
              <label className="text-white text-[12px] font-bold uppercase tracking-wider">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full bg-[#111116] border border-[rgba(255,255,255,0.08)] rounded-[12px] px-4 py-3 text-white text-[13px] focus:outline-none focus:border-[#c9115f]"
              >
                <option value="digital">Digital Product (Programs/Guides)</option>
                <option value="memorabilia">Memorabilia / Merch</option>
                <option value="experiences">Fan Experiences</option>
                <option value="coaches">Coaching Services</option>
              </select>
            </div>

            {/* Price */}
            <div className="flex flex-col gap-1.5">
              <label className="text-white text-[12px] font-bold uppercase tracking-wider">Price (INR) *</label>
              <input
                required
                type="number"
                step="0.01"
                placeholder="e.g. 1299"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="w-full bg-[#111116] border border-[rgba(255,255,255,0.08)] rounded-[12px] px-4 py-3 text-white text-[13px] placeholder:text-[#5a5a6a] focus:outline-none focus:border-[#c9115f]"
              />
            </div>

            {/* Sport Tag */}
            <div className="flex flex-col gap-1.5">
              <label className="text-white text-[12px] font-bold uppercase tracking-wider">Sport</label>
              <input
                type="text"
                placeholder="e.g. Athletics, Marathon, Javelin"
                value={formData.sport}
                onChange={(e) => setFormData({ ...formData, sport: e.target.value })}
                className="w-full bg-[#111116] border border-[rgba(255,255,255,0.08)] rounded-[12px] px-4 py-3 text-white text-[13px] placeholder:text-[#5a5a6a] focus:outline-none focus:border-[#c9115f]"
              />
            </div>

            {/* Sourcing Badge */}
            <div className="flex flex-col gap-1.5">
              <label className="text-white text-[12px] font-bold uppercase tracking-wider">Affiliation Type</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, sourcing_model: 'afi_affiliated' })}
                  className={`border rounded-[12px] p-3 text-left transition-all ${
                    formData.sourcing_model === 'afi_affiliated'
                      ? 'bg-[rgba(201,17,95,0.08)] border-[#c9115f]'
                      : 'bg-[#111116] border-[rgba(255,255,255,0.06)]'
                  }`}
                >
                  <p className="text-white text-[12px] font-bold">AFI Affiliated</p>
                  <p className="text-[#99A1AF] text-[9px] mt-0.5">Federation certified</p>
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, sourcing_model: 'independent' })}
                  className={`border rounded-[12px] p-3 text-left transition-all ${
                    formData.sourcing_model === 'independent'
                      ? 'bg-[rgba(255,255,255,0.04)] border-[rgba(255,255,255,0.2)]'
                      : 'bg-[#111116] border-[rgba(255,255,255,0.06)]'
                  }`}
                >
                  <p className="text-white text-[12px] font-bold">Independent</p>
                  <p className="text-[#99A1AF] text-[9px] mt-0.5">Independent listing</p>
                </button>
              </div>
            </div>

            {/* Premium Note */}
            <div className="bg-[rgba(0,200,100,0.08)] border border-[rgba(0,200,100,0.25)] rounded-[12px] p-3 flex gap-2.5 items-start mt-2">
              <Shield className="w-[16px] h-[16px] text-[#00c864] flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-white text-[11px] font-bold">V1 Pre-Approved Listing</p>
                <p className="text-[#99A1AF] text-[10px] leading-snug mt-0.5">
                  Your profile has pre-granted credentials. Your listing will go live immediately with standard splits (15% Platform · 10% AFI · 75% Remainder).
                </p>
              </div>
            </div>

          </div>
        </form>

        {/* CTA */}
        <div className="absolute bottom-0 left-0 right-0 bg-[#0b0b0f] border-t border-[rgba(255,255,255,0.07)] px-4 py-3">
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-gradient-to-r from-[#c9115f] to-[#cd620e] rounded-full py-3.5 text-white text-[15px] font-bold shadow-[0_0_20px_rgba(201,17,95,0.5)] flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-[16px] h-[16px] rounded-full border-2 border-white border-t-transparent animate-spin" />
                Creating...
              </>
            ) : (
              <>Create & Launch Listing <Sparkles className="w-[14px] h-[14px] text-white" /></>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
