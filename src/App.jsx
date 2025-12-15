import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';

// Stock Name Mapping (Ticker -> Japanese Name)
const STOCK_NAMES = {
    // AI・ロボット
    "9984.T": "ソフトバンクG", "6861.T": "キーエンス", "6954.T": "ファナック", "6273.T": "SMC", "6645.T": "オムロン",
    "3993.T": "PKSHA", "4180.T": "Appier", "247A.T": "Aiロボティクス", "4382.T": "HEROZ", "4011.T": "ヘッドウォータース",
    // 量子技術
    "6702.T": "富士通", "6701.T": "NEC", "9432.T": "NTT", "6501.T": "日立製作所", "6503.T": "三菱電機",
    "3687.T": "フィックスターズ", "6597.T": "HPCシステムズ", "6521.T": "オキサイド", "7713.T": "シグマ光機", "2693.T": "YKT",
    // 半導体・通信
    "8035.T": "東京エレクトロン", "6857.T": "アドバンテスト", "4063.T": "信越化学", "6146.T": "ディスコ", "6920.T": "レーザーテック",
    "6323.T": "ローツェ", "6315.T": "TOWA", "4369.T": "トリケミカル", "6871.T": "日本マイクロニクス", "6266.T": "タツモ",
    // バイオ・ヘルスケア
    "4519.T": "中外製薬", "4568.T": "第一三共", "4502.T": "武田薬品", "4578.T": "大塚HD", "4503.T": "アステラス製薬",
    "4587.T": "ペプチドリーム", "2160.T": "GNIグループ", "4552.T": "JCRファーマ", "4592.T": "サンバイオ", "4599.T": "ステムリム",
    // 核融合
    "7013.T": "IHI", "5802.T": "住友電気工業", "5803.T": "フジクラ", "5801.T": "古河電気工業", "1963.T": "日揮HD",
    "5310.T": "東洋炭素", "7711.T": "助川電気工業", "3446.T": "ジェイテック", "6378.T": "木村化工機", "6864.T": "エヌエフHD",
    // 宇宙
    "7011.T": "三菱重工業", "7012.T": "川崎重工業", "9412.T": "スカパーJSAT", "7751.T": "キヤノン", "9433.T": "KDDI",
    "9348.T": "ispace", "464A.T": "QPSホールディングス", "186A.T": "アストロスケール", "290A.T": "Synspective", "402A.T": "アクセルスペース"
};

const INITIAL_DATA = {
    "AI_Robot": { name: "AI・ロボット", change: 0, tickers: [] },
    "Quantum": { name: "量子技術", change: 0, tickers: [] },
    "Semi": { name: "半導体・通信", change: 0, tickers: [] },
    "Bio": { name: "バイオ・ヘルスケア", change: 0, tickers: [] },
    "Fusion": { name: "核融合", change: 0, tickers: [] },
    "Space": { name: "宇宙", change: 0, tickers: [] }
};

