import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';

// Stock Name Mapping
const STOCK_NAMES = {
    "9984.T": "ソフトバンクG", "6861.T": "キーエンス", "6954.T": "ファナック", "6273.T": "SMC", "6645.T": "オムロン",
    "3993.T": "PKSHA", "4180.T": "Appier", "247A.T": "Aiロボティクス", "4382.T": "HEROZ", "4011.T": "ヘッドウォータース",
    "6702.T": "富士通", "6701.T": "NEC", "9432.T": "NTT", "6501.T": "日立製作所", "6503.T": "三菱電機",
    "3687.T": "フィックスターズ", "6597.T": "HPCシステムズ", "6521.T": "オキサイド", "7713.T": "シグマ光機", "2693.T": "YKT",
    "8035.T": "東京エレクトロン", "6857.T": "アドバンテスト", "4063.T": "信越化学", "6146.T": "ディスコ", "6920.T": "レーザーテック",
    "6323.T": "ローツェ", "6315.T": "TOWA", "4369.T": "トリケミカル", "6871.T": "日本マイクロニクス", "6266.T": "タツモ",
    "4519.T": "中外製薬", "4568.T": "第一三共", "4502.T": "武田薬品", "4578.T": "大塚HD", "4503.T": "アステラス製薬",
    "4587.T": "ペプチドリーム", "2160.T": "GNIグループ", "4552.T": "JCRファーマ", "4592.T": "サンバイオ", "4599.T": "ステムリム",
    "7013.T": "IHI", "5802.T": "住友電気工業", "5803.T": "フジクラ", "5801.T": "古河電気工業", "1963.T": "日揮HD",
    "5310.T": "東洋炭素", "7711.T": "助川電気工業", "3446.T": "ジェイテック", "6378.T": "木村化工機", "6864.T": "エヌエフHD",
    "7011.T": "三菱重工業", "7012.T": "川崎重工業", "9412.T": "スカパーJSAT", "7751.T": "キヤノン", "9433.T": "KDDI",
    "9348.T": "ispace", "464A.T": "QPSホールディングス", "186A.T": "アストロスケール", "290A.T": "Synspective", "402A.T": "アクセルスペース"
};

const SECTORS = {
    "AI_Robot": { name: "AI・ロボット", icon: "🤖", gradient: "from-cyan-500 via-blue-500 to-purple-600" },
    "Quantum": { name: "量子技術", icon: "⚛️", gradient: "from-purple-500 via-pink-500 to-red-500" },
    "Semi": { name: "半導体", icon: "💎", gradient: "from-green-400 via-emerald-500 to-teal-600" },
    "Bio": { name: "バイオ", icon: "🧬", gradient: "from-pink-500 via-rose-500 to-red-600" },
    "Fusion": { name: "核融合", icon: "☀️", gradient: "from-yellow-400 via-orange-500 to-red-600" },
    "Space": { name: "宇宙", icon: "🚀", gradient: "from-indigo-500 via-purple-500 to-pink-500" }
};

const INITIAL_DATA = Object.fromEntries(
    Object.entries(SECTORS).map(([key, val]) => [key, { ...val, change: 0, tickers: [] }])
);

// Particle Component
function Particles() {
    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[...Array(50)].map((_, i) => (
                <div
                    key={i}
                    className="particle"
                    style={{
                        left: `${Math.random() * 100}%`,
                        animationDelay: `${Math.random() * 20}s`,
                        animationDuration: `${15 + Math.random() * 20}s`,
                    }}
                />
            ))}
        </div>
    );
}

// Animated Background Grid
function GridBackground() {
    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="grid-bg" />
            <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black" />
        </div>
    );
}

// Glowing Orb
function GlowingOrb() {
    return (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
            <div className="orb" />
        </div>
    );
}

