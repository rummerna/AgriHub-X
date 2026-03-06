import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface CurrencyRate {
  code: string;
  name: string;
  symbol: string;
  rate_to_usd: number;
}

export const useCurrency = () => {
  const [rates, setRates] = useState<Map<string, CurrencyRate>>(new Map());
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const userCurrency = user?.currency || "KES";

  useEffect(() => {
    const fetchRates = async () => {
      const { data } = await supabase.from("currency_rates").select("*");
      if (data) {
        const map = new Map<string, CurrencyRate>();
        data.forEach((r: any) => map.set(r.code, r));
        setRates(map);
      }
      setLoading(false);
    };
    fetchRates();
  }, []);

  const convert = useCallback(
    (amount: number, fromCurrency: string, toCurrency?: string): number => {
      const target = toCurrency || userCurrency;
      if (fromCurrency === target || rates.size === 0) return amount;

      const fromRate = rates.get(fromCurrency)?.rate_to_usd || 1;
      const toRate = rates.get(target)?.rate_to_usd || 1;

      // Convert: amount in fromCurrency -> USD -> toCurrency
      const usdAmount = amount / fromRate;
      return Math.round(usdAmount * toRate * 100) / 100;
    },
    [rates, userCurrency]
  );

  const formatPrice = useCallback(
    (amount: number, fromCurrency: string, toCurrency?: string): string => {
      const target = toCurrency || userCurrency;
      const converted = convert(amount, fromCurrency, target);
      const rate = rates.get(target);
      const symbol = rate?.symbol || target;
      return `${symbol} ${converted.toLocaleString()}`;
    },
    [convert, rates, userCurrency]
  );

  return { convert, formatPrice, userCurrency, rates, loading };
};
