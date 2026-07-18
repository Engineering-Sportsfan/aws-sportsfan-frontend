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
  userId: string;
  paymentMethod: 'upi' | 'gpay' | 'phonepe' | 'paytm' | 'card' | 'wallet';
  pricePaise: number;
  idempotencyKey: string;
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

  // Auctions & Bidding (Phase 6)
  getBids: (productId: string) =>
    api.get<any[]>(`/store/products/${productId}/bids`),

  placeBid: (productId: string, amountPaise: number, userId: string) =>
    api.post<any>(`/store/products/${productId}/bids`, { amountPaise, userId }),

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

  // Membership (Phase 10)
  getUserMembership: (userId: string) =>
    api.get<any>(`/store/users/${userId}/membership`),

  updateUserMembership: (userId: string, tier: string) =>
    api.post<any>(`/store/users/${userId}/membership`, { tier }),

  getBrandDeals: () =>
    api.get<any[]>('/store/brand-deals'),

  getMembershipPlans: () =>
    api.get<any[]>('/store/membership-plans'),

  validateJoinToken: (joinToken: string) =>
    api.get<{ success: boolean; meetingUrl: string; event: any }>(`/store/events/join/${joinToken}`),
};
