import React, { useState, useMemo, useEffect } from 'react';
import { 
  LineChart, Line, BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import { 
  ShoppingBag, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  DollarSign, 
  Package, 
  Smartphone, 
  Headphones, 
  Watch, 
  Laptop,
  Monitor
} from 'lucide-react';

// --- MOCK DATA GENERATOR ---
const generateHistory = (basePrice, volatility, trend) => {
  const data = [];
  const now = new Date();
  let currentPrice = basePrice;
  
  for (let i = 365; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    
    const change = (Math.random() - 0.5) * volatility;
    currentPrice += change + trend;
    if (currentPrice < basePrice * 0.5) currentPrice = basePrice * 0.5;

    const salesBase = 10000 / currentPrice; 
    const sales = Math.floor(salesBase * (0.8 + Math.random() * 0.4) * (i % 7 === 0 ? 1.5 : 1));
    const sellers = Math.floor(5 + Math.random() * 10 + (sales / 10));

    data.push({
      date: date.toISOString().split('T')[0],
      price: Math.round(currentPrice),
      sales: sales,
      sellers: sellers,
      revenue: Math.round(currentPrice * sales)
    });
  }
  return data;
};

const PRODUCTS_DB = {
  wb: [
    { id: 'wb-1', name: 'iPhone 15 Pro Max 256GB', category: 'Смартфоны', price: 135000, image: <Smartphone />, trend: 12, history: generateHistory(130000, 500, 5) },
    { id: 'wb-2', name: 'Xiaomi Robot Vacuum S10', category: 'Бытовая техника', price: 18900, image: <Package />, trend: -2, history: generateHistory(19000, 100, -1) },
    { id: 'wb-3', name: 'AirPods Pro 2', category: 'Наушники', price: 24000, image: <Headphones />, trend: 5, history: generateHistory(23000, 200, 2) },
    { id: 'wb-4', name: 'Dyson Supersonic HD07', category: 'Красота и здоровье', price: 45000, image: <Package />, trend: 8, history: generateHistory(42000, 300, 3) },
    { id: 'wb-5', name: 'Samsung Galaxy Watch 6', category: 'Умные часы', price: 22000, image: <Watch />, trend: 0, history: generateHistory(25000, 150, -2) },
  ],
  ozon: [
    { id: 'oz-1', name: 'ASUS TUF Gaming F15', category: 'Ноутбуки', price: 85000, image: <Laptop />, trend: 15, history: generateHistory(80000, 400, 10) },
    { id: 'oz-2', name: 'Sony WH-1000XM5', category: 'Наушники', price: 34000, image: <Headphones />, trend: 3, history: generateHistory(32000, 200, 1) },
    { id: 'oz-3', name: 'Яндекс Станция Макс', category: 'Умный дом', price: 29990, image: <Package />, trend: 25, history: generateHistory(27000, 50, 5) },
    { id: 'oz-4', name: 'Samsung Monitor Odyssey', category: 'Мониторы', price: 41000, image: <Monitor />, trend: -5, history: generateHistory(45000, 300, -3) },
    { id: 'oz-5', name: 'Logitech MX Master 3S', category: 'Периферия', price: 9500, image: <Package />, trend: 1, history: generateHistory(9000, 20, 0.5) },
  ],
  ali: [
    { id: 'ali-1', name: 'Lenovo Legion Y700', category: 'Планшеты', price: 32000, image: <Smartphone />, trend: 45, history: generateHistory(28000, 200, 8) },
    { id: 'ali-2', name: 'Anker Soundcore Q45', category: 'Наушники', price: 7500, image: <Headphones />, trend: 10, history: generateHistory(6000, 50, 3) },
    { id: 'ali-3', name: 'Baseus Power Bank 65W', category: 'Аксессуары', price: 4200, image: <Package />, trend: 8, history: generateHistory(3500, 20, 2) },
    { id: 'ali-4', name: 'Creality Ender 3 V3', category: '3D Принтеры', price: 19000, image: <Package />, trend: -1, history: generateHistory(21000, 150, -4) },
    { id: 'ali-5', name: 'Zeblaze Stratos 3', category: 'Умные часы', price: 5500, image: <Watch />, trend: 4, history: generateHistory(5000, 30, 1) },
  ]
};

// --- COMPONENTS ---

const Card = ({ children, className = "" }) => (
  <div className={`bg-white rounded-xl border border-slate-200 shadow-sm ${className}`}>
    {children}
  </div>
);

const Badge = ({ trend }) => {
  const isPositive = trend > 0;
  const isNeutral = trend === 0;
  return (
    <span className={`text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1 w-fit
      ${isPositive ? 'bg-green-100 text-green-700' : isNeutral ? 'bg-slate-100 text-slate-600' : 'bg-red-100 text-red-700'}`}>
      {isPositive ? <TrendingUp size={12} /> : isNeutral ? null : <TrendingDown size={12} />}
      {Math.abs(trend)}%
    </span>
  );
};

const PlatformSelector = ({ active, onSelect }) => {
  const platforms = [
    { id: 'wb', name: 'Wildberries', color: 'bg-purple-600' },
    { id: 'ozon', name: 'Ozon', color: 'bg-blue-500' },
    { id: 'ali', name: 'AliExpress', color: 'bg-orange-500' },
  ];

  return (
    <div className="flex p-1 bg-slate-100 rounded-lg mb-6">
      {platforms.map((p) => (
        <button
          key={p.id}
          onClick={() => onSelect(p.id)}
          className={`flex-1 py-2 text-sm font-medium rounded-md transition-all duration-200
            ${active === p.id 
              ? 'bg-white text-slate-900 shadow-sm' 
              : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'}`}
        >
          {p.name}
        </button>
      ))}
    </div>
  );
};

// --- MAIN APPLICATION ---

export default function MarketplaceAnalytics() {
  const [platform, setPlatform] = useState('wb');
  const [selectedProductId, setSelectedProductId] = useState(PRODUCTS_DB['wb'][0].id);
  const [timeRange, setTimeRange] = useState('month');

  // Derived State
  const products = PRODUCTS_DB[platform];
  const selectedProduct = useMemo(() => 
    products.find(p => p.id === selectedProductId) || products[0], 
  [products, selectedProductId]);

  // Сброс выбора при смене платформы
  useEffect(() => {
    setSelectedProductId(PRODUCTS_DB[platform][0].id);
  }, [platform]);

  // Filter Data Logic
  const filteredData = useMemo(() => {
    const history = selectedProduct.history;
    const daysMap = { 'week': 7, 'month': 30, 'half': 180, 'year': 365 };
    const days = daysMap[timeRange];
    return history.slice(-days);
  }, [selectedProduct, timeRange]);

  const totalSales = filteredData.reduce((acc, curr) => acc + curr.sales, 0);
  const avgPrice = Math.round(filteredData.reduce((acc, curr) => acc + curr.price, 0) / filteredData.length);
  const maxSellers = Math.max(...filteredData.map(d => d.sellers));

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans flex flex-col lg:flex-row overflow-hidden">
      
      {/* --- LEFT PANEL --- */}
      <aside className="w-full lg:w-[35%] h-full flex flex-col border-r border-slate-200 bg-white z-10">
        <div className="p-6 pb-4 border-b border-slate-100">
          <h1 className="text-xl font-bold flex items-center gap-2 mb-6 text-slate-900">
            <div className="p-2 bg-indigo-600 rounded-lg text-white">
              <TrendingUp size={20} />
            </div>
            MarketAnalytic
          </h1>
          <PlatformSelector active={platform} onSelect={setPlatform} />
          <div className="flex justify-between items-center text-sm text-slate-500 font-medium">
            <span>Топ товаров (Электроника)</span>
            <span>Рейтинг</span>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {products.map((product) => (
            <div
              key={product.id}
              onClick={() => setSelectedProductId(product.id)}
              className={`group p-3 rounded-xl cursor-pointer transition-all border
                ${selectedProductId === product.id 
                  ? 'bg-indigo-50 border-indigo-200 shadow-sm ring-1 ring-indigo-200' 
                  : 'bg-white border-slate-100 hover:border-indigo-100 hover:bg-slate-50'}`}
            >
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-slate-400
                  ${selectedProductId === product.id ? 'bg-indigo-200 text-indigo-700' : 'bg-slate-100'}`}>
                  {product.image}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className={`text-sm font-semibold truncate ${selectedProductId === product.id ? 'text-indigo-900' : 'text-slate-700'}`}>
                    {product.name}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">{product.category}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-sm">{product.price.toLocaleString()} ₽</p>
                  <div className="mt-1 flex justify-end">
                    <Badge trend={product.trend} />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </aside>

      {/* --- RIGHT PANEL --- */}
      <main className="flex-1 h-screen overflow-y-auto p-4 lg:p-8 bg-slate-50">
        <header className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">{selectedProduct.name}</h2>
            <p className="text-slate-500 text-sm mt-1">Аналитика по артикулу: {selectedProduct.id.toUpperCase()}</p>
          </div>
          <div className="flex bg-white rounded-lg shadow-sm border border-slate-200 p-1">
            {['week', 'month', 'half', 'year'].map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-colors capitalize
                  ${timeRange === range ? 'bg-slate-800 text-white' : 'text-slate-500 hover:bg-slate-100'}`}
              >
                {range === 'half' ? '6 мес.' : range === 'week' ? 'Неделя' : range === 'month' ? 'Месяц' : 'Год'}
              </button>
            ))}
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="p-5 flex items-center gap-4">
            <div className="p-3 bg-blue-100 text-blue-600 rounded-lg"><DollarSign size={24} /></div>
            <div>
              <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Средняя цена</p>
              <h3 className="text-2xl font-bold text-slate-800">{avgPrice.toLocaleString()} ₽</h3>
            </div>
          </Card>
          <Card className="p-5 flex items-center gap-4">
            <div className="p-3 bg-emerald-100 text-emerald-600 rounded-lg"><ShoppingBag size={24} /></div>
            <div>
              <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Продажи (шт)</p>
              <h3 className="text-2xl font-bold text-slate-800">{totalSales.toLocaleString()}</h3>
            </div>
          </Card>
          <Card className="p-5 flex items-center gap-4">
            <div className="p-3 bg-purple-100 text-purple-600 rounded-lg"><Users size={24} /></div>
            <div>
              <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Конкуренты (макс)</p>
              <h3 className="text-2xl font-bold text-slate-800">{maxSellers}</h3>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 gap-6">
          <Card className="p-6">
            <div className="mb-6">
              <h3 className="text-lg font-bold text-slate-800">Динамика цен</h3>
            </div>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={filteredData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="date" tickFormatter={(str) => { const date = new Date(str); return `${date.getDate()}.${date.getMonth() + 1}`; }} stroke="#94A3B8" fontSize={12} tickMargin={10} />
                  <YAxis stroke="#94A3B8" fontSize={12} tickFormatter={(val) => `${val / 1000}k`} />
                  <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} formatter={(value) => [`${value.toLocaleString()} ₽`, 'Цена']} labelFormatter={(label) => new Date(label).toLocaleDateString()} />
                  <Line type="monotone" dataKey="price" stroke="#2563EB" strokeWidth={3} dot={false} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>
          
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <Card className="p-6">
              <div className="mb-6"><h3 className="text-lg font-bold text-slate-800">Объем продаж</h3></div>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={filteredData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                    <XAxis dataKey="date" hide />
                    <YAxis stroke="#94A3B8" fontSize={12} />
                    <Tooltip cursor={{ fill: '#F1F5F9' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} formatter={(value) => [value, 'Продаж']} labelFormatter={(label) => new Date(label).toLocaleDateString()} />
                    <Bar dataKey="sales" fill="#10B981" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
            <Card className="p-6">
              <div className="mb-6"><h3 className="text-lg font-bold text-slate-800">Конкуренция</h3></div>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={filteredData}>
                    <defs>
                      <linearGradient id="colorSellers" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                    <XAxis dataKey="date" hide />
                    <YAxis stroke="#94A3B8" fontSize={12} />
                    <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} formatter={(value) => [value, 'Продавцов']} />
                    <Area type="monotone" dataKey="sellers" stroke="#8B5CF6" fillOpacity={1} fill="url(#colorSellers)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
