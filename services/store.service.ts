import { api } from "@/services/api";

export interface Product {
  id: string;
  category: string;
  name?: string;
  title?: string;
  role?: string;
  subtitle?: string;
  pricePaise: number;
  rating?: number;
  reviews?: number;
  sourcing_model?: 'independent' | 'afi_affiliated';
  governance_state?: 'approved' | 'pending';
  coachId?: string;
  athleteId?: string;
  image?: string;
  seats?: number;
  seatsLeft?: number;
  badge?: string;
  badgeColor?: string;
  type?: string;
  dates?: string;
  description?: string;
  currentBidPaise?: number;
  endsAt?: string;
}


export interface ExperienceOrder {
  orderId: string;
  productId: string;
  userId: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  eventDate?: string;
  pricePaise: number;
  quantity: number;
  productDetails?: {
    title: string;
    athlete: string;
    athleteImg?: string;
    type: 'online' | 'offline';
    category: string;
    duration: string;
    countdown?: string;
    venue?: string;
    venueAddress?: string;
    onlineLink?: string;
    image: string;
    host?: string;
    hostRole?: string;
    totalSeats?: number;
    seatsBooked?: number;
    description?: string;
    agenda?: { time: string; item: string }[];
    rules?: string[];
    arrivalTime?: string;
    dressCode?: string;
    parking?: string;
    priceInPaise?: number;
    eventStartsAt?: string;
  };
  createdAt: number;
  updatedAt: number;
}


export interface Slot {
  id: string;
  time: string;
  date: string;
  status: 'available' | 'locked' | 'booked';
  lockedBy?: string | null;
  lockExpiresAt?: string | null;
}

export interface CheckoutPayload {
  productId: string;
  slotId?: string;
  variantId?: string;
  userId: string;
  paymentMethod: 'upi' | 'gpay' | 'phonepe' | 'paytm' | 'card' | 'wallet';
  pricePaise: number;
  idempotencyKey: string;
}

// ✅ Add EventPass interface
export interface EventPass {
  id: string;
  orderId: string;
  productId: string;
  userId: string;
  joinToken: string;
  qrCode: string;
  status: 'active' | 'used' | 'expired';
  validFrom: string;
  validUntil: string;
  createdAt: string;
  updatedAt: string;
}

