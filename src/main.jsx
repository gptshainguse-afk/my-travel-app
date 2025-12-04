import React, { useState, useEffect, useRef, useMemo } from 'react';
import { createRoot } from 'react-dom/client';
import { createPortal } from 'react-dom';
import { 
  Plane, Hotel, MapPin, Users, Calendar, 
  Utensils, AlertTriangle, Map, DollarSign, 
  Loader2, Sparkles, Train, Globe, Plus, 
  Trash2, ChevronDown, ChevronUp, Heart,
  List, ArrowLeft, BookOpen, Search, Key, 
  MessageSquare, Banknote, Share2, Download, Copy, Check,
  FileJson, Upload, Car, ParkingCircle, CloudSun, Shirt,
  Wallet, PieChart, Coins, MinusCircle, X, UserCog,
  Camera, FileText, Bot, Info, ShieldAlert, Ticket, Save,
  ExternalLink
} from 'lucide-react';

// 【注意】在本地開發時，請取消下一行的註解以載入樣式
import './index.css'; 

// --- 自定義 Hook: 自動處理 localStorage 儲存與讀取 ---
const usePersistentState = (key, initialValue) => {
  const [state, setState] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const item = window.localStorage.getItem(key);
        return item ? JSON.parse(item) : initialValue;
      } catch (error) {
        console.error(`Error reading localStorage key "${key}":`, error);
        return initialValue;
      }
    }
    return initialValue;
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        window.localStorage.setItem(key, JSON.stringify(state));
      } catch (error) {
        console.error(`Error setting localStorage key "${key}":`, error);
      }
    }
  }, [key, state]);

  return [state, setState];
};

// --- 圖片壓縮工具 (避免 Base64 太大塞爆 LocalStorage) ---
const compressImage = (file) => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 800;
        const scaleSize = MAX_WIDTH / img.width;
        canvas.width = MAX_WIDTH;
        canvas.height = img.height * scaleSize;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', 0.7)); // 壓縮品質 0.7
      };
    };
  });
};

// --- JSON 清理工具 (使用 new RegExp 避免編譯錯誤) ---
const cleanJsonResult = (text) => {
  if (!text) return "{}";
  try {
    const firstBrace = text.indexOf('{');
    const lastBrace = text.lastIndexOf('}');
    
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      return text.substring(firstBrace, lastBrace + 1);
    }
    // 使用建構式建立正則，避免與 JSX 語法衝突
    return text.replace(new RegExp('```json', 'g'), '').replace(new RegExp('```', 'g'), '').trim();
  } catch (e) {
    console.error("JSON Clean Error", e);
    return text;
  }
};

// --- 安全渲染文字的輔助函數 ---
const safeRender = (content) => {
  if (content === null || content === undefined) return '';
  if (typeof content === 'string') return content;
  if (typeof content === 'number') return String(content);
  
  if (Array.isArray(content)) {
    return content.map(item => {
      if (typeof item === 'string') return item;
      if (typeof item === 'object' && item !== null) {
        const values = Object.values(item).filter(v => typeof v === 'string' || typeof v === 'number');
        if (values.length > 0) return `• ${values.join(': ')}`;
        return JSON.stringify(item); 
      }
      return String(item);
    }).join('\n');
  }
  
  if (typeof content === 'object') {
     const text = content['description'] || content['text'] || content['content'] || content['desc'];
     if (text) return text;
     const values = Object.values(content).filter(v => typeof v === 'string' || typeof v === 'number');
     if (values.length > 0) return values.join(', ');
     return JSON.stringify(content);
  }
  
  return String(content);
};

// --- AI 深度規劃彈窗元件 (使用 Portal) ---
const DeepDiveModal = ({ isOpen, onClose, data, isLoading, itemTitle, onSavePlan }) => {
  if (!isOpen) return null;

  const mapUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(itemTitle || '')}&travelmode=walking`;

  return createPortal(
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[9999] p-0 md:p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-t-2xl md:rounded-3xl w-full h-[85vh] md:h-auto md:max-h-[85vh] md:max-w-2xl flex flex-col shadow-2xl overflow-hidden animate-in slide-in-from-bottom-10 duration-300 absolute bottom-0 md:relative md:bottom-auto">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-4 md:p-6 flex justify-between items-center shrink-0">
          <div className="text-white overflow-hidden">
            <div className="flex items-center gap-2 text-purple-200 text-xs md:text-sm font-bold mb-1">
              <Sparkles className="w-4 h-4" /> AI 深度導遊
            </div>
            <h3 className="text-lg md:text-2xl font-bold truncate pr-2">{itemTitle}</h3>
          </div>
          <button onClick={onClose} className="bg-white/20 hover:bg-white/30 text-white p-2 rounded-full transition-colors shrink-0">
            <X className="w-5 h-5 md:w-6 md:h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-slate-50 overscroll-contain">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-full space-y-4 text-slate-500">
              <Loader2 className="w-10 h-10 md:w-12 md:h-12 animate-spin text-purple-600" />
              <p className="animate-pulse font-medium text-sm md:text-base">AI 正在實地考察中，請稍候...</p>
            </div>
          ) : data ? (
            <div className="space-y-4 md:space-y-6 pb-4">
               <div className="bg-white p-4 md:p-5 rounded-2xl shadow-sm border border-purple-100">
                  <h4 className="flex items-center gap-2 font-bold text-slate-800 mb-2 md:mb-3 text-base md:text-lg border-b border-slate-100 pb-2">
                    <MapPin className="w-5 h-5 text-purple-500" /> 最佳路線指引
                  </h4>
                  <p className="text-slate-600 leading-relaxed text-sm md:text-base whitespace-pre-wrap">
                    {safeRender(data.route_guide)}
                  </p>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div className="bg-white p-4 md:p-5 rounded-2xl shadow-sm border border-orange-100">
                    <h4 className="flex items-center gap-2 font-bold text-slate-800 mb-2 md:mb-3 text-base md:text-lg border-b border-slate-100 pb-2">
                      <Utensils className="w-5 h-5 text-orange-500" /> 周邊必吃/必逛
                    </h4>
                    <p className="text-slate-600 leading-relaxed text-sm md:text-base whitespace-pre-wrap">
                      {safeRender(data.must_visit_shops)}
                    </p>
                 </div>
                 <div className="bg-white p-4 md:p-5 rounded-2xl shadow-sm border border-red-100">
                    <h4 className="flex items-center gap-2 font-bold text-slate-800 mb-2 md:mb-3 text-base md:text-lg border-b border-slate-100 pb-2">
                      <ShieldAlert className="w-5 h-5 text-red-500" /> 避雷與治安提示
                    </h4>
                    <p className="text-slate-600 leading-relaxed text-sm md:text-base whitespace-pre-wrap">
                      {safeRender(data.safety_alert)}
                    </p>
                 </div>
               </div>

               {/* Map Link */}
               <a 
                 href={mapUrl} 
                 target="_blank" 
                 rel="noreferrer"
                 className="block bg-blue-50/50 p-4 md:p-5 rounded-2xl border border-blue-100 hover:bg-blue-100 transition-colors group cursor-pointer"
               >
                  <h4 className="flex items-center gap-2 font-bold text-blue-800 mb-2 text-sm md:text-base">
                    <Map className="w-5 h-5" /> 迷你地圖導航
                    <ExternalLink className="w-4 h-4 opacity-50 group-hover:opacity-100 transition-opacity ml-auto" />
                  </h4>
                  <p className="text-blue-700 text-sm md:text-base font-medium whitespace-pre-wrap mb-2">
                    {safeRender(data.mini_map_desc)}
                  </p>
                  <div className="text-xs text-blue-500 font-bold mt-2 flex items-center gap-1">
                    點擊開啟 Google Maps 行走路線 <ArrowLeft className="w-3 h-3 rotate-180" />
                  </div>
               </a>
            </div>
          ) : (
            <div className="text-center text-slate-400 py-20 flex flex-col items-center">
              <AlertTriangle className="w-12 h-12 mb-2 text-slate-300" />
              <p>資料讀取失敗，請重試</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-white flex gap-3 justify-end shrink-0 pb-8 md:pb-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-10">
          <button 
            onClick={onClose} 
            className="px-4 py-2 md:px-5 md:py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-colors flex items-center gap-2 text-sm md:text-base"
          >
            <ArrowLeft className="w-4 h-4" /> <span className="hidden md:inline">返回行程</span><span className="md:hidden">返回</span>
          </button>
          {!isLoading && data && (
            <button 
              onClick={() => { onSavePlan(); alert('規劃已儲存！'); }} 
              className="px-4 py-2 md:px-5 md:py-2.5 rounded-xl bg-purple-600 text-white font-bold hover:bg-purple-700 shadow-lg shadow-purple-200 transition-all flex items-center gap-2 text-sm md:text-base"
            >
              <Save className="w-4 h-4" /> <span className="hidden md:inline">儲存規劃</span><span className="md:hidden">儲存</span>
            </button>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};

// --- Simple Pie Chart ---
const SimplePieChart = ({ data, title, currencySymbol = '$' }) => {
  if (!data || data.length === 0) return <div className="text-center text-slate-400 text-sm py-4">尚無資料</div>;
  
  const total = data.reduce((acc, item) => acc + item.value, 0);
  if (total === 0) return <div className="text-center text-slate-400 text-sm py-4">金額為 0</div>;

  let cumulativePercent = 0;
  const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#6366f1', '#84cc16'];

  const slices = data.map((item, index) => {
    const startPercent = cumulativePercent;
    const percent = item.value / total;
    cumulativePercent += percent;
    const endPercent = cumulativePercent;

    const x1 = Math.cos(2 * Math.PI * startPercent);
    const y1 = Math.sin(2 * Math.PI * startPercent);
    const x2 = Math.cos(2 * Math.PI * endPercent);
    const y2 = Math.sin(2 * Math.PI * endPercent);

    const largeArcFlag = percent > 0.5 ? 1 : 0;
    const pathData = percent === 1 
      ? `M 1 0 A 1 1 0 1 1 -1 0 A 1 1 0 1 1 1 0 Z`
      : `M 0 0 L ${x1} ${y1} A 1 1 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;

    return { path: pathData, color: colors[index % colors.length], label: item.label, value: item.value, percent };
  });

  return (
    <div className="flex flex-col items-center">
      <h4 className="text-sm font-bold text-slate-600 mb-3">{title}</h4>
      <div className="flex flex-wrap items-center justify-center gap-6">
        <svg viewBox="-1 -1 2 2" className="w-32 h-32 transform -rotate-90">
          {slices.map((slice, i) => (
            <path key={i} d={slice.path} fill={slice.color} stroke="white" strokeWidth="0.02" />
          ))}
        </svg>
        <div className="space-y-1 text-xs">
          {slices.map((slice, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full" style={{ backgroundColor: slice.color }}></span>
              <span className="text-slate-600 font-medium">{slice.label}</span>
              <span className="text-slate-400">{(slice.percent * 100).toFixed(1)}% ({currencySymbol}{Math.round(slice.value).toLocaleString()})</span>
            </div>
          ))}
        </div>
      </div>
      <div className="mt-2 text-sm font-bold text-slate-800">總計: {currencySymbol}{Math.round(total).toLocaleString()}</div>
    </div>
  );
};

