export type TradeType = 'electrician' | 'bricklayer' | 'plumber' | 'carpenter' | 'mechanic';

export interface Location {
  latitude: number;
  longitude: number;
}

export interface Review {
  id: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
}

export interface DayAvailability {
  day: string;
  available: boolean;
  timeSlots: string[];
}

export interface Tradesperson {
  id: string;
  name: string;
  trade: TradeType;
  location: Location;
  hourlyRate: number;
  bio: string;
  imageUrl: string;
  credentials: string[];
  availability: DayAvailability[];
  reviews: Review[];
  rating: number;
  yearsExperience: number;
  phoneNumber: string;
  verified: boolean;
}

export interface Message {
  id: string;
  tradespersonId: string;
  tradespersonName: string;
  tradespersonImage: string;
  lastMessage: string;
  timestamp: string;
  unread: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
  imageUrl: string;
  location: Location;
  savedTradespeople: string[];
}
