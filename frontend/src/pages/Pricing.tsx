// src/pages/Pricing.tsx - Premium Subscription Pricing Page with Dynamic Currency Conversion
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  CheckIcon,
  GlobeAltIcon,
  CreditCardIcon,
} from "@heroicons/react/24/outline";

// Currency configuration
interface Currency {
  code: string;
  symbol: string;
  name: string;
  flag: string;
}

const CURRENCIES: Record<string, Currency> = {
  // Americas
  USD: { code: "USD", symbol: "$", name: "US Dollar", flag: "🇺🇸" },
  CAD: { code: "CAD", symbol: "C$", name: "Canadian Dollar", flag: "🇨🇦" },
  MXN: { code: "MXN", symbol: "Mex$", name: "Mexican Peso", flag: "🇲🇽" },
  BRL: { code: "BRL", symbol: "R$", name: "Brazilian Real", flag: "🇧🇷" },
  ARS: { code: "ARS", symbol: "AR$", name: "Argentine Peso", flag: "🇦🇷" },
  CLP: { code: "CLP", symbol: "CL$", name: "Chilean Peso", flag: "🇨🇱" },
  COP: { code: "COP", symbol: "CO$", name: "Colombian Peso", flag: "🇨🇴" },
  PEN: { code: "PEN", symbol: "S/", name: "Peruvian Sol", flag: "��" },

  // Europe
  EUR: { code: "EUR", symbol: "€", name: "Euro", flag: "🇪🇺" },
  GBP: { code: "GBP", symbol: "£", name: "British Pound", flag: "🇬🇧" },
  CHF: { code: "CHF", symbol: "CHF", name: "Swiss Franc", flag: "🇨🇭" },
  SEK: { code: "SEK", symbol: "kr", name: "Swedish Krona", flag: "🇸🇪" },
  NOK: { code: "NOK", symbol: "kr", name: "Norwegian Krone", flag: "🇳🇴" },
  DKK: { code: "DKK", symbol: "kr", name: "Danish Krone", flag: "🇩🇰" },
  PLN: { code: "PLN", symbol: "zł", name: "Polish Zloty", flag: "🇵🇱" },
  CZK: { code: "CZK", symbol: "Kč", name: "Czech Koruna", flag: "🇨🇿" },
  HUF: { code: "HUF", symbol: "Ft", name: "Hungarian Forint", flag: "🇭🇺" },
  RON: { code: "RON", symbol: "lei", name: "Romanian Leu", flag: "🇷🇴" },
  BGN: { code: "BGN", symbol: "лв", name: "Bulgarian Lev", flag: "🇧🇬" },
  RUB: { code: "RUB", symbol: "₽", name: "Russian Ruble", flag: "🇷🇺" },
  UAH: { code: "UAH", symbol: "₴", name: "Ukrainian Hryvnia", flag: "🇺🇦" },
  TRY: { code: "TRY", symbol: "₺", name: "Turkish Lira", flag: "🇹🇷" },

  // Asia-Pacific
  INR: { code: "INR", symbol: "₹", name: "Indian Rupee", flag: "🇮🇳" },
  CNY: { code: "CNY", symbol: "¥", name: "Chinese Yuan", flag: "🇨🇳" },
  JPY: { code: "JPY", symbol: "¥", name: "Japanese Yen", flag: "🇯🇵" },
  KRW: { code: "KRW", symbol: "₩", name: "South Korean Won", flag: "🇰🇷" },
  SGD: { code: "SGD", symbol: "S$", name: "Singapore Dollar", flag: "🇸🇬" },
  HKD: { code: "HKD", symbol: "HK$", name: "Hong Kong Dollar", flag: "🇭🇰" },
  TWD: { code: "TWD", symbol: "NT$", name: "Taiwan Dollar", flag: "🇹🇼" },
  MYR: { code: "MYR", symbol: "RM", name: "Malaysian Ringgit", flag: "🇲🇾" },
  THB: { code: "THB", symbol: "฿", name: "Thai Baht", flag: "🇹🇭" },
  IDR: { code: "IDR", symbol: "Rp", name: "Indonesian Rupiah", flag: "🇮🇩" },
  PHP: { code: "PHP", symbol: "₱", name: "Philippine Peso", flag: "🇵🇭" },
  VND: { code: "VND", symbol: "₫", name: "Vietnamese Dong", flag: "🇻🇳" },
  PKR: { code: "PKR", symbol: "₨", name: "Pakistani Rupee", flag: "🇵🇰" },
  BDT: { code: "BDT", symbol: "৳", name: "Bangladeshi Taka", flag: "🇧🇩" },
  LKR: { code: "LKR", symbol: "Rs", name: "Sri Lankan Rupee", flag: "🇱🇰" },
  AUD: { code: "AUD", symbol: "A$", name: "Australian Dollar", flag: "🇦🇺" },
  NZD: { code: "NZD", symbol: "NZ$", name: "New Zealand Dollar", flag: "🇳🇿" },

  // Middle East & Africa
  AED: { code: "AED", symbol: "د.إ", name: "UAE Dirham", flag: "🇦🇪" },
  SAR: { code: "SAR", symbol: "﷼", name: "Saudi Riyal", flag: "🇸🇦" },
  QAR: { code: "QAR", symbol: "﷼", name: "Qatari Riyal", flag: "🇶🇦" },
  KWD: { code: "KWD", symbol: "د.ك", name: "Kuwaiti Dinar", flag: "🇰🇼" },
  OMR: { code: "OMR", symbol: "﷼", name: "Omani Rial", flag: "🇴🇲" },
  BHD: { code: "BHD", symbol: "د.ب", name: "Bahraini Dinar", flag: "��" },
  ILS: { code: "ILS", symbol: "₪", name: "Israeli Shekel", flag: "🇮🇱" },
  EGP: { code: "EGP", symbol: "£", name: "Egyptian Pound", flag: "🇪🇬" },
  ZAR: { code: "ZAR", symbol: "R", name: "South African Rand", flag: "🇿🇦" },
  NGN: { code: "NGN", symbol: "₦", name: "Nigerian Naira", flag: "🇳🇬" },
  KES: { code: "KES", symbol: "KSh", name: "Kenyan Shilling", flag: "🇰🇪" },
  GHS: { code: "GHS", symbol: "GH₵", name: "Ghanaian Cedi", flag: "🇬🇭" },
  MAD: { code: "MAD", symbol: "د.م.", name: "Moroccan Dirham", flag: "��" },
};

