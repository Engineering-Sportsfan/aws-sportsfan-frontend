export interface Coach {
  id: string;
  name: string;
  sport: string;
  specialization: string;
  rating: number;
  reviewCount: number;
  pricePerHour: number;
  currency: string;
  imageUrl: string;
  bio: string;
  location: string;
  availability: string[];
}

export interface Service {
  id: string;
  title: string;
  description: string;
  category: string;
  price: number;
  currency: string;
  duration: number; // in minutes
  imageUrl: string;
  coach: Coach;
}

export interface Booking {
  id: string;
  service: Service;
  userId: string;
  scheduledAt: string;
  status: "pending" | "confirmed" | "completed" | "cancelled";
  totalAmount: number;
  currency: string;
  paymentStatus: "unpaid" | "paid" | "refunded";
  createdAt: string;
}

export interface BookingCreatePayload {
  serviceId: string;
  scheduledAt: string;
  notes?: string;
}
