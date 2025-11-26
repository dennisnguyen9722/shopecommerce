export interface BankTransferConfig {
  bankName: string
  accountName: string
  accountNumber: string
  branch?: string
  instructions?: string
  qrCodeUrl?: string
}

export interface MomoConfig {
  phone: string
  accountName: string
  qrCodeUrl?: string
  instructions?: string
}