// Country to currency mapping
const COUNTRY_CURRENCY_MAP: Record<string, string> = {
  // Americas
  US: "USD",
  CA: "CAD",
  MX: "MXN",
  BR: "BRL",
  AR: "ARS",
  CL: "CLP",
  CO: "COP",
  PE: "PEN",

  // Europe
  GB: "GBP",
  CH: "CHF",
  SE: "SEK",
  NO: "NOK",
  DK: "DKK",
  PL: "PLN",
  CZ: "CZK",
  HU: "HUF",
  RO: "RON",
  BG: "BGN",
  RU: "RUB",
  UA: "UAH",
  TR: "TRY",
  // Euro zone countries
  DE: "EUR",
  FR: "EUR",
  ES: "EUR",
  IT: "EUR",
  NL: "EUR",
  BE: "EUR",
  AT: "EUR",
  PT: "EUR",
  IE: "EUR",
  GR: "EUR",
  FI: "EUR",
  SK: "EUR",
  SI: "EUR",
  EE: "EUR",
  LV: "EUR",
  LT: "EUR",
  LU: "EUR",
  CY: "EUR",
  MT: "EUR",

  // Asia-Pacific
  IN: "INR",
  CN: "CNY",
  JP: "JPY",
  KR: "KRW",
  SG: "SGD",
  HK: "HKD",
  TW: "TWD",
  MY: "MYR",
  TH: "THB",
  ID: "IDR",
  PH: "PHP",
  VN: "VND",
  PK: "PKR",
  BD: "BDT",
  LK: "LKR",
  AU: "AUD",
  NZ: "NZD",

  // Middle East & Africa
  AE: "AED",
  SA: "SAR",
  QA: "QAR",
  KW: "KWD",
  OM: "OMR",
  BH: "BHD",
  IL: "ILS",
  EG: "EGP",
  ZA: "ZAR",
  NG: "NGN",
  KE: "KES",
  GH: "GHS",
  MA: "MAD",
};

interface PricingPlan {
  id: string;
  name: string;
  monthlyPrice: number; // Base price in USD
  yearlyPrice: number; // Base price in USD (already with 20% discount)
  popular?: boolean;
  features: string[];
  limits: {
    websites: string;
    keywords: string;
    audits: string;
    support: string;
  };
}

const PLANS: PricingPlan[] = [
  {
    id: "basic",
    name: "Basic",
    monthlyPrice: 29,
    yearlyPrice: 23, // $276/year
    features: [
      "10 websites monitoring",
      "100 keywords tracking",
      "Basic SEO audit",
      "Weekly reports",
      "Email support",
      "Mobile app access",
    ],
    limits: {
      websites: "10 websites",
      keywords: "100 keywords",
      audits: "Basic SEO audit",
      support: "Email support",
    },
  },
  {
    id: "advanced",
    name: "Advanced",
    monthlyPrice: 79,
    yearlyPrice: 63, // $756/year
    popular: true,
    features: [
      "50 websites monitoring",
      "500 keywords tracking",
      "Advanced SEO audit",
      "Competitor analysis",
      "Backlink monitoring",
      "Daily reports",
      "Priority support",
      "API access",
    ],
    limits: {
      websites: "50 websites",
      keywords: "500 keywords",
      audits: "Advanced audit",
      support: "Priority support",
    },
  },
  {
    id: "business",
    name: "Business",
    monthlyPrice: 149,
    yearlyPrice: 119, // $1,428/year
    features: [
      "Unlimited websites",
      "Unlimited keywords",
      "Enterprise audit suite",
      "White-label reports",
      "Custom integrations",
      "Real-time monitoring",
      "Dedicated account manager",
      "24/7 phone support",
      "Custom API limits",
      "Team collaboration",
    ],
    limits: {
      websites: "Unlimited",
      keywords: "Unlimited",
      audits: "Enterprise suite",
      support: "Dedicated manager",
    },
  },
];

