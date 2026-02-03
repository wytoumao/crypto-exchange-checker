"use client";

import { useState, useRef } from "react";

interface ChainInfo {
  name: string;
  deposit: boolean;
  withdraw: boolean;
  withdraw_delayed: boolean;
}

interface ExchangeResult {
  name: string;
  found: boolean;
  deposit?: boolean;
  withdraw?: boolean;
  withdraw_delayed?: boolean;
  chains?: ChainInfo[];
  error?: string;
}

interface CheckResult {
  coin: string;
  results: ExchangeResult[];
  checked_at: string;
}

function StatusBadge({ disabled, delayed }: { disabled: boolean; delayed?: boolean }) {
  if (disabled) return <span className="inline-flex items-center gap-1 text-red-400 font-semibold">🔴 关闭</span>;
  if (delayed) return <span className="inline-flex items-center gap-1 text-yellow-400 font-semibold">🟡 延迟</span>;
  return <span className="inline-flex items-center gap-1 text-green-400 font-semibold">🟢 正常</span>;
}

export default function Home() {
  const [coin, setCoin] = useState("");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<CheckResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const ticker = coin.trim().toUpperCase();
    if (!ticker) return;

    setLoading(true);
    setError(null);
    setData(null);

    try {
      const res = await fetch(`/api/check?coin=${ticker}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "查询失败");
      setData(json);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const hasAnyFound = data?.results.some((r) => r.found);

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      {/* Header */}
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-white mb-2">🏦 交易所充提查询</h1>
        <p className="text-gray-500 text-sm">输入币种，一键查看各交易所充值/提现状态</p>
      </div>

      {/* Search */}
      <form onSubmit={handleSubmit} className="flex gap-2 mb-8">
        <input
          ref={inputRef}
          type="text"
          value={coin}
          onChange={(e) => setCoin(e.target.value)}
          placeholder="BTC / ETH / SOL ..."
          className="flex-1 bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 text-lg"
          autoComplete="off"
          autoFocus
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 disabled:text-blue-600 text-white font-semibold px-6 py-3 rounded-xl transition-colors"
        >
          {loading ? "查询中..." : "查询"}
        </button>
      </form>

      {/* Error */}
      {error && (
        <div className="bg-red-950 border border-red-800 rounded-xl p-4 text-red-400 text-center mb-6">
          ❌ {error}
        </div>
      )}

      {/* Results */}
      {data && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-300">
              🔍 <span className="text-white font-bold">{data.coin}</span> 查询结果
            </h2>
            <span className="text-xs text-gray-600">{new Date(data.checked_at).toLocaleString("zh-Hans")}</span>
          </div>

          {!hasAnyFound && (
            <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 text-center text-gray-500">
              未在任何交易所找到 <span className="text-white font-bold">{data.coin}</span>，请检查币种名称
            </div>
          )}

          {data.results.map((r) => (
            <div key={r.name} className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
              {/* Exchange Header */}
              <div className="flex items-center justify-between px-5 py-3 border-b border-gray-800 bg-gray-900">
                <span className="font-bold text-white text-base">{r.name}</span>
                {!r.found && <span className="text-xs text-gray-600 bg-gray-800 px-2 py-0.5 rounded">未上线</span>}
                {r.found && (
                  <div className="flex gap-4 text-sm">
                    <span>充值: <StatusBadge disabled={!r.deposit} /></span>
                    <span>提现: <StatusBadge disabled={!r.withdraw} delayed={r.withdraw_delayed} /></span>
                  </div>
                )}
              </div>

              {/* Chains */}
              {r.found && r.chains && r.chains.length > 0 && (
                <div className="px-5 py-3">
                  <p className="text-xs text-gray-600 mb-2 uppercase tracking-wide">链路详情</p>
                  <div className="space-y-1.5">
                    {r.chains.map((c) => (
                      <div key={c.name} className="flex items-center justify-between text-sm py-1 border-b border-gray-800 last:border-0">
                        <span className="text-gray-300 font-mono">{c.name}</span>
                        <div className="flex gap-6">
                          <span className="text-gray-500 text-xs w-8 text-right">充</span>
                          <StatusBadge disabled={!c.deposit} />
                          <span className="text-gray-500 text-xs w-8 text-right">提</span>
                          <StatusBadge disabled={!c.withdraw} delayed={c.withdraw_delayed} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Footer */}
      <div className="mt-12 text-center text-xs text-gray-700">
        <p>当前支持: Gate.io · 更多交易所接入中</p>
        <p className="mt-1">数据来源: 交易所公开 API · 不构成投资建议</p>
      </div>
    </div>
  );
}