// Sector Card Component
function SectorCard({ sectorKey, data, historyData, onClick, index }) {
    const sector = SECTORS[sectorKey];

    // Calculate change from history
    const getChange = () => {
        if (!historyData?.length) return 0;
        const newsDateStr = "2025-11-26";
        const newsDataPoint = historyData.find(d => d.date >= newsDateStr) || historyData[historyData.length - 1];
        const currentDataPoint = historyData[historyData.length - 1];
        if (newsDataPoint && currentDataPoint) {
            const vNews = newsDataPoint[sectorKey] || 0;
            const vCurrent = currentDataPoint[sectorKey] || 0;
            return ((vCurrent - vNews) / (100 + vNews)) * 100;
        }
        return 0;
    };

    const change = getChange();
    const isPositive = change > 0;

    return (
        <button
            onClick={onClick}
            className="sector-card group"
            style={{ animationDelay: `${index * 100}ms` }}
        >
            {/* Glow effect */}
            <div className={`absolute -inset-0.5 bg-gradient-to-r ${sector.gradient} rounded-2xl blur-lg opacity-0 group-hover:opacity-75 transition-all duration-500`} />

            {/* Card content */}
            <div className="relative h-full bg-gray-900/90 backdrop-blur-xl rounded-2xl p-6 border border-white/10 overflow-hidden">
                {/* Background gradient animation */}
                <div className={`absolute inset-0 bg-gradient-to-br ${sector.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />

                {/* Icon */}
                <div className="text-5xl mb-4 transform group-hover:scale-110 transition-transform duration-300">
                    {sector.icon}
                </div>

                {/* Name */}
                <h3 className="text-xl font-bold text-white mb-2">{sector.name}</h3>

                {/* Change */}
                <div className={`text-3xl font-black ${isPositive ? 'text-red-400' : 'text-green-400'}`}>
                    {isPositive ? '+' : ''}{change.toFixed(2)}%
                </div>

                {/* Subtitle */}
                <p className="text-xs text-gray-500 mt-2">vs 税制改正ニュース</p>

                {/* Hover arrow */}
                <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0 transition-all duration-300">
                    <span className="text-white text-xl">→</span>
                </div>
            </div>
        </button>
    );
}

function App() {
    const [data, setData] = useState(INITIAL_DATA);
    const [historyData, setHistoryData] = useState([]);
    const [selectedSector, setSelectedSector] = useState(null);
    const [lastUpdated, setLastUpdated] = useState('');
    const [nikkeiPrice, setNikkeiPrice] = useState(null);
    const [showChart, setShowChart] = useState(false);
    const [timeRange, setTimeRange] = useState('ALL');

    useEffect(() => {
        const fetchData = async () => {
            try {
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
                if (json.history) setHistoryData(json.history);
                if (json.last_updated) {
                    setLastUpdated(new Date(json.last_updated).toLocaleString('ja-JP'));
                }
                if (json.nikkei_current_price) setNikkeiPrice(json.nikkei_current_price);
            } catch (err) {
                console.error("Failed to load stock data", err);
            }
        };
        fetchData();
    }, []);

    const getFilteredHistory = () => {
        if (!historyData.length) return [];
        const now = new Date();
        let startDate = new Date();
        switch (timeRange) {
            case '1M': startDate.setMonth(now.getMonth() - 1); break;
            case '6M': startDate.setMonth(now.getMonth() - 6); break;
            case 'YTD': startDate = new Date(now.getFullYear(), 0, 1); break;
            default: return historyData;
        }
        return historyData.filter(item => new Date(item.date) >= startDate);
    };

    const filteredHistory = getFilteredHistory();

    // Calculate Nikkei change
    const getNikkeiChange = () => {
        if (!historyData.length) return 0;
        const newsDateStr = "2025-11-26";
        const newsDataPoint = historyData.find(d => d.date >= newsDateStr) || historyData[historyData.length - 1];
        const currentDataPoint = historyData[historyData.length - 1];
        if (newsDataPoint && currentDataPoint && newsDataPoint.Nikkei225 !== undefined) {
            const vNews = newsDataPoint.Nikkei225;
            const vCurrent = currentDataPoint.Nikkei225;
            return ((vCurrent - vNews) / (100 + vNews)) * 100;
        }
        return 0;
    };

    const nikkeiChange = getNikkeiChange();

    return (
        <div className="min-h-screen bg-black text-white overflow-x-hidden">
            {/* Background Effects */}
            <GridBackground />
            <Particles />
            <GlowingOrb />

            {/* Main Content */}
            <div className="relative z-10 max-w-7xl mx-auto px-4 py-8">
                {/* Header */}
                <header className="text-center mb-16 pt-8">
                    <h1 className="title-gradient text-6xl md:text-8xl font-black tracking-tighter mb-4">
                        JAPAN TECH 6
                    </h1>
                    <p className="text-cyan-400/60 font-mono text-sm tracking-[0.3em] uppercase">
                        National Strategic Sectors Dashboard
                    </p>

                    {/* Nikkei Badge */}
                    {nikkeiPrice && (
                        <div className="mt-8 inline-flex items-center gap-4 px-6 py-3 bg-white/5 backdrop-blur-xl rounded-full border border-white/10">
                            <div className="flex items-center gap-2">
                                <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                                <span className="text-red-400 font-bold">NIKKEI 225</span>
                            </div>
                            <span className="text-2xl font-mono font-bold">¥{nikkeiPrice.toLocaleString()}</span>
                            <span className={`text-lg font-bold ${nikkeiChange >= 0 ? 'text-red-400' : 'text-green-400'}`}>
                                {nikkeiChange > 0 ? '+' : ''}{nikkeiChange.toFixed(2)}%
                            </span>
                        </div>
                    )}
                </header>

                {/* Sector Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                    {Object.keys(data).map((key, index) => (
                        <SectorCard
                            key={key}
                            sectorKey={key}
                            data={data[key]}
                            historyData={historyData}
                            onClick={() => setSelectedSector(key)}
                            index={index}
                        />
                    ))}
                </div>

                {/* Chart Button */}
                <div className="text-center mb-8">
                    <button
                        onClick={() => setShowChart(!showChart)}
                        className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-full font-bold text-lg shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/50 hover:scale-105 transition-all duration-300"
                    >
                        {showChart ? '✕ チャートを閉じる' : '📊 トレンドチャートを見る'}
                    </button>
                </div>

                {/* Chart */}
                {showChart && (
                    <div className="glass-panel p-6 rounded-3xl mb-12 animate-fade-in">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold">マーケットトレンド</h2>
                            <div className="flex gap-2">
                                {['1M', '6M', 'YTD', 'ALL'].map((range) => (
                                    <button
                                        key={range}
                                        onClick={() => setTimeRange(range)}
                                        className={`px-4 py-2 rounded-lg font-bold transition-all ${timeRange === range
                                                ? 'bg-gradient-to-r from-cyan-500 to-purple-600 text-white'
                                                : 'bg-white/10 text-white/60 hover:bg-white/20'
                                            }`}
                                    >
                                        {range}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="h-[400px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={filteredHistory}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                                    <XAxis
                                        dataKey="date"
                                        stroke="#666"
                                        tick={{ fill: '#999', fontSize: 10 }}
                                        tickFormatter={(str) => {
                                            const date = new Date(str);
                                            return `${date.getMonth() + 1}/${date.getDate()}`;
                                        }}
                                    />
                                    <YAxis stroke="#666" tick={{ fill: '#999', fontSize: 10 }} unit="%" />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#111', border: '1px solid #333', borderRadius: '8px' }}
                                        itemStyle={{ color: '#fff' }}
                                    />
                                    <Legend />
                                    <ReferenceLine x="2024-11-26" stroke="#ff00ff" strokeDasharray="3 3" label={{ value: "税制改正", fill: '#ff00ff', fontSize: 10 }} />

                                    <Line type="monotone" dataKey="Nikkei225" stroke="#ff4444" strokeWidth={2} dot={false} name="日経225" />
                                    <Line type="monotone" dataKey="AI_Robot" stroke="#00d4ff" strokeWidth={2} dot={false} name="AI・ロボット" />
                                    <Line type="monotone" dataKey="Semi" stroke="#00ff88" strokeWidth={2} dot={false} name="半導体" />
                                    <Line type="monotone" dataKey="Bio" stroke="#ff00aa" strokeWidth={2} dot={false} name="バイオ" />
                                    <Line type="monotone" dataKey="Quantum" stroke="#aa00ff" strokeWidth={2} dot={false} name="量子" />
                                    <Line type="monotone" dataKey="Fusion" stroke="#ffaa00" strokeWidth={2} dot={false} name="核融合" />
                                    <Line type="monotone" dataKey="Space" stroke="#ffffff" strokeWidth={2} dot={false} name="宇宙" />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                )}

                {/* Footer */}
                <footer className="text-center text-gray-500 text-sm">
                    Last Updated: {lastUpdated}
                </footer>
            </div>

            {/* Sector Detail Modal */}
            {selectedSector && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-xl" onClick={() => setSelectedSector(null)} />
                    <div className="relative w-full max-w-3xl max-h-[85vh] overflow-y-auto bg-gray-900/95 backdrop-blur-xl rounded-3xl border border-white/20 shadow-2xl animate-scale-in">
                        {/* Modal Header */}
                        <div className="sticky top-0 z-10 p-6 bg-gradient-to-b from-gray-900 to-transparent">
                            <div className="flex justify-between items-start">
                                <div className="flex items-center gap-4">
                                    <span className="text-5xl">{SECTORS[selectedSector]?.icon}</span>
                                    <div>
                                        <h2 className="text-3xl font-black">{data[selectedSector]?.name}</h2>
                                        <p className="text-gray-400">構成銘柄</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setSelectedSector(null)}
                                    className="p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                                >
                                    ✕
                                </button>
                            </div>
                        </div>

                        {/* Stock List */}
                        <div className="p-6 pt-0 grid grid-cols-1 md:grid-cols-2 gap-3">
                            {data[selectedSector]?.tickers?.map((stock, i) => {
                                const isObject = typeof stock === 'object';
                                const ticker = isObject ? stock.ticker : stock;
                                const change = isObject ? stock.change : null;
                                const price = isObject ? stock.price : null;

                                return (
                                    <a
                                        key={ticker}
                                        href={`https://finance.yahoo.co.jp/quote/${ticker}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex justify-between items-center p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-all border border-transparent hover:border-white/20 group"
                                        style={{ animationDelay: `${i * 50}ms` }}
                                    >
                                        <div>
                                            <div className="font-bold text-white group-hover:text-cyan-400 transition-colors">
                                                {STOCK_NAMES[ticker] || ticker}
                                            </div>
                                            <div className="text-xs text-gray-500 font-mono">{ticker}</div>
                                        </div>
                                        <div className="text-right">
                                            {price !== null ? (
                                                <>
                                                    <div className={`font-bold text-lg ${change > 0 ? 'text-red-400' : change < 0 ? 'text-green-400' : 'text-gray-400'}`}>
                                                        {change > 0 ? '+' : ''}{change}%
                                                    </div>
                                                    <div className="text-xs text-gray-500">¥{price?.toLocaleString()}</div>
                                                </>
                                            ) : (
                                                <div className="text-gray-600">---</div>
                                            )}
                                        </div>
                                    </a>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default App;