export const storeService = {
  // Products / Catalog
  getProducts: (category?: string, sport?: string) =>
    api.get<Product[]>(`/store/products?${category ? `category=${category}` : ''}${sport ? `&sport=${sport}` : ''}`),

  getProductById: (id: string) =>
    api.get<Product>(`/store/products/${id}`),

  // Slots
  getSlots: (productId: string) =>
    api.get<Slot[]>(`/store/products/${productId}/slots`),

  lockSlot: (productId: string, slotId: string, userId: string) =>
    api.post<{ slotId: string; status: string; lockExpiresAt: string }>(
      `/store/products/${productId}/slots/${slotId}/lock`,
      { userId }
    ),

  unlockSlot: (productId: string, slotId: string, userId: string) =>
    api.post<{ success: boolean }>(
      `/store/products/${productId}/slots/${slotId}/unlock`,
      { userId }
    ),

  // Bookings/Cancel
  cancelBooking: (bookingId: string, userId: string) =>
    api.post<{ success: boolean; bookingId: string }>(`/store/bookings/${bookingId}/cancel`, { userId }),

  // Checkout
  checkout: (payload: CheckoutPayload) =>
    api.post<{ orderId: string; success: boolean }>("/store/checkout", payload),

  //  Add getEventPass method
  getEventPass: (orderId: string, userId?: string) => {
    // If api.get() already adds /api/v2, use just the relative path
    const url = `/store/orders/${orderId}/event-pass${userId ? `?userId=${userId}` : ''}`;
    return api.get<EventPass>(url);
  },

   getExperienceOrderById: (orderId: string | string[]) => {
    const id = Array.isArray(orderId) ? orderId[0] : orderId;
    return api.get<ExperienceOrder>(`/store/orders/${id}`);
  },

  // Auctions & Bidding (Phase 6)
  getBids: (productId: string) =>
    api.get<any[]>(`/store/products/${productId}/bids`),

  placeBid: (productId: string, amountPaise: number, userId: string) =>
    api.post<any>(`/auctions/${productId}/bid`, { amountPaise, userId }),

  toggleAutoBid: (productId: string, maxCeilingPaise: number, isActive: boolean, userId: string) =>
    api.post<any>(`/auctions/${productId}/auto-bid`, { maxCeilingPaise, isActive, userId }),

  // User Orders
  getUserOrders: (userId: string) =>
    api.get<any[]>(`/store/users/${userId}/orders`),

  // Wallet
  getWalletBalance: (userId: string) =>
    api.get<{ balancePaise: number }>(`/store/users/${userId}/wallet/balance`),

  getWalletTransactions: (userId: string) =>
    api.get<any[]>(`/store/users/${userId}/wallet/transactions`),

  // Coins (Phase 8)
  getCoinsBalance: (userId: string) =>
    api.get<{ balance: number }>(`/store/users/${userId}/coins/balance`),

  getCoinsTransactions: (userId: string) =>
    api.get<any[]>(`/store/users/${userId}/coins/transactions`),

  // Session Requests (Phase 9)
  createSessionRequest: (payload: any) =>
    api.post<any>('/store/session-requests', payload),

  getSessionRequests: (userId: string) =>
    api.get<any[]>(`/store/users/${userId}/session-requests`),

  // Library
  getLibrary: (userId: string) =>
    api.get<any[]>(`/store/users/${userId}/library`),

  // Wishlist (Phase 10)
  getWishlist: (userId: string) =>
    api.get<any[]>(`/store/users/${userId}/wishlist`),

  toggleWishlist: (userId: string, productId: string, action: 'add' | 'remove') =>
    api.post<any>(`/store/users/${userId}/wishlist`, { productId, action }),

  // Recently Viewed (Phase 10)
  getRecentlyViewed: (userId: string) =>
    api.get<any[]>(`/store/users/${userId}/recently-viewed`),

  addRecentlyViewed: (userId: string, productId: string) =>
    api.post<any>(`/store/users/${userId}/recently-viewed`, { productId }),

  // Membership APIs

  // Membership APIs

  getMembershipPlans: () =>
    api.get<any[]>("/store/membership-plans"),

  getMyMembership: (userId: string) =>
    api.get<{ hasMembership: boolean; membership: any; plan: any }>(
      `/store/users/${userId}/membership`
    ),

  subscribeMembership: (
    planId: string,
    userId: string,
    paymentMethod: string
  ) =>
    api.post<any>("/membership/subscribe", {
      planId,
      userId,
      paymentMethod,
    }),

  pauseMembership: (userId: string) =>
    api.post<any>("/membership/pause", {
      userId,
    }),

  resumeMembership: (userId: string) =>
    api.post<any>("/membership/resume", {
      userId,
    }),

  cancelMembership: (userId: string) =>
    api.post<any>("/membership/cancel", {
      userId,
    }),

  getBrandDeals: () =>
    api.get<any[]>('/store/brand-deals'),

  validateJoinToken: (joinToken: string) =>
    api.get<{ success: boolean; meetingUrl: string; event: any }>(`/store/events/join/${joinToken}`),

  getUserAuctions: (userId: string, type: 'current' | 'previous' | 'won') =>
    api.get<any[]>(`/store/users/${userId}/auctions?type=${type}`),

  // Athlete Store Listing APIs
  purchaseAthleteListing: (athleteId: string, listingId: string) =>
    api.post<any>(`/store/athletes/${athleteId}/listings/${listingId}/purchase`),

  getAthleteBookings: (userId: string) =>
    api.get<any[]>(`/store/users/${userId}/athlete-bookings`),
};