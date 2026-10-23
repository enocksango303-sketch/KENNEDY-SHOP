export type PosterCategory =
  | 'all'
  | 'eglise'
  | 'mariage'
  | 'carwash'
  | 'voyage'
  | 'scolaire'
  | 'resto'
  | 'sport'
  | 'commerce';

export interface PosterTemplate {
  id: string;
  name: string;
  category: PosterCategory;
  categoryLabel: string;
  thumbnail: string;
  title: string;
  subtitle: string;
  badge: string;
  date: string;
  time: string;
  location: string;
  contact: string;
  organizer: string;
  price: string;
  description: string;
  palette: {
    name: string;
    bgGradient: string;
    primaryText: string;
    accentColor: string;
    badgeBg: string;
    badgeText: string;
    cardBg: string;
  };
  fontFamily: 'sans' | 'serif' | 'display' | 'mono';
  aspectRatio: '4:5' | '9:16' | '1:1';
  overlayOpacity: number;
}

export interface UserPoster extends PosterTemplate {
  savedAt: string;
  isCustom?: boolean;
}

export interface PrintOrder {
  id: string;
  orderNumber: string;
  posterId: string;
  posterTitle: string;
  category: string;
  format: 'A4' | 'A3' | 'BACHE' | 'ROLLUP' | 'FLYER';
  paperType: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  clientName: string;
  clientPhone: string;
  clientEmail: string;
  deliveryCity: string;
  deliveryAddress: string;
  paymentMethod: 'WAVE' | 'ORANGE_MONEY' | 'MTN_MOMO' | 'MOOV_MONEY' | 'CARTE';
  paymentStatus: 'PAID' | 'PENDING';
  orderStatus: 'PENDING' | 'IN_PRODUCTION' | 'SHIPPED' | 'DELIVERED';
  posterPreviewUrl?: string;
  notes?: string;
  createdAt: string;
  estimatedDeliveryDate: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'client' | 'admin';
  plan: 'gratuit' | 'starter' | 'pro';
  creationsLeft: number;
  totalCreationsCount: number;
}
