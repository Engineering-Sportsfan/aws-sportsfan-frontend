import { useState } from 'react';
import { ChevronDown, Search, SlidersHorizontal } from 'lucide-react';
import RecordsScreen from '../figma/RecordsExplorer';

export default function RecordsTab() {
  const [selectedCategory, setSelectedCategory] = useState('All Events');
  const [selectedGender, setSelectedGender] = useState('All');
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showGenderDropdown, setShowGenderDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const categories = ['All Events', '100m', '200m', 'Javelin', 'Long Jump', 'High Jump', 'Shot Put', 'Discus'];
  const genders = ['All', 'Men', 'Women'];

  return (
    <div className="relative min-h-screen">
      {/* Filters */}
      <div className="sticky top-0 z-40 bg-[#050505] border-b border-[rgba(255,255,255,0.05)] px-4 py-3">
        <div className="flex items-center gap-2 mb-3">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-[14px] h-[14px] text-[#99A1AF]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search records..."
              className="w-full bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] rounded-full pl-9 pr-4 py-2 text-white text-[13px] placeholder:text-[#99A1AF] focus:outline-none focus:border-[rgba(255,122,0,0.3)]"
            />
          </div>

          {/* Filter Button */}
          <button className="w-[36px] h-[36px] rounded-full bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] flex items-center justify-center hover:bg-[rgba(255,255,255,0.1)] transition-colors">
            <SlidersHorizontal className="w-[16px] h-[16px] text-white" />
          </button>
        </div>

        <div className="flex gap-2">
          {/* Category Dropdown */}
          <div className="relative flex-1">
            <button
              onClick={() => {
                setShowCategoryDropdown(!showCategoryDropdown);
                setShowGenderDropdown(false);
              }}
              className="w-full bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] rounded-full px-4 py-2 flex items-center justify-between hover:border-[rgba(255,122,0,0.2)] transition-colors"
            >
              <span className="text-white text-[13px] font-semibold">{selectedCategory}</span>
              <ChevronDown className="w-[14px] h-[14px] text-[#99A1AF]" />
            </button>

            {showCategoryDropdown && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-[#111111] border border-[rgba(255,255,255,0.1)] rounded-[12px] overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.4)] z-50">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => {
                      setSelectedCategory(category);
                      setShowCategoryDropdown(false);
                    }}
                    className={`w-full px-4 py-2.5 text-left text-[13px] transition-colors ${
                      selectedCategory === category
                        ? 'bg-[rgba(255,122,0,0.1)] text-[#FF7A00] font-semibold'
                        : 'text-white hover:bg-[rgba(255,255,255,0.05)]'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Gender Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setShowGenderDropdown(!showGenderDropdown);
                setShowCategoryDropdown(false);
              }}
              className="bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] rounded-full px-4 py-2 flex items-center gap-2 hover:border-[rgba(255,122,0,0.2)] transition-colors"
            >
              <span className="text-white text-[13px] font-semibold">{selectedGender}</span>
              <ChevronDown className="w-[14px] h-[14px] text-[#99A1AF]" />
            </button>

            {showGenderDropdown && (
              <div className="absolute top-full right-0 mt-2 bg-[#111111] border border-[rgba(255,255,255,0.1)] rounded-[12px] overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.4)] z-50 min-w-[120px]">
                {genders.map((gender) => (
                  <button
                    key={gender}
                    onClick={() => {
                      setSelectedGender(gender);
                      setShowGenderDropdown(false);
                    }}
                    className={`w-full px-4 py-2.5 text-left text-[13px] transition-colors ${
                      selectedGender === gender
                        ? 'bg-[rgba(255,122,0,0.1)] text-[#FF7A00] font-semibold'
                        : 'text-white hover:bg-[rgba(255,255,255,0.05)]'
                    }`}
                  >
                    {gender}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Records Screen Content */}
      <div
        className="relative"
        onClick={() => {
          setShowCategoryDropdown(false);
          setShowGenderDropdown(false);
        }}
      >
        <style>{`
          [data-name*="Button"] {
            transition: all 0.2s ease;
            cursor: pointer;
          }
          [data-name*="Button"]:hover {
            transform: scale(1.02);
            filter: brightness(1.15);
          }
          [data-name*="Button"]:active {
            transform: scale(0.98);
          }
          [data-name*="Card"],
          [data-name*="Container"] > div[class*="border"] {
            transition: all 0.3s ease;
          }
          [data-name*="Card"]:hover,
          [data-name*="Container"] > div[class*="border"]:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 24px rgba(255, 122, 0, 0.15);
          }
        `}</style>
        <RecordsScreen />
      </div>
    </div>
  );
}