const Pricing: React.FC = () => {
  const navigate = useNavigate();
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "yearly">(
    "yearly"
  );
  const [selectedCurrency, setSelectedCurrency] = useState<string>("USD");
  const [exchangeRates, setExchangeRates] = useState<Record<string, number>>({
    USD: 1,
  });
  const [userCountry, setUserCountry] = useState<string>("US");
  const [loading, setLoading] = useState<boolean>(true);
  const [ratesLoading, setRatesLoading] = useState<boolean>(false);

  // Detect user's country and currency on mount
  useEffect(() => {
    const initializePage = async () => {
      setLoading(true);
      await loadExchangeRates();
      await detectUserLocation();
      setLoading(false);
    };
    initializePage();
  }, []);

  const detectUserLocation = async () => {
    try {
      // Check if we have cached location data
      const cachedLocation = localStorage.getItem("userLocation");
      const cachedTime = localStorage.getItem("userLocationTime");

      if (cachedLocation && cachedTime) {
        const age = Date.now() - parseInt(cachedTime);
        // Use cache if less than 24 hours old
        if (age < 24 * 60 * 60 * 1000) {
          const location = JSON.parse(cachedLocation);
          setUserCountry(location.country);
          setSelectedCurrency(location.currency);
          return;
        }
      }

      // Fetch user's location using IP geolocation API
      const response = await fetch("https://ipapi.co/json/");
      const data = await response.json();

      const country = data.country_code || "US";
      const currency = COUNTRY_CURRENCY_MAP[country] || "USD";

      setUserCountry(country);
      setSelectedCurrency(currency);

      // Cache the result
      localStorage.setItem(
        "userLocation",
        JSON.stringify({ country, currency })
      );
      localStorage.setItem("userLocationTime", Date.now().toString());
    } catch (error) {
      console.error("Error detecting location:", error);
      setUserCountry("US");
      setSelectedCurrency("USD");
    }
  };

  const loadExchangeRates = async () => {
    try {
      // Check if we have cached rates
      const cachedRates = localStorage.getItem("exchangeRates");
      const cachedTime = localStorage.getItem("exchangeRatesTime");

      if (cachedRates && cachedTime) {
        const age = Date.now() - parseInt(cachedTime);
        // Use cache if less than 24 hours old
        if (age < 24 * 60 * 60 * 1000) {
          const rates = JSON.parse(cachedRates);
          setExchangeRates(rates);
          console.log("Using cached exchange rates:", rates);
          return;
        }
      }

      setRatesLoading(true);
      console.log("Fetching fresh exchange rates...");

      // Fetch latest exchange rates using your API key
      const response = await fetch(
        "https://v6.exchangerate-api.com/v6/dd691f4a8fe430b99c193dfb/latest/USD"
      );
      const data = await response.json();

      // Check if API call was successful
      if (data.result === "success") {
        // Extract rates for all currencies we support
        const rates: Record<string, number> = { USD: 1 };

        Object.keys(CURRENCIES).forEach((currencyCode) => {
          if (currencyCode !== "USD") {
            rates[currencyCode] = data.conversion_rates[currencyCode] || 1;
          }
        });

        setExchangeRates(rates);
        console.log("✅ Exchange rates loaded successfully");
        console.log("📊 Sample rates:", {
          USD: rates.USD,
          INR: rates.INR,
          JPY: rates.JPY,
          EUR: rates.EUR,
          GBP: rates.GBP,
          RUB: rates.RUB,
          CNY: rates.CNY,
        });
        console.log(
          `💰 Test: $29 USD = ₽${(29 * rates.RUB).toFixed(2)} RUB (rate: ${
            rates.RUB
          })`
        );

        // Cache the rates
        localStorage.setItem("exchangeRates", JSON.stringify(rates));
        localStorage.setItem("exchangeRatesTime", Date.now().toString());
      } else {
        console.error("API returned error:", data);
        throw new Error("API call failed");
      }

      setRatesLoading(false);
    } catch (error) {
      console.error("Error loading exchange rates:", error);
      // Use fallback rates if API fails (accurate rates as of Nov 2025)
      const fallbackRates = {
        // Americas
        USD: 1.0,
        CAD: 1.38,
        MXN: 17.15,
        BRL: 4.96,
        ARS: 365.5,
        CLP: 920.0,
        COP: 4125.0,
        PEN: 3.73,
        // Europe
        EUR: 0.93,
        GBP: 0.79,
        CHF: 0.88,
        SEK: 10.63,
        NOK: 10.95,
        DKK: 6.95,
        PLN: 4.02,
        CZK: 23.45,
        HUF: 368.5,
        RON: 4.62,
        BGN: 1.82,
        RUB: 92.5,
        UAH: 38.25,
        TRY: 34.2,
        // Asia-Pacific
        INR: 83.25,
        CNY: 7.24,
        JPY: 149.8,
        KRW: 1318.0,
        SGD: 1.34,
        HKD: 7.82,
        TWD: 31.85,
        MYR: 4.48,
        THB: 35.2,
        IDR: 15680.0,
        PHP: 56.5,
        VND: 24350.0,
        PKR: 278.5,
        BDT: 109.75,
        LKR: 305.0,
        AUD: 1.53,
        NZD: 1.67,
        // Middle East & Africa
        AED: 3.67,
        SAR: 3.75,
        QAR: 3.64,
        KWD: 0.31,
        OMR: 0.38,
        BHD: 0.38,
        ILS: 3.72,
        EGP: 49.25,
        ZAR: 18.35,
        NGN: 815.0,
        KES: 129.5,
        GHS: 12.15,
        MAD: 10.08,
      };
      setExchangeRates(fallbackRates);
      console.log("Using fallback exchange rates:", fallbackRates);
      setRatesLoading(false);
    }
  };

  const convertPrice = (usdPrice: number): string => {
    const rate = exchangeRates[selectedCurrency] || 1;
    const converted = usdPrice * rate;
    const currency = CURRENCIES[selectedCurrency];

    // Debug logging (detailed)
    if (!exchangeRates[selectedCurrency]) {
      console.warn(
        `❌ No exchange rate found for ${selectedCurrency}, using rate: 1`
      );
      console.log("Available rates:", Object.keys(exchangeRates));
    } else {
      // Log first conversion to verify it's working
      if (usdPrice === 29 && rate !== 1) {
        console.log(
          `✅ Converting $${usdPrice} to ${selectedCurrency}: ${
            currency.symbol
          }${converted.toFixed(2)} (rate: ${rate})`
        );
      }
    }

    // Currencies that should be displayed without decimals
    const noDecimalCurrencies = [
      "JPY",
      "KRW",
      "VND",
      "IDR",
      "CLP",
      "ARS",
      "COP",
      "HUF",
      "PKR",
      "BDT",
      "LKR",
      "NGN",
      "KES",
    ];

    // Currencies that use Indian numbering system
    const indianNumbering = ["INR", "PKR", "BDT", "LKR"];

    if (noDecimalCurrencies.includes(selectedCurrency)) {
      // No decimals for these currencies
      const rounded = Math.round(converted);
      if (indianNumbering.includes(selectedCurrency)) {
        return `${currency.symbol}${rounded.toLocaleString("en-IN")}`;
      }
      return `${currency.symbol}${rounded.toLocaleString()}`;
    } else if (indianNumbering.includes(selectedCurrency)) {
      // Indian numbering with 2 decimals
      return `${currency.symbol}${converted
        .toFixed(2)
        .replace(/\B(?=(\d{2})+(?!\d))/g, ",")}`;
    } else {
      // Standard formatting with 2 decimals
      return `${currency.symbol}${converted
        .toFixed(2)
        .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
    }
  };

  const handleSelectPlan = (planId: string) => {
    // Navigate to checkout with plan details
    navigate(
      `/checkout?plan=${planId}&billing=${billingPeriod}&currency=${selectedCurrency}`
    );
  };

  const handleCurrencyChange = async (currencyCode: string) => {
    setSelectedCurrency(currencyCode);

    // Find country for this currency
    const country =
      Object.entries(COUNTRY_CURRENCY_MAP).find(
        ([_, curr]) => curr === currencyCode
      )?.[0] || "US";
    setUserCountry(country);
  };

  // Show loading state until both location and exchange rates are loaded
  const isFullyLoaded = !loading && Object.keys(exchangeRates).length > 1;

  if (!isFullyLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 font-semibold">
            Loading pricing information...
          </p>
          <p className="mt-2 text-sm text-gray-500">
            {Object.keys(exchangeRates).length === 1
              ? "Loading exchange rates..."
              : "Detecting your location..."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="inline-block px-4 py-2 bg-blue-500/20 rounded-full text-blue-300 text-sm font-semibold mb-6">
            PRICING PLANS
          </span>
          <h1 className="text-6xl font-extrabold mb-6 leading-tight">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8">
            Choose the perfect plan for your business. All plans include a
            14-day free trial with full access to our enterprise-grade SEO
            analytics platform.
          </p>

          {/* Trust Indicators */}
          <div className="flex justify-center items-center gap-8 text-sm text-gray-400 flex-wrap">
            <span className="flex items-center gap-2">
              <svg
                className="w-5 h-5 text-green-400"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              No credit card required
            </span>
            <span className="flex items-center gap-2">
              <svg
                className="w-5 h-5 text-green-400"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              Cancel anytime
            </span>
            <span className="flex items-center gap-2">
              <svg
                className="w-5 h-5 text-green-400"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              Trusted by 10,000+ businesses
            </span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-10">
        {/* Controls Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8 mb-12 border-2 border-gray-100">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
            {/* Currency Selector - Enhanced */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full lg:w-auto">
              <div className="flex items-center gap-3">
                <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-3 rounded-xl shadow-lg">
                  <GlobeAltIcon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <div className="text-xs text-gray-500 uppercase tracking-wide font-semibold">
                    Select Currency
                  </div>
                  <div className="text-sm text-gray-700 font-medium">
                    Prices in your local currency
                  </div>
                </div>
              </div>

              <div className="relative group">
                <select
                  value={selectedCurrency}
                  onChange={(e) => handleCurrencyChange(e.target.value)}
                  className="appearance-none px-6 py-3 pr-12 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 bg-white text-gray-900 font-bold text-lg cursor-pointer transition-all hover:border-blue-400 hover:shadow-lg shadow-md min-w-[280px]"
                  style={{
                    backgroundImage: "none",
                    backgroundColor: "white",
                  }}
                >
                  {Object.values(CURRENCIES).map((currency) => (
                    <option
                      key={currency.code}
                      value={currency.code}
                      className="bg-white text-gray-900 py-2 px-4"
                      style={{
                        backgroundColor: "white",
                        color: "#111827",
                        padding: "8px 16px",
                      }}
                    >
                      {currency.flag} {currency.code} - {currency.name}
                    </option>
                  ))}
                </select>

                {/* Custom dropdown arrow */}
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                  <svg
                    className="w-5 h-5 text-gray-600 group-hover:text-blue-600 transition-colors"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>

                {/* Loading indicator */}
                {ratesLoading && (
                  <div className="absolute -right-12 top-1/2 -translate-y-1/2">
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-600 border-t-transparent"></div>
                      <span className="text-xs text-blue-600 font-semibold whitespace-nowrap">
                        Updating rates...
                      </span>
                    </div>
                  </div>
                )}

                {/* Success checkmark after loading */}
                {!ratesLoading &&
                  selectedCurrency &&
                  Object.keys(exchangeRates).length > 1 && (
                    <div className="absolute -right-8 top-1/2 -translate-y-1/2">
                      <div
                        className="bg-green-100 rounded-full p-1"
                        title={`Live rates for ${
                          Object.keys(exchangeRates).length
                        } currencies`}
                      >
                        <svg
                          className="w-4 h-4 text-green-600"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                    </div>
                  )}
              </div>
            </div>

            {/* Billing Period Toggle */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-gray-700 mr-2">
                Billing:
              </span>
              <div className="flex items-center gap-2 bg-gray-100 p-1.5 rounded-lg">
                <button
                  onClick={() => setBillingPeriod("monthly")}
                  className={`px-6 py-2 rounded-md font-semibold text-sm transition-all ${
                    billingPeriod === "monthly"
                      ? "bg-white text-blue-600 shadow-md"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  Monthly
                </button>
                <button
                  onClick={() => setBillingPeriod("yearly")}
                  className={`px-6 py-2 rounded-md font-semibold text-sm transition-all relative ${
                    billingPeriod === "yearly"
                      ? "bg-white text-blue-600 shadow-md"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  Annual
                  <span className="absolute -top-2 -right-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs px-2 py-0.5 rounded-full font-bold shadow-lg">
                    -20%
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {PLANS.map((plan) => {
            const price =
              billingPeriod === "monthly"
                ? plan.monthlyPrice
                : plan.yearlyPrice;
            const yearlyTotal =
              billingPeriod === "yearly" ? price * 12 : plan.yearlyPrice * 12;

            return (
              <div
                key={plan.id}
                className={`relative bg-white rounded-2xl shadow-xl overflow-hidden transform transition-all hover:scale-105 ${
                  plan.popular
                    ? "border-4 border-blue-500 shadow-2xl"
                    : "border border-gray-200"
                }`}
              >
                {/* Popular Badge */}
                {plan.popular && (
                  <div className="absolute top-0 right-0 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 text-sm font-bold rounded-bl-2xl">
                    MOST POPULAR
                  </div>
                )}

                <div className="p-8">
                  {/* Plan Name */}
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    {plan.name}
                  </h3>

                  {/* Price */}
                  <div className="mb-6">
                    <div className="flex items-baseline gap-2">
                      <span className="text-5xl font-bold text-gray-900">
                        {convertPrice(price)}
                      </span>
                      <span className="text-gray-600">/month</span>
                    </div>
                    {billingPeriod === "yearly" && (
                      <div className="mt-2 text-sm text-gray-600">
                        {convertPrice(yearlyTotal)} billed annually
                      </div>
                    )}
                    {billingPeriod === "monthly" && (
                      <div className="mt-2 text-sm text-green-600 font-semibold">
                        Save{" "}
                        {convertPrice(
                          plan.monthlyPrice * 12 - plan.yearlyPrice * 12
                        )}{" "}
                        with yearly
                      </div>
                    )}
                  </div>

                  {/* CTA Button */}
                  <button
                    onClick={() => handleSelectPlan(plan.id)}
                    className={`w-full py-3 px-6 rounded-lg font-bold text-lg transition-all mb-6 ${
                      plan.popular
                        ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl"
                        : "bg-gray-900 text-white hover:bg-gray-800"
                    }`}
                  >
                    Start Free Trial
                  </button>

                  {/* Features */}
                  <div className="space-y-4">
                    <div className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                      What's Included:
                    </div>
                    <ul className="space-y-3">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-start gap-3">
                          <CheckIcon className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                          <span className="text-gray-700">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Payment Methods */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-12">
          <div className="flex items-center gap-3 mb-6">
            <CreditCardIcon className="h-8 w-8 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">
              Accepted Payment Methods
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {/* Card Payments */}
            <div className="flex flex-col items-center gap-2">
              <div className="w-20 h-14 bg-gradient-to-br from-blue-500 to-blue-700 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xs">VISA</span>
              </div>
              <span className="text-sm text-gray-600">Visa</span>
            </div>

            <div className="flex flex-col items-center gap-2">
              <div className="w-20 h-14 bg-gradient-to-br from-red-500 to-orange-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xs">MC</span>
              </div>
              <span className="text-sm text-gray-600">Mastercard</span>
            </div>

            <div className="flex flex-col items-center gap-2">
              <div className="w-20 h-14 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xs">AMEX</span>
              </div>
              <span className="text-sm text-gray-600">Amex</span>
            </div>

            {/* PayPal */}
            <div className="flex flex-col items-center gap-2">
              <div className="w-20 h-14 bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xs">PayPal</span>
              </div>
              <span className="text-sm text-gray-600">PayPal</span>
            </div>

            {/* UPI (India only) */}
            {userCountry === "IN" && (
              <>
                <div className="flex flex-col items-center gap-2">
                  <div className="w-20 h-14 bg-gradient-to-br from-green-500 to-teal-500 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-xs">GPay</span>
                  </div>
                  <span className="text-sm text-gray-600">Google Pay</span>
                </div>

                <div className="flex flex-col items-center gap-2">
                  <div className="w-20 h-14 bg-gradient-to-br from-purple-600 to-purple-800 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-xs">
                      PhonePe
                    </span>
                  </div>
                  <span className="text-sm text-gray-600">PhonePe</span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* FAQ Section */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Frequently Asked Questions
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-bold text-lg text-gray-900 mb-2">
                Can I change plans later?
              </h3>
              <p className="text-gray-600">
                Yes! You can upgrade or downgrade your plan at any time. Changes
                are prorated automatically.
              </p>
            </div>

            <div>
              <h3 className="font-bold text-lg text-gray-900 mb-2">
                What payment methods do you accept?
              </h3>
              <p className="text-gray-600">
                We accept all major credit cards, PayPal, and UPI (for Indian
                customers).
              </p>
            </div>

            <div>
              <h3 className="font-bold text-lg text-gray-900 mb-2">
                Is there a free trial?
              </h3>
              <p className="text-gray-600">
                Yes! All plans include a 14-day free trial. No credit card
                required.
              </p>
            </div>

            <div>
              <h3 className="font-bold text-lg text-gray-900 mb-2">
                Can I cancel anytime?
              </h3>
              <p className="text-gray-600">
                Absolutely! Cancel anytime from your account settings. No
                questions asked.
              </p>
            </div>
          </div>
        </div>

        {/* Money-Back Guarantee Banner */}
        <div className="mt-12 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-2xl p-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="bg-green-500 rounded-full p-4">
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-1">
                  30-Day Money-Back Guarantee
                </h3>
                <p className="text-gray-700">
                  Try risk-free. If you're not satisfied, get a full refund
                  within 30 days. No questions asked.
                </p>
              </div>
            </div>
            <div className="text-center">
              <div className="bg-white rounded-xl px-6 py-3 shadow-lg border-2 border-green-300">
                <div className="text-4xl font-bold text-green-600">100%</div>
                <div className="text-sm text-gray-600 font-semibold">
                  Satisfaction
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Testimonials Section */}
        <div className="mt-16 bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2 text-center">
            What Our Customers Say
          </h2>
          <p className="text-gray-600 text-center mb-8">
            Join thousands of satisfied businesses
          </p>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-100">
              <div className="flex items-center mb-4">
                <div className="flex text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      className="w-5 h-5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
              </div>
              <p className="text-gray-700 mb-4 italic">
                "SEO Health Analyzer transformed our online visibility. We saw a
                300% increase in organic traffic within 3 months!"
              </p>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                  SJ
                </div>
                <div>
                  <div className="font-bold text-gray-900">Sarah Johnson</div>
                  <div className="text-sm text-gray-600">
                    Marketing Director, TechCorp
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-100">
              <div className="flex items-center mb-4">
                <div className="flex text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      className="w-5 h-5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
              </div>
              <p className="text-gray-700 mb-4 italic">
                "The best investment for our digital marketing strategy. The
                insights are actionable and the ROI is incredible."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center text-white font-bold">
                  MP
                </div>
                <div>
                  <div className="font-bold text-gray-900">Michael Park</div>
                  <div className="text-sm text-gray-600">
                    CEO, E-Commerce Plus
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-xl p-6 border border-orange-100">
              <div className="flex items-center mb-4">
                <div className="flex text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      className="w-5 h-5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
              </div>
              <p className="text-gray-700 mb-4 italic">
                "Comprehensive tool with excellent support. It covers everything
                we need for SEO management in one platform."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center text-white font-bold">
                  AR
                </div>
                <div>
                  <div className="font-bold text-gray-900">Anita Rodriguez</div>
                  <div className="text-sm text-gray-600">
                    SEO Manager, Digital Agency
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Comparison Table */}
        <div className="mt-16 bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2 text-center">
            Detailed Feature Comparison
          </h2>
          <p className="text-gray-600 text-center mb-8">
            Choose the perfect plan for your needs
          </p>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="text-left py-4 px-6 font-bold text-gray-900">
                    Feature
                  </th>
                  <th className="text-center py-4 px-6">
                    <div className="font-bold text-gray-900">Basic</div>
                    <div className="text-sm text-gray-600 font-normal">
                      {convertPrice(PLANS[0].monthlyPrice)}/
                      {billingPeriod === "monthly" ? "mo" : "yr"}
                    </div>
                  </th>
                  <th className="text-center py-4 px-6 bg-blue-50">
                    <div className="font-bold text-blue-600">Advanced</div>
                    <div className="text-sm text-blue-600 font-normal">
                      {convertPrice(PLANS[1].monthlyPrice)}/
                      {billingPeriod === "monthly" ? "mo" : "yr"}
                    </div>
                    <span className="inline-block bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full mt-1">
                      POPULAR
                    </span>
                  </th>
                  <th className="text-center py-4 px-6">
                    <div className="font-bold text-gray-900">Business</div>
                    <div className="text-sm text-gray-600 font-normal">
                      {convertPrice(PLANS[2].monthlyPrice)}/
                      {billingPeriod === "monthly" ? "mo" : "yr"}
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-4 px-6 font-semibold text-gray-900">
                    Websites Monitored
                  </td>
                  <td className="text-center py-4 px-6 text-gray-700">10</td>
                  <td className="text-center py-4 px-6 bg-blue-50 text-blue-900 font-semibold">
                    50
                  </td>
                  <td className="text-center py-4 px-6 text-gray-700">
                    Unlimited
                  </td>
                </tr>
                <tr className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-4 px-6 font-semibold text-gray-900">
                    Keywords Tracking
                  </td>
                  <td className="text-center py-4 px-6 text-gray-700">100</td>
                  <td className="text-center py-4 px-6 bg-blue-50 text-blue-900 font-semibold">
                    500
                  </td>
                  <td className="text-center py-4 px-6 text-gray-700">2,000</td>
                </tr>
                <tr className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-4 px-6 font-semibold text-gray-900">
                    SEO Audits
                  </td>
                  <td className="text-center py-4 px-6 text-gray-700">Basic</td>
                  <td className="text-center py-4 px-6 bg-blue-50 text-blue-900 font-semibold">
                    Advanced
                  </td>
                  <td className="text-center py-4 px-6 text-gray-700">
                    Comprehensive
                  </td>
                </tr>
                <tr className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-4 px-6 font-semibold text-gray-900">
                    Competitor Analysis
                  </td>
                  <td className="text-center py-4 px-6 text-red-500">✗</td>
                  <td className="text-center py-4 px-6 bg-blue-50 text-green-600 font-bold">
                    ✓
                  </td>
                  <td className="text-center py-4 px-6 text-green-600 font-bold">
                    ✓
                  </td>
                </tr>
                <tr className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-4 px-6 font-semibold text-gray-900">
                    Backlink Monitoring
                  </td>
                  <td className="text-center py-4 px-6 text-red-500">✗</td>
                  <td className="text-center py-4 px-6 bg-blue-50 text-green-600 font-bold">
                    ✓
                  </td>
                  <td className="text-center py-4 px-6 text-green-600 font-bold">
                    ✓
                  </td>
                </tr>
                <tr className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-4 px-6 font-semibold text-gray-900">
                    White Label Reports
                  </td>
                  <td className="text-center py-4 px-6 text-red-500">✗</td>
                  <td className="text-center py-4 px-6 bg-blue-50 text-red-500">
                    ✗
                  </td>
                  <td className="text-center py-4 px-6 text-green-600 font-bold">
                    ✓
                  </td>
                </tr>
                <tr className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-4 px-6 font-semibold text-gray-900">
                    API Access
                  </td>
                  <td className="text-center py-4 px-6 text-red-500">✗</td>
                  <td className="text-center py-4 px-6 bg-blue-50 text-green-600 font-bold">
                    ✓
                  </td>
                  <td className="text-center py-4 px-6 text-green-600 font-bold">
                    ✓ Unlimited
                  </td>
                </tr>
                <tr className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-4 px-6 font-semibold text-gray-900">
                    Report Frequency
                  </td>
                  <td className="text-center py-4 px-6 text-gray-700">
                    Weekly
                  </td>
                  <td className="text-center py-4 px-6 bg-blue-50 text-blue-900 font-semibold">
                    Daily
                  </td>
                  <td className="text-center py-4 px-6 text-gray-700">
                    Real-time
                  </td>
                </tr>
                <tr className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-4 px-6 font-semibold text-gray-900">
                    Support Level
                  </td>
                  <td className="text-center py-4 px-6 text-gray-700">Email</td>
                  <td className="text-center py-4 px-6 bg-blue-50 text-blue-900 font-semibold">
                    Priority
                  </td>
                  <td className="text-center py-4 px-6 text-gray-700">
                    24/7 Dedicated
                  </td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="py-4 px-6 font-semibold text-gray-900">
                    Team Members
                  </td>
                  <td className="text-center py-4 px-6 text-gray-700">3</td>
                  <td className="text-center py-4 px-6 bg-blue-50 text-blue-900 font-semibold">
                    10
                  </td>
                  <td className="text-center py-4 px-6 text-gray-700">
                    Unlimited
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Enhanced FAQ Section */}
        <div className="mt-16 bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl shadow-lg p-8 border border-gray-200">
          <h2 className="text-3xl font-bold text-gray-900 mb-2 text-center">
            Frequently Asked Questions
          </h2>
          <p className="text-gray-600 text-center mb-8">
            Everything you need to know
          </p>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="font-bold text-lg text-gray-900 mb-2 flex items-center gap-2">
                <span className="text-blue-600">💳</span>
                What payment methods do you accept?
              </h3>
              <p className="text-gray-600">
                We accept all major credit cards (Visa, Mastercard, Amex),
                PayPal, and region-specific payment methods like UPI for India.
                All transactions are secure and encrypted.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="font-bold text-lg text-gray-900 mb-2 flex items-center gap-2">
                <span className="text-green-600">🎁</span>
                Is there a free trial available?
              </h3>
              <p className="text-gray-600">
                Yes! All plans include a 14-day free trial with full feature
                access. No credit card required to start. Cancel anytime during
                the trial with no charges.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="font-bold text-lg text-gray-900 mb-2 flex items-center gap-2">
                <span className="text-purple-600">🔄</span>
                Can I change plans later?
              </h3>
              <p className="text-gray-600">
                Absolutely! You can upgrade, downgrade, or cancel your plan at
                any time from your account settings. All changes are prorated
                automatically, so you only pay for what you use.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="font-bold text-lg text-gray-900 mb-2 flex items-center gap-2">
                <span className="text-red-600">❌</span>
                What's your cancellation policy?
              </h3>
              <p className="text-gray-600">
                Cancel anytime with one click from your account dashboard. No
                questions asked, no cancellation fees. If you cancel within 30
                days, you'll get a full refund.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="font-bold text-lg text-gray-900 mb-2 flex items-center gap-2">
                <span className="text-orange-600">📊</span>
                Do you offer custom enterprise plans?
              </h3>
              <p className="text-gray-600">
                Yes! For organizations needing more than our Business plan
                offers, we provide custom enterprise solutions. Contact our
                sales team for tailored pricing and features.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="font-bold text-lg text-gray-900 mb-2 flex items-center gap-2">
                <span className="text-teal-600">🔒</span>
                Is my data secure?
              </h3>
              <p className="text-gray-600">
                Your data security is our top priority. We use enterprise-grade
                encryption, regular security audits, and comply with GDPR, SOC
                2, and ISO 27001 standards.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="font-bold text-lg text-gray-900 mb-2 flex items-center gap-2">
                <span className="text-yellow-600">💰</span>
                Why choose annual billing?
              </h3>
              <p className="text-gray-600">
                Annual billing saves you 20% compared to monthly payments. Plus,
                you'll never worry about monthly renewals and can focus on
                growing your SEO performance.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="font-bold text-lg text-gray-900 mb-2 flex items-center gap-2">
                <span className="text-indigo-600">🌍</span>
                Do prices vary by region?
              </h3>
              <p className="text-gray-600">
                Base pricing is in USD, but we display prices in 58 currencies
                worldwide using real-time exchange rates. The equivalent value
                remains consistent globally.
              </p>
            </div>
          </div>
        </div>

        {/* Trust Badges & Security */}
        <div className="mt-12 bg-white rounded-2xl shadow-lg p-8">
          <p className="text-center text-gray-700 font-semibold mb-6 text-lg">
            Trusted by over 10,000+ businesses in 150+ countries
          </p>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-6 items-center justify-items-center mb-8">
            <div className="text-center">
              <div className="text-4xl mb-2">🔒</div>
              <div className="text-sm font-semibold text-gray-900">
                SSL Encrypted
              </div>
              <div className="text-xs text-gray-600">256-bit</div>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-2">✓</div>
              <div className="text-sm font-semibold text-gray-900">
                GDPR Compliant
              </div>
              <div className="text-xs text-gray-600">EU Standards</div>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-2">⚡</div>
              <div className="text-sm font-semibold text-gray-900">
                Instant Access
              </div>
              <div className="text-xs text-gray-600">Start in 60 sec</div>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-2">💳</div>
              <div className="text-sm font-semibold text-gray-900">
                Secure Payment
              </div>
              <div className="text-xs text-gray-600">PCI DSS</div>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-2">🎯</div>
              <div className="text-sm font-semibold text-gray-900">
                99.9% Uptime
              </div>
              <div className="text-xs text-gray-600">SLA Guaranteed</div>
            </div>
          </div>

          <div className="flex flex-wrap justify-center items-center gap-6 text-sm text-gray-600 border-t pt-6">
            <span className="flex items-center gap-2">
              <svg
                className="w-5 h-5 text-green-500"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              No credit card for trial
            </span>
            <span className="flex items-center gap-2">
              <svg
                className="w-5 h-5 text-green-500"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              30-day money-back guarantee
            </span>
            <span className="flex items-center gap-2">
              <svg
                className="w-5 h-5 text-green-500"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              Cancel anytime, no fees
            </span>
            <span className="flex items-center gap-2">
              <svg
                className="w-5 h-5 text-green-500"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              24/7 customer support
            </span>
          </div>
        </div>

        {/* Final CTA */}
        <div className="mt-12 text-center bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-12 text-white shadow-2xl">
          <h2 className="text-4xl font-bold mb-4">Ready to Boost Your SEO?</h2>
          <p className="text-xl mb-8 text-blue-100">
            Join thousands of successful businesses today
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button
              onClick={() => handleSelectPlan("advanced")}
              className="bg-white text-blue-600 px-8 py-4 rounded-xl font-bold text-lg hover:bg-gray-100 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              Start Free Trial →
            </button>
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="bg-transparent border-2 border-white text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-white hover:text-blue-600 transition-all"
            >
              Compare Plans
            </button>
          </div>
          <p className="mt-6 text-sm text-blue-100">
            No credit card required • 14-day free trial • Cancel anytime
          </p>
        </div>
      </div>
    </div>
  );
};

export default Pricing;
