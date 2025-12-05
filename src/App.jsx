import React, { useState, useEffect, useRef, Suspense, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Text, Float, Stars, OrbitControls, MeshDistortMaterial, Sphere, Box, RoundedBox } from '@react-three/drei';
import * as THREE from 'three';
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

const INITIAL_DATA = {
    "AI_Robot": { name: "AI・ロボット", change: 0, tickers: [], color: "#00ffff", icon: "🤖" },
    "Quantum": { name: "量子技術", change: 0, tickers: [], color: "#ff00ff", icon: "⚛️" },
    "Semi": { name: "半導体・通信", change: 0, tickers: [], color: "#00ff00", icon: "📱" },
    "Bio": { name: "バイオ・ヘルスケア", change: 0, tickers: [], color: "#ff00aa", icon: "💊" },
    "Fusion": { name: "核融合", change: 0, tickers: [], color: "#ffaa00", icon: "☀️" },
    "Space": { name: "宇宙", change: 0, tickers: [], color: "#ffffff", icon: "🚀" }
};

// Animated Particles Background
function ParticleField({ count = 500 }) {
    const mesh = useRef();
    const [positions] = useState(() => {
        const pos = new Float32Array(count * 3);
        for (let i = 0; i < count * 3; i += 3) {
            pos[i] = (Math.random() - 0.5) * 50;
            pos[i + 1] = (Math.random() - 0.5) * 50;
            pos[i + 2] = (Math.random() - 0.5) * 50;
        }
        return pos;
    });

    useFrame((state) => {
        if (mesh.current) {
            mesh.current.rotation.y = state.clock.elapsedTime * 0.02;
            mesh.current.rotation.x = state.clock.elapsedTime * 0.01;
        }
    });

    return (
        <points ref={mesh}>
            <bufferGeometry>
                <bufferAttribute
                    attach="attributes-position"
                    count={count}
                    array={positions}
                    itemSize={3}
                />
            </bufferGeometry>
            <pointsMaterial size={0.08} color="#00ffff" transparent opacity={0.6} sizeAttenuation />
        </points>
    );
}

// Floating 3D Sector Card
function SectorCard({ position, sector, data, onClick, index }) {
    const mesh = useRef();
    const [hovered, setHovered] = useState(false);

    useFrame((state) => {
        if (mesh.current) {
            mesh.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5 + index) * 0.1;
            mesh.current.position.y = position[1] + Math.sin(state.clock.elapsedTime + index * 0.5) * 0.15;
        }
    });

    const isPositive = data.change > 0;

    return (
        <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5}>
            <group
                ref={mesh}
                position={position}
                onClick={onClick}
                onPointerOver={() => setHovered(true)}
                onPointerOut={() => setHovered(false)}
            >
                <RoundedBox args={[2.5, 1.8, 0.1]} radius={0.1} smoothness={4}>
                    <meshPhysicalMaterial
                        color={hovered ? data.color : "#111111"}
                        metalness={0.9}
                        roughness={0.1}
                        transparent
                        opacity={0.9}
                        envMapIntensity={1}
                    />
                </RoundedBox>

                {/* Glow effect */}
                <RoundedBox args={[2.6, 1.9, 0.05]} radius={0.1} position={[0, 0, -0.1]}>
                    <meshBasicMaterial color={data.color} transparent opacity={hovered ? 0.4 : 0.1} />
                </RoundedBox>

                {/* Sector Name */}
                <Text
                    position={[0, 0.4, 0.1]}
                    fontSize={0.2}
                    color="#ffffff"
                    anchorX="center"
                    anchorY="middle"
                    font="/fonts/NotoSansJP-Bold.otf"
                >
                    {data.name || sector}
                </Text>

                {/* Change Percentage */}
                <Text
                    position={[0, -0.2, 0.1]}
                    fontSize={0.4}
                    color={isPositive ? "#ff4444" : "#44ff44"}
                    anchorX="center"
                    anchorY="middle"
                >
                    {isPositive ? "+" : ""}{data.change?.toFixed(2) || "0.00"}%
                </Text>
            </group>
        </Float>
    );
}