// 6分野 大型株 (STOCK_NAMESから参照、年間トレンドグラフと同じ色)
const LARGE_CAP_LOGOS = [
    // AI・ロボット - Blue (#3b82f6) - 年間トレンドのAI線と同色
    { name: "ソフトバンクG", domain: "softbank.co.jp", color: "#3b82f6" },
    { name: "キーエンス", domain: "keyence.co.jp", color: "#3b82f6" },
    { name: "ファナック", domain: "fanuc.co.jp", color: "#3b82f6" },
    { name: "SMC", domain: "smcworld.com", color: "#3b82f6" },
    { name: "オムロン", domain: "omron.co.jp", color: "#3b82f6" },
    // 量子技術 - Purple (#8b5cf6) - 年間トレンドの量子線と同色
    { name: "富士通", domain: "fujitsu.com", color: "#8b5cf6" },
    { name: "NEC", domain: "nec.com", color: "#8b5cf6" },
    { name: "NTT", domain: "ntt.com", color: "#8b5cf6" },
    { name: "日立製作所", domain: "hitachi.com", color: "#8b5cf6" },
    { name: "三菱電機", domain: "mitsubishielectric.com", color: "#8b5cf6" },
    // 半導体・通信 - Green (#10b981) - 年間トレンドの半導体線と同色
    { name: "東京エレクトロン", domain: "tel.com", color: "#10b981" },
    { name: "アドバンテスト", domain: "advantest.com", color: "#10b981" },
    { name: "信越化学", domain: "shinetsu.co.jp", color: "#10b981" },
    { name: "ディスコ", domain: "disco.co.jp", color: "#10b981" },
    { name: "レーザーテック", domain: "lasertec.co.jp", color: "#10b981" },
    // バイオ・ヘルスケア - Pink (#ec4899) - 年間トレンドのバイオ線と同色
    { name: "中外製薬", domain: "chugai-pharm.co.jp", color: "#ec4899" },
    { name: "第一三共", domain: "daiichisankyo.co.jp", color: "#ec4899" },
    { name: "武田薬品", domain: "takeda.com", color: "#ec4899" },
    { name: "大塚HD", domain: "otsuka.com", color: "#ec4899" },
    { name: "アステラス製薬", domain: "astellas.com", color: "#ec4899" },
    // 核融合 - Orange (#f59e0b) - 年間トレンドの核融合線と同色
    { name: "IHI", domain: "ihi.co.jp", color: "#f59e0b" },
    { name: "住友電気工業", domain: "sei.co.jp", color: "#f59e0b" },
    { name: "フジクラ", domain: "fujikura.co.jp", color: "#f59e0b" },
    { name: "古河電気工業", domain: "furukawa.co.jp", color: "#f59e0b" },
    { name: "日揮HD", domain: "jgc.com", color: "#f59e0b" },
    // 宇宙 - Gray (#9ca3af) - 年間トレンドの宇宙線と同色
    { name: "三菱重工業", domain: "mhi.com", color: "#9ca3af" },
    { name: "川崎重工業", domain: "khi.co.jp", color: "#9ca3af" },
    { name: "スカパーJSAT", domain: "sptvjsat.com", color: "#9ca3af" },
    { name: "キヤノン", domain: "canon.com", color: "#9ca3af" },
    { name: "KDDI", domain: "kddi.com", color: "#9ca3af" }
];

// ロゴアイテムコンポーネント - 安定性のためテキストロゴに統一
function LogoItem({ company }) {
    return (
        <div className="logo-item-vertical">
            <span
                className="company-logo-text"
                style={{
                    color: company.color,
                    textShadow: `0 0 15px ${company.color}`
                }}
            >
                {company.name}
            </span>
        </div>
    );
}

// 左側のロゴ（下に流れる）
function LeftLogoSlider() {
    const logos = [...LARGE_CAP_LOGOS, ...LARGE_CAP_LOGOS, ...LARGE_CAP_LOGOS];

    return (
        <div className="logo-column logo-column-left">
            <div className="logo-scroll logo-scroll-down">
                {logos.map((company, i) => (
                    <LogoItem key={i} company={company} />
                ))}
            </div>
        </div>
    );
}

// 右側のロゴ（上に流れる）
function RightLogoSlider() {
    const logos = [...LARGE_CAP_LOGOS, ...LARGE_CAP_LOGOS, ...LARGE_CAP_LOGOS].reverse();

    return (
        <div className="logo-column logo-column-right">
            <div className="logo-scroll logo-scroll-up">
                {logos.map((company, i) => (
                    <LogoItem key={i} company={company} />
                ))}
            </div>
        </div>
    );
}