// --- Ledger Summary ---
const LedgerSummary = ({ expenses, dayIndex = null, travelers, currencySettings }) => {
  const [viewMode, setViewMode] = useState('category'); 
  const { symbol } = currencySettings;

  const relevantExpenses = useMemo(() => {
    if (dayIndex !== null) {
      return expenses.filter(e => e.dayIndex === dayIndex);
    }
    return expenses;
  }, [expenses, dayIndex]);

  const categoryData = useMemo(() => {
    const map = {};
    relevantExpenses.forEach(e => {
      map[e.category] = (map[e.category] || 0) + Number(e.amount);
    });
    return Object.entries(map).map(([label, value]) => ({ label, value }));
  }, [relevantExpenses]);

  const personData = useMemo(() => {
    const map = {};
    travelers.forEach(t => map[t] = 0);
    relevantExpenses.forEach(e => {
      const splitAmount = Number(e.amount) / (e.splitters.length || 1);
      e.splitters.forEach(person => {
        map[person] = (map[person] || 0) + splitAmount;
      });
    });
    return Object.entries(map).map(([label, value]) => ({ label, value })).filter(i => i.value > 0);
  }, [relevantExpenses, travelers]);

  if (relevantExpenses.length === 0) {
    return (
      <div className="p-6 bg-slate-50 rounded-xl border border-slate-200 text-center text-slate-400 mt-6 print:hidden">
        <Wallet className="w-8 h-8 mx-auto mb-2 opacity-20" />
        <p>{dayIndex !== null ? '當日尚無記帳資料' : '整趟旅程尚無記帳資料'}</p>
      </div>
    );
  }

  return (
    <div className="mt-8 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden print:break-inside-avoid">
      <div className="bg-slate-100 px-6 py-3 border-b border-slate-200 flex justify-between items-center">
        <h3 className="font-bold text-slate-700 flex items-center gap-2">
          <PieChart className="w-5 h-5 text-blue-600" />
          {dayIndex !== null ? `Day ${dayIndex + 1} 帳本結算` : '整趟旅程 總帳本結算'}
        </h3>
        <div className="flex bg-slate-200 rounded-lg p-1 text-xs font-bold">
          <button 
            onClick={() => setViewMode('category')}
            className={`px-3 py-1 rounded-md transition-all ${viewMode === 'category' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            消費分類
          </button>
          <button 
            onClick={() => setViewMode('person')}
            className={`px-3 py-1 rounded-md transition-all ${viewMode === 'person' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            個人分攤
          </button>
        </div>
      </div>
      <div className="p-6">
        <SimplePieChart 
          data={viewMode === 'category' ? categoryData : personData} 
          title={viewMode === 'category' ? '消費項目比例' : '各旅行者分攤比例'} 
          currencySymbol={symbol}
        />
      </div>
    </div>
  );
};

// --- Expense Form ---
const ExpenseForm = ({ travelers, onSave, onCancel, currencySettings }) => {
  const [form, setForm] = useState({
    item: '', category: '美食', amount: '', payer: travelers[0] || '', splitters: travelers, note: ''
  });

  const isGoDutch = form.payer === '各付各';

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  
  const handleSplitterChange = (name) => {
    setForm(prev => {
      const newSplitters = prev.splitters.includes(name) 
        ? prev.splitters.filter(n => n !== name) 
        : [...prev.splitters, name];
      return { ...prev, splitters: newSplitters };
    });
  };

  const handleSubmit = () => {
    if (!form.item || !form.amount) return alert("請輸入項目名稱與金額");
    
    let finalAmount = Number(form.amount);
    
    if (isGoDutch) {
       finalAmount = finalAmount * form.splitters.length;
    }

    onSave({
      ...form,
      amount: finalAmount,
      note: isGoDutch ? `${form.note} (各付各: 單價 ${form.amount} x ${form.splitters.length}人)` : form.note
    });
  };

  return (
    <div className="mt-3 bg-emerald-50/50 p-4 rounded-lg border border-emerald-100 text-sm animate-in fade-in slide-in-from-top-2">
      <div className="grid grid-cols-2 gap-3 mb-3">
        <div className="col-span-2 md:col-span-1">
           <input name="item" placeholder="消費項目 (如: 拉麵)" value={form.item} onChange={handleChange} className="w-full p-2 border rounded outline-none focus:border-emerald-500" />
        </div>
        <div className="col-span-2 md:col-span-1 relative">
           <div className="absolute left-3 top-2 text-slate-400">{currencySettings.symbol}</div>
           <input 
             name="amount" 
             type="number" 
             placeholder={isGoDutch ? "每人金額 (單價)" : "總金額"} 
             value={form.amount} 
             onChange={handleChange} 
             className="w-full pl-8 p-2 border rounded outline-none focus:border-emerald-500" 
           />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3 mb-3">
        <select name="category" value={form.category} onChange={handleChange} className="p-2 border rounded bg-white">
          <option>美食</option><option>娛樂</option><option>門票</option><option>購物</option><option>交通</option><option>小費</option><option>其他</option>
        </select>
        <select name="payer" value={form.payer} onChange={handleChange} className="p-2 border rounded bg-white">
          {travelers.map(t => <option key={t} value={t}>{t} 先付</option>)}
          <option value="各付各">各付各 (Go Dutch)</option>
        </select>
      </div>
      
      <div className="mb-3 bg-white p-2 rounded border border-slate-100">
        <div className="flex justify-between items-center mb-1">
           <div className="text-xs text-slate-500">分攤者 (預設全員):</div>
           {isGoDutch && <div className="text-xs text-emerald-600 font-bold">總金額將自動計算: {currencySettings.symbol}{Number(form.amount) * form.splitters.length}</div>}
        </div>
        <div className="flex flex-wrap gap-2">
          {travelers.map(t => (
            <label key={t} className="flex items-center gap-1 cursor-pointer px-2 py-1 rounded hover:bg-slate-50 select-none">
              <input type="checkbox" checked={form.splitters.includes(t)} onChange={() => handleSplitterChange(t)} className="w-3 h-3 text-emerald-500 rounded" /> 
              <span className="text-slate-700">{t}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-2 border-t border-emerald-100/50">
        <button onClick={onCancel} className="px-4 py-1.5 text-slate-500 hover:bg-slate-100 rounded text-xs font-medium">取消</button>
        <button onClick={handleSubmit} className="px-4 py-1.5 bg-emerald-500 text-white rounded hover:bg-emerald-600 text-xs font-bold shadow-sm">新增記帳</button>
      </div>
    </div>
  );
};

// --- City Guide ---
const CityGuide = ({ guideData, cities }) => {
  const [selectedCity, setSelectedCity] = useState(cities[0]);
  const currentGuide = guideData[selectedCity];

  if (!currentGuide) return null;

  return (
    <div className="bg-indigo-50/50 border border-indigo-100 rounded-3xl p-6 mb-8 print:break-inside-avoid">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold text-indigo-900 flex items-center gap-2">
          <BookOpen className="w-6 h-6" /> 城市生存指南
        </h3>
        <div className="relative">
          <select 
            value={selectedCity} 
            onChange={(e) => setSelectedCity(e.target.value)}
            className="appearance-none bg-white border border-indigo-200 text-indigo-700 py-2 pl-4 pr-10 rounded-xl font-bold focus:outline-none focus:ring-2 focus:ring-indigo-300 cursor-pointer"
          >
            {cities.map(city => <option key={city} value={city}>{city}</option>)}
          </select>
          <ChevronDown className="absolute right-3 top-3 w-4 h-4 text-indigo-400 pointer-events-none" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-indigo-50">
          <h4 className="font-bold text-indigo-800 mb-3 flex items-center gap-2">
            <Globe className="w-4 h-4" /> 歷史人文
          </h4>
          <p className="text-sm text-slate-600 leading-relaxed">{currentGuide.history_culture}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-indigo-50">
          <h4 className="font-bold text-indigo-800 mb-3 flex items-center gap-2">
            <Ticket className="w-4 h-4" /> 交通與票務
          </h4>
          <p className="text-sm text-slate-600 leading-relaxed">{currentGuide.transport_tips}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-indigo-50">
          <h4 className="font-bold text-red-800 mb-3 flex items-center gap-2">
            <ShieldAlert className="w-4 h-4" /> 治安與詐騙提醒
          </h4>
          <p className="text-sm text-slate-600 leading-relaxed">{currentGuide.safety_scams}</p>
        </div>
      </div>
    </div>
  );
};

// --- Day Timeline ---
const DayTimeline = ({ day, dayIndex, expenses, setExpenses, travelers, currencySettings, isPrintMode = false, apiKey, updateItineraryItem, onSavePlan }) => {
  const [editingExpense, setEditingExpense] = useState(null); 
  const [activeNote, setActiveNote] = useState(null); 
  const [activeDeepDive, setActiveDeepDive] = useState(null);

  const addExpense = (timelineIndex, newItem) => {
    const newExpense = {
      id: Date.now().toString(),
      dayIndex,
      timelineIndex,
      ...newItem
    };
    setExpenses(prev => [...prev, newExpense]);
  };

  const removeExpense = (id) => {
    if(confirm("確定要刪除這筆帳務嗎？")) {
      setExpenses(prev => prev.filter(e => e.id !== id));
    }
  };

  const handlePhotoUpload = async (e, timelineIndex) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const base64 = await compressImage(file);
      const currentItem = day.timeline[timelineIndex];
      const newPhotos = currentItem.photos ? [...currentItem.photos, base64] : [base64];
      
      updateItineraryItem(dayIndex, timelineIndex, { photos: newPhotos });
    } catch (error) {
      console.error("Image upload failed", error);
      alert("圖片處理失敗，請重試");
    }
  };

  const removePhoto = (timelineIndex, photoIndex) => {
    if(!confirm("刪除這張照片？")) return;
    const currentItem = day.timeline[timelineIndex];
    const newPhotos = currentItem.photos.filter((_, i) => i !== photoIndex);
    updateItineraryItem(dayIndex, timelineIndex, { photos: newPhotos });
  };

  const handleNoteChange = (timelineIndex, text) => {
    updateItineraryItem(dayIndex, timelineIndex, { user_notes: text });
  };

  const handleDeepDive = async (timelineIndex, item) => {
    if (item.ai_details) {
      setActiveDeepDive({ timelineIndex, isLoading: false, data: item.ai_details, title: item.title });
      return;
    }

    if (!apiKey) return alert("需要 API Key 才能使用此功能");
    
    setActiveDeepDive({ timelineIndex, isLoading: true, data: null, title: item.title });

    const prompt = `
      針對景點/地點: "${item.title}" (位於 ${day.city}) 進行深度分析。
      請以 JSON 格式回傳，不要有 Markdown 標記，純 JSON 字串。
      請務必回傳合法的 JSON 物件，不要有其他文字。
      包含以下欄位:
      1. "route_guide": 詳細步行或參觀路線建議 (100字以內)
      2. "must_visit_shops": 3間附近必去店舖或攤位 (名稱 + 特色)
      3. "safety_alert": 針對此地的具體治安或避雷提示
      4. "mini_map_desc": 文字描述周邊地圖重點 (例如: "出口X出來直走看到Y地標右轉")
    `;

    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], generationConfig: { responseMimeType: "application/json" } })
      });
      const data = await response.json();
      const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
      const cleanedText = cleanJsonResult(rawText);
      let aiResult = {};
      
      try {
        aiResult = JSON.parse(cleanedText);
      } catch (parseError) {
        console.error("Parse Error", parseError);
        throw new Error("AI 回傳格式無法解析");
      }

      updateItineraryItem(dayIndex, timelineIndex, { ai_details: aiResult });
      
      setActiveDeepDive({ timelineIndex, isLoading: false, data: aiResult, title: item.title });
    } catch (error) {
      console.error(error);
      alert("AI 分析失敗: " + error.message);
      setActiveDeepDive(null);
    }
  };

  const convertToHomeCurrency = (amount) => {
     if (!currencySettings.rate || currencySettings.rate === 0) return '';
     const homeAmount = Math.round(amount * currencySettings.rate);
     return `(≈ NT$${homeAmount.toLocaleString()})`;
  };

  return (
    <div className={`bg-white/80 backdrop-blur rounded-3xl shadow-xl min-h-[600px] overflow-hidden border border-white/50 
      ${isPrintMode ? 'shadow-none border-none bg-white min-h-0 overflow-visible mb-8 break-inside-avoid' : ''}`}>
      
      {/* Day Header */}
      <div className={`bg-slate-800 text-white p-6 md:p-10 relative overflow-hidden 
        ${isPrintMode ? 'bg-white text-black p-0 mb-4 border-b-2 border-slate-800 pb-2' : ''}`}>
        {!isPrintMode && (
          <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -translate-y-1/2 translate-x-1/4 blur-3xl"></div>
        )}
        <div className="relative z-10">
           <h3 className={`text-3xl md:text-5xl font-extrabold mb-2 ${isPrintMode ? 'text-black text-4xl' : ''}`}>
             {isPrintMode && <span className="text-xl block text-slate-500 mb-1">Day {day.day_index}</span>}
             {day.city}
           </h3>
           <p className={`text-blue-200 text-base md:text-xl font-medium flex items-center gap-2 ${isPrintMode ? 'text-slate-700' : ''}`}>
             <Sparkles className={`w-4 h-4 md:w-5 md:h-5 ${isPrintMode ? 'hidden' : ''}`} /> 
             {day.title}
           </p>

           {(day.weather_forecast || day.clothing_suggestion) && (
             <div className={`mt-4 flex flex-wrap gap-4 ${isPrintMode ? 'text-sm mt-2' : 'text-sm md:text-base'}`}>
               {day.weather_forecast && (
                 <div className={`flex items-center gap-2 bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-full border border-white/10 ${isPrintMode ? 'bg-slate-100 border-slate-200 text-slate-800' : 'text-blue-50'}`}>
                   <CloudSun className="w-4 h-4" />
                   <span>{day.weather_forecast}</span>
                 </div>
               )}
               {day.clothing_suggestion && (
                 <div className={`flex items-center gap-2 bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-full border border-white/10 ${isPrintMode ? 'bg-slate-100 border-slate-200 text-slate-800' : 'text-orange-50'}`}>
                   <Shirt className="w-4 h-4" />
                   <span>{day.clothing_suggestion}</span>
                 </div>
               )}
             </div>
           )}
        </div>
      </div>

      {/* Timeline Content */}
      <div className={`p-4 md:p-12 relative ${isPrintMode ? 'p-0' : ''}`}>
        <div className={`absolute left-[35px] md:left-[59px] top-12 bottom-12 w-0.5 bg-gradient-to-b from-slate-200 via-slate-300 to-slate-200 ${isPrintMode ? 'hidden' : ''}`}></div>
        <div className={`space-y-8 md:space-y-12 ${isPrintMode ? 'space-y-6' : ''}`}>
          {day.timeline.map((item, timelineIndex) => (
            <div key={timelineIndex} className="relative flex gap-4 md:gap-8 group break-inside-avoid">
              
              {/* Icon */}
              <div className={`w-10 h-10 md:w-14 md:h-14 rounded-full flex items-center justify-center shrink-0 z-10 border-4 md:border-[6px] border-white shadow-lg transition-transform group-hover:scale-110 
                ${isPrintMode ? 'hidden' : 
                  item.type === 'flight' ? 'bg-indigo-500 text-white' : 
                  item.type === 'meal' ? 'bg-orange-500 text-white' : 
                  item.type === 'transport' ? 'bg-slate-500 text-white' : 
                  item.type === 'activity' ? 'bg-pink-500 text-white' : 
                  'bg-blue-500 text-white'
                }`}>
                {item.type === 'flight' && <Plane className="w-5 h-5 md:w-6 md:h-6" />}
                {item.type === 'transport' && <Train className="w-5 h-5 md:w-6 md:h-6" />}
                {item.type === 'meal' && <Utensils className="w-5 h-5 md:w-6 md:h-6" />}
                {item.type === 'hotel' && <Hotel className="w-5 h-5 md:w-6 md:h-6" />}
                {item.type === 'activity' && <BookOpen className="w-5 h-5 md:w-6 md:h-6" />}
              </div>

              <div className={`flex-1 bg-white border border-slate-100 rounded-2xl p-4 md:p-6 shadow-sm hover:shadow-xl transition-all duration-300 transform 
                ${isPrintMode ? 'shadow-none border-l-4 border-slate-300 rounded-none pl-4 border-t-0 border-r-0 border-b-0 hover:transform-none' : ''}`}>
                
                <div className="flex flex-col md:flex-row justify-between items-start mb-3 md:mb-4 gap-3 md:gap-4">
                  <div>
                    <div className={`inline-flex items-center gap-2 bg-slate-100 text-slate-600 px-2 py-0.5 md:px-3 md:py-1 rounded-full text-[10px] md:text-xs font-bold mb-2 ${isPrintMode ? 'bg-transparent p-0 text-black pl-0' : ''}`}>
                      <span className={`w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-slate-400 ${isPrintMode ? 'hidden' : ''}`}></span>
                      {item.time}
                    </div>
                    <h4 className="font-bold text-xl md:text-2xl text-slate-800 flex flex-wrap items-center gap-2 md:gap-3">
                      {item.title}
                      {item.price_level && (
                        <span className={`text-[10px] md:text-xs px-2 py-0.5 rounded border 
                          ${isPrintMode ? 'border-black text-black' : 
                            item.price_level === 'High' ? 'bg-red-50 text-red-600 border-red-100' : 
                            item.price_level === 'Mid' ? 'bg-yellow-50 text-yellow-600 border-yellow-100' : 
                            'bg-green-50 text-green-600 border-green-100'
                          }`}>
                          {item.price_level === 'High' ? '$$$' : item.price_level === 'Mid' ? '$$' : '$'}
                        </span>
                      )}
                    </h4>
                  </div>
                  
                  {/* Action Bar */}
                  <div className={`flex items-center gap-2 ${isPrintMode ? 'hidden' : ''}`}>
                     <a 
                       href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(item.location_query || item.title)}`} 
                       target="_blank" 
                       rel="noreferrer" 
                       className="p-2 rounded-full hover:bg-blue-50 text-blue-500 transition-colors"
                       title="Google Maps"
                     >
                       <Map className="w-5 h-5" />
                     </a>
                     
                     <button 
                       onClick={() => setActiveNote(activeNote === timelineIndex ? null : timelineIndex)}
                       className={`p-2 rounded-full transition-colors ${item.user_notes ? 'bg-yellow-50 text-yellow-600' : 'hover:bg-slate-50 text-slate-400 hover:text-slate-600'}`}
                       title="備註筆記"
                     >
                       <FileText className="w-5 h-5" />
                     </button>

                     <label className="p-2 rounded-full hover:bg-slate-50 text-slate-400 hover:text-slate-600 cursor-pointer transition-colors" title="上傳照片">
                        <input type="file" accept="image/*" className="hidden" onChange={(e) => handlePhotoUpload(e, timelineIndex)} />
                        <Camera className="w-5 h-5" />
                     </label>

                     <button 
                       onClick={() => handleDeepDive(timelineIndex, item)}
                       className={`p-2 rounded-full hover:bg-purple-50 transition-colors relative ${item.ai_details ? 'text-purple-600 bg-purple-50' : 'text-purple-400'}`}
                       title="AI 深度規劃"
                     >
                        <Bot className="w-5 h-5" />
                     </button>
                  </div>
                </div>
                
                <div className={`text-slate-600 text-sm md:text-base leading-relaxed mb-4 md:mb-6 whitespace-pre-line border-l-4 border-slate-100 pl-3 md:pl-4 py-1 ${isPrintMode ? 'text-black border-none pl-0' : ''}`}>
                  {item.description}
                </div>

                {/* User Notes */}
                {(activeNote === timelineIndex || item.user_notes) && (
                   <div className={`mb-4 ${!activeNote && item.user_notes ? 'block' : activeNote === timelineIndex ? 'block' : 'hidden'}`}>
                      <textarea 
                        value={item.user_notes || ''}
                        onChange={(e) => handleNoteChange(timelineIndex, e.target.value)}
                        placeholder="在此輸入筆記 (例如: 必買清單、訂位代號...)"
                        className="w-full p-3 bg-yellow-50/50 border border-yellow-200 rounded-lg text-sm text-slate-700 focus:ring-2 focus:ring-yellow-200 focus:border-yellow-400 outline-none resize-none min-h-[80px]"
                      />
                   </div>
                )}

                {/* Photo Wall */}
                {item.photos && item.photos.length > 0 && (
                   <div className="flex gap-3 overflow-x-auto pb-2 mb-4 scrollbar-hide">
                      {item.photos.map((photo, pIdx) => (
                        <div key={pIdx} className="relative group/photo shrink-0">
                           <img src={photo} alt="user upload" className="h-24 w-24 object-cover rounded-lg shadow-sm border border-slate-100" />
                           <button 
                             onClick={() => removePhoto(timelineIndex, pIdx)}
                             className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1 opacity-0 group-hover/photo:opacity-100 transition-opacity"
                           >
                              <X className="w-3 h-3" />
                           </button>
                        </div>
                      ))}
                   </div>
                )}

                {/* Transport, Warnings, Menu */}
                {item.transport_detail && (
                  <div className={`bg-slate-50 p-3 md:p-4 rounded-xl mb-3 md:mb-4 flex items-start gap-3 md:gap-4 border border-slate-100 ${isPrintMode ? 'bg-transparent border border-slate-300' : ''}`}>
                    <div className={`bg-white p-2 rounded-full shadow-sm shrink-0 ${isPrintMode ? 'hidden' : ''}`}><Train className="w-4 h-4 text-slate-500" /></div>
                    <div className="text-xs md:text-sm text-slate-600 flex-1"><span className="block font-bold text-slate-800 mb-1">交通建議</span>{item.transport_detail}</div>
                  </div>
                )}
                
                {item.warnings_tips && (
                  <div className={`bg-amber-50 border border-amber-100 p-3 md:p-4 rounded-xl mb-3 md:mb-4 flex items-start gap-3 md:gap-4 ${isPrintMode ? 'bg-transparent border border-black' : ''}`}>
                    <div className={`bg-white p-2 rounded-full shadow-sm shrink-0 ${isPrintMode ? 'hidden' : ''}`}><AlertTriangle className="w-4 h-4 text-amber-500" /></div>
                    <div className="text-xs md:text-sm text-amber-800 flex-1"><span className="block font-bold text-amber-900 mb-1">重要提醒 (Tips)</span>{item.warnings_tips}</div>
                  </div>
                )}

                {item.menu_recommendations && (
                  <div className={`mt-4 md:mt-6 border-t border-slate-100 pt-3 md:pt-4 ${isPrintMode ? 'border-slate-300' : ''}`}>
                    <h5 className="text-xs md:text-sm font-bold text-orange-600 mb-2 md:mb-3 flex items-center gap-2"><Globe className={`w-4 h-4 ${isPrintMode ? 'hidden' : ''}`} /> 點餐翻譯小幫手</h5>
                    <div className={`bg-orange-50/50 rounded-xl overflow-hidden border border-orange-100 overflow-x-auto ${isPrintMode ? 'bg-transparent border-slate-300' : ''}`}>
                      <table className="w-full text-xs md:text-sm text-left min-w-[300px]">
                        <thead className={`bg-orange-100 text-orange-800 ${isPrintMode ? 'bg-slate-100 text-black' : ''}`}>
                          <tr>
                            <th className="p-2 md:p-3 pl-3 md:pl-4 font-bold">當地菜名</th>
                            <th className="p-2 md:p-3 font-bold">中文</th>
                            <th className="p-2 md:p-3 font-bold">預估價格</th>
                          </tr>
                        </thead>
                        <tbody className={`divide-y divide-orange-100 text-slate-700 ${isPrintMode ? 'divide-slate-300' : ''}`}>
                          {item.menu_recommendations.map((menu, mIdx) => (
                            <tr key={mIdx} className={`hover:bg-orange-50 transition-colors ${isPrintMode ? 'hover:bg-transparent' : ''}`}>
                              <td className="p-2 md:p-3 pl-3 md:pl-4 font-medium text-orange-900">{menu.local}</td>
                              <td className="p-2 md:p-3">{menu.cn}</td>
                              <td className="p-2 md:p-3 text-slate-500 font-mono">{menu.price}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Ledger */}
                {!isPrintMode && (
                  <div className="mt-4 pt-4 border-t border-slate-100">
                      <div className="flex items-center justify-between mb-2">
                        <h5 className="text-sm font-bold text-slate-600 flex items-center gap-2"><Wallet className="w-4 h-4 text-emerald-500" /> 記帳小本本</h5>
                        <button onClick={() => setEditingExpense(editingExpense === timelineIndex ? null : timelineIndex)} className="text-xs bg-emerald-50 text-emerald-600 px-2 py-1 rounded hover:bg-emerald-100 transition-colors flex items-center gap-1">
                          {editingExpense === timelineIndex ? <MinusCircle className="w-3 h-3" /> : <Plus className="w-3 h-3" />} {editingExpense === timelineIndex ? '收起' : '新增消費'}
                        </button>
                      </div>

                      <div className="space-y-2">
                        {expenses.filter(e => e.dayIndex === dayIndex && e.timelineIndex === timelineIndex).map(expense => (
                          <div key={expense.id} className="flex justify-between items-center text-xs bg-slate-50 p-2 rounded border border-slate-100">
                            <div className="flex flex-col">
                              <span className="font-bold text-slate-700">{expense.item} ({expense.category})</span>
                              <span className="text-slate-500">{expense.payer} 付款, {expense.splitters.length} 人分攤</span>
                              {expense.note && <span className="text-slate-400 italic scale-90 origin-left">{expense.note}</span>}
                            </div>
                            <div className="flex flex-col items-end gap-0.5">
                              <div className="flex items-center gap-2">
                                <span className="font-mono font-bold text-slate-800">{currencySettings.symbol}{Number(expense.amount).toLocaleString()}</span>
                                <button onClick={() => removeExpense(expense.id)} className="text-red-300 hover:text-red-500"><X className="w-3 h-3" /></button>
                              </div>
                              <span className="text-[10px] text-blue-500 font-medium">{convertToHomeCurrency(expense.amount)}</span>
                            </div>
                          </div>
                        ))}
                      </div>

                      {editingExpense === timelineIndex && (
                        <ExpenseForm 
                          travelers={travelers} 
                          currencySettings={currencySettings}
                          onSave={(newItem) => {
                            addExpense(timelineIndex, newItem);
                            setEditingExpense(null);
                          }} 
                          onCancel={() => setEditingExpense(null)}
                        />
                      )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
        
        <LedgerSummary expenses={expenses} dayIndex={dayIndex} travelers={travelers} currencySettings={currencySettings} />

        {/* --- Deep Dive Modal --- */}
        <DeepDiveModal 
           isOpen={activeDeepDive !== null}
           onClose={() => setActiveDeepDive(null)}
           data={activeDeepDive?.data}
           isLoading={activeDeepDive?.isLoading}
           itemTitle={activeDeepDive?.title}
           onSavePlan={onSavePlan}
        />
      </div>
    </div>
  );
};

const CurrencyModal = ({ onClose, currencySettings, setCurrencySettings }) => {
  const [amount, setAmount] = useState(1000);
  
  const updateRate = (val) => {
    setCurrencySettings(prev => ({ ...prev, rate: val }));
  };

  const updateSymbol = (val) => {
    setCurrencySettings(prev => ({ ...prev, symbol: val }));
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl animate-in zoom-in-95">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold flex items-center gap-2"><Coins className="w-5 h-5 text-yellow-500" /> 匯率與幣別設定</h3>
          <button onClick={onClose}><X className="w-5 h-5 text-slate-400" /></button>
        </div>
        <div className="space-y-4">
          <div className="pt-2 bg-blue-50 p-3 rounded border border-blue-100">
              <label className="text-xs text-blue-600 font-bold block mb-1">目前設定匯率 (1 外幣 = ? 台幣)</label>
              <input 
                type="number" 
                value={currencySettings.rate} 
                onChange={(e) => updateRate(e.target.value)} 
                className="w-full p-2 border rounded text-sm font-mono text-center" 
                step="0.001" 
              />
              <div className="flex gap-2 mt-2">
                <input 
                  placeholder="符號 (如 ¥)" 
                  value={currencySettings.symbol}
                  onChange={(e) => updateSymbol(e.target.value)}
                  className="w-20 p-2 border rounded text-sm text-center"
                />
                <span className="text-xs text-slate-400 self-center flex-1">← 設定當地貨幣符號</span>
              </div>
          </div>

          <hr className="border-slate-100" />

          <div className="flex items-end gap-2">
            <div className="flex-1">
              <label className="text-xs text-slate-500">當地貨幣</label>
              <div className="w-full p-2 bg-slate-100 rounded text-center text-sm text-slate-500">
                {currencySettings.symbol} {amount}
              </div>
            </div>
            <div className="text-center text-slate-400 text-xs pb-3">≈</div>
            <div className="flex-1">
              <label className="text-xs text-slate-500">約合台幣</label>
                <div className="w-full p-2 bg-slate-100 border rounded text-center font-mono text-lg font-bold text-blue-600">
                  NT$ {Math.round(amount * currencySettings.rate).toLocaleString()}
                </div>
            </div>
          </div>
          
          <div className="pt-2">
              <label className="text-xs text-slate-500">試算金額輸入</label>
              <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} className="w-full p-2 border rounded text-sm" />
          </div>
        </div>
      </div>
    </div>
  );
};

const TravelerModal = ({ travelers, setTravelers, onClose }) => {
  const handleChange = (idx, val) => {
    const newT = [...travelers];
    newT[idx] = val;
    setTravelers(newT);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl animate-in zoom-in-95">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold flex items-center gap-2"><Users className="w-5 h-5 text-blue-500" /> 設定旅伴暱稱</h3>
          <button onClick={onClose}><X className="w-5 h-5 text-slate-400" /></button>
        </div>
        <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
          {travelers.map((name, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold">{i + 1}</div>
              <input 
                value={name} 
                onChange={(e) => handleChange(i, e.target.value)}
                className="flex-1 p-2 border rounded focus:ring-2 focus:ring-blue-200 outline-none"
                placeholder={`旅伴 ${i + 1}`} 
              />
            </div>
          ))}
        </div>
        <button onClick={onClose} className="mt-4 w-full py-2 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700">完成</button>
      </div>
    </div>
  );
};

const App = () => {
  const [step, setStep] = useState('input'); 
  const [apiKey, setApiKey] = usePersistentState('gemini_api_key', '');

  const [basicData, setBasicData] = usePersistentState('travel_basic_data', {
    destinations: '福岡',
    dates: '2025-12-08 to 2025-12-12',
    type: '綜合 (購物+文化)',
    travelers: 2,
    hasTransitTour: true,
    isMultiCityFlight: false,
    hasFlights: true,
    transportMode: 'public', 
    needParking: false,
    specialRequests: '',
    priceRanges: { high: false, medium: false, low: false }
  });

  const [simpleFlights, setSimpleFlights] = usePersistentState('travel_simple_flights', {
    outbound: { date: '2025-12-08', time: '16:55', code: 'IT720', airport: 'FUK', type: '去程' },
    transit:  { date: '2025-12-12', time: '12:10', code: 'TW214', airport: 'TAE', type: '中轉' },
    inbound:  { date: '2025-12-12', time: '22:40', code: 'TW663', airport: 'TPE', type: '回程' },
  });

  const [multiFlights, setMultiFlights] = usePersistentState('travel_multi_flights', [
    { id: 1, type: '去程', date: '', time: '', code: '', airport: '', isOpen: true }
  ]);

  const [accommodations, setAccommodations] = usePersistentState('travel_accommodations', [
    { 
      id: 1, type: '飯店', source: 'Agoda', name: '博多站前飯店', 
      address: '福岡市博多區...', orderId: 'AG123456', booker: '王小明', isOpen: true 
    }
  ]);

  const [travelerNames, setTravelerNames] = usePersistentState('traveler_names', ['旅伴 A', '旅伴 B']);
  const [expenses, setExpenses] = usePersistentState('travel_expenses', []);
  
  const [currencySettings, setCurrencySettings] = usePersistentState('currency_settings', {
    rate: 0.21,
    symbol: '$',
    code: 'JPY'
  });
  
  const [isCurrencyModalOpen, setIsCurrencyModalOpen] = useState(false);
  const [isTravelerModalOpen, setIsTravelerModalOpen] = useState(false);

  const [itineraryData, setItineraryData] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [errorMsg, setErrorMsg] = useState('');
  const [savedPlans, setSavedPlans] = useState([]);
  const [isExporting, setIsExporting] = useState(false); 
  const [copySuccess, setCopySuccess] = useState(false);
  const [showCopyMenu, setShowCopyMenu] = useState(false);

  useEffect(() => {
    const count = Number(basicData.travelers);
    if (travelerNames.length !== count) {
      const newNames = [...travelerNames];
      if (count > newNames.length) {
        for (let i = newNames.length; i < count; i++) newNames.push(`旅伴 ${i + 1}`);
      } else {
        newNames.length = count;
      }
      setTravelerNames(newNames);
    }
  }, [basicData.travelers]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('my_travel_plans');
      if (saved) setSavedPlans(JSON.parse(saved));
    } catch (e) {
      console.error("無法讀取儲存的計畫", e);
    }
  }, []);

  const handleBasicChange = (e) => {
    const { name, value, type, checked } = e.target;
    setBasicData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handlePriceChange = (e) => {
    const { name, checked } = e.target;
    setBasicData(prev => ({ ...prev, priceRanges: { ...prev.priceRanges, [name]: checked } }));
  };

  const handleSimpleFlightChange = (key, field, value) => {
    setSimpleFlights(prev => ({ ...prev, [key]: { ...prev[key], [field]: value } }));
  };

  const addMultiFlight = () => setMultiFlights(prev => [...prev.map(f => ({ ...f, isOpen: false })), { id: Date.now(), type: '航段', date: '', time: '', code: '', airport: '', isOpen: true }]);
  const updateMultiFlight = (id, field, value) => setMultiFlights(prev => prev.map(f => f.id === id ? { ...f, [field]: value } : f));
  const toggleMultiFlight = (id) => setMultiFlights(prev => prev.map(f => f.id === id ? { ...f, isOpen: !f.isOpen } : { ...f, isOpen: false }));
  const removeMultiFlight = (id) => setMultiFlights(prev => prev.filter(f => f.id !== id));
  
  const addAccommodation = () => setAccommodations(prev => [...prev.map(a => ({ ...a, isOpen: false })), { id: Date.now(), type: '飯店', source: '', name: '', address: '', orderId: '', booker: '', isOpen: true }]);
  const updateAccommodation = (id, field, value) => setAccommodations(prev => prev.map(a => a.id === id ? { ...a, [field]: value } : a));
  const toggleAccommodation = (id) => setAccommodations(prev => prev.map(a => a.id === id ? { ...a, isOpen: !a.isOpen } : { ...a, isOpen: false }));
  const removeAccommodation = (id) => setAccommodations(prev => prev.filter(a => a.id !== id));

  const resetForm = () => {
    if (confirm('確定要清空所有輸入欄位嗎？')) {
      localStorage.removeItem('travel_basic_data');
      localStorage.removeItem('travel_simple_flights');
      localStorage.removeItem('travel_multi_flights');
      localStorage.removeItem('travel_accommodations');
      localStorage.removeItem('traveler_names');
      localStorage.removeItem('travel_expenses');
      localStorage.removeItem('currency_settings');
      window.location.reload(); 
    }
  };

  const saveCurrentPlan = () => {
    if (!itineraryData) return;
    const existingIndex = savedPlans.findIndex(p => p.created === itineraryData.created);
    let newPlans;
    if (existingIndex >= 0) {
      newPlans = savedPlans.filter((_, idx) => idx !== existingIndex);
    } else {
      const planToSave = { 
        ...itineraryData, 
        basicInfo: basicData, 
        expenses, 
        travelerNames,
        currencySettings,
        created: itineraryData.created || Date.now() 
      };
      newPlans = [planToSave, ...savedPlans];
    }
    setSavedPlans(newPlans);
    localStorage.setItem('my_travel_plans', JSON.stringify(newPlans));
    if (!itineraryData.created) setItineraryData(prev => ({ ...prev, created: Date.now() }));
  };

  const clearApiKey = () => {
    setApiKey('');
    localStorage.removeItem('gemini_api_key');
  };

  const loadSavedPlan = (plan) => {
    setItineraryData(plan);
    setBasicData(plan.basicInfo || basicData);
    if (plan.expenses) setExpenses(plan.expenses);
    if (plan.travelerNames) setTravelerNames(plan.travelerNames);
    if (plan.currencySettings) setCurrencySettings(plan.currencySettings);
    setStep('result');
    setActiveTab(0);
  };

  const isCurrentPlanSaved = () => {
    if (!itineraryData) return false;
    return savedPlans.some(p => p.created === itineraryData.created);
  };

  const handleExportJSON = () => {
    if (!itineraryData) {
      alert('目前沒有可匯出的行程規劃');
      return;
    }
    const dataToExport = {
      version: 2,
      timestamp: Date.now(),
      basicData,
      simpleFlights,
      multiFlights,
      accommodations,
      itineraryData,
      travelerNames,
      expenses,
      currencySettings
    };
    const dataStr = JSON.stringify(dataToExport, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Trip_${basicData.destinations}_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImportJSON = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const imported = JSON.parse(e.target.result);
        if (imported.basicData && imported.itineraryData) {
          if (confirm(`確定要載入 "${imported.basicData.destinations}" 的行程嗎？當前的輸入將被覆蓋。`)) {
            setBasicData(imported.basicData);
            setSimpleFlights(imported.simpleFlights);
            setMultiFlights(imported.multiFlights);
            setAccommodations(imported.accommodations);
            setItineraryData(imported.itineraryData);
            if (imported.travelerNames) setTravelerNames(imported.travelerNames);
            if (imported.expenses) setExpenses(imported.expenses);
            if (imported.currencySettings) setCurrencySettings(imported.currencySettings);
            setStep('result');
            alert('行程載入成功！');
          }
        } else {
          alert('無效的行程檔案格式');
        }
      } catch (err) {
        console.error(err);
        alert('檔案讀取失敗，請確認檔案是否損毀');
      }
      event.target.value = '';
    };
    reader.readAsText(file);
  };

  const handleExportPDF = () => window.print();

  const fallbackCopyTextToClipboard = (text) => {
    var textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.top = "0";
    textArea.style.left = "0";
    textArea.style.position = "fixed";
    textArea.style.opacity = "0"; 
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      var successful = document.execCommand('copy');
      if (successful) {
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
      } else {
        alert('複製失敗，請手動選取文字複製');
      }
    } catch (err) {
      console.error('Fallback: Oops, unable to copy', err);
    }
    document.body.removeChild(textArea);
  };

  const handleShareText = (mode = 'simple') => {
    if (!itineraryData) return;
    let text = `${basicData.destinations}\n`;
    itineraryData.days.forEach(day => {
      text += `\nDay ${day.day_index}\n`;
      day.timeline.forEach(item => {
        if (mode === 'simple') {
          text += `${item.time}｜${item.title}\n`;
        } else {
          const desc = item.description ? item.description.replace(/[\r\n]+/g, ' ').trim() : '';
          text += `${item.time}｜${item.title}｜${desc}\n`;
        }
      });
    });
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(() => {
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
      }).catch(() => fallbackCopyTextToClipboard(text));
    } else {
      fallbackCopyTextToClipboard(text);
    }
    setShowCopyMenu(false);
  };

  const updateItineraryItem = (dayIndex, timelineIndex, updates) => {
     setItineraryData(prev => {
        const newDays = [...prev.days];
        const newTimeline = [...newDays[dayIndex].timeline];
        newTimeline[timelineIndex] = { ...newTimeline[timelineIndex], ...updates };
        newDays[dayIndex].timeline = newTimeline;
        return { ...prev, days: newDays };
     });
  };

  const generateItinerary = async () => {
    if (!apiKey) {
      alert("請輸入您的 Gemini API Key");
      return;
    }
    setStep('loading');
    setErrorMsg('');

    let flightsString = "No flights involved.";
    if (basicData.hasFlights) {
      if (basicData.isMultiCityFlight) {
        flightsString = multiFlights.map(f => `${f.type} | 日期:${f.date} | 時間:${f.time} | 航班:${f.code} | 機場:${f.airport}`).join('\n');
      } else {
        flightsString = `去程 | 日期:${simpleFlights.outbound.date} | 時間:${simpleFlights.outbound.time} | 航班:${simpleFlights.outbound.code} | 機場:${simpleFlights.outbound.airport}\n中轉 | 日期:${simpleFlights.transit.date ? simpleFlights.transit.date : '無'} | 時間:${simpleFlights.transit.time} | 航班:${simpleFlights.transit.code} | 機場:${simpleFlights.transit.airport}\n回程 | 日期:${simpleFlights.inbound.date} | 時間:${simpleFlights.inbound.time} | 航班:${simpleFlights.inbound.code} | 機場:${simpleFlights.inbound.airport}`;
      }
    }

    const accommodationString = accommodations.map(a => `住處:${a.name}(${a.type}) 地址:${a.address}`).join('\n');

    const selectedPrices = [];
    if (basicData.priceRanges.high) selectedPrices.push("高 (1000 TWD+)");
    if (basicData.priceRanges.medium) selectedPrices.push("中 (301-1000 TWD)");
    if (basicData.priceRanges.low) selectedPrices.push("低 (<300 TWD)");
    const priceConstraint = selectedPrices.length > 0 ? selectedPrices.join(', ') : "無限制";

    const transportConstraint = basicData.transportMode === 'self_driving' 
      ? "Self-driving (Prioritize driving routes/distances)" 
      : "Public Transport";
    
    const parkingConstraint = (basicData.transportMode === 'self_driving' && basicData.needParking)
      ? "Include nearby parking lot recommendations with estimated prices for each stop (Activity/Meal)."
      : "";

    const systemPrompt = `
      You are an expert AI Travel Planner API. Respond with valid JSON only.
      User Constraints:
      - Destinations: ${basicData.destinations}
      - Dates: ${basicData.dates}
      - Type: ${basicData.type}
      - Travelers: ${basicData.travelers}
      - Flights: ${flightsString} ${basicData.hasFlights ? "(Use Airport Codes to identify cities. E.g., FUK=Fukuoka, TAE=Daegu)." : "(No flights involved)"}
      - Transport Mode: ${transportConstraint}
      - Parking Info Needed: ${parkingConstraint}
      - Accommodation: ${accommodationString}
      - Transit Tour: ${basicData.hasTransitTour}
      - Special Requests: ${basicData.specialRequests || "None"}
      - Restaurant Budget: ${priceConstraint}
      
      Requirements:
      1. Logistics: Realistic travel times + buffer.
      2. Culture & History: detailed background story for historical sites.
      3. Food: Menu translation (Local | Chinese | Est. Price).
      4. Weather: Provide estimated temperature range (e.g., "10°C - 18°C") and specific clothing advice for the season/weather.
      5. Currency: Identify the primary local currency code (e.g., "JPY") and an approximate exchange rate to TWD (e.g. "0.21").
      6. **City Guide**: Provide a guide for each unique major city visited. Include keys: "history_culture", "transport_tips" (tickets, passes), "safety_scams" (areas to avoid, common scams).
      
      JSON Schema Structure:
      {
        "trip_summary": "String",
        "currency_rate": "String (e.g. '1 JPY = 0.21 TWD')",
        "currency_code": "String (e.g. 'JPY')",
        "city_guides": {
           "CityName": {
             "history_culture": "...",
             "transport_tips": "...",
             "safety_scams": "..."
           }
        },
        "created": ${Date.now()}, 
        "days": [
          {
            "day_index": 1,
            "date": "YYYY-MM-DD",
            "city": "City Name",
            "title": "Theme",
            "weather_forecast": "String", 
            "clothing_suggestion": "String",
            "timeline": [
              {
                "time": "HH:MM",
                "type": "transport" | "activity" | "meal" | "hotel" | "flight",
                "title": "Title",
                "description": "Detailed description",
                "location_query": "Google Maps Query",
                "transport_detail": "Transport Info",
                "price_level": "Low" | "Mid" | "High",
                "warnings_tips": "Important tips",
                "menu_recommendations": [{ "local": "", "cn": "", "price": "" }]
              }
            ]
          }
        ]
      }
    `;

    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: systemPrompt }] }], generationConfig: { responseMimeType: "application/json" } })
      });
      const data = await response.json();
      if (data.error) throw new Error(data.error.message);
      const resultText = data.candidates[0].content.parts[0].text;
      
      // Use cleanJsonResult to ensure the JSON is parseable, removing any markdown code blocks
      const cleanedText = cleanJsonResult(resultText);
      let parsedData;
      
      try {
        parsedData = JSON.parse(cleanedText);
      } catch (parseError) {
        console.error("JSON Parse Error:", parseError);
        throw new Error("無法解析 AI 回傳的行程資料格式");
      }

      if (!parsedData.created) parsedData.created = Date.now();
      
      if (parsedData.currency_code && parsedData.currency_rate) {
        const rateMatch = parsedData.currency_rate.match(/=\s*([\d.]+)/);
        const rate = rateMatch ? parseFloat(rateMatch[1]) : 0.21;
        let symbol = '$';
        if (parsedData.currency_code === 'JPY') symbol = '¥';
        if (parsedData.currency_code === 'KRW') symbol = '₩';
        if (parsedData.currency_code === 'EUR') symbol = '€';
        if (parsedData.currency_code === 'GBP') symbol = '£';
        
        setCurrencySettings({
           rate: rate,
           symbol: symbol,
           code: parsedData.currency_code
        });
      }

      setItineraryData(parsedData);
      setStep('result');
    } catch (error) {
      console.error(error);
      setErrorMsg("生成失敗: " + error.message);
      setStep('input');
    }
  };

  const renderInputForm = () => (
    <div className="max-w-4xl mx-auto bg-white/90 backdrop-blur-md p-6 md:p-8 rounded-3xl shadow-2xl space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 border border-white/20 print:hidden">
       <div className="text-center pb-6 border-b border-slate-100">
        <h1 className="text-3xl md:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-teal-500 flex items-center justify-center gap-3">
          <Sparkles className="w-8 h-8 md:w-10 md:h-10 text-teal-500" />
          AI 智能旅程規劃師
        </h1>
        <p className="text-slate-500 mt-3 text-base md:text-lg">智慧分析航班與機場，為您量身打造深度文化之旅</p>
      </div>

      <div className="space-y-6">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-5 md:p-6 rounded-2xl border border-blue-100 shadow-inner">
          <div className="flex justify-between items-center mb-2">
            <label className="block text-sm font-bold text-blue-800 flex items-center gap-2">
              <Key className="w-4 h-4" /> Gemini API Key (必填)
            </label>
            <div className="flex gap-2">
              <button onClick={resetForm} className="text-xs text-slate-500 hover:text-slate-700 underline transition-colors">重置所有欄位</button>
              {apiKey && <button onClick={clearApiKey} className="text-xs text-red-500 hover:text-red-700 underline transition-colors">清除儲存的 Key</button>}
            </div>
          </div>
          <div className="relative">
             <input type="password" value={apiKey} onChange={(e) => setApiKey(e.target.value)} placeholder="貼上您的 API Key (將自動儲存在本機)" className="w-full pl-4 pr-4 py-3 bg-white border border-blue-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all shadow-sm text-sm md:text-base" />
          </div>
        </div>

        <section className="space-y-4">
          <h3 className="text-lg md:text-xl font-bold text-slate-800 flex items-center gap-2"><span className="bg-blue-100 p-2 rounded-lg text-blue-600"><MapPin className="w-5 h-5" /></span>基本行程</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-600">目的城市</label>
              <input name="destinations" value={basicData.destinations} onChange={handleBasicChange} className="w-full p-3 md:p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm md:text-base" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-600">旅遊日期</label>
              <div className="relative">
                <Calendar className="absolute left-4 top-3.5 md:top-4 w-5 h-5 text-slate-400" />
                <input name="dates" value={basicData.dates} onChange={handleBasicChange} className="w-full pl-12 p-3 md:p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm md:text-base" />
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-600">風格</label>
              <select name="type" value={basicData.type} onChange={handleBasicChange} className="w-full p-3 md:p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all appearance-none text-sm md:text-base">
                <option>休閒 (慢步調)</option>
                <option>購物 (商圈為主)</option>
                <option>文化 (歷史古蹟)</option>
                <option>深度 (在地體驗)</option>
                <option>綜合 (購物+文化)</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-600">人數</label>
              <div className="relative">
                <Users className="absolute left-4 top-3.5 md:top-4 w-5 h-5 text-slate-400" />
                <input type="number" name="travelers" value={basicData.travelers} onChange={handleBasicChange} className="w-full pl-12 p-3 md:p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm md:text-base" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-600">交通偏好</label>
              <div className="relative">
                {basicData.transportMode === 'self_driving' ? <Car className="absolute left-4 top-3.5 md:top-4 w-5 h-5 text-slate-400" /> : <Train className="absolute left-4 top-3.5 md:top-4 w-5 h-5 text-slate-400" />}
                <select name="transportMode" value={basicData.transportMode} onChange={handleBasicChange} className="w-full pl-12 p-3 md:p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all appearance-none text-sm md:text-base">
                  <option value="public">大眾交通</option>
                  <option value="self_driving">自駕</option>
                </select>
              </div>
            </div>
            
            {basicData.transportMode === 'self_driving' && (
              <div className="space-y-2 flex items-center h-full pt-6">
                <label className="flex items-center gap-3 cursor-pointer bg-slate-50 p-3 rounded-xl border border-slate-200 w-full hover:bg-slate-100 transition-colors">
                  <input 
                    type="checkbox" 
                    name="needParking" 
                    checked={basicData.needParking} 
                    onChange={handleBasicChange} 
                    className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500" 
                  />
                  <span className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                    <ParkingCircle className="w-5 h-5 text-slate-500" />
                    是否提供停車資訊
                  </span>
                </label>
              </div>
            )}
          </div>
        </section>

        <hr className="border-slate-100" />

        <section className="space-y-4">
          <h3 className="text-lg md:text-xl font-bold text-slate-800 flex items-center gap-2">
            <span className="bg-purple-100 p-2 rounded-lg text-purple-600"><MessageSquare className="w-5 h-5" /></span>特殊要求與偏好
          </h3>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-600">特殊要求</label>
            <textarea name="specialRequests" value={basicData.specialRequests} onChange={handleBasicChange} rows={2} className="w-full p-3 md:p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm md:text-base" placeholder="例如：一定要吃燒肉、想在天神待久一點..." />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-600 flex items-center gap-2"><Banknote className="w-4 h-4" /> 餐廳價位偏好</label>
            <div className="flex flex-wrap gap-3">
              {[
                { key: 'high', label: '高 (NT$1000+)' },
                { key: 'medium', label: '中 (NT$301-1000)' },
                { key: 'low', label: '低 (NT$300以下)' }
              ].map((price) => (
                <label key={price.key} className="flex items-center gap-2 bg-slate-50 px-4 py-3 rounded-xl border border-slate-200 cursor-pointer hover:bg-slate-100 transition-colors">
                  <input type="checkbox" name={price.key} checked={basicData.priceRanges[price.key]} onChange={handlePriceChange} className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500" />
                  <span className="text-sm font-medium text-slate-700">{price.label}</span>
                </label>
              ))}
            </div>
          </div>
        </section>

        <hr className="border-slate-100" />

        <section className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg md:text-xl font-bold text-slate-800 flex items-center gap-2"><span className="bg-indigo-100 p-2 rounded-lg text-indigo-600"><Plane className="w-5 h-5" /></span>航班資訊</h3>
            
            <div className="flex items-center gap-4">
               <label className="flex items-center gap-2 cursor-pointer hover:bg-slate-50 p-2 rounded-lg transition-colors">
                <input type="checkbox" checked={!basicData.hasFlights} onChange={() => setBasicData(prev => ({ ...prev, hasFlights: !prev.hasFlights }))} className="w-5 h-5 text-slate-500 rounded focus:ring-slate-500" />
                <span className="text-sm font-bold text-slate-600">無 (不需航班)</span>
              </label>

              {basicData.hasFlights && (
                <label className="flex items-center gap-2 cursor-pointer hover:bg-slate-50 p-2 rounded-lg transition-colors">
                  <input type="checkbox" name="isMultiCityFlight" checked={basicData.isMultiCityFlight} onChange={handleBasicChange} className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500" />
                  <span className="text-sm font-bold text-slate-600">複雜航班</span>
                </label>
              )}
            </div>
          </div>
          
          {basicData.hasFlights && (
            !basicData.isMultiCityFlight ? (
            <div className="bg-slate-50/50 p-4 md:p-6 rounded-2xl border border-slate-200 space-y-4 shadow-sm">
              {[ { label: '去程', key: 'outbound', color: 'text-emerald-600' }, { label: '中轉', key: 'transit', color: 'text-amber-600' }, { label: '回程', key: 'inbound', color: 'text-blue-600' } ].map((row) => (
                <div key={row.key} className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
                  <span className={`col-span-1 text-sm font-bold ${row.color} pt-2 md:pt-0`}>{row.label}</span>
                  <div className="col-span-3"><input type="date" value={simpleFlights[row.key].date} onChange={(e) => handleSimpleFlightChange(row.key, 'date', e.target.value)} className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-sm" /></div>
                  <div className="col-span-2"><input type="time" value={simpleFlights[row.key].time} onChange={(e) => handleSimpleFlightChange(row.key, 'time', e.target.value)} className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-sm" /></div>
                  <div className="col-span-4"><input type="text" placeholder="航班" value={simpleFlights[row.key].code} onChange={(e) => handleSimpleFlightChange(row.key, 'code', e.target.value)} className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-sm" /></div>
                  <div className="col-span-2"><input type="text" placeholder="機場" value={simpleFlights[row.key].airport} onChange={(e) => handleSimpleFlightChange(row.key, 'airport', e.target.value)} className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-sm font-mono uppercase text-center" /></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {multiFlights.map((flight) => (
                <div key={flight.id} className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                  <div onClick={() => toggleMultiFlight(flight.id)} className="p-4 flex items-center justify-between cursor-pointer bg-slate-50/50 hover:bg-slate-100">
                    <div className="flex items-center gap-3"><span className="font-bold text-slate-700 bg-white px-3 py-1 rounded-md border border-slate-200 text-sm shadow-sm">{flight.type}</span>{!flight.isOpen && <span className="text-sm text-slate-500">{flight.date} | {flight.code} | {flight.airport}</span>}</div>
                    <div className="flex items-center gap-2"><button onClick={(e) => { e.stopPropagation(); removeMultiFlight(flight.id); }} className="p-2 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-full"><Trash2 className="w-4 h-4" /></button>{flight.isOpen ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}</div>
                  </div>
                  {flight.isOpen && (
                    <div className="p-4 grid grid-cols-2 md:grid-cols-5 gap-4">
                      <input placeholder="類型" value={flight.type} onChange={(e) => updateMultiFlight(flight.id, 'type', e.target.value)} className="p-2.5 border rounded-lg text-sm" />
                      <input type="date" value={flight.date} onChange={(e) => updateMultiFlight(flight.id, 'date', e.target.value)} className="p-2.5 border rounded-lg text-sm" />
                      <input type="time" value={flight.time} onChange={(e) => updateMultiFlight(flight.id, 'time', e.target.value)} className="p-2.5 border rounded-lg text-sm" />
                      <input placeholder="航班" value={flight.code} onChange={(e) => updateMultiFlight(flight.id, 'code', e.target.value)} className="p-2.5 border rounded-lg text-sm" />
                      <input placeholder="機場" value={flight.airport} onChange={(e) => updateMultiFlight(flight.id, 'airport', e.target.value)} className="p-2.5 border rounded-lg text-sm font-mono uppercase" />
                    </div>
                  )}
                </div>
              ))}
              <button onClick={addMultiFlight} className="w-full py-3 border-2 border-dashed border-slate-300 rounded-xl text-slate-500 hover:border-blue-400 flex items-center justify-center gap-2"><Plus className="w-5 h-5" /> 新增航段</button>
            </div>
          ))}

          <div className="flex items-center gap-3 pt-2 bg-blue-50/50 p-4 rounded-xl border border-blue-100">
              <input type="checkbox" id="transitTour" name="hasTransitTour" checked={basicData.hasTransitTour} onChange={handleBasicChange} className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500" />
              <label htmlFor="transitTour" className="text-slate-700 font-bold cursor-pointer text-sm md:text-base">安排轉機入境觀光</label>
          </div>
        </section>

        <hr className="border-slate-100" />

        <section className="space-y-4">
          <h3 className="text-lg md:text-xl font-bold text-slate-800 flex items-center gap-2"><span className="bg-orange-100 p-2 rounded-lg text-orange-600"><Hotel className="w-5 h-5" /></span>住宿資訊</h3>
          <div className="space-y-3">
            {accommodations.map((acc) => (
              <div key={acc.id} className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all">
                <div onClick={() => toggleAccommodation(acc.id)} className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-50">
                  <div className="flex items-center gap-3"><div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold"><Hotel className="w-5 h-5" /></div><div><div className="font-bold text-slate-800 text-sm md:text-base">{acc.name || '新住宿地點'}</div><div className="text-xs text-slate-500">{acc.address}</div></div></div>
                  <div className="flex items-center gap-2"><button onClick={(e) => { e.stopPropagation(); removeAccommodation(acc.id); }} className="p-2 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-full"><Trash2 className="w-4 h-4" /></button>{acc.isOpen ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}</div>
                </div>
                {acc.isOpen && (
                   <div className="p-5 bg-slate-50/50 border-t border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-4">
                      <input value={acc.type} onChange={(e) => updateAccommodation(acc.id, 'type', e.target.value)} className="p-3 border rounded-lg text-sm" placeholder="類型" />
                      <input value={acc.name} onChange={(e) => updateAccommodation(acc.id, 'name', e.target.value)} className="p-3 border rounded-lg text-sm" placeholder="名稱" />
                      <input value={acc.address} onChange={(e) => updateAccommodation(acc.id, 'address', e.target.value)} className="p-3 border rounded-lg text-sm md:col-span-2" placeholder="完整地址" />
                   </div>
                )}
              </div>
            ))}
            <button onClick={addAccommodation} className="w-full py-3 border-2 border-dashed border-slate-300 rounded-xl text-slate-500 flex justify-center items-center gap-2 hover:border-orange-400"><Plus className="w-5 h-5" /> 新增住宿</button>
          </div>
        </section>
      </div>

      <div className="space-y-4 pt-4">
        <button onClick={generateItinerary} className="w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white font-bold py-5 rounded-2xl shadow-xl hover:shadow-2xl hover:scale-[1.01] transform transition-all flex justify-center items-center gap-3 text-lg md:text-xl ring-4 ring-blue-100">
          <Sparkles className="w-6 h-6 animate-pulse" /> 開始 AI 一鍵規劃
        </button>
        <button onClick={() => setStep('saved_list')} className="w-full bg-white border-2 border-slate-200 text-slate-600 font-bold py-4 rounded-2xl hover:bg-slate-50 hover:border-slate-300 transition-all flex justify-center items-center gap-2">
          <List className="w-5 h-5" /> 查看已儲存的規劃 ({savedPlans.length})
        </button>
      </div>
      {errorMsg && <div className="p-4 bg-red-50 text-red-600 rounded-xl flex items-center gap-2 border border-red-100 animate-shake"><AlertTriangle className="w-5 h-5" />{errorMsg}</div>}
    </div>
  );
};

const rootElement = document.getElementById('root');
if (rootElement) {
  const root = createRoot(rootElement);
  root.render(<React.StrictMode><App /></React.StrictMode>);
} else {
  console.error("找不到 root 元素，請確認 index.html 包含 <div id='root'></div>");
}