// Central Rotating Sphere
function CentralSphere() {
    const mesh = useRef();

    useFrame((state) => {
        if (mesh.current) {
            mesh.current.rotation.y = state.clock.elapsedTime * 0.2;
            mesh.current.rotation.x = state.clock.elapsedTime * 0.1;
        }
    });

    return (
        <Sphere ref={mesh} args={[1.5, 64, 64]} position={[0, 0, 0]}>
            <MeshDistortMaterial
                color="#0066ff"
                attach="material"
                distort={0.4}
                speed={2}
                roughness={0.2}
                metalness={0.8}
            />
        </Sphere>
    );
}

// 3D Scene Component
function Scene({ data, historyData, onSectorClick }) {
    const sectorKeys = Object.keys(data);
    const radius = 5;

    // Compute sector change from historyData
    const getSectorChange = (key) => {
        if (!historyData || historyData.length < 2) return 0;
        const newsDateStr = "2025-11-26";
        const newsDataPoint = historyData.find(d => d.date >= newsDateStr) || historyData[historyData.length - 1];
        const currentDataPoint = historyData[historyData.length - 1];
        if (newsDataPoint && currentDataPoint) {
            const vNews = newsDataPoint[key] || 0;
            const vCurrent = currentDataPoint[key] || 0;
            return ((vCurrent - vNews) / (100 + vNews)) * 100;
        }
        return 0;
    };

    return (
        <>
            <ambientLight intensity={0.3} />
            <pointLight position={[10, 10, 10]} intensity={1} color="#00ffff" />
            <pointLight position={[-10, -10, -10]} intensity={0.5} color="#ff00ff" />
            <spotLight position={[0, 10, 0]} intensity={0.8} color="#ffffff" angle={0.5} />

            <Stars radius={100} depth={50} count={3000} factor={4} saturation={0} fade speed={1} />
            <ParticleField count={300} />

            <CentralSphere />

            {sectorKeys.map((key, index) => {
                const angle = (index / sectorKeys.length) * Math.PI * 2;
                const x = Math.cos(angle) * radius;
                const z = Math.sin(angle) * radius;
                const sectorData = {
                    ...data[key],
                    change: getSectorChange(key),
                    color: INITIAL_DATA[key]?.color || "#ffffff"
                };

                return (
                    <SectorCard
                        key={key}
                        position={[x, 0, z]}
                        sector={key}
                        data={sectorData}
                        onClick={() => onSectorClick(key)}
                        index={index}
                    />
                );
            })}

            <OrbitControls
                enableZoom={true}
                enablePan={false}
                maxPolarAngle={Math.PI / 1.5}
                minPolarAngle={Math.PI / 3}
                autoRotate
                autoRotateSpeed={0.5}
            />
        </>
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
                    setLastUpdated(new Date(json.last_updated).toLocaleString('ja-JP', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }));
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

    return (
        <div className="w-full h-screen bg-black relative overflow-hidden">
            {/* 3D Canvas */}
            <Canvas
                camera={{ position: [0, 5, 12], fov: 60 }}
                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
            >
                <Suspense fallback={null}>
                    <Scene
                        data={data}
                        historyData={historyData}
                        onSectorClick={(key) => setSelectedSector(key)}
                    />
                </Suspense>
            </Canvas>

            {/* UI Overlay */}
            <div className="absolute inset-0 pointer-events-none">
                {/* Header */}
                <header className="p-6 pointer-events-auto">
                    <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 tracking-tight">
                        JAPAN TECH 6
                    </h1>
                    <p className="text-cyan-400/60 mt-1 font-mono text-sm tracking-widest">NATIONAL STRATEGIC SECTORS</p>

                    {nikkeiPrice && (
                        <div className="mt-4 inline-flex items-center gap-3 px-4 py-2 bg-black/50 backdrop-blur-xl rounded-xl border border-white/10">
                            <span className="text-red-500 font-bold">NIKKEI 225</span>
                            <span className="text-white text-xl font-mono">¥{nikkeiPrice.toLocaleString()}</span>
                        </div>
                    )}
                </header>

                {/* Chart Toggle Button */}
                <div className="absolute bottom-6 left-6 pointer-events-auto">
                    <button
                        onClick={() => setShowChart(!showChart)}
                        className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-xl font-bold text-white shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50 transition-all hover:scale-105"
                    >
                        {showChart ? '3D VIEW' : 'CHART VIEW'}
                    </button>
                </div>

                {/* Last Updated */}
                <div className="absolute bottom-6 right-6 text-white/40 text-xs font-mono pointer-events-auto">
                    Last Updated: {lastUpdated}
                </div>
            </div>

            {/* Chart Overlay */}
            {showChart && (
                <div className="absolute inset-0 bg-black/90 backdrop-blur-xl z-50 p-8 overflow-auto">
                    <div className="max-w-6xl mx-auto">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-3xl font-bold text-white">MARKET TREND</h2>
                            <div className="flex gap-2">
                                {['1M', '6M', 'YTD', 'ALL'].map((range) => (
                                    <button
                                        key={range}
                                        onClick={() => setTimeRange(range)}
                                        className={`px-4 py-2 font-bold rounded-lg transition-all ${timeRange === range
                                                ? 'bg-gradient-to-r from-cyan-500 to-purple-500 text-white'
                                                : 'bg-white/10 text-white/60 hover:bg-white/20'
                                            }`}
                                    >
                                        {range}
                                    </button>
                                ))}
                                <button
                                    onClick={() => setShowChart(false)}
                                    className="ml-4 px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30"
                                >
                                    CLOSE
                                </button>
                            </div>
                        </div>

                        <div className="h-[500px] bg-white/5 rounded-2xl p-6 border border-white/10">
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
                                    <ReferenceLine x="2024-11-26" stroke="#ff00ff" strokeDasharray="3 3" />

                                    <Line type="monotone" dataKey="Nikkei225" stroke="#ff0000" strokeWidth={2} dot={false} name="日経225" />
                                    <Line type="monotone" dataKey="AI_Robot" stroke="#00ffff" strokeWidth={2} dot={false} name="AI・ロボット" />
                                    <Line type="monotone" dataKey="Semi" stroke="#00ff00" strokeWidth={2} dot={false} name="半導体" />
                                    <Line type="monotone" dataKey="Bio" stroke="#ff00aa" strokeWidth={2} dot={false} name="バイオ" />
                                    <Line type="monotone" dataKey="Quantum" stroke="#ff00ff" strokeWidth={2} dot={false} name="量子" />
                                    <Line type="monotone" dataKey="Fusion" stroke="#ffaa00" strokeWidth={2} dot={false} name="核融合" />
                                    <Line type="monotone" dataKey="Space" stroke="#ffffff" strokeWidth={2} dot={false} name="宇宙" />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            )}

            {/* Sector Detail Modal */}
            {selectedSector && (
                <div className="absolute inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-xl" onClick={() => setSelectedSector(null)} />
                    <div className="relative w-full max-w-3xl max-h-[80vh] overflow-y-auto bg-gradient-to-br from-gray-900 to-black rounded-3xl border border-white/20 shadow-2xl">
                        <div className="p-8">
                            <div className="flex justify-between items-start mb-8">
                                <div>
                                    <div className="text-5xl mb-2">{INITIAL_DATA[selectedSector]?.icon}</div>
                                    <h2 className="text-3xl font-black text-white">{data[selectedSector]?.name}</h2>
                                </div>
                                <button
                                    onClick={() => setSelectedSector(null)}
                                    className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white"
                                >
                                    ✕
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {data[selectedSector]?.tickers?.map((stock) => {
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
                                            className="flex justify-between items-center p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-all border border-white/10 group"
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
                </div>
            )}
        </div>
    );
}

export default App;