function App() {
    const [data, setData] = useState(INITIAL_DATA);
    const [historyData, setHistoryData] = useState([]);
    const [selectedSector, setSelectedSector] = useState(null);
    const [lastUpdated, setLastUpdated] = useState('');
    const [nikkeiPrice, setNikkeiPrice] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Try production path first, then local, with cache busting
                const timestamp = Date.now();
                let res = await fetch(`/six-national-strategic/stock_data.json?t=${timestamp}`);
                if (!res.ok) res = await fetch(`/stock_data.json?t=${timestamp}`);

                const json = await res.json();
                if (json.sectors) {
                    setData(prev => {
                        const newData = { ...prev };
                        Object.keys(json.sectors).forEach(key => {
                            if (newData[key]) {
                                newData[key].change = json.sectors[key].change_percent;
                                newData[key].tickers = json.sectors[key].tickers || [];
                            }
                        });
                        return newData;
                    });
                }
                if (json.history) {
                    setHistoryData(json.history);
                }
                if (json.last_updated) {
                    setLastUpdated(new Date(json.last_updated).toLocaleString('ja-JP', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }));
                }
                if (json.nikkei_current_price) {
                    setNikkeiPrice(json.nikkei_current_price);
                }
            } catch (err) {
                console.error("Failed to load stock data", err);
            }
        };
        fetchData();
    }, []);

    // Calculate Nikkei change since Tax Cut News
    const getNikkeiChange = () => {
        if (!historyData.length) return null;
        const newsDateStr = "2025-11-26";
        const newsDataPoint = historyData.find(d => d.date >= newsDateStr) || historyData[historyData.length - 1];
        const currentDataPoint = historyData[historyData.length - 1];

        if (newsDataPoint && currentDataPoint && newsDataPoint.Nikkei225 !== undefined && currentDataPoint.Nikkei225 !== undefined) {
            const vNews = newsDataPoint.Nikkei225;
            const vCurrent = currentDataPoint.Nikkei225;
            return ((vCurrent - vNews) / (100 + vNews)) * 100;
        }
        return 0;
    };

    const nikkeiChange = getNikkeiChange();

    return (
        <div className="min-h-screen text-white p-4 md:p-8 font-sans selection:bg-blue-500 selection:text-white relative overflow-hidden">
            {/* ===== ANIMATED BACKGROUND EFFECTS ===== */}
            {/* Grid Overlay */}
            <div className="grid-overlay" />

            {/* Logo Sliders - Left and Right Columns */}
            <LeftLogoSlider />
            <RightLogoSlider />

            <div className="max-w-7xl mx-auto space-y-8 relative z-10">

                {/* Header */}
                <header className="flex flex-col md:flex-row justify-between items-start md:items-center py-4">
                    <div>
                        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent animate-gradient-x bg-[length:200%_auto]">
                            Japan Tech 6
                        </h1>
                        <p className="text-gray-400 mt-2 font-medium">国家戦略6分野 株価トラッカー</p>
                        {nikkeiPrice && (
                            <div className="mt-2 flex items-center gap-3 text-sm font-medium">
                                <span className="px-2 py-0.5 rounded bg-red-500/20 text-red-400 border border-red-500/30 animate-pulse-slow">日経225</span>
                                <span className="text-white">¥{nikkeiPrice.toLocaleString()}</span>
                                <span className={`${nikkeiChange >= 0 ? 'text-red-400' : 'text-green-400'}`}>
                                    (減税報道比: {nikkeiChange > 0 ? '+' : ''}{nikkeiChange?.toFixed(2)}%)
                                </span>
                            </div>
                        )}
                    </div>
                    <div className="mt-4 md:mt-0 px-4 py-2 bg-white/5 rounded-full border border-white/10 backdrop-blur-sm text-sm text-gray-300">
                        最終更新: {lastUpdated || '読み込み中...'}
                    </div>
                </header>

                {/* Main Bento Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {Object.entries(data).map(([key, info], index) => {
                        // Calculate change since Tax Cut News (fixed: 2025-11-26)
                        const newsDateStr = "2025-11-26";

                        // Find closest data point to news date
                        const newsDataPoint = historyData.find(d => d.date >= newsDateStr) || historyData[historyData.length - 1];
                        const currentDataPoint = historyData[historyData.length - 1];

                        let newsChange = 0;
                        if (newsDataPoint && currentDataPoint) {
                            const vNews = newsDataPoint[key] || 0;
                            const vCurrent = currentDataPoint[key] || 0;
                            // Formula: (V_current - V_news) / (100 + V_news) * 100
                            newsChange = ((vCurrent - vNews) / (100 + vNews)) * 100;
                        }

                        const displayChange = newsChange.toFixed(2);

                        return (
                            <button
                                key={key}
                                onClick={() => setSelectedSector(key)}
                                className="sector-card group relative overflow-hidden rounded-3xl bg-gray-900/60 border border-white/5 p-8 text-left transition-all duration-300 hover:scale-[1.02] hover:bg-gray-800/80 hover:shadow-2xl hover:shadow-blue-500/20 hover:border-white/20"
                                style={{ animationDelay: `${index * 100}ms` }}
                            >
                                {/* Background Glow */}
                                <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-gradient-to-br from-blue-500/30 to-purple-500/0 blur-3xl transition-all duration-500 group-hover:from-blue-500/50 group-hover:scale-150" />

                                {/* Shimmer Effect */}
                                <div className="shimmer absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />

                                <div className="relative z-10 flex flex-col h-full justify-between">
                                    <div className="flex justify-between items-start">
                                        <div className="p-3 rounded-2xl bg-white/5 text-3xl backdrop-blur-md border border-white/5 group-hover:scale-110 transition-transform duration-300">
                                            {key === 'AI_Robot' && '🤖'}
                                            {key === 'Quantum' && '⚛️'}
                                            {key === 'Semi' && '📱'}
                                            {key === 'Bio' && '💊'}
                                            {key === 'Fusion' && '☀️'}
                                            {key === 'Space' && '🚀'}
                                        </div>
                                        <div className="text-right">
                                            <div className={`text-3xl font-bold tracking-tighter ${Number(displayChange) > 0 ? 'text-red-400 glow-red' : Number(displayChange) < 0 ? 'text-green-400 glow-green' : 'text-gray-400'}`}>
                                                {Number(displayChange) > 0 ? '+' : ''}{displayChange}%
                                            </div>
                                            <div className="text-xs text-gray-500 mt-1">減税報道比</div>
                                        </div>
                                    </div>

                                    <div className="mt-8">
                                        <h3 className="text-xl font-bold text-white group-hover:text-blue-300 transition-colors">
                                            {info.name}
                                        </h3>
                                        <p className="text-sm text-gray-500 mt-1 group-hover:text-gray-400 transition-colors">詳細を見る →</p>
                                    </div>
                                </div>
                            </button>
                        );
                    })}
                </div>

                {/* Charts Section (Bento Style) */}
                <div className="grid grid-cols-1 gap-6">
                    {/* Line Chart Card */}
                    <div className="rounded-3xl bg-gray-900/60 border border-white/5 p-8 backdrop-blur-sm relative overflow-hidden">
                        {/* Chart Background Glow */}
                        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
                        <div className="absolute bottom-0 left-0 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl" />

                        <h2 className="text-xl font-bold mb-6 text-gray-200 flex items-center gap-2 relative z-10">
                            <span className="w-1 h-6 bg-purple-500 rounded-full animate-pulse" />
                            年間トレンド
                        </h2>
                        <div className="h-[400px] w-full relative z-10">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={historyData} margin={{ top: 40, right: 60, left: 0, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                                    <XAxis
                                        dataKey="date"
                                        stroke="#666"
                                        fontSize={11}
                                        tickLine={false}
                                        axisLine={false}
                                        tickFormatter={(str) => {
                                            const d = new Date(str);
                                            return `${d.getMonth() + 1}/${d.getDate()}`;
                                        }}
                                        interval={30}
                                    />
                                    <YAxis stroke="#666" fontSize={11} tickLine={false} axisLine={false} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#111', borderColor: '#333', borderRadius: '12px' }}
                                        itemStyle={{ color: '#fff' }}
                                        labelFormatter={(label) => new Date(label).toLocaleDateString()}
                                    />
                                    <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                                    <ReferenceLine x="2025-11-26" stroke="#ef4444" strokeDasharray="3 3" label={{ value: '減税報道', fill: '#ef4444', fontSize: 12, position: 'top' }} />

                                    <Line type="monotone" dataKey="Nikkei225" stroke="#ff0000" strokeWidth={3} dot={false} name="日経225" />
                                    <Line type="monotone" dataKey="AI_Robot" stroke="#3b82f6" strokeWidth={2} dot={false} name="AI" />
                                    <Line type="monotone" dataKey="Quantum" stroke="#8b5cf6" strokeWidth={2} dot={false} name="量子" />
                                    <Line type="monotone" dataKey="Semi" stroke="#10b981" strokeWidth={2} dot={false} name="半導体" />
                                    <Line type="monotone" dataKey="Bio" stroke="#ec4899" strokeWidth={2} dot={false} name="バイオ" />
                                    <Line type="monotone" dataKey="Fusion" stroke="#f59e0b" strokeWidth={2} dot={false} name="核融合" />
                                    <Line type="monotone" dataKey="Space" stroke="#9ca3af" strokeWidth={2} dot={false} name="宇宙" />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <footer className="text-center text-gray-600 py-8 text-sm">
                    <p>Powered by GitHub Actions & Yahoo! Finance</p>
                </footer>
            </div>

            {/* Modal Overlay (Enhanced with Effects) */}
            {selectedSector && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    {/* Backdrop with blur */}
                    <div
                        className="absolute inset-0 bg-black/70 backdrop-blur-xl transition-opacity"
                        onClick={() => setSelectedSector(null)}
                    />

                    {/* Modal Container */}
                    <div className="relative w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-[2rem] border border-white/20 shadow-2xl modal-enter">
                        {/* Modal Background Effects */}
                        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-[#0a0a15] to-gray-900" />

                        {/* Modal Orbs */}
                        <div className="absolute -top-32 -right-32 w-64 h-64 bg-blue-500/30 rounded-full blur-[80px] animate-pulse" />
                        <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-purple-500/30 rounded-full blur-[80px] animate-pulse" style={{ animationDelay: '1s' }} />

                        {/* Grid overlay for modal */}
                        <div className="absolute inset-0 opacity-30" style={{
                            backgroundImage: 'linear-gradient(rgba(59, 130, 246, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(59, 130, 246, 0.1) 1px, transparent 1px)',
                            backgroundSize: '40px 40px'
                        }} />

                        {/* Scrollable Content */}
                        <div className="relative z-10 max-h-[90vh] overflow-y-auto">
                            {/* Modal Header */}
                            <div className="sticky top-0 z-20 flex justify-between items-center p-6 md:p-8 bg-gradient-to-b from-gray-900/95 via-gray-900/90 to-transparent backdrop-blur-xl">
                                <div className="flex items-center gap-4">
                                    <div className="relative">
                                        <span className="text-5xl relative z-10">
                                            {selectedSector === 'AI_Robot' && '🤖'}
                                            {selectedSector === 'Quantum' && '⚛️'}
                                            {selectedSector === 'Semi' && '📱'}
                                            {selectedSector === 'Bio' && '💊'}
                                            {selectedSector === 'Fusion' && '☀️'}
                                            {selectedSector === 'Space' && '🚀'}
                                        </span>
                                        {/* Icon glow */}
                                        <div className="absolute inset-0 blur-xl bg-blue-500/50 scale-150" />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent">
                                            {data[selectedSector].name}
                                        </h2>
                                        <p className="text-gray-400 text-sm mt-1">構成銘柄一覧 • 10銘柄</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setSelectedSector(null)}
                                    className="p-3 rounded-full bg-white/5 hover:bg-white/20 transition-all hover:scale-110 text-gray-400 hover:text-white border border-white/10"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                </button>
                            </div>

                            {/* Modal Content */}
                            <div className="p-6 md:p-8 space-y-8">
                                {/* Large Cap Section */}
                                <div className="relative">
                                    <div className="absolute -left-4 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-500 to-blue-500/0 rounded-full" />
                                    <h3 className="text-sm font-bold text-blue-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                                        <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse shadow-lg shadow-blue-400/50" />
                                        大型株 (Large Cap)
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        {data[selectedSector].tickers.slice(0, 5).map((stock, i) => {
                                            const isObject = typeof stock === 'object' && stock !== null;
                                            const ticker = isObject ? stock.ticker : stock;
                                            const change = isObject ? stock.change : null;
                                            const price = isObject ? stock.price : null;

                                            return (
                                                <a
                                                    key={ticker}
                                                    href={`https://finance.yahoo.co.jp/quote/${ticker}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="stock-item relative flex justify-between items-center p-4 bg-white/5 rounded-2xl hover:bg-blue-500/10 transition-all duration-300 hover:scale-[1.02] group border border-white/5 hover:border-blue-500/30 overflow-hidden"
                                                    style={{ animationDelay: `${i * 80}ms` }}
                                                >
                                                    {/* Hover glow effect */}
                                                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-blue-500/10 to-blue-500/0 opacity-0 group-hover:opacity-100 transition-opacity" />

                                                    <div className="relative z-10">
                                                        <div className="font-bold text-lg text-gray-200 group-hover:text-blue-300 transition-colors flex items-center gap-2">
                                                            {STOCK_NAMES[ticker] || ticker}
                                                            <svg className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-x-1 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                                                        </div>
                                                        <div className="text-xs text-gray-500 font-mono">{ticker}</div>
                                                    </div>
                                                    <div className="text-right relative z-10">
                                                        {price !== null ? (
                                                            <>
                                                                <div className={`font-bold text-lg ${change > 0 ? 'text-red-400 glow-red' : change < 0 ? 'text-green-400 glow-green' : 'text-gray-400'}`}>
                                                                    {change > 0 ? '+' : ''}{change}%
                                                                </div>
                                                                <div className="text-xs text-gray-500">¥{price.toLocaleString()}</div>
                                                            </>
                                                        ) : (
                                                            <div className="text-gray-600 text-xs">---</div>
                                                        )}
                                                    </div>
                                                </a>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Divider with glow */}
                                <div className="relative h-px">
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-500/50 to-transparent" />
                                </div>

                                {/* Small/Mid Cap Section */}
                                <div className="relative">
                                    <div className="absolute -left-4 top-0 bottom-0 w-1 bg-gradient-to-b from-purple-500 to-purple-500/0 rounded-full" />
                                    <h3 className="text-sm font-bold text-purple-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                                        <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse shadow-lg shadow-purple-400/50" />
                                        中小型株 (Small/Mid Cap)
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        {data[selectedSector].tickers.slice(5, 10).map((stock, i) => {
                                            const isObject = typeof stock === 'object' && stock !== null;
                                            const ticker = isObject ? stock.ticker : stock;
                                            const change = isObject ? stock.change : null;
                                            const price = isObject ? stock.price : null;

                                            return (
                                                <a
                                                    key={ticker}
                                                    href={`https://finance.yahoo.co.jp/quote/${ticker}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="stock-item relative flex justify-between items-center p-4 bg-white/5 rounded-2xl hover:bg-purple-500/10 transition-all duration-300 hover:scale-[1.02] group border border-white/5 hover:border-purple-500/30 overflow-hidden"
                                                    style={{ animationDelay: `${(i + 5) * 80}ms` }}
                                                >
                                                    {/* Hover glow effect */}
                                                    <div className="absolute inset-0 bg-gradient-to-r from-purple-500/0 via-purple-500/10 to-purple-500/0 opacity-0 group-hover:opacity-100 transition-opacity" />

                                                    <div className="relative z-10">
                                                        <div className="font-bold text-lg text-gray-200 group-hover:text-purple-300 transition-colors flex items-center gap-2">
                                                            {STOCK_NAMES[ticker] || ticker}
                                                            <svg className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-x-1 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                                                        </div>
                                                        <div className="text-xs text-gray-500 font-mono">{ticker}</div>
                                                    </div>
                                                    <div className="text-right relative z-10">
                                                        {price !== null ? (
                                                            <>
                                                                <div className={`font-bold text-lg ${change > 0 ? 'text-red-400 glow-red' : change < 0 ? 'text-green-400 glow-green' : 'text-gray-400'}`}>
                                                                    {change > 0 ? '+' : ''}{change}%
                                                                </div>
                                                                <div className="text-xs text-gray-500">¥{price.toLocaleString()}</div>
                                                            </>
                                                        ) : (
                                                            <div className="text-gray-600 text-xs">---</div>
                                                        )}
                                                    </div>
                                                </a>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default App
