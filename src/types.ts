export interface SocialLink {
  platform: string;
  url: string;
}

export interface PreviewFileItem {
  id: string;
  name: string;
  url?: string;
  fileType: "document" | "image" | "video" | "code" | "other";
  isUnblurred: boolean; // Up to 2 files can be true (unblurred teaser)
  size?: string;
}

export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  mpesaPhoneNumber: string;
  mobileMoneyMethod: "mpesa" | "airtel" | "mtn" | "tigo";
  accountName?: string;
  updatedAt?: any;
}

export interface SharedFile {
  id: string;
  title: string;
  description: string;
  fee: number;
  fileType: "document" | "image" | "video" | "other";
  fileName: string;
  creatorId: string;
  creatorName: string;
  creatorEmail: string;
  creatorMpesaPhone?: string;
  createdAt: any; // Firestore Timestamp
  socialLinks: SocialLink[];
  coverUrl?: string;
  purchasesCount: number;
  totalEarnings: number;
  previewFiles?: PreviewFileItem[];
}

export interface FileContent {
  fileData: string; // Base64 or Text representation
  writtenInfo?: string;
}

export interface PurchaseRecord {
  id: string;
  fileId: string;
  fileTitle: string;
  buyerEmail: string;
  amountPaid: number;
  platformFee?: number; // 5% fee deducted
  netCreatorEarnings?: number; // 95% revenue credited
  paymentMethod?: "mpesa" | "card" | "gpay";
  mpesaBuyerPhone?: string;
  mpesaTxRef?: string;
  purchasedAt: any; // Firestore Timestamp
  creatorId: string;
}

export interface FileRequest {
  id: string;
  requesterEmail: string;
  requesterName: string;
  title: string;
  description: string;
  offeredFee: number;
  status: "pending" | "accepted" | "completed" | "declined";
  creatorId: string;
  createdAt: any; // Firestore Timestamp
  fulfilledFileId?: string;
}

export interface WithdrawalRecord {
  id: string;
  creatorId: string;
  method: "mpesa" | "crypto" | "bank";
  recipient: string; // Phone number for M-Pesa, Wallet address for Crypto, Account details for Bank
  networkOrBank?: string; // e.g. "Safaricom M-Pesa", "USDT (TRC20)", "Chase Bank"
  amountUSD: number;
  status: "processing" | "completed" | "failed";
  createdAt: any; // Firestore Timestamp or Date
  transactionRef?: string;
}
