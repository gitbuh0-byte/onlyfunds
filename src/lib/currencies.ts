export interface Currency {
  code: string;
  symbol: string;
  name: string;
  rate: number; // relative to 1 USD
}

export const WORLD_CURRENCIES: Currency[] = [
  { code: "USD", symbol: "$", name: "United States Dollar", rate: 1.0 },
  { code: "EUR", symbol: "€", name: "Euro", rate: 0.92 },
  { code: "GBP", symbol: "£", name: "British Pound Sterling", rate: 0.78 },
  { code: "JPY", symbol: "¥", name: "Japanese Yen", rate: 158.5 },
  { code: "AUD", symbol: "A$", name: "Australian Dollar", rate: 1.49 },
  { code: "CAD", symbol: "C$", name: "Canadian Dollar", rate: 1.37 },
  { code: "CHF", symbol: "CHF", name: "Swiss Franc", rate: 0.89 },
  { code: "CNY", symbol: "元", name: "Chinese Yuan", rate: 7.26 },
  { code: "SEK", symbol: "kr", name: "Swedish Krona", rate: 10.55 },
  { code: "NZD", symbol: "NZ$", name: "New Zealand Dollar", rate: 1.64 },
  { code: "INR", symbol: "₹", name: "Indian Rupee", rate: 83.50 },
  { code: "BRL", symbol: "R$", name: "Brazilian Real", rate: 5.43 },
  { code: "RUB", symbol: "₽", name: "Russian Ruble", rate: 87.80 },
  { code: "ZAR", symbol: "R", name: "South African Rand", rate: 18.20 },
  { code: "TRY", symbol: "₺", name: "Turkish Lira", rate: 32.70 },
  { code: "MXN", symbol: "Mex$", name: "Mexican Peso", rate: 18.10 },
  { code: "SGD", symbol: "S$", name: "Singapore Dollar", rate: 1.34 },
  { code: "HKD", symbol: "HK$", name: "Hong Kong Dollar", rate: 7.81 },
  { code: "KRW", symbol: "₩", name: "South Korean Won", rate: 1380 },
  { code: "PLN", symbol: "zł", name: "Polish Zloty", rate: 3.93 },
  { code: "DKK", symbol: "kr", name: "Danish Krone", rate: 6.87 },
  { code: "NOK", symbol: "kr", name: "Norwegian Krone", rate: 10.65 },
  { code: "HUF", symbol: "Ft", name: "Hungarian Forint", rate: 362 },
  { code: "CZK", symbol: "Kč", name: "Czech Koruna", rate: 23.10 },
  { code: "ILS", symbol: "₪", name: "Israeli New Shekel", rate: 3.65 },
  { code: "CLP", symbol: "$", name: "Chilean Peso", rate: 935 },
  { code: "PHP", symbol: "₱", name: "Philippine Peso", rate: 58.40 },
  { code: "AED", symbol: "د.إ", name: "United Arab Emirates Dirham", rate: 3.67 },
  { code: "SAR", symbol: "ر.س", name: "Saudi Riyal", rate: 3.75 },
  { code: "MYR", symbol: "RM", name: "Malaysian Ringgit", rate: 4.71 },
  { code: "THB", symbol: "฿", name: "Thai Baht", rate: 36.40 },
  { code: "IDR", symbol: "Rp", name: "Indonesian Rupiah", rate: 16350 },
  { code: "VND", symbol: "₫", name: "Vietnamese Dong", rate: 25400 },
  { code: "NGN", symbol: "₦", name: "Nigerian Naira", rate: 1520 },
  { code: "KES", symbol: "KSh", name: "Kenyan Shilling", rate: 129.5 },
  { code: "EGP", symbol: "E£", name: "Egyptian Pound", rate: 47.90 },
  { code: "COP", symbol: "$", name: "Colombian Peso", rate: 4150 },
  { code: "PKR", symbol: "₨", name: "Pakistani Rupee", rate: 278.50 },
  { code: "ARS", symbol: "$", name: "Argentine Peso", rate: 920 },
  { code: "UAH", symbol: "₴", name: "Ukrainian Hryvnia", rate: 40.70 },
  { code: "PEN", symbol: "S/.", name: "Peruvian Sol", rate: 3.79 },
  { code: "VUV", symbol: "VT", name: "Vanuatu Vatu", rate: 118 },
  { code: "WST", symbol: "T", name: "Samoan Tala", rate: 2.70 },
  { code: "YER", symbol: "﷼", name: "Yemeni Rial", rate: 250 },
  { code: "ZMW", symbol: "ZK", name: "Zambian Kwacha", rate: 25.40 },
  { code: "KWD", symbol: "د.ك", name: "Kuwaiti Dinar", rate: 0.31 },
  { code: "BHD", symbol: ".د.ب", name: "Bahraini Dinar", rate: 0.38 },
  { code: "OMR", symbol: "ر.ع.", name: "Omani Rial", rate: 0.38 },
  { code: "QAR", symbol: "ر.ق", name: "Qatari Riyal", rate: 3.64 }
];

export function formatPrice(amountInUSD: number, targetCurrency: Currency): string {
  const converted = amountInUSD * targetCurrency.rate;
  
  // Format with currency-specific precision
  let formatted = converted.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
  
  return `${targetCurrency.symbol}${formatted}`;
}
