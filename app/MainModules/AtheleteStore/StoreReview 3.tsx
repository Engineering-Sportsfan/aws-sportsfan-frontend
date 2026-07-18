import { useNavigate, useParams } from 'react-router';
import { ArrowLeft, Star } from 'lucide-react';
import { useState } from 'react';

const coachNames: Record<string, string> = {
  '1': 'Ravi Shastri',
  '2': 'Priya Sharma',
  '3': 'Arun Kumar',
  '4': 'Sneha Patel',
};

const ratingLabels = ['', 'Poor', 'Fair', 'Good', 'Great', 'Excellent'];

export default function StoreReview() {
  const navigate = useNavigate();
  const { id } = useParams();
  const coachName = coachNames[id || '1'] || 'Ravi Shastri';

  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [review, setReview] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    if (rating === 0) return;
    setSubmitted(true);
    setTimeout(() => navigate('/store/my-bookings'), 1500);
  };

  const displayed = hovered || rating;

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
          <h1 className="text-white font-bold text-[17px]">Rate Your Session</h1>
        </div>

        <div className="flex-1 overflow-y-auto pb-[88px] no-scrollbar px-4 pt-8">
          {/* Coach info */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-[72px] h-[72px] rounded-full bg-gradient-to-br from-[#c9115f] to-[#cd620e] flex items-center justify-center mb-3 shadow-[0_0_24px_rgba(201,17,95,0.5)]">
              <span className="text-white text-[28px] font-bold">{coachName[0]}</span>
            </div>
            <p className="text-white text-[18px] font-bold">{coachName}</p>
            <p className="text-[#99A1AF] text-[13px] mt-0.5">Technique Analysis · June 10, 2026</p>
          </div>

          {/* Star rating */}
          <div className="flex flex-col items-center mb-6">
            <p className="text-[#99A1AF] text-[14px] mb-4">How was your session?</p>
            <div className="flex gap-3 mb-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHovered(star)}
                  onMouseLeave={() => setHovered(0)}
                  className="transition-transform hover:scale-110 active:scale-95"
                >
                  <Star
                    className="w-[38px] h-[38px] transition-all"
                    style={{
                      color: star <= displayed ? '#FFD700' : 'rgba(255,255,255,0.15)',
                      fill: star <= displayed ? '#FFD700' : 'none',
                      filter: star <= displayed ? 'drop-shadow(0 0 6px rgba(255,215,0,0.5))' : 'none',
                    }}
                  />
                </button>
              ))}
            </div>
            {displayed > 0 && (
              <p className="text-[#FFD700] text-[14px] font-semibold">{ratingLabels[displayed]}</p>
            )}
          </div>

          {/* Review text */}
          <div className="mb-6">
            <label className="text-white text-[14px] font-semibold block mb-2">Write a review (optional)</label>
            <textarea
              value={review}
              onChange={(e) => setReview(e.target.value)}
              placeholder="Share your experience to help other athletes..."
              rows={4}
              className="w-full bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] rounded-[14px] px-4 py-3 text-white text-[13px] placeholder:text-[#99A1AF] focus:outline-none focus:border-[rgba(201,17,95,0.5)] resize-none leading-relaxed"
            />
            <p className="text-[#4a4a5a] text-[11px] mt-1 text-right">{review.length}/300</p>
          </div>
        </div>

        {/* CTA */}
        <div className="absolute bottom-0 left-0 right-0 bg-[#0b0b0f] border-t border-[rgba(255,255,255,0.07)] px-4 py-3">
          <button
            onClick={handleSubmit}
            disabled={rating === 0 || submitted}
            className={`w-full rounded-full py-3.5 text-white text-[15px] font-bold transition-all ${
              rating > 0 && !submitted
                ? 'bg-gradient-to-r from-[#c9115f] to-[#cd620e] shadow-[0_0_20px_rgba(201,17,95,0.5)]'
                : 'bg-[rgba(255,255,255,0.1)] opacity-50'
            }`}
          >
            {submitted ? '✓ Review Submitted!' : 'Submit Review'}
          </button>
        </div>
      </div>
    </div>
  );
}
