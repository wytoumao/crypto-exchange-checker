import { NextResponse } from "next/server";

// ─── Types ──────────────────────────────────────────────
interface GateChain {
  name: string;
  deposit_disabled: boolean;
  withdraw_disabled: boolean;
  withdraw_delayed: boolean;
}

interface GateCurrency {
  currency: string;
  deposit_disabled: boolean;
  withdraw_disabled: boolean;
  withdraw_delayed: boolean;
  chains: GateChain[];
}

interface ChainResult {
  name: string;
  deposit: boolean;   // true = 正常
  withdraw: boolean;
  withdraw_delayed: boolean;
}

interface ExchangeResult {
  name: string;
  found: boolean;
  deposit?: boolean;
  withdraw?: boolean;
  withdraw_delayed?: boolean;
  chains?: ChainResult[];
  error?: string;
}

// ─── Gate.io ────────────────────────────────────────────
async function checkGateio(coin: string): Promise<ExchangeResult> {
  try {
    const res = await fetch("https://api.gateio.ws/api/v4/spot/currencies", {
      headers: { "User-Agent": "crypto-exchange-checker/1.0" },
      next: { revalidate: 60 }, // cache 60s
    });
    const list: GateCurrency[] = await res.json();
    const c = list.find((x) => x.currency === coin);

    if (!c) return { name: "Gate.io", found: false };

    return {
      name: "Gate.io",
      found: true,
      deposit: !c.deposit_disabled,
      withdraw: !c.withdraw_disabled,
      withdraw_delayed: c.withdraw_delayed,
      chains: (c.chains || []).map((ch) => ({
        name: ch.name,
        deposit: !ch.deposit_disabled,
        withdraw: !ch.withdraw_disabled,
        withdraw_delayed: ch.withdraw_delayed,
      })),
    };
  } catch (err: any) {
    return { name: "Gate.io", found: false, error: err.message };
  }
}

// ─── 后续交易所接入模板 ─────────────────────────────────
// async function checkBinance(coin: string): Promise<ExchangeResult> { ... }
// async function checkOKX(coin: string): Promise<ExchangeResult> { ... }
// async function checkBitget(coin: string): Promise<ExchangeResult> { ... }
// async function checkMexc(coin: string): Promise<ExchangeResult> { ... }

// ─── Route Handler ──────────────────────────────────────
export async function GET(request: Request) {
  const url = new URL(request.url);
  const coin = (url.searchParams.get("coin") || "").trim().toUpperCase();

  if (!coin) {
    return NextResponse.json({ error: "请提供币种参数" }, { status: 400 });
  }

  // 并发查询所有交易所
  const results = await Promise.all([
    checkGateio(coin),
    // checkBinance(coin),
    // checkOKX(coin),
    // checkBitget(coin),
    // checkMexc(coin),
  ]);

  return NextResponse.json({
    coin,
    results,
    checked_at: new Date().toISOString(),
  });
}
