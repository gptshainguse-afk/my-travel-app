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
  ExternalLink, MessageCircle, CreditCard, Landmark, Gift, 
  CheckCircle2, Image as ImageIcon, ChefHat, Edit3, RefreshCw,
  Palmtree, Fish, Bird, CarFront, Tent,Cloud, Pin, PlusCircle, Clock, Sun
} from 'lucide-react';

// 【注意】在本地開發時，請取消下一行的註解以載入樣式
import './index.css'; 

// --- 自定義 Hook: 自動處理 localStorage 儲存與讀取 ---

const ISSUING_COUNTRIES = [
  { code: 'TW', name: '台灣 (Taiwan)' },
  { code: 'JP', name: '日本 (Japan)' },
  { code: 'KR', name: '韓國 (South Korea)' },
  { code: 'CN', name: '中國 (China)' },
  { code: 'HK', name: '香港 (Hong Kong)' },
  { code: 'SG', name: '新加坡 (Singapore)' },
  { code: 'MY', name: '馬來西亞 (Malaysia)' },
  { code: 'TH', name: '泰國 (Thailand)' },
  { code: 'VN', name: '越南 (Vietnam)' },
  { code: 'US', name: '美國 (USA)' },
  { code: 'CA', name: '加拿大 (Canada)' },
  { code: 'UK', name: '英國 (UK)' },
  { code: 'AU', name: '澳洲 (Australia)' },
  { code: 'EU', name: '歐洲 (Europe)' },
  { code: 'OTHER', name: '其他 (Other)' }
];
const deepMerge = (target, source) => {
  const result = { ...target };
  if (source && typeof source === 'object') {
    Object.keys(source).forEach(key => {
      // 如果是物件且不是陣列，則遞迴合併
      if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
        result[key] = deepMerge(result[key] || {}, source[key]);
      } else {
        // 否則直接覆蓋 (保留用戶的輸入)
        result[key] = source[key];
      }
    });
  }
  return result;
};
const usePersistentState = (key, initialValue) => {
  const [state, setState] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const item = window.localStorage.getItem(key);
        if (item) {
          const parsed = JSON.parse(item);
          // 使用深度合併，確保新舊資料結構相容
          if (typeof initialValue === 'object' && !Array.isArray(initialValue) && initialValue !== null && parsed !== null) {
            return deepMerge(initialValue, parsed);
          }
          return parsed !== null ? parsed : initialValue;
        }
        return initialValue;
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

const cleanJsonResult = (text) => {
  if (!text) return "{}";
  try {
    // 1. 先移除 Markdown 標記 (```json 和 ```)
    let cleaned = text.replace(/```json/gi, '').replace(/```/g, '');
    
    // 2. 尋找第一個 '{' 和最後一個 '}'
    const firstOpen = cleaned.indexOf('{');
    const lastClose = cleaned.lastIndexOf('}');
    
    // 3. 如果有找到合法的括號，就只擷取中間這段
    if (firstOpen !== -1 && lastClose !== -1 && lastClose > firstOpen) {
      cleaned = cleaned.substring(firstOpen, lastClose + 1);
    }
    
    return cleaned.trim();
  } catch (e) {
    console.error("JSON Clean Error", e);
    return "{}";
  }
};

// --- 圖片壓縮工具 ---
const compressImage = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 800; // 限制最大寬度，節省 iOS 記憶體
        let width = img.width;
        let height = img.height;

        if (width > MAX_WIDTH) {
          height *= MAX_WIDTH / width;
          width = MAX_WIDTH;
        }

        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        // 強制輸出為 jpeg，品質 0.7
        resolve(canvas.toDataURL('image/jpeg', 0.7)); 
      };
      img.onerror = (error) => reject(error);
    };
    
    reader.onerror = (error) => reject(error);
  });
};

// --- 安全渲染文字 ---
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

// --- AI 深度規劃彈窗 (Portal) ---
const DeepDiveModal = ({ isOpen, onClose, data, isLoading, itemTitle, onRegenerate }) => {
  if (!isOpen) return null;
  
  const getMultiStopMapUrl = () => {
    if (data?.walking_route && Array.isArray(data.walking_route) && data.walking_route.length > 0) {
      const cleanWaypoints = data.walking_route.map(pt => {
         return pt.replace(/^(起點|途經\d*|終點)[:：]\s*/, '').trim();
      });
      const path = cleanWaypoints.map(w => encodeURIComponent(w)).join('/');
      return `https://www.google.com/maps/dir/${path}/data=!4m2!4m1!3e2`;
    }
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(itemTitle || '')}`;
  };

  const mapUrl = getMultiStopMapUrl();

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
               {/* 路線指引 */}
               <div className="bg-white p-4 md:p-5 rounded-2xl shadow-sm border border-purple-100">
                  <h4 className="flex items-center gap-2 font-bold text-slate-800 mb-2 md:mb-3 text-base md:text-lg border-b border-slate-100 pb-2">
                    <MapPin className="w-5 h-5 text-purple-500" /> 最佳路線指引
                  </h4>
                  <p className="text-slate-600 leading-relaxed text-sm md:text-base whitespace-pre-wrap">
                    {safeRender(data.route_guide)}
                  </p>
                  {data.walking_route && (
                    <div className="mt-3 flex flex-wrap gap-2 items-center text-xs md:text-sm text-slate-500 bg-slate-50 p-3 rounded-lg">
                       <span className="font-bold text-purple-600">路線規劃：</span>
                       {data.walking_route.map((pt, idx) => (
                          <React.Fragment key={idx}>
                             {idx > 0 && <span className="text-slate-300">➝</span>}
                             <span className="bg-white border border-slate-200 px-2 py-1 rounded text-slate-700 shadow-sm">{pt.replace(/^(起點|途經\d*|終點)[:：]\s*/, '')}</span>
                          </React.Fragment>
                       ))}
                    </div>
                  )} 
               </div>

               {/* 必吃與治安 */}
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
                    <Map className="w-5 h-5" /> 
                    {data.walking_route ? '開啟多點步行導航 (A➝B➝C)' : '迷你地圖導航'}
                    <ExternalLink className="w-4 h-4 opacity-50 group-hover:opacity-100 transition-opacity ml-auto" />
                  </h4>
                  <p className="text-blue-700 text-sm md:text-base font-medium whitespace-pre-wrap mb-2">
                    {safeRender(data.mini_map_desc)}
                  </p>
                  <div className="text-xs text-blue-500 font-bold mt-2 flex items-center gap-1">
                    點擊開啟 Google Maps {data.walking_route ? '查看完整路線' : '行走路線'} <ArrowLeft className="w-3 h-3 rotate-180" />
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

        {/* Footer Buttons */}
        <div className="p-4 border-t border-slate-100 bg-white flex gap-3 justify-end shrink-0 pb-8 md:pb-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-10">
          <button 
            onClick={onClose} 
            className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-colors"
          >
            返回
          </button>
          {!isLoading && data && (
            <button 
              onClick={onRegenerate} 
              className="px-5 py-2.5 rounded-xl bg-purple-600 text-white font-bold hover:bg-purple-700 shadow-lg shadow-purple-200 transition-all flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" /> 重新生成
            </button>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};

// --- Simple Pie Chart ---
const SimplePieChart = ({ data, title }) => {
  if (!data || data.length === 0) return <div className="text-center text-slate-400 text-sm py-4">尚無資料</div>;
  
  // 計算總金額 (全部轉為台幣)
  const totalTWD = data.reduce((acc, item) => acc + item.valueTWD, 0);

  if (totalTWD === 0) return <div className="text-center text-slate-400 text-sm py-4">金額為 0</div>;

  let cumulativePercent = 0;
  const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#6366f1', '#84cc16'];

  const slices = data.map((item, index) => {
    const startPercent = cumulativePercent;
    // 使用台幣價值來計算百分比
    const percent = item.valueTWD / totalTWD;
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

    return { path: pathData, color: colors[index % colors.length], label: item.label, valueTWD: item.valueTWD, percent };
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
            <div key={i} className="flex items-center gap-2 flex-wrap">
              <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: slice.color }}></span>
              <span className="text-slate-600 font-medium">{slice.label}</span>
              <span className="text-slate-400">
                {(slice.percent * 100).toFixed(1)}% 
                {/* 顯示台幣金額 */}
                <span className="ml-1 text-blue-500 font-bold font-mono">
                  NT${Math.round(slice.valueTWD).toLocaleString()}
                </span>
              </span>
            </div>
          ))}
        </div>
      </div>
      
      {/* 總金額顯示區 */}
      <div className="mt-3 flex flex-col items-center border-t border-slate-100 pt-2 w-full">
        <div className="text-sm font-bold text-slate-800">
           總計 (約合台幣): <span className="text-blue-600">NT${Math.round(totalTWD).toLocaleString()}</span>
        </div>
        <div className="text-[10px] text-slate-400">
           *因包含多種幣別，統一轉換為台幣統計
        </div>
      </div>
    </div>
  );
};

// --- Ledger Summary ---
const LedgerSummary = ({ expenses, dayIndex = null, travelers, currencySettings }) => {
  const [viewMode, setViewMode] = useState('category'); 
  // 注意：這裡我們不再依賴全域 currencySettings 來計算總額，而是依賴每一筆帳目自己的匯率

  const relevantExpenses = useMemo(() => {
    if (dayIndex !== null) {
      return expenses.filter(e => e.dayIndex === dayIndex);
    }
    return expenses;
  }, [expenses, dayIndex]);

  // 輔助函數：取得該筆消費的台幣價值
  const getTWDValue = (expense) => {
      // 優先使用該筆帳紀錄的匯率，如果沒有(舊資料)，則使用當前全域匯率
      const rate = expense.exchangeRate || currencySettings.rate || 0.21;
      return Number(expense.amount) * rate;
  };

  // 1. 消費分類 (以台幣計算)
  const categoryData = useMemo(() => {
    const map = {};
    relevantExpenses.forEach(e => {
      const val = getTWDValue(e);
      map[e.category] = (map[e.category] || 0) + val;
    });
    return Object.entries(map).map(([label, valueTWD]) => ({ label, valueTWD }));
  }, [relevantExpenses, currencySettings.rate]);

  // 2. 個人支出 (以台幣計算)
  const personalData = useMemo(() => {
    const map = {};
    travelers.forEach(t => map[t] = 0);
    relevantExpenses.forEach(e => {
      const totalValTWD = getTWDValue(e);
      const splitVal = totalValTWD / (e.splitters.length || 1);
      e.splitters.forEach(person => {
        map[person] = (map[person] || 0) + splitVal;
      });
    });
    return Object.entries(map).map(([label, valueTWD]) => ({ label, valueTWD })).filter(i => i.valueTWD > 0);
  }, [relevantExpenses, travelers, currencySettings.rate]);

  // 3. 代墊分攤 (以台幣計算)
  const sharedData = useMemo(() => {
    const map = {};
    travelers.forEach(t => map[t] = 0);
    relevantExpenses.forEach(e => {
      if (e.splitters && e.splitters.length > 1 && e.payer !== '各付各') {
          const payer = e.payer;
          if (map[payer] !== undefined) {
             // 累加的是台幣價值
             map[payer] += getTWDValue(e);
          }
      }
    });
    return Object.entries(map).map(([label, valueTWD]) => ({ label, valueTWD })).filter(i => i.valueTWD > 0);
  }, [relevantExpenses, travelers, currencySettings.rate]);

  // 4. 自動結算建議 (以台幣計算)
  const settlementSuggestions = useMemo(() => {
    if (viewMode !== 'shared') return [];

    const balances = {}; // 紀錄每個人欠款或應收的「台幣」金額
    travelers.forEach(t => balances[t] = 0);

    relevantExpenses.forEach(e => {
       if (e.splitters && e.splitters.length > 1 && e.payer !== '各付各') {
           const amountTWD = getTWDValue(e);
           
           // 付款人：+ 台幣價值
           if (balances[e.payer] !== undefined) balances[e.payer] += amountTWD;

           // 分攤人：- 應付的台幣價值
           const splitAmountTWD = amountTWD / e.splitters.length;
           e.splitters.forEach(p => {
               if (balances[p] !== undefined) balances[p] -= splitAmountTWD;
           });
       }
    });

    let debtors = [];
    let creditors = [];

    Object.entries(balances).forEach(([name, amount]) => {
        const val = Math.round(amount); 
        if (val < -1) debtors.push({ name, amount: val });
        else if (val > 1) creditors.push({ name, amount: val });
    });

    debtors.sort((a, b) => a.amount - b.amount); 
    creditors.sort((a, b) => b.amount - a.amount);

    const suggestions = [];
    let i = 0; 
    let j = 0; 

    while (i < debtors.length && j < creditors.length) {
        const debtor = debtors[i];
        const creditor = creditors[j];
        const amountToSettle = Math.min(Math.abs(debtor.amount), creditor.amount);

        if (amountToSettle > 0) {
            suggestions.push({
                from: debtor.name,
                to: creditor.name,
                amount: amountToSettle
            });
        }
        debtor.amount += amountToSettle;
        creditor.amount -= amountToSettle;
        if (Math.abs(debtor.amount) < 1) i++;
        if (creditor.amount < 1) j++;
    }

    return suggestions;
  }, [relevantExpenses, travelers, viewMode, currencySettings.rate]);


  const currentData = viewMode === 'category' ? categoryData 
                    : viewMode === 'personal' ? personalData 
                    : sharedData;

  const getTitle = () => {
      if (viewMode === 'category') return '消費項目比例 (台幣)';
      if (viewMode === 'personal') return '個人總消費 (含獨享/台幣)';
      return '代墊公款總額 (台幣)';
  };

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
      <div className="bg-slate-100 px-4 py-3 border-b border-slate-200 flex flex-col md:flex-row justify-between items-center gap-3">
        <h3 className="font-bold text-slate-700 flex items-center gap-2">
          <PieChart className="w-5 h-5 text-blue-600" />
          {dayIndex !== null ? `Day ${dayIndex + 1} 帳本結算 (自動轉匯台幣)` : '整趟旅程 總帳本結算 (自動轉匯台幣)'}
        </h3>
        
        <div className="flex bg-slate-200 rounded-lg p-1 text-[10px] md:text-xs font-bold w-full md:w-auto">
          <button 
            onClick={() => setViewMode('category')}
            className={`flex-1 md:flex-none px-3 py-1.5 rounded-md transition-all ${viewMode === 'category' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            消費分類
          </button>
          <button 
            onClick={() => setViewMode('personal')}
            className={`flex-1 md:flex-none px-3 py-1.5 rounded-md transition-all ${viewMode === 'personal' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            個人支出
          </button>
          <button 
            onClick={() => setViewMode('shared')}
            className={`flex-1 md:flex-none px-3 py-1.5 rounded-md transition-all ${viewMode === 'shared' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            代墊分攤
          </button>
        </div>
      </div>
      
      <div className="p-6">
        <SimplePieChart 
          data={currentData} 
          title={getTitle()} 
          currencySettings={currencySettings}
        />
        
        {viewMode === 'shared' && (
            <div className="mt-6 pt-4 border-t border-slate-100">
                {settlementSuggestions.length > 0 ? (
                    <div className="bg-blue-50/50 rounded-xl p-4 border border-blue-100">
                        <h5 className="font-bold text-blue-800 text-sm mb-3 flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4" /> 結算建議 (最終應付台幣)
                        </h5>
                        <div className="space-y-2">
                            {settlementSuggestions.map((item, idx) => (
                                <div key={idx} className="flex justify-between items-center text-sm bg-white p-2 rounded-lg border border-blue-50 shadow-sm">
                                    <div className="flex items-center gap-2">
                                        <span className="font-bold text-slate-700">{item.from}</span>
                                        <span className="text-slate-400 text-xs">➜ 應給 ➜</span>
                                        <span className="font-bold text-blue-600">{item.to}</span>
                                    </div>
                                    <div className="text-right">
                                        <div className="font-mono font-bold text-slate-800">
                                            NT$ {item.amount.toLocaleString()}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <p className="text-[10px] text-blue-400 mt-2 text-center">* 系統已自動將所有不同幣別之消費轉換為台幣進行平帳計算</p>
                    </div>
                ) : (
                    currentData.length > 0 && (
                        <div className="text-center text-xs text-green-600 font-bold bg-green-50 p-2 rounded-lg border border-green-100">
                            🎉 帳目已平衡，不需要互相轉帳！
                        </div>
                    )
                )}
                
                {currentData.length === 0 && (
                    <div className="text-center text-xs text-slate-400 mt-2">
                        (目前沒有多人代墊款項)
                    </div>
                )}
            </div>
        )}
      </div>
    </div>
  );
};
// --- Expense Form ---
const ExpenseForm = ({ travelers, onSave, onCancel, currencySettings, initialData }) => {
  // 預設表單狀態
  const isSoloTraveler = travelers.length === 1;
  const defaultForm = {
    item: '', 
    category: '美食', 
    amount: '', 
    // ✅ 修正：如果是單人，預設 payer 就是「個人消費」；多人則預設第一位旅伴
    payer: isSoloTraveler ? '個人消費' : (travelers[0] || ''), 
    // ✅ 修正：如果是單人，分攤者預設就是他自己 (雖然下面會隱藏，但邏輯要對)
    splitters: isSoloTraveler ? travelers : travelers, 
    note: '',
    currencyCode: currencySettings.code, 
    exchangeRate: currencySettings.rate
  };

  const [form, setForm] = useState(defaultForm);
  

  // 當 initialData 改變時 (代表進入編輯模式)，填入資料
  useEffect(() => {
    if (initialData) {
      let displayAmount = initialData.amount;
      // 處理各付各的顯示金額
      if (initialData.payer === '各付各' && initialData.splitters.length > 0) {
         displayAmount = displayAmount / initialData.splitters.length;
      }
      setForm({
        ...initialData,
        amount: displayAmount
      });
    } else {
      setForm(defaultForm); 
    }
  }, [initialData]);

  // 判斷當前模式
  const isGoDutch = form.payer === '各付各';
  const isPersonal = form.payer === '個人消費';

  // 處理欄位變更
  const handleChange = (e) => {
      const { name, value } = e.target;
      setForm(prev => {
          let newSplitters = prev.splitters;

          // 特殊邏輯：當切換付款人模式時，重置分攤者勾選狀態
          if (name === 'payer') {
              if (value === '個人消費') {
                  newSplitters = []; // 切換到個人消費：預設不勾選任何人
              } else if (value === '各付各') {
                  newSplitters = travelers; // 切換到各付各：預設全選
              } else {
                  // 切換回一般代墊：如果之前是空的(從個人消費切回來)，則全選
                  if (prev.payer === '個人消費') newSplitters = travelers;
              }
          }
          return { ...prev, [name]: value, splitters: newSplitters };
      });
  };
  
  // 處理分攤者勾選
  const handleSplitterChange = (name) => {
    setForm(prev => {
      // 如果是「個人消費」模式，且已經有勾選別人，則改成單選 (Radio 行為)
      // 或是維持多選但由 handleSubmit 擋下 (這裡採用維持多選介面，但邏輯上通常只選一人)
      const newSplitters = prev.splitters.includes(name) 
        ? prev.splitters.filter(n => n !== name) 
        : [...prev.splitters, name];
      return { ...prev, splitters: newSplitters };
    });
  };

  const handleSubmit = () => {
    if (!form.item || !form.amount) return alert("請輸入項目名稱與金額");
    
    // 防呆：個人消費必須選擇歸屬者
    if (isPersonal && form.splitters.length === 0) {
        return alert("請勾選這筆消費是「誰的」？");
    }
    if (isPersonal && form.splitters.length > 1) {
        return alert("「個人消費」只能勾選一個人。如果是多人請改用「各付各」或指定某人先付。");
    }

    let finalAmount = Number(form.amount);
    let finalPayer = form.payer;
    let finalNote = form.note;

    // 邏輯轉換：
    // 1. 各付各：總金額 = 單價 * 人數
    if (isGoDutch) {
       finalAmount = finalAmount * form.splitters.length;
       finalNote = `${form.note} (${form.currencyCode} 各付各: ${form.amount} x ${form.splitters.length}人)`;
    }

    // 2. 個人消費：轉換為「某人先付，且只有某人分攤」
    if (isPersonal) {
        const owner = form.splitters[0]; // 抓出那個唯一被勾選的人
        finalPayer = owner; // 付款人變成他
        // 分攤者維持 [owner]，金額維持原輸入金額
        finalNote = `${form.note} (個人私帳)`;
    }

    onSave({
      ...form,
      amount: finalAmount,
      payer: finalPayer, // 儲存時，將「個人消費」轉為具體的人名
      note: finalNote
    });
  };

  return (
    <div className="mt-3 bg-emerald-50/50 p-4 rounded-lg border border-emerald-100 text-sm animate-in fade-in slide-in-from-top-2 relative">
      <div className="absolute -top-3 left-4 bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded text-xs font-bold border border-emerald-200">
         {initialData ? '🖊️ 編輯消費' : '✨ 新增消費'}
      </div>

      <div className="grid grid-cols-2 gap-3 mb-3 mt-2">
        <div className="col-span-2 md:col-span-1">
           <input name="item" placeholder="消費項目 (如: 拉麵)" value={form.item} onChange={handleChange} className="w-full p-2 border rounded outline-none focus:border-emerald-500" />
        </div>
        <div className="col-span-2 md:col-span-1 relative">
           <div className="absolute left-3 top-2 text-slate-400 font-bold">{currencySettings.symbol}</div>
           <input 
             name="amount" 
             type="number" 
             placeholder={isGoDutch ? "每人金額 (單價)" : "總金額"} 
             value={form.amount} 
             onChange={handleChange} 
             className="w-full pl-8 p-2 border rounded outline-none focus:border-emerald-500" 
           />
           <div className="absolute right-2 top-2.5 text-[10px] text-emerald-600 bg-emerald-100 px-1.5 rounded">
             匯率 {form.exchangeRate}
           </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-3">
        <select name="category" value={form.category} onChange={handleChange} className="p-2 border rounded bg-white">
          <option>美食</option><option>娛樂</option><option>門票</option><option>購物</option><option>交通</option><option>小費</option><option>其他</option>
        </select>
        <select 
          name="payer" 
          value={form.payer} 
          onChange={handleChange} 
          className="p-2 border rounded bg-white"
          // 如果只有一人，強制鎖定且不可選 (雖然下面只會 render 一個選項，但加 disabled 更保險)
          disabled={travelers.length === 1} 
        >
          {travelers.length === 1 ? (
             /* 情境 A: 只有一人旅行 -> 只顯示個人消費 */
             <option value="個人消費">個人消費 (私帳)</option>
          ) : (
             /* 情境 B: 多人旅行 -> 顯示完整選項 */
             <>
               {travelers.map(t => <option key={t} value={t}>{t} 先付</option>)}
               <option value="各付各">各付各 (Go Dutch)</option>
               <option value="個人消費">個人消費 (私帳)</option>
             </>
          )}
        </select>
      </div>
      
      <div className={`mb-3 p-2 rounded border transition-colors ${isPersonal ? 'bg-orange-50 border-orange-200' : 'bg-white border-slate-100'}`}>
        <div className="flex justify-between items-center mb-1">
           {/* 根據模式改變標題 */}
           <div className={`text-xs ${isPersonal ? 'text-orange-600 font-bold' : 'text-slate-500'}`}>
             {isPersonal ? '誰的消費? (請勾選 1 人)' : '分攤者 (預設全員):'}
           </div>
           
           {isGoDutch && <div className="text-xs text-emerald-600 font-bold">總金額: {currencySettings.symbol}{Number(form.amount) * form.splitters.length}</div>}
        </div>
        
        <div className="flex flex-wrap gap-2">
          {travelers.map(t => (
            <label key={t} className="flex items-center gap-1 cursor-pointer px-2 py-1 rounded hover:bg-slate-50 select-none">
              <input type="checkbox" checked={form.splitters.includes(t)} onChange={() => handleSplitterChange(t)} className={`w-3 h-3 rounded ${isPersonal ? 'text-orange-500 focus:ring-orange-500' : 'text-emerald-500 focus:ring-emerald-500'}`} /> 
              <span className="text-slate-700">{t}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-2 border-t border-emerald-100/50">
        <button onClick={onCancel} className="px-4 py-1.5 text-slate-500 hover:bg-slate-100 rounded text-xs font-medium">取消</button>
        <button onClick={handleSubmit} className="px-4 py-1.5 bg-emerald-500 text-white rounded hover:bg-emerald-600 text-xs font-bold shadow-sm">
            {initialData ? '儲存修改' : '新增記帳'}
        </button>
      </div>
    </div>
  );
};
const FunLoading = ({ destination }) => {
  const [progress, setProgress] = useState(0);
  const [messageIndex, setMessageIndex] = useState(0);

  const funMessages = [
    `正在打包 AI 的虛擬行李...`,
    `正在與 ${destination} 的當地貓咪打好關係...`,
    `正在計算最佳拉麵湯頭/美食比例...`,
    `正在幫您預測哪天會出大太陽...`,
    `正在跟 Google Maps 吵架找最佳路線...`,
    `正在搜尋哪裡的廁所最乾淨...`,
    `AI 導遊正在繫緊鞋帶準備出發...`,
    `正在幫您省下每一分冤枉錢...`,
    `正在為了您的信用卡回饋精打細算...` 
  ];

  useEffect(() => {
    // 立即執行一次，避免畫面剛出來是空白
    const timer = setInterval(() => {
      setProgress(prev => {
        // 優化後的進度條邏輯：
        // 1. 0-30%: 快速衝刺 (啟動感)
        // 2. 30-70%: 穩定前進 (處理感)
        // 3. 70-85%: 變慢 (思考感)
        // 4. 85%+: 極慢並卡在 95% (等待感，不會讓人覺得當機)
        
        if (prev >= 95) return 95; // 卡在 95%，等待 API 回傳
        
        let increment = 0;
        if (prev < 30) increment = 2;       // 快
        else if (prev < 70) increment = 0.5; // 中
        else if (prev < 85) increment = 0.1; // 慢
        else increment = 0.02;               // 龜速 (85%~95%)

        return prev + increment;
      });
    }, 50); // 更新頻率加快，動畫更流暢

    const msgInterval = setInterval(() => {
      setMessageIndex(prev => (prev + 1) % funMessages.length);
    }, 2500);

    return () => {
      clearInterval(timer);
      clearInterval(msgInterval);
    };
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 animate-in fade-in duration-500">
      <div className="w-full max-w-md space-y-6 text-center">
        
        {/* 動畫 Icon */}
        <div className="relative inline-block">
          <div className="absolute inset-0 bg-blue-400 blur-2xl opacity-20 rounded-full animate-pulse"></div>
          <Plane className="w-16 h-16 text-blue-600 animate-bounce relative z-10" />
        </div>

        {/* 趣味文字 */}
        <div className="h-16 flex items-center justify-center">
             <h2 className="text-xl md:text-2xl font-bold text-slate-700 animate-in slide-in-from-bottom-2 fade-in duration-500 key={messageIndex}">
               {funMessages[messageIndex]}
             </h2>
        </div>

        {/* 進度條 */}
        <div className="w-full bg-slate-100 rounded-full h-4 overflow-hidden shadow-inner border border-slate-200 relative">
          <div 
            className="bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 h-full rounded-full transition-all duration-300 ease-out relative"
            style={{ width: `${progress}%` }}
          >
              <div className="absolute inset-0 bg-white/30 w-full h-full animate-[shimmer_2s_infinite] border-t border-white/20"></div>
          </div>
        </div>
        
        <div className="flex justify-between text-xs font-bold text-slate-400 font-mono">
          <span>START</span>
          <span>{Math.floor(progress)}%</span>
          <span>READY</span>
        </div>
      </div>
    </div>
  );
};
const CreditCardPlanner = ({ city, issuingCountry, countryName, bankList, apiKey, onSave, savedAnalysis, modelType }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedBanks, setSelectedBanks] = useState([]);
  const [otherBanks, setOtherBanks] = useState(''); 
  const [includeTop3, setIncludeTop3] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(savedAnalysis || null); 

  useEffect(() => {
    if (savedAnalysis) setAnalysisResult(savedAnalysis);
  }, [savedAnalysis]);

  const toggleBank = (bank) => {
    setSelectedBanks(prev => 
      prev.includes(bank) ? prev.filter(b => b !== bank) : [...prev, bank]
    );
  };

  const handleAnalyze = async () => {
    if (!apiKey) return alert("需要 API Key 才能分析信用卡回饋");
    
    const manualBanks = otherBanks.split(/[,，、]/).map(s => s.trim()).filter(s => s);
    const allBanks = [...selectedBanks, ...manualBanks];

    if (allBanks.length === 0 && !includeTop3) return alert("請至少選擇一家銀行、輸入其他銀行，或勾選推薦前三名");

    setIsAnalyzing(true);
    setAnalysisResult(null); 
    
    const TARGET_MODEL = modelType === 'pro' ? 'gemini-2.5-pro' : 'gemini-2.5-flash';    
    
    const banksStr = allBanks.length > 0 ? allBanks.join(', ') : "不指定特定銀行";
    const prompt = `
      我來自 ${countryName} (代碼: ${issuingCountry})，即將前往 "${city}" 旅遊。
      請針對以下條件進行信用卡回饋分析：
      1. 使用者持有的銀行/發卡機構: ${banksStr}
      2. 額外需求: 請推薦該國(${countryName})發行，在 "${city}" 最好用的 "前3名信用卡" (Top 3)。

      請以 JSON 格式回傳，包含兩個陣列：
      1. "bank_recommendations": 針對使用者勾選的銀行，列出該銀行最強的旅遊卡 (現金回饋 與 里程回饋 各一張，若無則略過)。
         欄位: { "bank": "銀行名", "card_name": "卡名", "type": "現金/里程", "reward_desc": "回饋內容簡述", "condition": "簡單條件 (如: 需登錄/有上限)" }
      2. "top_3_general": 不分銀行，推薦前三名最強卡片。
         欄位: { "card_name": "卡名", "bank": "發行銀行", "type": "現金/里程", "reason": "推薦理由" }

      純 JSON，不要 Markdown。
    `;

    try {
      console.log(`正在嘗試主模型: ${TARGET_MODEL}...`);
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${TARGET_MODEL}:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], generationConfig: { responseMimeType: "application/json" } })
      });
      const data = await response.json();
      
      if (data.error) {
         console.warn(`主模型 ${TARGET_MODEL} 失敗，啟動自動修復 (2.5 Flash preview)...`);
         const fallbackResp = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], generationConfig: { responseMimeType: "application/json" } })
         });
         const fallbackData = await fallbackResp.json();
         if (fallbackData.error) throw new Error(fallbackData.error.message);
         const rawText = fallbackData.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
         setAnalysisResult(JSON.parse(cleanJsonResult(rawText)));
      } else {
         const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
         setAnalysisResult(JSON.parse(cleanJsonResult(rawText)));
      }
    } catch (e) {
      console.error(e);
      alert("分析失敗: " + e.message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="mt-4 bg-gradient-to-br from-slate-50 to-blue-50/30 rounded-2xl border border-blue-100 overflow-hidden print:border-none print:bg-white print:mt-8 print:break-inside-avoid">
      {/* 列印時隱藏標題按鈕 */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-4 flex items-center justify-between bg-white hover:bg-blue-50 transition-colors text-blue-800 font-bold print:hidden"
      >
        <span className="flex items-center gap-2"><CreditCard className="w-5 h-5" /> 信用卡與支付回饋攻略 {analysisResult && <CheckCircle2 className="w-4 h-4 text-green-500" />}</span>
        {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>

      {/* 列印時強制顯示內容 (如果 analysisResult 存在) */}
      <div className={`p-4 md:p-6 animate-in slide-in-from-top-2 ${isOpen ? 'block' : 'hidden'} ${analysisResult ? 'print:block' : 'print:hidden'}`}>
        {/* 只有在沒結果時顯示輸入表單，且列印時隱藏 */}
        {!analysisResult && !isAnalyzing ? (
          <div className="print:hidden">
            {/* ... 輸入表單部分保持不變，省略以節省篇幅 ... */}
            <div className="mb-4">
                <h5 className="font-bold text-slate-700 mb-2 flex items-center gap-2">
                  <Landmark className="w-4 h-4 text-slate-500" /> 選擇您持有的銀行 ({countryName})
                </h5>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 max-h-48 overflow-y-auto p-2 bg-white rounded-xl border border-slate-200 mb-2">
                  {bankList && bankList.length > 0 ? bankList.map((bank, idx) => (
                    <label key={idx} className="flex items-center gap-2 p-2 hover:bg-slate-50 rounded cursor-pointer text-sm">
                      <input 
                        type="checkbox" 
                        checked={selectedBanks.includes(bank)} 
                        onChange={() => toggleBank(bank)}
                        className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                      />
                      <span className="text-slate-700">{bank}</span>
                    </label>
                  )) : <div className="col-span-full text-slate-400 text-sm">AI 未提供預設清單，請直接手動輸入</div>}
                </div>
                <input 
                  type="text"
                  placeholder="其他銀行 (如: 渣打, 匯豐... 用逗號分隔)"
                  value={otherBanks}
                  onChange={(e) => setOtherBanks(e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-400"
                />
            </div>
            <div className="mb-6 flex items-center gap-2 bg-white p-3 rounded-xl border border-slate-200">
                <input type="checkbox" id="top3" checked={includeTop3} onChange={(e) => setIncludeTop3(e.target.checked)} className="w-5 h-5 text-blue-600 rounded border-slate-300 focus:ring-blue-500" />
                <label htmlFor="top3" className="font-bold text-slate-700 cursor-pointer text-sm md:text-base">同時推薦 {countryName} 該地區最強 Top 3 信用卡</label>
            </div>
            <button onClick={handleAnalyze} className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-lg shadow-blue-200 transition-all flex justify-center items-center gap-2">
              <Sparkles className="w-5 h-5" /> 生成最佳刷卡策略
            </button>
          </div>
        ) : isAnalyzing ? (
           <div className="py-10 text-center flex flex-col items-center justify-center space-y-3 print:hidden">
               <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
               <p className="text-blue-600 font-bold animate-pulse">AI 正在計算現金回饋與里程轉換率...</p>
           </div>
        ) : (
          <div className="space-y-6">
            {/* 新增：列印時的標題 (因為按鈕被隱藏了) */}
            <h4 className="hidden print:flex items-center gap-2 text-xl font-bold text-slate-800 mb-4 border-b border-slate-800 pb-2">
               <CreditCard className="w-6 h-6" /> AI 信用卡回饋攻略 ({city})
            </h4>

            {/* Top 3 Section */}
            {analysisResult.top_3_general && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 print:border-slate-300 print:bg-white">
                <h5 className="font-bold text-yellow-800 mb-3 flex items-center gap-2 text-lg print:text-black">
                  <Gift className="w-5 h-5" /> {city} 必備 Top 3 神卡
                </h5>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {analysisResult.top_3_general.map((card, i) => (
                    <div key={i} className="bg-white p-3 rounded-lg shadow-sm border border-yellow-100 print:border-slate-300">
                      <div className="text-xs text-yellow-600 font-bold mb-1 print:text-slate-600">{card.bank}</div>
                      <div className="font-bold text-slate-800 mb-1">{card.card_name}</div>
                      <div className="text-xs bg-slate-100 inline-block px-1.5 py-0.5 rounded text-slate-500 mb-2 print:border print:border-slate-200">{card.type}</div>
                      <div className="text-sm text-slate-600 leading-snug">{card.reason}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Bank Specific Section */}
            {analysisResult.bank_recommendations && analysisResult.bank_recommendations.length > 0 && (
              <div>
                <h5 className="font-bold text-blue-800 mb-3 flex items-center gap-2 print:text-black">
                  <CheckCircle2 className="w-5 h-5" /> 您的持有銀行主力卡
                </h5>
                <div className="space-y-3">
                  {analysisResult.bank_recommendations.map((item, i) => (
                    <div key={i} className="bg-white p-4 rounded-xl border border-blue-100 shadow-sm flex flex-col md:flex-row gap-3 md:items-center print:border-slate-300 print:break-inside-avoid">
                      <div className="shrink-0 md:w-32">
                         <div className="text-xs text-slate-400 font-bold">{item.bank}</div>
                         <div className="font-bold text-slate-700">{item.card_name}</div>
                      </div>
                      <div className="flex-1">
                         <div className="flex items-center gap-2 mb-1">
                           <span className={`text-xs px-2 py-0.5 rounded font-bold ${item.type.includes('現金') ? 'bg-green-100 text-green-700' : 'bg-purple-100 text-purple-700'} print:border print:border-slate-300`}>{item.type}</span>
                           <span className="text-sm font-bold text-blue-600 print:text-black">{item.reward_desc}</span>
                         </div>
                         <div className="text-xs text-slate-500">⚠️ {item.condition}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* 新增：列印時的免責聲明 */}
            <div className="hidden print:block mt-4 p-2 text-[10px] text-slate-500 border-t border-slate-300 italic">
               *此資訊由 AI 生成僅供參考，實際回饋規則與優惠請以各銀行官方公告為準。可能會漏掉部分快閃活動或最新異動。
            </div>

            <div className="flex gap-3 pt-2 print:hidden">
              <button onClick={() => setAnalysisResult(null)} className="flex-1 py-2 text-slate-500 hover:bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold transition-colors">
                  重選銀行
              </button>
              <button onClick={() => { onSave(analysisResult); alert("信用卡攻略已儲存到本次行程！"); }} className="flex-1 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-sm font-bold shadow-md shadow-emerald-200 transition-colors flex items-center justify-center gap-2">
                  <Save className="w-4 h-4" /> 儲存此攻略
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
// --- City Guide ---
const CityGuide = ({ guideData, cities, basicData, apiKey, onSaveCreditCardAnalysis, modelType }) => {
  const [selectedCity, setSelectedCity] = useState(cities[0]);
  const [isOpen, setIsOpen] = useState(false);
  const currentGuide = guideData[selectedCity];
  

  if (!currentGuide) return null;

  // 取得國家的顯示名稱
  const countryName = ISSUING_COUNTRIES.find(c => c.code === basicData.issuingCountry)?.name || basicData.otherCountryName || basicData.issuingCountry;

  return (
    <div className="bg-indigo-50/50 border border-indigo-100 rounded-3xl mb-8 print:break-inside-avoid overflow-hidden transition-all duration-300">
      {/* 標題列 (保持不變) */}
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="p-6 flex justify-between items-center cursor-pointer bg-indigo-50 hover:bg-indigo-100 transition-colors"
      >
        <h3 className="text-xl font-bold text-indigo-900 flex items-center gap-2">
          <BookOpen className="w-6 h-6" /> 城市生存指南 & 優惠情報
        </h3>
        <div className="flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
           <div className="relative">
            <select 
              value={selectedCity} 
              onChange={(e) => setSelectedCity(e.target.value)}
              className="appearance-none bg-white border border-indigo-200 text-indigo-700 py-2 pl-4 pr-10 rounded-xl font-bold focus:outline-none focus:ring-2 focus:ring-indigo-300 cursor-pointer text-sm"
            >
              {cities.map(city => <option key={city} value={city}>{city}</option>)}
            </select>
            <ChevronDown className="absolute right-3 top-3 w-4 h-4 text-indigo-400 pointer-events-none" />
          </div>
          <button onClick={() => setIsOpen(!isOpen)} className="p-2 text-indigo-400 hover:text-indigo-600">
            {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* 內容區塊 */}
      {isOpen && (
        <div className="p-6 border-t border-indigo-100 animate-in slide-in-from-top-2 duration-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* 在地用語 (保持不變) */}
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-teal-100 md:col-span-2">
              <h4 className="font-bold text-teal-700 mb-3 flex items-center gap-2">
                <MessageCircle className="w-5 h-5" /> 在地用語小學堂
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                {currentGuide.basic_phrases && Array.isArray(currentGuide.basic_phrases) ? (
                   currentGuide.basic_phrases.map((phrase, idx) => (
                     <div key={idx} className="bg-teal-50 p-3 rounded-xl border border-teal-100">
                       <div className="text-xs text-teal-600 font-bold mb-1">{phrase.label}</div>
                       <div className="text-base font-bold text-slate-800">{phrase.local}</div>
                       <div className="text-xs text-slate-400 font-mono italic">{phrase.roman}</div>
                     </div>
                   ))
                ) : (
                  <span className="text-slate-400 text-sm col-span-full">尚無資料</span>
                )}
              </div>
            </div>

            {/* 新增：旅遊補助與退稅 (新功能) */}
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-rose-100 md:col-span-2">
                <h4 className="font-bold text-rose-700 mb-3 flex items-center gap-2">
                    <Banknote className="w-5 h-5" /> 省錢情報：補助與退稅
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-rose-50/50 p-3 rounded-xl">
                        <span className="block text-xs font-bold text-rose-500 mb-1">🎁 當地旅遊補助</span>
                        <p className="text-sm text-slate-700 whitespace-pre-line">{safeRender(currentGuide.subsidies) || '無相關資訊'}</p>
                    </div>
                    <div className="bg-rose-50/50 p-3 rounded-xl">
                        <span className="block text-xs font-bold text-rose-500 mb-1">💳 退稅攻略</span>
                        <p className="text-sm text-slate-700 whitespace-pre-line">{safeRender(currentGuide.tax_refund) || '無相關資訊'}</p>
                    </div>
                </div>
            </div>

            {/* 歷史與交通 (保持不變) */}
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
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-indigo-50 md:col-span-2">
              <h4 className="font-bold text-red-800 mb-3 flex items-center gap-2">
                <ShieldAlert className="w-4 h-4" /> 治安與詐騙提醒
              </h4>
              <p className="text-sm text-slate-600 leading-relaxed">{currentGuide.safety_scams}</p>
            </div>
          </div>

          {/* 新增：信用卡回饋分析 (CreditCardPlanner) */}
          {basicData.enableCreditCard && (
             <CreditCardPlanner 
                city={selectedCity}
                issuingCountry={basicData.issuingCountry}
                countryName={countryName}
                bankList={currentGuide.major_banks_list}
                apiKey={apiKey}
                savedAnalysis={currentGuide.credit_card_analysis} // 傳入已儲存的資料
                onSave={(analysis) => onSaveCreditCardAnalysis(selectedCity, analysis)} // 處理儲存
                modelType={modelType}
             />
          )}

        </div>
      )}
    </div>
  );
};

// --- Day Timeline ---
const DayTimeline = ({ day, dayIndex, expenses, setExpenses, travelers, currencySettings, isPrintMode = false, apiKey, updateItineraryItem, onSavePlan, onDeleteClick, onEditClick, onTimeUpdate, onAddClick, onUpdateDayInfo, onRefreshWeather, onIconClick }) => {
  const [editingExpense, setEditingExpense] = useState(null); 
  const [expenseToEdit, setExpenseToEdit] = useState(null); 
  const [activeNote, setActiveNote] = useState(null); 
  const [activeDeepDive, setActiveDeepDive] = useState(null);
  const [editingTimeId, setEditingTimeId] = useState(null);
  const [isRefreshingWeather, setIsRefreshingWeather] = useState(false);

  // 1. 記帳功能
  const addExpense = (timelineIndex, newItem) => {
    const newExpense = { id: Date.now().toString(), dayIndex, timelineIndex, ...newItem };
    setExpenses(prev => [...prev, newExpense]);
  };
  const updateExpense = (updatedItem) => {
      setExpenses(prev => prev.map(e => e.id === updatedItem.id ? updatedItem : e));
  };
  const removeExpense = (id) => {
    if(confirm("確定要刪除這筆帳務嗎？")) { setExpenses(prev => prev.filter(e => e.id !== id)); }
  };

  // 2. 照片功能 (回歸原生處理)
  const handlePhotoUpload = async (e, timelineIndex) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      // 不做前端 HEIC 轉檔，直接依賴 iOS 的自動轉換
      // 如果手機上傳圖片，compressImage 會將其轉為 JPEG Base64
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

  // ... (其他原有函數保持不變) ...
  const handleNoteChange = (timelineIndex, text) => { updateItineraryItem(dayIndex, timelineIndex, { user_notes: text }); };
  const handleDeepDive = async (timelineIndex, item) => { /* 保留原本代碼 */ if (item.ai_details) { setActiveDeepDive({ timelineIndex, isLoading: false, data: item.ai_details, title: item.title }); return; } if (!apiKey) return alert("需要 API Key 才能使用此功能"); setActiveDeepDive({ timelineIndex, isLoading: true, data: null, title: item.title }); const TARGET_MODEL = 'gemini-2.5-flash'; const prompt = `針對景點/地點: "${item.title}" (位於 ${day.city}) 進行深度分析...(略)...`; try { const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${TARGET_MODEL}:generateContent?key=${apiKey}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], generationConfig: { responseMimeType: "application/json" } }) }); const data = await response.json(); if (data.error) throw new Error(data.error.message); const resultText = data.candidates?.[0]?.content?.parts?.[0]?.text; if (!resultText) throw new Error("AI 無回應"); const cleanedText = cleanJsonResult(resultText); let aiResult = JSON.parse(cleanedText); updateItineraryItem(dayIndex, timelineIndex, { ai_details: aiResult }); setActiveDeepDive({ timelineIndex, isLoading: false, data: aiResult, title: item.title }); } catch (error) { console.error(error); alert("AI 分析失敗: " + error.message); setActiveDeepDive(null); } };
  const handleRegenerateDeepDive = async () => { /* 保留原本代碼 */ const { timelineIndex, title } = activeDeepDive; if (!apiKey) return alert("需要 API Key"); setActiveDeepDive({ timelineIndex, title, isLoading: true, data: null }); const TARGET_MODEL = 'gemini-2.5-flash'; const prompt = `針對景點/地點: "${title}" (位於 ${day.city}) 進行深度分析...(略)...`; try { const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${TARGET_MODEL}:generateContent?key=${apiKey}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], generationConfig: { responseMimeType: "application/json" } }) }); const data = await response.json(); if (data.error) throw new Error(data.error.message); const resultText = data.candidates?.[0]?.content?.parts?.[0]?.text; if (!resultText) throw new Error("AI 無回應"); const cleanedText = cleanJsonResult(resultText); let aiResult = JSON.parse(cleanedText); updateItineraryItem(dayIndex, timelineIndex, { ai_details: aiResult }); setActiveDeepDive({ timelineIndex, isLoading: false, data: aiResult, title }); } catch (error) { console.error(error); alert("重新生成失敗: " + error.message); setActiveDeepDive(prev => ({ ...prev, isLoading: false })); } };
  const convertToHomeCurrency = (amount) => { if (!currencySettings.rate || currencySettings.rate === 0) return ''; const homeAmount = Math.round(amount * currencySettings.rate); return `(≈ NT$${homeAmount.toLocaleString()})`; };
  const handleWeatherClick = async () => { setIsRefreshingWeather(true); await onRefreshWeather(dayIndex, day.city, day.date); setIsRefreshingWeather(false); };
  const typeColors = { flight: 'bg-sky-100 text-sky-500 ring-sky-200', transport: 'bg-indigo-100 text-indigo-500 ring-indigo-200', meal: 'bg-orange-100 text-orange-500 ring-orange-200', hotel: 'bg-rose-100 text-rose-500 ring-rose-200', activity: 'bg-teal-100 text-teal-500 ring-teal-200', spot: 'bg-emerald-100 text-emerald-500 ring-emerald-200', shopping: 'bg-pink-100 text-pink-500 ring-pink-200', default: 'bg-slate-100 text-slate-500 ring-slate-200' };

  return (
    <div className={`bg-[#fffef8] dark:bg-[#3a2a25] rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.08)] min-h-[600px] overflow-hidden border-4 border-white dark:border-[#2c1f1b] relative ${isPrintMode ? 'shadow-none border-none bg-white min-h-0 overflow-visible mb-8 break-inside-avoid' : ''}`}>
      {/* ... (Header & Decoration 保持不變) ... */}
      {!isPrintMode && (<><div className="absolute bottom-0 right-0 opacity-[0.07] dark:opacity-20 pointer-events-none text-amber-600 dark:text-amber-400"><Tent className="w-48 h-48 -rotate-12 translate-x-10 translate-y-10" /></div><div className="absolute top-1/2 left-0 opacity-[0.07] dark:opacity-20 pointer-events-none text-sky-600 dark:text-sky-400"><Cloud className="w-32 h-32 rotate-12 -translate-x-10" /></div></>)}
      <div className={`bg-gradient-to-r from-sky-400 via-cyan-400 to-teal-300 p-6 md:p-10 relative overflow-hidden ${isPrintMode ? 'bg-white text-black p-0 mb-4 border-b-2 border-slate-800 pb-2' : ''}`}>
        {!isPrintMode && (<><div className="absolute top-[-20%] right-[-10%] w-40 h-40 bg-white opacity-20 rounded-full blur-2xl"></div><div className="absolute bottom-[-20%] left-[-10%] w-60 h-60 bg-yellow-300 opacity-20 rounded-full blur-3xl"></div><div className="absolute top-4 right-4 text-white opacity-50"><Plane className="w-8 h-8 rotate-45" /></div></>)}
        <div className="relative z-10">
           <div className="flex items-end gap-2 mb-2">{isPrintMode ? (<h3 className="text-4xl font-extrabold text-black"><span className="text-xl block text-slate-500 mb-1">Day {day.day_index}</span>{day.city}</h3>) : (<input value={day.city} onChange={(e) => onUpdateDayInfo(dayIndex, { city: e.target.value })} className="bg-transparent text-3xl md:text-5xl font-extrabold text-white border-b-2 border-transparent hover:border-white/50 focus:border-white focus:outline-none w-full md:w-auto transition-colors placeholder-white/70 drop-shadow-sm" placeholder="輸入城市名稱" />)}</div>
           <div className={`flex items-center gap-2 text-sky-100 text-base md:text-xl font-medium ${isPrintMode ? 'text-slate-700' : ''}`}><Sparkles className={`w-5 h-5 flex-shrink-0 ${isPrintMode ? 'hidden' : ''}`} /> {isPrintMode ? <span>{day.title}</span> : (<input value={day.title} onChange={(e) => onUpdateDayInfo(dayIndex, { title: e.target.value })} className="bg-transparent border-b border-transparent hover:border-sky-200/50 focus:border-sky-100 focus:outline-none w-full md:w-1/2 transition-colors placeholder-sky-100/70" placeholder="輸入行程主題" />)}</div>
           {(day.weather_forecast || day.clothing_suggestion) && (<div className={`mt-4 flex flex-wrap gap-3 items-center ${isPrintMode ? 'text-sm mt-2' : 'text-sm md:text-base'}`}>{day.weather_forecast && (<div className={`flex items-center gap-2 bg-white/80 backdrop-blur-md px-3 py-1.5 rounded-full text-sky-600 font-medium shadow-sm ${isPrintMode ? 'bg-slate-100 border-slate-200 text-slate-800' : ''}`}><CloudSun className="w-4 h-4" /><span>{day.weather_forecast}</span></div>)}{day.clothing_suggestion && (<div className={`flex items-center gap-2 bg-white/80 backdrop-blur-md px-3 py-1.5 rounded-full text-orange-600 font-medium shadow-sm ${isPrintMode ? 'bg-slate-100 border-slate-200 text-slate-800' : ''}`}><Shirt className="w-4 h-4" /><span>{day.clothing_suggestion}</span></div>)}{!isPrintMode && (<button onClick={handleWeatherClick} disabled={isRefreshingWeather} className={`p-2 rounded-full bg-white/20 hover:bg-white/40 transition-all text-white ${isRefreshingWeather ? 'animate-spin' : 'hover:rotate-180'}`} title="重新預測天氣"><RefreshCw className="w-5 h-5" /></button>)}</div>)}
        </div>
      </div>

      <div className={`p-4 md:p-10 relative ${isPrintMode ? 'p-0' : ''}`}>
        <div className={`absolute left-[35px] md:left-[59px] top-10 bottom-10 w-[3px] bg-[linear-gradient(to_bottom,transparent,SkyBlue,LightPink,Moccasin,transparent)] bg-[length:100%_20px] bg-repeat-y ${isPrintMode ? 'hidden' : ''}`} style={{backgroundImage: 'repeating-linear-gradient(0deg, #bae6fd, #bae6fd 8px, transparent 8px, transparent 16px)'}}></div>
        
        <div className={`space-y-8 md:space-y-12 ${isPrintMode ? 'space-y-6' : ''}`}>
          {day.timeline.map((item, timelineIndex) => {
            const colorClass = typeColors[item.type] || typeColors.default;
            return (
            <React.Fragment key={timelineIndex}>
                <div className="relative flex gap-4 md:gap-8 group break-inside-avoid z-10">
                  {/* Icon */}
                  <div onClick={() => !isPrintMode && onIconClick(dayIndex, timelineIndex)} className={`w-12 h-12 md:w-16 md:h-16 rounded-full flex items-center justify-center shrink-0 z-10 border-[5px] border-[#fffef8] shadow-md transition-all group-hover:scale-110 cursor-pointer hover:shadow-lg ring-4 ${colorClass.split(' ')[2]} ${isPrintMode ? 'hidden' : colorClass}`} title="點擊更換圖示">
                    {item.type === 'flight' && <Plane className="w-6 h-6 md:w-7 md:h-7" />}{item.type === 'transport' && <Train className="w-6 h-6 md:w-7 md:h-7" />}{item.type === 'meal' && <Utensils className="w-6 h-6 md:w-7 md:h-7" />}{item.type === 'hotel' && <Hotel className="w-6 h-6 md:w-7 md:h-7" />}{item.type === 'activity' && <BookOpen className="w-6 h-6 md:w-7 md:h-7" />}{item.type === 'shopping' && <Wallet className="w-6 h-6 md:w-7 md:h-7" />}{(item.type === 'spot' || !['flight','transport','meal','hotel','activity','shopping'].includes(item.type)) && <MapPin className="w-6 h-6 md:w-7 md:h-7" />}
                  </div>

                  {/* Card Content */}
                  <div className={`flex-1 bg-white rounded-[2rem] p-5 md:p-7 shadow-[0_4px_20px_rgb(0,0,0,0.06)] hover:shadow-[0_8px_25px_rgb(0,0,0,0.1)] transition-all duration-300 transform relative group border-2 border-slate-50 ${isPrintMode ? 'shadow-none border-l-4 border-slate-300 rounded-none pl-4 border-t-0 border-r-0 border-b-0 hover:transform-none' : ''}`}>
                    {/* 編輯/刪除按鈕 */}
                    <div className="absolute top-3 right-3 flex items-center gap-1 bg-white/90 backdrop-blur-sm p-1 rounded-full shadow-sm z-20 print:hidden border border-slate-200">
                        <button onClick={(e) => { e.stopPropagation(); onEditClick(dayIndex, timelineIndex, item.title, day.city); }} className="p-2 text-slate-400 hover:text-sky-500 hover:bg-sky-50 rounded-full transition-colors" title="編輯"><Edit3 className="w-4 h-4" /></button>
                        <div className="w-px h-4 bg-slate-200"></div>
                        <button onClick={(e) => { e.stopPropagation(); onDeleteClick(dayIndex, timelineIndex); }} className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-full transition-colors" title="刪除"><Trash2 className="w-4 h-4" /></button>
                    </div>

                    <div className="flex flex-col md:flex-row justify-between items-start mb-3 md:mb-4 gap-3 md:gap-4">
                      <div>
                        {editingTimeId === timelineIndex && !isPrintMode ? (<input type="time" defaultValue={item.time} autoFocus onBlur={(e) => { onTimeUpdate(dayIndex, timelineIndex, e.target.value); setEditingTimeId(null); }} onKeyDown={(e) => { if(e.key === 'Enter') { onTimeUpdate(dayIndex, timelineIndex, e.currentTarget.value); setEditingTimeId(null); } }} className="bg-sky-50 text-sky-700 px-3 py-1 rounded-full text-sm font-bold border-2 border-sky-200 outline-none mb-2 font-mono" />) : (<div onClick={() => !isPrintMode && setEditingTimeId(timelineIndex)} className={`inline-flex items-center gap-2 bg-sky-50 text-sky-700 px-3 py-1 rounded-full text-xs md:text-sm font-bold mb-2 cursor-pointer hover:bg-sky-100 transition-colors ${isPrintMode ? 'bg-transparent p-0 text-black pl-0' : ''}`} title="點擊修改時間"><Clock className={`w-3.5 h-3.5 ${isPrintMode ? 'hidden' : ''}`} />{item.time}</div>)}
                        <h4 className="font-bold text-xl md:text-2xl text-slate-700 flex flex-wrap items-center gap-2">{item.title}{item.price_level && <span className={`text-[10px] md:text-xs px-2 py-1 rounded-full font-bold ${isPrintMode ? 'border-black text-black border' : item.price_level === 'High' ? 'bg-rose-100 text-rose-600' : item.price_level === 'Mid' ? 'bg-amber-100 text-amber-600' : 'bg-green-100 text-green-600'}`}>{item.price_level === 'High' ? '$$$' : item.price_level === 'Mid' ? '$$' : '$'}</span>}</h4>
                      </div>
                      
                      <div className={`flex items-center gap-1 ${isPrintMode ? 'hidden' : ''}`}>
                         <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(item.location_query || item.title)}`} target="_blank" rel="noreferrer" className="p-2.5 rounded-full hover:bg-sky-100 text-sky-400 hover:text-sky-600 transition-colors"><Map className="w-5 h-5" /></a>
                         <button onClick={() => setActiveNote(activeNote === timelineIndex ? null : timelineIndex)} className={`p-2.5 rounded-full transition-colors ${item.user_notes ? 'bg-amber-100 text-amber-600' : 'text-amber-300 hover:bg-amber-50 hover:text-amber-500'}`}><FileText className="w-5 h-5" /></button>
                         
                         {/* ✅ 相機按鈕：使用透明覆蓋法 */}
                         <label className="p-2.5 rounded-full hover:bg-rose-50 dark:hover:bg-rose-900/30 text-rose-300 hover:text-rose-500 dark:hover:text-rose-400 cursor-pointer transition-colors">
                             {/* input 放在裡面，並且 hidden */}
                             <input 
                                 type="file" 
                                 accept="image/*" 
                                 className="hidden" 
                                 onChange={(e) => handlePhotoUpload(e, timelineIndex)} 
                             />
                             <Camera className="w-5 h-5" />
                         </label>

                         <button onClick={() => handleDeepDive(timelineIndex, item)} className={`p-2.5 rounded-full transition-colors relative ${item.ai_details ? 'text-violet-600 bg-violet-100 ring-2 ring-violet-200' : 'text-violet-300 hover:bg-violet-50 hover:text-violet-500'}`}><Bot className="w-5 h-5" />{item.ai_details && <span className="absolute -top-1 -right-1 w-3 h-3 bg-violet-500 rounded-full border-2 border-white"></span>}</button>
                      </div>
                    </div>
                    
                    {/* ... Content ... */}
                    <div className={`text-slate-600 text-sm md:text-base leading-relaxed mb-4 md:mb-6 whitespace-pre-line pl-2 ${isPrintMode ? 'text-black pl-0' : ''}`}>{item.description}</div>
                    
                    {isPrintMode && item.ai_details && (<div className="mt-2 mb-4 p-5 bg-violet-50 rounded-2xl border-2 border-violet-100 text-sm break-inside-avoid relative overflow-hidden"><div className="absolute top-0 right-0 text-violet-200 opacity-30"><Sparkles className="w-16 h-16" /></div><h5 className="font-bold text-violet-800 mb-3 flex items-center gap-2 border-b border-violet-200 pb-2 relative z-10"><Sparkles className="w-5 h-5" /> AI 深度導遊情報</h5><div className="space-y-2.5 text-slate-700 relative z-10"><div><span className="font-bold text-purple-700 bg-purple-100 px-1.5 py-0.5 rounded-md mr-1">📍 路線:</span> {safeRender(item.ai_details.route_guide)}</div><div><span className="font-bold text-orange-700 bg-orange-100 px-1.5 py-0.5 rounded-md mr-1">🍽️ 必訪:</span> {safeRender(item.ai_details.must_visit_shops)}</div><div><span className="font-bold text-red-700 bg-red-100 px-1.5 py-0.5 rounded-md mr-1">🛡️ 安全:</span> {safeRender(item.ai_details.safety_alert)}</div><div className="text-xs text-slate-500 pt-2 border-t border-violet-200"><span className="font-bold mr-1">🗺️ 地圖:</span> {safeRender(item.ai_details.mini_map_desc)}</div></div></div>)}
                    {(activeNote === timelineIndex || item.user_notes) && (<div className="mb-5 relative rotate-1 transition-transform hover:rotate-0"><div className="absolute -top-2 -left-2 text-yellow-400 opacity-50"><Pin className="w-5 h-5" /></div><textarea value={item.user_notes||''} onChange={(e)=>handleNoteChange(timelineIndex,e.target.value)} className="w-full p-4 bg-yellow-100/80 border-none rounded-xl text-sm outline-none resize-none shadow-sm text-yellow-800 placeholder-yellow-800/50 font-handwriting" rows="3" placeholder="寫點什麼紀錄一下..."/></div>)}
                    {item.photos?.length > 0 && (<div className="flex gap-3 overflow-x-auto pb-4 mb-2 pl-2"><div className="bg-white p-2 shadow-md rounded-lg rotate-2 hover:rotate-0 transition-all"><img src={item.photos[0]} className="h-28 w-28 object-cover rounded-md border border-slate-100"/></div></div>)}
                    {item.transport_detail && (<div className={`bg-indigo-50 p-4 rounded-2xl mb-3 flex items-start gap-3 border-2 border-indigo-100 ${isPrintMode ? 'bg-transparent border-slate-300' : ''}`}><div className={`bg-white p-2.5 rounded-full shadow-sm shrink-0 text-indigo-500 ${isPrintMode ? 'hidden' : ''}`}><Train className="w-5 h-5" /></div><div className="text-sm text-indigo-900 flex-1 pt-0.5"><span className="block font-bold mb-1">交通建議</span>{item.transport_detail}</div></div>)}
                    {item.warnings_tips && (<div className={`bg-amber-50 border-2 border-amber-100 p-4 rounded-2xl mb-3 flex items-start gap-3 ${isPrintMode ? 'bg-transparent border-black' : ''}`}><div className={`bg-white p-2.5 rounded-full shadow-sm shrink-0 text-amber-500 ${isPrintMode ? 'hidden' : ''}`}><AlertTriangle className="w-5 h-5" /></div><div className="text-sm text-amber-900 flex-1 pt-0.5"><span className="block font-bold mb-1">重要提醒 (Tips)</span>{item.warnings_tips}</div></div>)}
                    {item.menu_recommendations && item.menu_recommendations.length > 0 && (<div className={`mt-6 border-t-2 border-orange-100 pt-4 ${isPrintMode ? 'border-slate-300' : ''}`}><h5 className="text-sm font-bold text-orange-600 mb-3 flex items-center gap-2"><ChefHat className={`w-5 h-5 ${isPrintMode ? 'hidden' : ''}`} /> 點餐翻譯小幫手</h5><div className={`bg-orange-50/80 rounded-2xl overflow-hidden border-2 border-orange-100 overflow-x-auto shadow-sm ${isPrintMode ? 'bg-transparent border-slate-300' : ''}`}><table className="w-full text-sm text-left min-w-[300px]"><thead className={`bg-orange-200/50 text-orange-800 ${isPrintMode ? 'bg-slate-100 text-black' : ''}`}><tr><th className="p-3 pl-4 font-bold rounded-tl-2xl">當地菜名</th><th className="p-3 font-bold">中文</th><th className="p-3 font-bold rounded-tr-2xl">預估價格</th></tr></thead><tbody className={`divide-y divide-orange-100 text-slate-700 ${isPrintMode ? 'divide-slate-300' : ''}`}>{item.menu_recommendations.map((menu, mIdx) => (<tr key={mIdx} className={`hover:bg-orange-100/50 transition-colors ${isPrintMode ? 'hover:bg-transparent' : ''}`}><td className="p-3 pl-4 font-bold text-orange-700">{menu.local}</td><td className="p-3">{menu.cn}</td><td className="p-3 text-slate-500 font-mono">{menu.price}</td></tr>))}</tbody></table></div></div>)}

                    {/* 記帳小本本 */}
                    {!isPrintMode && (
                      <div className="mt-6 pt-4 border-t-2 border-emerald-100/50">
                          <div className="flex items-center justify-between mb-3">
                            <h5 className="text-sm font-bold text-emerald-700 flex items-center gap-2"><Wallet className="w-5 h-5" /> 記帳小本本</h5>
                            <button 
                              onClick={() => {
                                if (editingExpense === timelineIndex) {
                                   setEditingExpense(null);
                                   setExpenseToEdit(null);
                                } else {
                                   setEditingExpense(timelineIndex);
                                   setExpenseToEdit(null);
                                }
                              }}
                              className={`text-xs px-3 py-1.5 rounded-full transition-colors flex items-center gap-1 font-bold shadow-sm ${editingExpense === timelineIndex && !expenseToEdit ? 'bg-rose-100 text-rose-600' : 'bg-emerald-100 text-emerald-600 hover:bg-emerald-200'}`}
                            >
                              {editingExpense === timelineIndex && !expenseToEdit ? <MinusCircle className="w-3.5 h-3.5" /> : <PlusCircle className="w-3.5 h-3.5" />} 
                              {editingExpense === timelineIndex && !expenseToEdit ? '收起' : '記一筆'}
                            </button>
                          </div>
                          
                          <div className="space-y-2">
                            {expenses.filter(e => e.dayIndex === dayIndex && e.timelineIndex === timelineIndex).map(expense => (
                              <div 
                                key={expense.id} 
                                onClick={() => {
                                    setEditingExpense(timelineIndex);
                                    setExpenseToEdit(expense);
                                }}
                                className="flex justify-between items-center text-sm bg-[#f0fdf4] p-2.5 rounded-xl border border-emerald-100 shadow-sm group/expense hover:shadow-md transition-all relative overflow-hidden cursor-pointer hover:bg-emerald-50"
                                title="點擊編輯此帳務"
                              >
                                <div className="absolute right-0 bottom-0 opacity-10 text-emerald-300 pointer-events-none"><Coins className="w-12 h-12 -rotate-12 translate-x-4 translate-y-4"/></div>
                                <div className="flex flex-col relative z-10">
                                  <span className="font-bold text-emerald-800 flex items-center gap-1">{expense.item} <span className="text-xs font-normal text-emerald-600 bg-emerald-100 px-1.5 rounded-md">{expense.category}</span></span>
                                  <span className="text-xs text-emerald-600 mt-0.5">{expense.payer} 付款, {expense.splitters.length} 人分攤</span>
                                  {expense.note && <span className="text-xs text-slate-400 italic mt-1 border-l-2 border-slate-200 pl-1">{expense.note}</span>}
                                </div>
                                <div className="flex flex-col items-end gap-0.5 relative z-10">
                                  <div className="flex items-center gap-2">
                                    <span className="font-mono font-bold text-lg text-emerald-700">{currencySettings.symbol}{Number(expense.amount).toLocaleString()}</span>
                                    <button 
                                      onClick={(e) => { e.stopPropagation(); removeExpense(expense.id); }} 
                                      className="text-slate-300 hover:text-rose-500 opacity-0 group-hover/expense:opacity-100 transition-opacity p-1 bg-white rounded-full shadow-sm hover:shadow-md transition-all"
                                    >
                                        <X className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                  <span className="text-[10px] text-slate-400 font-medium bg-white/50 px-1.5 rounded-full">{convertToHomeCurrency(expense.amount)}</span>
                                </div>
                              </div>
                            ))}
                          </div>

                          {editingExpense === timelineIndex && (
                            <div className="mt-3 bg-emerald-50/50 p-3 rounded-2xl border-2 border-emerald-100 relative animate-in slide-in-from-top-2">
                                <ExpenseForm 
                                  travelers={travelers} 
                                  currencySettings={currencySettings} 
                                  initialData={expenseToEdit} 
                                  onSave={(data) => {
                                      if (expenseToEdit) {
                                          updateExpense({ ...expenseToEdit, ...data });
                                      } else {
                                          addExpense(timelineIndex, data);
                                      }
                                      setEditingExpense(null);
                                      setExpenseToEdit(null);
                                  }} 
                                  onCancel={() => {
                                      setEditingExpense(null);
                                      setExpenseToEdit(null);
                                  }} 
                                />
                            </div>
                          )}
                      </div>
                    )}
                  </div>
                </div>
                
                {!isPrintMode && (<div className="relative flex items-center justify-center py-3 z-10 group/add"><button onClick={() => onAddClick(dayIndex, timelineIndex + 1, day.city)} className="w-9 h-9 rounded-full bg-white border-2 border-rose-200 text-rose-300 hover:bg-rose-400 hover:text-white hover:scale-110 hover:border-rose-400 transition-all flex items-center justify-center shadow-sm opacity-60 group-hover/add:opacity-100" title="在此處插入新行程"><Plus className="w-5 h-5" /></button></div>)}
            </React.Fragment>
          )})}
          
          {(!day.timeline || day.timeline.length === 0) && !isPrintMode && (<button onClick={() => onAddClick(dayIndex, 0, day.city)} className="w-full py-12 border-4 border-dashed border-sky-200 rounded-[2rem] text-sky-400 hover:border-sky-400 hover:text-sky-600 hover:bg-sky-50 flex flex-col items-center justify-center gap-3 transition-all group"><div className="p-4 bg-sky-100 rounded-full group-hover:scale-110 transition-transform"><Plus className="w-10 h-10" /></div><span className="font-bold text-lg">點擊這裡新增第一個可愛行程！✨</span></button>)}
        </div>
        <LedgerSummary expenses={expenses} dayIndex={dayIndex} travelers={travelers} currencySettings={currencySettings} />
        <DeepDiveModal isOpen={activeDeepDive !== null} onClose={() => setActiveDeepDive(null)} data={activeDeepDive?.data} isLoading={activeDeepDive?.isLoading} itemTitle={activeDeepDive?.title} onRegenerate={handleRegenerateDeepDive} />
      </div>
    </div>
  );
};
const ApiKeyTutorialModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[10001] p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95">
        
        <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-4 text-white font-bold flex justify-between items-center">
          <span className="flex items-center gap-2"><Key className="w-5 h-5" /> 如何獲取免費 API Key？</span>
          <button onClick={onClose} className="bg-white/20 hover:bg-white/30 rounded-full p-1 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="flex items-start gap-4">
            <div className="bg-amber-100 text-amber-700 w-8 h-8 rounded-full flex items-center justify-center font-bold shrink-0">1</div>
            <div>
              <h4 className="font-bold text-slate-800">前往 Google AI Studio</h4>
              <p className="text-sm text-slate-600 mb-1">點擊下方連結開啟官網，並登入您的 Google 帳號。</p>
              <a 
                href="https://aistudio.google.com/apikey" 
                target="_blank" 
                rel="noreferrer"
                className="text-blue-600 hover:text-blue-800 text-sm font-bold flex items-center gap-1 underline decoration-2 decoration-blue-200 hover:decoration-blue-600 transition-all"
              >
                https://aistudio.google.com/apikey <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="bg-amber-100 text-amber-700 w-8 h-8 rounded-full flex items-center justify-center font-bold shrink-0">2</div>
            <div>
              <h4 className="font-bold text-slate-800">建立或複製金鑰</h4>
              <p className="text-sm text-slate-600">
                點擊藍色的 <span className="font-mono bg-slate-100 px-1 rounded border border-slate-300">Create API key</span> 按鈕。
                <br/>
                <span className="text-xs text-slate-400">(若已有 "Default..." 項目，直接點擊該項目即可)</span>
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="bg-amber-100 text-amber-700 w-8 h-8 rounded-full flex items-center justify-center font-bold shrink-0">3</div>
            <div>
              <h4 className="font-bold text-slate-800">複製並貼上</h4>
              <p className="text-sm text-slate-600 mb-2">
                複製那串以 <span className="font-mono font-bold text-red-500">AIza</span> 開頭的亂碼，貼回本 APP 的輸入欄位。
              </p>
              <div className="bg-slate-100 p-2 rounded text-xs font-mono text-slate-500 break-all border border-slate-200">
                AIzaSyD... (範例)
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end">
          <button 
            onClick={onClose}
            className="px-6 py-2 bg-amber-500 text-white rounded-xl font-bold text-sm hover:bg-amber-600 transition-all shadow-md shadow-amber-200"
          >
            我知道了
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};
const TutorialModal = ({ isOpen, onClose, title, pages, storageKey }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [dontShowAgain, setDontShowAgain] = useState(false);

  // 當彈窗打開時，檢查是否曾經勾選「不再提醒」
  useEffect(() => {
    if (isOpen) {
      const isHidden = localStorage.getItem(storageKey);
      if (isHidden === 'true') {
        onClose(); // 如果設定過不再提醒，直接關閉
      }
      setCurrentIndex(0); // 重置第一頁
    }
  }, [isOpen, storageKey]);

  const handleClose = () => {
    if (dontShowAgain) {
      localStorage.setItem(storageKey, 'true');
    }
    onClose();
  };

  const nextSlide = () => {
    if (currentIndex < pages.length - 1) setCurrentIndex(prev => prev + 1);
  };

  const prevSlide = () => {
    if (currentIndex > 0) setCurrentIndex(prev => prev - 1);
  };

  if (!isOpen) return null;

  // 如果 localStorage 已經有值且剛打開，會由 useEffect 關閉，這裡避免閃爍
  if (localStorage.getItem(storageKey) === 'true') return null;

  return createPortal(
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[10000] p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl w-full max-w-md flex flex-col shadow-2xl overflow-hidden relative">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-teal-500 p-4 text-white font-bold flex justify-between items-center">
          <span className="flex items-center gap-2"><Info className="w-5 h-5" /> {title}</span>
          <div className="text-xs bg-white/20 px-2 py-1 rounded-full">
             {currentIndex + 1} / {pages.length}
          </div>
        </div>

        {/* Content (Carousel) */}
        <div className="p-6 min-h-[200px] flex flex-col justify-center items-center text-center">
          <div className="mb-4 text-6xl">{pages[currentIndex].icon}</div>
          <h3 className="text-xl font-bold text-slate-800 mb-2">{pages[currentIndex].title}</h3>
          <p className="text-slate-600 text-sm leading-relaxed">{pages[currentIndex].desc}</p>
        </div>

        {/* Navigation Dots & Arrows */}
        <div className="px-6 pb-2 flex justify-between items-center">
             <button onClick={prevSlide} disabled={currentIndex === 0} className="p-2 rounded-full hover:bg-slate-100 disabled:opacity-30 text-slate-500 transition-colors">
                <ArrowLeft className="w-6 h-6" />
             </button>

             <div className="flex gap-2">
               {pages.map((_, idx) => (
                 <div 
                   key={idx} 
                   className={`w-2 h-2 rounded-full transition-all duration-300 ${idx === currentIndex ? 'bg-blue-500 w-4' : 'bg-slate-300'}`}
                 />
               ))}
             </div>

             <button onClick={nextSlide} disabled={currentIndex === pages.length - 1} className="p-2 rounded-full hover:bg-slate-100 disabled:opacity-30 text-slate-500 transition-colors">
                <ArrowLeft className="w-6 h-6 rotate-180" />
             </button>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-between items-center">
          <label className="flex items-center gap-2 cursor-pointer text-sm text-slate-500 hover:text-slate-700 select-none">
            <input 
              type="checkbox" 
              checked={dontShowAgain} 
              onChange={(e) => setDontShowAgain(e.target.checked)}
              className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
            />
            不再提醒
          </label>
          <button 
            onClick={handleClose}
            className="px-5 py-2 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 transition-all shadow-lg shadow-blue-200"
          >
            我知道了
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};
const DateRangePicker = ({ value, onChange, onClose }) => {
  const [currentDate, setCurrentDate] = useState(new Date()); // 控制當前顯示的月份
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [hoverDate, setHoverDate] = useState(null);

  // 初始化：解析傳入的字串 (e.g., "2025-12-08 to 2025-12-12")
  useEffect(() => {
    if (value) {
      const [startStr, endStr] = value.split(' to ');
      if (startStr) {
        const s = new Date(startStr);
        if (!isNaN(s)) {
           setStartDate(s);
           setCurrentDate(s); // 讓月曆跳到開始日期
        }
      }
      if (endStr) {
        const e = new Date(endStr);
        if (!isNaN(e)) setEndDate(e);
      }
    }
  }, []);

  const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  const handlePrevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const handleNextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const handleDateClick = (day) => {
    const clickedDate = new Date(year, month, day);
    
    // 邏輯：
    // 1. 如果還沒選開始日期，或已經選完範圍(重新選) -> 設為開始日期
    // 2. 如果選了開始日期，且點擊日期在開始日期之後 -> 設為結束日期
    // 3. 如果選了開始日期，但點擊日期在開始日期之前 -> 重設為新的開始日期
    if (!startDate || (startDate && endDate)) {
      setStartDate(clickedDate);
      setEndDate(null);
    } else if (clickedDate > startDate) {
      setEndDate(clickedDate);
      
      // --- 修正開始 ---
      // 原本錯誤寫法: const fmt = (d) => d.toISOString().split('T')[0];
      // 改用下方寫法，強制使用當地時間年月日，避免時區回推導致少一天
      const fmt = (d) => {
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        return `${y}-${m}-${dd}`;
      };
      // --- 修正結束 ---

      onChange(`${fmt(startDate)} to ${fmt(clickedDate)}`);
      setTimeout(onClose, 300); // 稍微延遲關閉讓用戶看到選取結果
    } else {
      setStartDate(clickedDate);
    }
  };

  const isSelected = (day) => {
    const target = new Date(year, month, day);
    if (startDate && target.getTime() === startDate.getTime()) return 'start';
    if (endDate && target.getTime() === endDate.getTime()) return 'end';
    if (startDate && endDate && target > startDate && target < endDate) return 'range';
    if (startDate && !endDate && hoverDate && target > startDate && target <= hoverDate) return 'hover';
    return null;
  };

  return (
    <div className="absolute top-full left-0 mt-2 z-50 bg-white rounded-xl shadow-2xl border border-slate-200 p-4 w-80 animate-in zoom-in-95">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <button onClick={handlePrevMonth} className="p-1 hover:bg-slate-100 rounded-full"><ChevronDown className="w-5 h-5 rotate-90 text-slate-500" /></button>
        <div className="font-bold text-slate-700">{year}年 {month + 1}月</div>
        <button onClick={handleNextMonth} className="p-1 hover:bg-slate-100 rounded-full"><ChevronDown className="w-5 h-5 -rotate-90 text-slate-500" /></button>
      </div>

      {/* Week Days */}
      <div className="grid grid-cols-7 mb-2 text-center">
        {['日', '一', '二', '三', '四', '五', '六'].map(d => (
          <div key={d} className="text-xs font-bold text-slate-400">{d}</div>
        ))}
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-7 gap-1 text-sm">
        {Array.from({ length: firstDay }).map((_, i) => <div key={`empty-${i}`} />)}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const status = isSelected(day);
          
          let bgClass = 'hover:bg-slate-100 text-slate-700';
          if (status === 'start' || status === 'end') bgClass = 'bg-blue-600 text-white hover:bg-blue-700';
          else if (status === 'range') bgClass = 'bg-blue-100 text-blue-700';
          else if (status === 'hover') bgClass = 'bg-blue-50 text-blue-600';

          return (
            <button
              key={day}
              onClick={() => handleDateClick(day)}
              onMouseEnter={() => setHoverDate(new Date(year, month, day))}
              className={`w-9 h-9 rounded-full flex items-center justify-center transition-all font-medium ${bgClass}`}
            >
              {day}
            </button>
          );
        })}
      </div>
      
      {/* Footer */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between items-center">
        <button onClick={onClose} className="text-xs text-slate-400 hover:text-slate-600">取消</button>
        <div className="text-xs font-bold text-blue-600">
            {startDate ? startDate.toLocaleDateString() : '請選擇出發'} 
            {endDate ? ` ➜ ${endDate.toLocaleDateString()}` : ''}
        </div>
      </div>
    </div>
  );
};
const SavedPlanItem = ({ plan, onLoad, onDelete }) => {
  const [translateX, setTranslateX] = useState(0);
  const startX = useRef(0);
  const isDragging = useRef(false);

  // 觸控開始：記錄起始點
  const onTouchStart = (e) => {
    startX.current = e.touches[0].clientX;
    isDragging.current = true;
  };

  // 觸控移動：計算滑動距離
  const onTouchMove = (e) => {
    if (!isDragging.current) return;
    const currentX = e.touches[0].clientX;
    const diff = currentX - startX.current;

    // 只允許向左滑 (diff < 0)，且限制最大滑動距離為 -100px
    if (diff < 0 && diff > -120) {
      setTranslateX(diff);
    }
  };

  // 觸控結束：決定是彈回還是展開
  const onTouchEnd = () => {
    isDragging.current = false;
    // 如果向左滑超過 60px，就固定在 -80px (展開刪除鍵)，否則彈回 0 (關閉)
    if (translateX < -60) {
      setTranslateX(-80);
    } else {
      setTranslateX(0);
    }
  };

  return (
    <div className="relative group overflow-hidden rounded-2xl shadow-sm border border-slate-100 hover:shadow-xl hover:border-blue-200 transition-all duration-300">
      
      {/* 1. 底層紅色刪除區塊 (左滑後露出) */}
      <div className="absolute inset-y-0 right-0 w-24 bg-red-500 flex items-center justify-center z-0">
        <button 
          onClick={(e) => { e.stopPropagation(); onDelete(plan.created); }}
          className="flex flex-col items-center text-white font-bold text-xs gap-1 w-full h-full justify-center active:bg-red-600"
        >
          <Trash2 className="w-6 h-6" />
          <span>刪除</span>
        </button>
      </div>

      {/* 2. 上層內容卡片 (可滑動) */}
      <div 
        className="relative z-10 bg-white p-6 cursor-pointer transition-transform duration-200 ease-out h-full"
        style={{ transform: `translateX(${translateX}px)` }}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        onClick={() => {
            // 如果已展開刪除鍵，點擊卡片則是"關閉刪除鍵"
            if (translateX < 0) setTranslateX(0);
            else onLoad(plan);
        }}
      >
        <div className="flex justify-between items-start mb-4">
          <h3 className="font-bold text-xl text-slate-800 line-clamp-1">{plan.basicInfo?.destinations || '旅程規劃'}</h3>
          <span className="text-xs bg-slate-100 text-slate-500 px-2 py-1 rounded-full font-mono shrink-0">
            {new Date(plan.created).toLocaleDateString()}
          </span>
        </div>
        
        <p className="text-slate-500 text-sm line-clamp-3 mb-6 min-h-[4rem] leading-relaxed">
           {plan.trip_summary}
        </p>

        <div className="flex items-center gap-4 text-sm text-slate-400 border-t border-slate-50 pt-4">
          <div className="flex items-center gap-1.5">
             <Calendar className="w-4 h-4 text-blue-400" /> {plan.days.length} 天
          </div>
          {/* 電腦版用的懸浮刪除按鈕 (手機版看不到) */}
          <button 
             onClick={(e) => { e.stopPropagation(); onDelete(plan.created); }}
             className="ml-auto p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors md:block hidden"
             title="刪除此規劃"
          >
             <Trash2 className="w-4 h-4" />
          </button>
        </div>

        {/* 手機版提示：左滑刪除 (僅在未滑動時顯示) */}
        {translateX === 0 && (
           <div className="absolute right-2 bottom-2 text-[10px] text-slate-300 md:hidden opacity-50 flex items-center gap-1">
             <ArrowLeft className="w-3 h-3" /> 左滑管理
           </div>
        )}
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

// --- 新增 API 函數: 重新生成單一行程項目資料 ---
async function regenerateSingleItem(newTitle, cityName, apiKey) {
  // 強制使用 2.5 Flash，避免 Pro 模型的配額限制 (Rate Limit)
  const TARGET_MODEL = 'gemini-2.5-flash'; 
  
  console.log(`[AI Edit] 正在使用模型: ${TARGET_MODEL} 進行生成...`);

  const prompt = `
    你是一個旅遊行程資料補全助手。使用者將行程中的某個點更改為新的地點："${newTitle}" (位於城市: ${cityName})。
    請針對這個新地點，生成符合現有行程資料結構的 JSON 物件。
    
    要求：
    1. 只回傳一個 JSON 物件，不要有 Markdown 標記。
    2. 物件必須包含以下欄位：
       - "title": "${newTitle}" (固定不變)
       - "description": 一段關於此地點的簡短吸引人描述 (50字內)。
       - "location_query": 用於 Google Maps 搜尋的精確關鍵字。
       - "transport_detail": 若此點通常需要特定交通方式到達，請簡述，否則留空。
       - "suggested_duration": 建議停留時間。
       - "type": 根據地點性質填入 "activity", "meal", "spot" 等。
       
       // ✅ 新增：要求回傳這兩個關鍵欄位
       - "warnings_tips": 針對此地點的重要提醒 (例如：需提前預約、禁帶外食、排隊需知)，若無則留空。
       - "menu_recommendations": 若此地點是餐廳或有販售食物，請提供 3-5 樣推薦菜色陣列。格式：[{ "local": "原文", "cn": "中文", "price": "預估價格" }]。若非餐廳，回傳 [] 空陣列。

    3. 請確保資料真實準確。
  `;

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${TARGET_MODEL}:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], generationConfig: { responseMimeType: "application/json" } })
    });
    
    const data = await response.json();

    if (data.error) {
        // 直接將 API 的原始錯誤拋出，方便除錯，不隱藏問題
        throw new Error(data.error.message || `API Error (${TARGET_MODEL})`);
    }

    const resultText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!resultText) {
        throw new Error("AI 無法生成內容 (Empty Response)");
    }

    const cleanedText = resultText.replace(/```json\n|\n```/g, '').trim(); 
    return JSON.parse(cleanedText);

  } catch (error) {
    console.error("單點生成失敗:", error);
    throw error;
  }
}
// --- 輔助函數: 將檔案轉為 Base64 ---
const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result.split(',')[1]); // 只取 base64 部分
    reader.onerror = (error) => reject(error);
  });
};

const MenuHelperModal = ({ isOpen, onClose, apiKey, currencySymbol }) => {
  const [selectedImages, setSelectedImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [menuData, setMenuData] = useState(null);
  const [isAnalyzingMenu, setIsAnalyzingMenu] = useState(false);
  
  const [budget, setBudget] = useState('');
  const [requests, setRequests] = useState('');
  const [recommendation, setRecommendation] = useState(null);
  const [isRecommending, setIsRecommending] = useState(false);
  
  // 處理圖片選擇
  const handleImageSelect = (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newFiles = Array.from(files);
    setSelectedImages(prev => [...prev, ...newFiles]);

    const newPreviews = newFiles.map(file => URL.createObjectURL(file));
    setImagePreviews(prev => [...prev, ...newPreviews]);
    
    // 注意：舊版代碼證明不需要手動清空 value，iOS 也能正常運作
    // 如果這裡清空，反而會導致 iOS 讀取失敗
  };

  const handleAnalyzeMenu = async () => {
    if (selectedImages.length === 0) return alert("請先選擇菜單照片");
    if (!apiKey) return alert("請輸入 API Key");

    setIsAnalyzingMenu(true);
    try {
        const imageParts = await Promise.all(selectedImages.map(async (file) => ({
            inlineData: {
                data: await fileToBase64(file),
                mimeType: file.type || "image/jpeg"
            }
        })));

        const TARGET_MODEL = 'gemini-2.5-flash'; 

        const prompt = `
          你是一個專業的菜單翻譯與整理助手。請分析傳入的菜單圖片。
          任務：
          1. 辨識圖片中的所有菜色。
          2. 將菜名翻譯成繁體中文。
          3. 根據性質分類 (例如: 開胃菜, 主餐, 飲料, 甜點...)。
          4. 找出價格，並區分含稅(tax_included)或不含稅(tax_excluded)。如果無法判斷，優先填入 tax_excluded。

          請回傳一個純 JSON 物件 (不要 Markdown)，格式如下:
          {
            "categories": [
              {
                "name": "類別名稱 (如: 主餐)",
                "items": [
                  {
                    "original_name": "原文菜名",
                    "translated_name": "中文菜名",
                    "description": "簡短描述成分或作法 (若有)",
                    "price_tax_excluded": 數字或 null,
                    "price_tax_included": 數字或 null
                  }
                ]
              }
            ]
          }
        `;
        
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${TARGET_MODEL}:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{
                    parts: [{ text: prompt }, ...imageParts]
                }]
            })
        });
        
        const data = await response.json();
        if (data.error) throw new Error(data.error.message);

        const resultText = data.candidates?.[0]?.content?.parts?.[0]?.text;
        const cleanedText = cleanJsonResult(resultText);
        setMenuData(JSON.parse(cleanedText));

    } catch (error) {
        console.error(error);
        alert("菜單分析失敗: " + error.message);
    } finally {
        setIsAnalyzingMenu(false);
    }
  };

  const handleRecommend = async () => {
    if (!menuData) return;
    if (!apiKey) return alert("請輸入 API Key");

    setIsRecommending(true);
    try {
        const prompt = `
           我有一份已整理好的菜單資料 (JSON): ${JSON.stringify(menuData)}
           我的需求如下:
           - 預算限制: ${budget ? budget + currencySymbol : '無限制'}
           - 特殊要求: ${requests || '無'}
           請擔任一位專業點餐顧問，推薦一套組合並說明理由。請直接用繁體中文回答。
        `;

         const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
        });
        const data = await response.json();
        if (data.error) throw new Error(data.error.message);
        setRecommendation(data.candidates?.[0]?.content?.parts?.[0]?.text);

    } catch (error) {
        alert("推薦失敗: " + error.message);
    } finally {
        setIsRecommending(false);
    }
  };
  
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-[2000] flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#3a2a25] rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl relative transition-colors duration-300">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500 to-red-500 p-4 flex justify-between items-center text-white shrink-0">
            <h3 className="font-bold text-lg flex items-center gap-2"><ChefHat/> AI 菜單翻譯助手</h3>
            <button onClick={onClose}><X /></button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-8">
            <div>
                <div className="flex items-center gap-4 mb-4 overflow-x-auto pb-2 min-h-[100px]">
                    {imagePreviews.map((src, idx) => (
                        <div key={idx} className="relative shrink-0">
                             <img src={src} alt="preview" className="h-24 w-24 object-cover rounded-lg border-2 border-orange-200" />
                        </div>
                    ))}
                    
                     {/* ✅ 關鍵修正：改回使用 label 包裹 input */}
                     <label className="h-24 w-24 flex flex-col items-center justify-center border-2 border-dashed border-slate-300 dark:border-[#5d4037] rounded-lg hover:bg-slate-50 dark:hover:bg-[#4a3b32] hover:border-orange-400 transition-colors shrink-0 cursor-pointer">
                        <Camera className="w-6 h-6 text-slate-400 dark:text-[#a08d85]" />
                        <span className="text-xs text-slate-500 dark:text-[#a08d85] mt-1">加入照片</span>
                        
                        {/* input 隱藏在 label 內，這是最標準且兼容性最好的寫法 */}
                        <input 
                            type="file" 
                            accept="image/*" 
                            multiple 
                            className="hidden" // 直接隱藏，靠 label 觸發
                            onChange={handleImageSelect} 
                        />
                    </label>
                </div>

                <button 
                    onClick={handleAnalyzeMenu} 
                    disabled={isAnalyzingMenu || selectedImages.length === 0}
                    className="w-full py-3 bg-orange-500 hover:bg-orange-600 disabled:bg-slate-300 dark:disabled:bg-[#4a3b32] text-white rounded-xl font-bold flex justify-center items-center gap-2 transition-all shadow-md"
                >
                    {isAnalyzingMenu ? <Loader2 className="animate-spin"/> : <Sparkles />} 
                    {isAnalyzingMenu ? 'AI 正在努力看菜單...' : '開始翻譯與整理菜單'}
                </button>
            </div>

            {/* ... (MenuData 顯示區塊，保持不變) ... */}
            {menuData && (
                <div className="space-y-6 animate-in slide-in-from-bottom-4">
                    {menuData.categories.map((cat, catIdx) => (
                        <div key={catIdx}>
                            <h4 className="font-bold text-orange-700 dark:text-orange-400 text-lg mb-2 pb-1 border-b border-orange-100 dark:border-orange-900/30">{cat.name}</h4>
                            <div className="space-y-3">
                                {cat.items.map((item, itemIdx) => (
                                    <div key={itemIdx} className="flex justify-between items-start bg-slate-50 dark:bg-[#2c1f1b] p-3 rounded-lg border border-transparent dark:border-[#4a3b32]">
                                        <div>
                                            <div className="font-bold text-slate-800 dark:text-[#ebd5c1]">{item.translated_name}</div>
                                            <div className="text-xs text-slate-500 dark:text-[#a08d85]">{item.original_name}</div>
                                            {item.description && <div className="text-sm text-slate-600 dark:text-[#d6c0b3] mt-1">{item.description}</div>}
                                        </div>
                                        <div className="text-right font-mono font-bold text-orange-600 dark:text-orange-400">
                                            {item.price_tax_included ? <>{currencySymbol}{item.price_tax_included}<span className="text-xs ml-1 text-slate-400">(含稅)</span></> : 
                                             item.price_tax_excluded ? <>{currencySymbol}{item.price_tax_excluded}<span className="text-xs ml-1 text-slate-400">(未稅)</span></> :
                                             '--'}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
        {/* ... Footer 保持不變 ... */}
        {menuData && (
            <div className="p-4 bg-orange-50 dark:bg-[#2c1f1b] border-t border-orange-100 dark:border-[#4a3b32] shrink-0">
                <div className="flex gap-3 mb-3">
                    <input type="number" placeholder={`預算 (例如: 2000${currencySymbol})`} value={budget} onChange={e=>setBudget(e.target.value)} className="flex-1 p-2 border rounded-lg text-sm outline-none focus:border-orange-400 dark:bg-[#33241f] dark:border-[#5d4037] dark:text-[#ebd5c1]" />
                    <input type="text" placeholder="特殊要求 (例如: 不吃牛)" value={requests} onChange={e=>setRequests(e.target.value)} className="flex-[2] p-2 border rounded-lg text-sm outline-none focus:border-orange-400 dark:bg-[#33241f] dark:border-[#5d4037] dark:text-[#ebd5c1]" />
                    <button onClick={handleRecommend} disabled={isRecommending} className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-bold flex items-center gap-1 disabled:bg-slate-300 transition-colors">
                        {isRecommending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />} AI 推薦
                    </button>
                </div>
                {recommendation && (
                    <div className="bg-white dark:bg-[#33241f] p-4 rounded-xl border border-red-100 dark:border-red-900/30 shadow-sm text-slate-700 dark:text-[#d6c0b3] leading-relaxed animate-in fade-in">
                        <h5 className="font-bold text-red-700 dark:text-red-400 mb-2 flex items-center gap-1">💡 推薦結果：</h5>
                        {recommendation}
                    </div>
                )}
            </div>
        )}
      </div>
    </div>
  );
};
const IconSelectorModal = ({ isOpen, onClose, onSelect }) => {
  if (!isOpen) return null;

  const icons = [
    { type: 'flight', label: '航班', icon: <Plane className="w-6 h-6" /> },
    { type: 'transport', label: '交通/移動', icon: <Train className="w-6 h-6" /> },
    { type: 'meal', label: '餐飲', icon: <Utensils className="w-6 h-6" /> },
    { type: 'hotel', label: '住宿', icon: <Hotel className="w-6 h-6" /> },
    { type: 'activity', label: '景點/活動', icon: <BookOpen className="w-6 h-6" /> },
    { type: 'spot', label: '地標/打卡', icon: <MapPin className="w-6 h-6" /> },
    { type: 'shopping', label: '購物', icon: <Wallet className="w-6 h-6" /> }, // 新增購物
  ];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[2000] p-4 animate-in fade-in">
      <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-slate-800">更換行程圖示</h3>
          <button onClick={onClose}><X className="w-5 h-5 text-slate-400" /></button>
        </div>
        <div className="grid grid-cols-4 gap-4">
          {icons.map((item) => (
            <button
              key={item.type}
              onClick={() => onSelect(item.type)}
              className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-slate-100 transition-colors border border-transparent hover:border-slate-200"
            >
              <div className="text-blue-600">{item.icon}</div>
              <span className="text-xs font-bold text-slate-600">{item.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
async function regenerateDayWeather(city, date, apiKey) {
  const TARGET_MODEL = 'gemini-2.5-flash'; 
  
  const prompt = `
    請查詢並預測 "${city}" 在日期 "${date}" 的天氣狀況。
    請回傳一個純 JSON 物件，包含以下兩個欄位 (繁體中文)：
    1. "weather_forecast": 簡短天氣敘述與氣溫 (例如: "🌤️ 多雲時晴 18°C-24°C，降雨機率 10%")
    2. "clothing_suggestion": 針對該氣溫的具體穿著建議 (例如: "早晚溫差大，建議洋蔥式穿搭，帶件薄外套")
    
    只需回傳 JSON，不要 Markdown。
  `;

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${TARGET_MODEL}:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], generationConfig: { responseMimeType: "application/json" } })
    });
    
    const data = await response.json();
    if (data.error) throw new Error(data.error.message);

    const resultText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    const cleanedText = resultText.replace(/```json\n|\n```/g, '').trim(); 
    return JSON.parse(cleanedText);

  } catch (error) {
    console.error("天氣更新失敗:", error);
    throw error;
  }
}


const App = () => {
  const [showCalendar, setShowCalendar] = useState(false);
  const [modelType, setModelType] = usePersistentState('gemini_model_type', 'pro');
  const [itineraryData, setItineraryData] = usePersistentState('current_itinerary_data', null);
  const [step, setStep] = useState(() => itineraryData ? 'result' : 'input');
  const [apiKey, setApiKey] = usePersistentState('gemini_api_key', '');
  const [showInputTutorial, setShowInputTutorial] = useState(true); // 預設開啟，內部會檢查 localStorage
  const [showResultTutorial, setShowResultTutorial] = useState(true);
  const textareaRef = useRef(null);
  const [showApiKeyTutorial, setShowApiKeyTutorial] = useState(false);
  const [editModalData, setEditModalData] = useState(null);
  const [addModalData, setAddModalData] = useState(null);
  const [isProcessingEdit, setIsProcessingEdit] = useState(false); // AI 處理中的 loading 狀態
  const [isMenuModalOpen, setIsMenuModalOpen] = useState(false);
  const [iconSelectModalData, setIconSelectModalData] = useState(null);
  const [simpleFlights, setSimpleFlights] = usePersistentState('travel_simple_flights', {
    outbound: { mode: 'flight', date: '', depTime: '', arrTime: '', code: '', station: '', type: '去程' },
    transit:  { mode: 'flight', date: '', depTime: '', arrTime: '', code: '', station: '', type: '中轉' },
    inbound:  { mode: 'flight', date: '', depTime: '', arrTime: '', code: '', station: '', type: '回程' },
  });

  
  const [multiFlights, setMultiFlights] = usePersistentState('travel_multi_flights', [
    // 預設給一個空的欄位，方便用戶直接填寫，也可以改成 [] 讓用戶自己按新增
    { id: Date.now(), type: '移動', mode: 'flight', date: '', depTime: '', arrTime: '', code: '', station: '', isOpen: true }
  ]);
  const [basicData, setBasicData] = usePersistentState('travel_basic_data', {
    destinations: '', // 清空
    dates: '',        // 清空
    type: '休閒 (慢步調)', // 給一個預設值即可
    travelers: 2,     // 預設人數可以留 1 或 2，避免報錯
    hasTransitTour: false, // 預設關閉
    isMultiCityFlight: false,
    hasFlights: true, // 預設開啟航班填寫
    transportMode: 'public', 
    needParking: false,
    specialRequests: '', // 清空
    priceRanges: { high: false, medium: false, low: false },
    enableCreditCard: true, 
    issuingCountry: 'TW',   
    otherCountryName: ''    
  });

  const [accommodations, setAccommodations] = usePersistentState('travel_accommodations', []);
  // 或者保留一個空的輸入框：
  // const [accommodations, setAccommodations] = usePersistentState('travel_accommodations', [
  //   { id: Date.now(), type: '飯店', source: '', name: '', address: '', orderId: '', booker: '', isOpen: true }
  // ]);

  const [travelerNames, setTravelerNames] = usePersistentState('traveler_names', ['旅伴 A', '旅伴 B']);
  const [expenses, setExpenses] = usePersistentState('travel_expenses', []);
  
  const [currencySettings, setCurrencySettings] = usePersistentState('currency_settings', {
    rate: 0.21,
    symbol: '$',
    code: 'JPY'
  });
  
  const [isCurrencyModalOpen, setIsCurrencyModalOpen] = useState(false);
  const [isTravelerModalOpen, setIsTravelerModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [errorMsg, setErrorMsg] = useState('');
  const [savedPlans, setSavedPlans] = useState([]);
  const [isExporting, setIsExporting] = useState(false); 
  const [copySuccess, setCopySuccess] = useState(false);
  const [showCopyMenu, setShowCopyMenu] = useState(false);
  const inputTutorialPages = [
    { icon: '🌍', title: '第一步：設定目的地與日期', desc: '輸入您想去的城市（如：東京、巴黎），並點擊日曆圖示選擇出發與回程日期。' },
    { icon: '✈️', title: '第二步：航班與交通', desc: '如果需要 AI 安排航班，請勾選「需要航班」。若您是自駕遊，請在交通偏好選擇「自駕」，我們會提供停車建議。' },
    { icon: '💰', title: '第三步：預算與信用卡', desc: '設定餐廳的價位偏好，並勾選「信用卡推薦」，AI 將根據您的發卡國家，計算最佳刷卡回饋攻略。' },
    { icon: '✨', title: '第四步：一鍵生成', desc: '填妥後點擊下方按鈕，AI 將在幾秒內為您生成包含景點、美食、交通與預算的完整行程！' }
  ];
  const handleIconUpdate = (newType) => {
    if (!iconSelectModalData) return;
    const { dayIndex, timelineIndex } = iconSelectModalData;
    
    const newItinerary = { ...itineraryData };
    newItinerary.days[dayIndex].timeline[timelineIndex].type = newType;
    
    setItineraryData(newItinerary);
    setIconSelectModalData(null); // 關閉視窗
  };
  const handleTimeUpdate = (dayIndex, timelineIndex, newTime) => {
    const newItinerary = { ...itineraryData };
    newItinerary.days[dayIndex].timeline[timelineIndex].time = newTime;
    // 為了保持順序，通常修改時間後應該重新排序，但在這裡我們先只更新時間，讓使用者自己決定順序
    setItineraryData(newItinerary);
  };

  // ✅ 1. 新增：更新整天的大標題資訊 (標題、副標、天氣)
  const updateDayInfo = (dayIndex, updates) => {
    setItineraryData(prev => {
        const newDays = [...prev.days];
        // 更新該天 (dayIndex) 的特定欄位
        newDays[dayIndex] = { ...newDays[dayIndex], ...updates };
        return { ...prev, days: newDays };
    });
  };

  // ✅ 2. 新增：處理天氣刷新按鈕
  const handleWeatherRefresh = async (dayIndex, city, date) => {
    if (!apiKey) return alert("需要 API Key");
    
    // 這裡我們不使用全域 loading，而是讓 DayTimeline 自己處理 loading 狀態
    // 所以這裡回傳 promise 讓組件去 await
    return regenerateDayWeather(city, date, apiKey).then(result => {
        updateDayInfo(dayIndex, {
            weather_forecast: result.weather_forecast,
            clothing_suggestion: result.clothing_suggestion
        });
        alert(`已更新 ${date} 的天氣預報！`);
    }).catch(err => {
        alert("天氣更新失敗: " + err.message);
    });
  };

  // ✅ 3. 新增：打開新增視窗
  const openAddModal = (dayIndex, insertIndex, city) => {
    setAddModalData({ dayIndex, insertIndex, time: '', title: '', city });
  };

  // ✅ 4. 新增：執行新增 (手動)
  const handleManualAddComplete = () => {
    const { dayIndex, insertIndex, time, title } = addModalData;
    if (!title.trim() || !time) return alert("請輸入時間與目的地");

    const newItem = {
      time,
      title,
      description: "手動新增的行程",
      type: "spot", // 預設類型
      location_query: title,
      user_notes: "",
      photos: []
    };

    const newItinerary = { ...itineraryData };
    // 在指定位置插入新項目
    newItinerary.days[dayIndex].timeline.splice(insertIndex, 0, newItem);
    
    setItineraryData(newItinerary);
    setAddModalData(null);
  };

  // ✅ 5. 新增：執行新增 (AI)
  const handleAIAddComplete = async () => {
    const { dayIndex, insertIndex, time, title, city } = addModalData;
    if (!title.trim() || !time) return alert("請輸入時間與目的地");
    if (!apiKey) return alert("需要 API Key");

    setIsProcessingEdit(true); // 共用 loading 狀態
    try {
      // 複用原本的單點生成 API
      const aiResult = await regenerateSingleItem(title, city, apiKey);
      
      const newItem = {
        time,
        title, // 確保標題是新的
        ...aiResult, // 展開 AI 查到的資料
        user_notes: "",
        photos: []
      };

      const newItinerary = { ...itineraryData };
      newItinerary.days[dayIndex].timeline.splice(insertIndex, 0, newItem);

      setItineraryData(newItinerary);
      setAddModalData(null);
    } catch (error) {
      alert("AI 新增失敗: " + error.message);
    } finally {
      setIsProcessingEdit(false);
    }
  };
  const resultTutorialPages = [
    { 
      icon: '🛠️', 
      title: '頂部工具列：您的控制中心', 
      desc: '左側可設定匯率(💰)與旅伴名稱(👥)。右側功能包含：複製純文字分享(📋)、列印 PDF(🖨️)、匯出 JSON 檔分享給朋友，可以通過主頁的匯入使用(📂)，還有最重要的「儲存行程」，如果沒有儲存，此次生成會消失喔(❤️)！' 
    },
    { 
      icon: '📍', 
      title: '景點卡片：四大神器', 
      desc: '每個景點右上有四個按鈕：\n1.🗺️ 地圖：直連 Google Maps 導航。\n2.📝 筆記：記錄訂位代號或備忘。\n3.📷 照片：上傳該景點的回憶。\n4.🤖 AI 深度導遊(紫色)：點擊後，AI 會針對此地提供「最佳步行路線、周邊必吃、治安提醒」！' 
    },
    { 
      icon: '📘', 
      title: '城市生存指南 & 省錢攻略', 
      desc: '點擊展開下方的藍色指南區塊。除了歷史文化、交通建議外，我們新增了「💳 信用卡回饋分析」與「🎁 補助/退稅情報」，AI 幫您算出刷哪張卡最划算！' 
    },
    { 
      icon: '💸', 
      title: '記帳小本本 & 圓餅圖', 
      desc: '點擊行程下方的「+ 新增消費」即可記帳，支援自動分帳 (Go Dutch)。頁面最下方會自動統計「當日」與「整趟旅程」的消費圓餅圖，預算控制一目了然。' 
    }
  ];
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
    setBasicData(prev => ({ 
      ...prev, 
      priceRanges: { 
        ...(prev.priceRanges || { high: false, medium: false, low: false }), 
        [name]: checked 
      } 
    }));
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
      setExpenses([]);
      localStorage.removeItem('current_itinerary_data'); 
      setItineraryData(null); 
      window.location.reload(); 
    }
  };

  const saveCurrentPlan = () => {
    if (!itineraryData) return;
    
    // 雖然 generateItinerary 有修正，但為了雙重保險，
    // 我們以「按下儲存按鈕」的當下時間 (Date.now()) 為準，這樣絕對不會錯。
    const currentTimestamp = Date.now();

    // 檢查是否已存在 (用舊的 created 判斷可能會有誤，這裡改用內容判斷稍微複雜，
    // 簡單解法：直接視為新的一筆，或者如果 id 一樣才覆蓋。
    // 在此我們採用：如果是剛生成的，就視為新的一筆；如果載入舊的再存，視為更新)
    
    // 為了避免邏輯複雜導致錯誤，這裡採取「總是存入正確時間」的策略
    const planToSave = { 
      ...itineraryData, 
      basicInfo: basicData, 
      expenses, 
      travelerNames,
      currencySettings,
      created: currentTimestamp // ✅ 強制覆寫：使用現在的時間 (毫秒)
    };

    // 檢查是否有相同 created 時間的舊資料 (針對編輯舊行程的情境)
    // 如果 itineraryData.created 已經存在且有效，我們更新它；否則新增
    let newPlans;
    const existingIndex = savedPlans.findIndex(p => p.created === itineraryData.created);
    
    if (existingIndex >= 0) {
       // 更新舊資料 (保留舊的 created 時間，或者您可以決定要不要更新成現在)
       // 這裡我們選擇：更新內容，但保留原始建立時間，以免順序亂跳
       // 但如果您希望「編輯後置頂」，就用 planToSave.created
       const updatedPlan = { ...planToSave, created: savedPlans[existingIndex].created };
       newPlans = [...savedPlans];
       newPlans[existingIndex] = updatedPlan;
    } else {
       // 新增資料
       newPlans = [planToSave, ...savedPlans];
    }

    setSavedPlans(newPlans);
    localStorage.setItem('my_travel_plans', JSON.stringify(newPlans));
    
    // 更新當前狀態的 created，避免連續按儲存重複新增
    if (existingIndex === -1) {
        setItineraryData(prev => ({ ...prev, created: currentTimestamp }));
    }
    
    alert('規劃已儲存！');
  };

  const clearApiKey = () => {
    setApiKey('');
    localStorage.removeItem('gemini_api_key');
  };

  const loadSavedPlan = (plan) => {
    setItineraryData(plan);
    setBasicData(plan.basicInfo || basicData);
    setExpenses(plan.expenses || []);
    const count = Number(plan.basicInfo?.travelers || 2);
    // 如果存檔有名字就用存檔的，否則根據人數產生預設陣列 ['旅伴 1', '旅伴 2'...]
    const defaultNames = Array.from({ length: count }, (_, i) => `旅伴 ${i + 1}`);
    setTravelerNames(plan.travelerNames || defaultNames);
    if (plan.currencySettings) setCurrencySettings(plan.currencySettings);
    setStep('result');
    setActiveTab(0);
  };
  const deletePlan = (createdTimestamp) => {
    if (confirm('確定要刪除這個行程嗎？刪除後無法復原。')) {
      const newPlans = savedPlans.filter(p => p.created !== createdTimestamp);
      setSavedPlans(newPlans);
      // usePersistentState 會自動同步到 localStorage，無需手動 setItem
      // 但為了確保萬無一失 (因為 setSavedPlans 是非同步的)，我們這裡也可以顯式寫入
      try {
         localStorage.setItem('my_travel_plans', JSON.stringify(newPlans));
      } catch (e) { console.error(e); }
    }
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
    (itineraryData.days || []).forEach(day => {
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
      const fmtMode = (m) => m === 'train' ? '火車/高鐵' : '飛機';
      if (basicData.isMultiCityFlight) {
        flightsString = multiFlights.map(f => 
          `${f.type} | 交通:${fmtMode(f.mode)} | 日期:${f.date} | 出發:${f.depTime} | 抵達:${f.arrTime} | 班次:${f.code} | 地點:${f.station}`
        ).join('\n');
      } else {
        const renderLeg = (leg) => 
          `${leg.type} | 交通:${fmtMode(leg.mode)} | 日期:${leg.date} | 出發:${leg.depTime} | 抵達:${leg.arrTime} | 班次:${leg.code} | 地點:${leg.station}`;

        flightsString = [
          renderLeg(simpleFlights.outbound),
          simpleFlights.transit.date ? renderLeg(simpleFlights.transit) : null,
          renderLeg(simpleFlights.inbound)
        ].filter(Boolean).join('\n');
      }
    }

    const accommodationString = accommodations.map(a => `住處:${a.name}(${a.type}) 地址:${a.address}`).join('\n');

    const selectedPrices = [];
    if (basicData.priceRanges?.high) selectedPrices.push("高 (1000 TWD+)");
    if (basicData.priceRanges?.medium) selectedPrices.push("中 (301-1000 TWD)");
    if (basicData.priceRanges?.low) selectedPrices.push("低 (<300 TWD)");
    const priceConstraint = selectedPrices.length > 0 ? selectedPrices.join(', ') : "無限制";

    const transportConstraint = basicData.transportMode === 'self_driving' 
      ? "Self-driving (Prioritize driving routes/distances)" 
      : "Public Transport";
    
    const parkingConstraint = (basicData.transportMode === 'self_driving' && basicData.needParking)
      ? "Include nearby parking lot recommendations with estimated prices for each stop (Activity/Meal)."
      : "";
    const selectedCountryName = ISSUING_COUNTRIES.find(c => c.code === basicData.issuingCountry)?.name || basicData.otherCountryName || basicData.issuingCountry;
    
    const TARGET_MODEL = modelType === 'pro' ? 'gemini-2.5-pro' : 'gemini-2.5-flash';
    console.log("Current Model Strategy:", TARGET_MODEL);

    const systemPrompt = `
      You are an expert AI Travel Planner API. Respond with valid JSON only.
      User Constraints:
      - Destinations: ${basicData.destinations}
      - Dates: ${basicData.dates}
      - Type: ${basicData.type}
      - Travelers: ${basicData.travelers}
      - Flights: ${flightsString}
      - Transport Mode: ${transportConstraint}
      - Parking Info Needed: ${parkingConstraint}
      - Accommodation: ${accommodationString}
      - Transit Tour: ${basicData.hasTransitTour}
      - Special Requests: ${basicData.specialRequests || "None"}
      - Restaurant Budget: ${priceConstraint}
      - User's Home Country (for Bank List): ${selectedCountryName}
      
      Requirements:
      1. Logistics: Realistic travel times + buffer.
      2. Culture & History: detailed background story.
      3. Food: Menu translation.
      4. Weather: Temp range & clothing.
      5. Currency: Local currency code & rate to TWD.
      6. **City Guide**: For each major city, include history, transport, safety, subsidies, tax_refund, and major_banks_list.
      7. **Basic Phrases (MANDATORY)**: You MUST generate an array of EXACTLY 5 objects for "basic_phrases". 
      8. Output Language: Traditional Chinese (Taiwan).
      9. major_banks_list: [CRITICAL] An array of 15-20 major consumer banks located in "${selectedCountryName}" (User's Origin). DO NOT list banks from the destination city.
      10. **Currency Rate (MANDATORY)**: You MUST provide the numerical exchange rate in "currency_rate_val". Example: if 1 EUR = 34.5 TWD, value is 34.5.
      
      JSON Schema Structure:
      {
        "trip_summary": "String",
        "currency_rate": "String (e.g. '1 EUR ≈ 34.5 TWD')",
        "currency_rate_val": Number, // CRITICAL: The raw number (e.g. 34.5) for calculation
        "currency_code": "String (e.g. 'EUR')",
        "city_guides": {
           "CityName": {
             "history_culture": "String",
             "transport_tips": "String",
             "safety_scams": "String",
             "subsidies": "String",
             "tax_refund": "String",
             "major_banks_list": ["Bank A", "Bank B"],
             "basic_phrases": [ 
                { "label": "你好", "local": "...", "roman": "..." },
                { "label": "謝謝", "local": "...", "roman": "..." },
                { "label": "對不起", "local": "...", "roman": "..." },
                { "label": "請問", "local": "...", "roman": "..." },
                { "label": "多少錢", "local": "...", "roman": "..." }
             ]
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
      const fetchWithModel = async (modelId) => {
         const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${modelId}:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: [{ text: systemPrompt }] }], generationConfig: { responseMimeType: "application/json" } })
         });
         const resData = await response.json();
         if (resData.error) throw new Error(resData.error.message);
         return resData;
      };

      let data;
      try {
         console.log(`嘗試使用模型: ${TARGET_MODEL}`);
         data = await fetchWithModel(TARGET_MODEL);
      } catch (err) {
         console.warn(`${TARGET_MODEL} 失敗，嘗試自動降級至 gemini-2.5-flash-preview-09-2025...`, err);
         data = await fetchWithModel('gemini-2.5-flash-preview-09-2025');
      }
      const resultText = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!resultText) throw new Error("AI 回傳內容為空");
      
      const cleanedText = cleanJsonResult(resultText);
      let parsedData;
      
      try {
        parsedData = JSON.parse(cleanedText);
      } catch (parseError) {
        console.error("JSON Parse Error:", parseError);
        throw new Error("無法解析 AI 回傳的行程資料格式");
      }

      // 強制使用當下時間
      parsedData.created = Date.now();
      
      // --- 匯率解析邏輯優化 ---
      if (parsedData.currency_code) {
        let rate = 0.21; // 預設值 (以防萬一)
        
        // 1. 優先使用 AI 回傳的精準數值
        if (parsedData.currency_rate_val && typeof parsedData.currency_rate_val === 'number') {
            rate = parsedData.currency_rate_val;
        } 
        // 2. 如果沒有數值，嘗試解析字串 (支援 =, ≈, :)
        else if (parsedData.currency_rate) {
             // 嘗試抓取 TWD 前面的數字 (最準確)
             const twdMatch = parsedData.currency_rate.match(/([\d.]+)\s*TWD/i);
             if (twdMatch) {
                 rate = parseFloat(twdMatch[1]);
             } else {
                 // 否則抓取任何看起來像匯率的數字 (排除前面的 1)
                 const fallbackMatch = parsedData.currency_rate.match(/[=≈:]\s*([\d.]+)/);
                 if (fallbackMatch) {
                    rate = parseFloat(fallbackMatch[1]);
                 }
             }
        }

        let symbol = '$';
        const code = parsedData.currency_code.toUpperCase();
        if (code === 'JPY') symbol = '¥';
        if (code === 'KRW') symbol = '₩';
        if (code === 'EUR') symbol = '€';
        if (code === 'GBP') symbol = '£';
        if (code === 'USD') symbol = '$';
        if (code === 'CNY') symbol = '¥';
        if (code === 'THB') symbol = '฿';
        if (code === 'VND') symbol = '₫';
        
        setCurrencySettings({
           rate: rate,
           symbol: symbol,
           code: code
        });
      }

      setItineraryData(parsedData);
      setExpenses([]);
      setStep('result');

    } catch (error) {
      console.error(error);
      setErrorMsg(`生成失敗: ${error.message}`);
      setStep('input');
    }
  };

  const handleUpdateCreditCardAnalysis = (city, analysis) => {
      setItineraryData(prev => {
          if (!prev || !prev.city_guides || !prev.city_guides[city]) return prev;
          
          return {
              ...prev,
              city_guides: {
                  ...prev.city_guides,
                  [city]: {
                      ...prev.city_guides[city],
                      credit_card_analysis: analysis
                  }
              }
          };
      });
  };
  useEffect(() => {
    if (textareaRef.current) {
      // 先重置高度為 auto，讓 scrollHeight 能夠正確計算縮小的情況
      textareaRef.current.style.height = 'auto';
      // 設定高度為內容高度 (scrollHeight)
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [basicData.specialRequests]); // 只要內容變了就觸發

  const handleDeleteItem = (dayIndex, itemIndex) => {
    if (!window.confirm("確定要刪除這個行程嗎？刪除後無法復原。")) return;
  
    const newItinerary = { ...itineraryData };
    const deletedItemTitle = newItinerary.days[dayIndex].timeline[itemIndex].title;
  
    // 1. 從時間軸中移除
    newItinerary.days[dayIndex].timeline.splice(itemIndex, 1);
    setItineraryData(newItinerary);
  
    // 2. (重要) 同步刪除關聯的記帳資料 (假設記帳是綁定地點名稱的)
    const updatedExpenses = expenses.filter(exp => exp.location !== deletedItemTitle);
    if (updatedExpenses.length !== expenses.length) {
        setExpenses(updatedExpenses);
        alert(`已刪除行程，並同步移除了 ${expenses.length - updatedExpenses.length} 筆關聯的記帳紀錄。`);
    }
  };
  
  // --- 核心邏輯：打開編輯對話框 ---
  const openEditModal = (dayIndex, itemIndex, currentTitle, city) => {
    setEditModalData({ dayIndex, itemIndex, currentTitle, newTitle: currentTitle, city });
  };
  
  // --- 核心邏輯：執行編輯 (手動完成) ---
  const handleManualEditComplete = () => {
    const { dayIndex, itemIndex, newTitle, currentTitle } = editModalData;
    if (!newTitle.trim() || newTitle === currentTitle) {
      setEditModalData(null); return;
    }

    const newItinerary = { ...itineraryData };
    const item = newItinerary.days[dayIndex].timeline[itemIndex];

    // 更新標題與搜尋關鍵字
    item.title = newTitle;
    item.location_query = newTitle;
    
    // ✅ 關鍵修正：因為地點換了，舊的「AI 深度導遊 (推薦/路線)」已經無效，必須清空
    // 這樣介面上的紫色按鈕會重置，您可以再點一次來生成新地點的推薦
    item.ai_details = null; 
    
    setItineraryData(newItinerary);
    updateRelatedExpenses(currentTitle, newTitle);
    setEditModalData(null);
  };

  // --- 修正後的 handleAIEditComplete (AI 編輯) ---
  const handleAIEditComplete = async () => {
    const { dayIndex, itemIndex, newTitle, currentTitle, city } = editModalData;
    if (!newTitle.trim()) return alert("請輸入新的地點名稱");
    if (!apiKey) return alert("需要 API Key 才能使用 AI 功能");

    setIsProcessingEdit(true);
    try {
      const aiResult = await regenerateSingleItem(newTitle, city, apiKey);
      
      const newItinerary = { ...itineraryData };
      const oldItemData = newItinerary.days[dayIndex].timeline[itemIndex];

      // 合併資料邏輯：
      // 1. ...oldItemData: 保留使用者手動輸入的筆記 (user_notes)、照片 (photos)、記帳 (expenses)
      // 2. 覆蓋舊有的 AI 生成欄位，避免殘留
      newItinerary.days[dayIndex].timeline[itemIndex] = {
          ...oldItemData, 
          
          // ✅ 先清空舊的 AI 資料 (預設值)
          warnings_tips: "",
          menu_recommendations: [],
          ai_details: null,

          // ✅ 再填入 AI 新生成的資料 (aiResult 裡面的值會覆蓋上面的預設值)
          ...aiResult,    
          
          title: newTitle 
      };

      setItineraryData(newItinerary);
      updateRelatedExpenses(currentTitle, newTitle);
      setEditModalData(null);
    } catch (error) {
      alert("AI 生成失敗: " + error.message);
    } finally {
      setIsProcessingEdit(false);
    }
  };
  
  // 輔助函數：同步更新記帳資料的地點名稱
  const updateRelatedExpenses = (oldTitle, newTitle) => {
      if (oldTitle === newTitle) return;
      const updatedExpenses = expenses.map(exp => 
          exp.location === oldTitle ? { ...exp, location: newTitle } : exp
      );
      setExpenses(updatedExpenses);
  };
 
  const renderInputForm = () => {
    return (
      // ✅ 修改：輸入表單容器 (深色模式：摩卡色背景 + 深咖啡邊框)
      <div className="max-w-4xl mx-auto bg-white/80 dark:bg-[#3a2a25]/90 backdrop-blur-xl p-6 md:p-8 rounded-3xl shadow-2xl space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 border border-white/50 dark:border-[#5d4037] print:hidden transition-colors duration-300">
        <TutorialModal 
           isOpen={showInputTutorial} 
           onClose={() => setShowInputTutorial(false)} 
           title="新手上路：如何規劃？"
           pages={inputTutorialPages}
           storageKey="tutorial_input_seen"
        />
        <ApiKeyTutorialModal 
           isOpen={showApiKeyTutorial} 
           onClose={() => setShowApiKeyTutorial(false)} 
        />
        {/* --- Header 區域開始 --- */}
        <div className="pb-6 border-b border-slate-100/50 dark:border-[#5d4037]/50">
          
          {/* 1. 上排：功能按鈕區 */}
          <div className="flex justify-start mb-4">
            <button 
              onClick={() => { localStorage.removeItem('tutorial_input_seen'); setShowInputTutorial(true); }}
              className="px-3 py-2 text-slate-500 dark:text-[#d6c0b3] hover:text-blue-600 dark:hover:text-sky-300 transition-colors flex items-center gap-2 text-sm font-bold border border-slate-200 dark:border-[#5d4037] rounded-xl hover:bg-blue-50 dark:hover:bg-[#4a3b32] bg-white dark:bg-[#2c1f1b] shadow-sm"
            >
               <Info className="w-4 h-4" /> 使用教學
            </button>
          </div>

          {/* 2. 下排：標題區 */}
          <div className="text-center">
            <h1 className="text-3xl md:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-teal-500 dark:from-sky-300 dark:to-teal-300 flex items-center justify-center gap-3 flex-wrap">
              <Sparkles className="w-8 h-8 md:w-10 md:h-10 text-teal-500 dark:text-teal-300" />
              AI 智能旅程規劃師
            </h1>
            <p className="text-slate-500 dark:text-[#d6c0b3] mt-3 text-base md:text-lg">智慧分析航班與機場，為您量身打造深度文化之旅</p>
          </div>
        </div>

        <div className="space-y-6">
          {/* API Key 區塊 */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-[#2a1e1a] dark:to-[#33241f] p-5 md:p-6 rounded-2xl border border-blue-100 dark:border-[#5d4037] shadow-inner transition-colors duration-300">
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-bold text-blue-800 dark:text-sky-200 flex items-center gap-2">
                <Key className="w-4 h-4" /> Gemini API Key (必填)
                <button 
                  onClick={() => setShowApiKeyTutorial(true)}
                  className="text-xs bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-200 px-2 py-0.5 rounded-full hover:bg-amber-200 dark:hover:bg-amber-800 transition-colors flex items-center gap-1 font-normal cursor-pointer"
                >
                  <Info className="w-3 h-3" /> 如何獲取?
                </button>
              </label>
              <div className="flex gap-2">
                <button onClick={resetForm} className="text-xs text-slate-500 dark:text-[#a08d85] hover:text-slate-700 dark:hover:text-[#ebd5c1] underline transition-colors">重置所有欄位</button>
                {apiKey && <button onClick={clearApiKey} className="text-xs text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 underline transition-colors">清除儲存的 Key</button>}
              </div>
            </div>
            <div className="relative">
               <input 
                 type="password" 
                 value={apiKey} 
                 onChange={(e) => setApiKey(e.target.value)} 
                 placeholder="貼上您的 API Key (將自動儲存在本機)" 
                 className="w-full pl-4 pr-4 py-3 bg-white dark:bg-[#2c1f1b] border border-blue-200 dark:border-[#5d4037] rounded-xl focus:ring-4 focus:ring-blue-100 dark:focus:ring-[#5d4037]/50 focus:border-blue-500 dark:focus:border-sky-400 outline-none transition-all shadow-sm text-sm md:text-base dark:text-[#ebd5c1]" 
               />
            </div>
            
            {/* 模型選擇區塊 */}
            <div className="bg-white/60 dark:bg-[#2c1f1b]/60 p-3 rounded-xl border border-blue-100/50 dark:border-[#5d4037]/50 mt-4">
              <div className="text-xs font-bold text-slate-500 dark:text-[#a08d85] mb-2 flex items-center gap-1">
                <Bot className="w-3 h-3" /> 選擇 AI 模型引擎
              </div>
              <div className="flex flex-col md:flex-row gap-3">
                {/* 2.5 Pro 選項 */}
                <label className={`flex-1 relative cursor-pointer border rounded-lg p-3 transition-all ${modelType === 'pro' ? 'bg-indigo-50 dark:bg-[#3e2b26] border-indigo-500 dark:border-sky-400 shadow-sm' : 'bg-white dark:bg-[#2c1f1b] border-slate-200 dark:border-[#5d4037] hover:bg-slate-50 dark:hover:bg-[#33241f]'}`}>
                  <div className="flex items-start gap-3">
                    <input 
                      type="radio" 
                      name="modelType" 
                      value="pro" 
                      checked={modelType === 'pro'} 
                      onChange={() => setModelType('pro')}
                      className="mt-1 w-4 h-4 text-indigo-600 focus:ring-indigo-500 dark:bg-[#1e1410] dark:border-[#5d4037]"
                    />
                    <div>
                      <span className="block text-sm font-bold text-slate-800 dark:text-[#ebd5c1]">使用 2.5 Pro (完整版)</span>
                      <span className="block text-xs text-slate-500 dark:text-[#a08d85] mt-1">輸出慢但更完整，適合複雜規劃。</span>
                      <span className="block text-[10px] text-amber-600 dark:text-amber-400 mt-0.5 font-mono">限制: ~2次/分</span>
                    </div>
                  </div>
                </label>
    
                {/* 2.5 Flash 選項 */}
                <label className={`flex-1 relative cursor-pointer border rounded-lg p-3 transition-all ${modelType === 'flash' ? 'bg-indigo-50 dark:bg-[#3e2b26] border-indigo-500 dark:border-sky-400 shadow-sm' : 'bg-white dark:bg-[#2c1f1b] border-slate-200 dark:border-[#5d4037] hover:bg-slate-50 dark:hover:bg-[#33241f]'}`}>
                  <div className="flex items-start gap-3">
                    <input 
                      type="radio" 
                      name="modelType" 
                      value="flash" 
                      checked={modelType === 'flash'} 
                      onChange={() => setModelType('flash')}
                      className="mt-1 w-4 h-4 text-indigo-600 focus:ring-indigo-500 dark:bg-[#1e1410] dark:border-[#5d4037]"
                    />
                    <div>
                      <span className="block text-sm font-bold text-slate-800 dark:text-[#ebd5c1]">使用 2.5 Flash (極速版)</span>
                      <span className="block text-xs text-slate-500 dark:text-[#a08d85] mt-1">輸出快但可能會漏細節。</span>
                      <span className="block text-[10px] text-amber-600 dark:text-amber-400 mt-0.5 font-mono">限制: ~3次/分</span>
                    </div>
                  </div>
                </label>
              </div>
            </div>
          </div>
          
          <section className="space-y-4">
            <h3 className="text-lg md:text-xl font-bold text-slate-800 dark:text-[#ebd5c1] flex items-center gap-2">
              <span className="bg-blue-100 dark:bg-sky-900/50 p-2 rounded-lg text-blue-600 dark:text-sky-300"><MapPin className="w-5 h-5" /></span>基本行程
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-600 dark:text-[#d6c0b3]">
                  目的城市 
                  <span className="text-xs text-slate-400 dark:text-[#8e7c75] font-normal ml-2">
                    (多個城市請用逗號或空白隔開)
                  </span>
                </label>
                <input 
                  name="destinations" 
                  value={basicData.destinations} 
                  onChange={handleBasicChange} 
                  placeholder="例如：福岡, 熊本, 由布院"
                  className="w-full p-3 md:p-4 bg-slate-50 dark:bg-[#2c1f1b] border border-slate-200 dark:border-[#5d4037] rounded-xl focus:ring-2 focus:ring-blue-500 dark:focus:ring-sky-400 outline-none transition-all text-sm md:text-base dark:text-[#ebd5c1] dark:placeholder-[#6e5850]" 
                />
              </div>
              
              {/* 日期選擇 (含月曆) */}
              <div className="space-y-2 relative">
                <label className="text-sm font-semibold text-slate-600 dark:text-[#d6c0b3]">旅遊日期</label>
                <div 
                  className="relative cursor-pointer"
                  onClick={() => setShowCalendar(!showCalendar)}
                >
                  <Calendar className="absolute left-4 top-3.5 md:top-4 w-5 h-5 text-slate-400 dark:text-[#8e7c75]" />
                  <input 
                    name="dates" 
                    value={basicData.dates} 
                    readOnly 
                    className="w-full pl-12 p-3 md:p-4 bg-slate-50 dark:bg-[#2c1f1b] border border-slate-200 dark:border-[#5d4037] rounded-xl focus:ring-2 focus:ring-blue-500 dark:focus:ring-sky-400 outline-none transition-all text-sm md:text-base cursor-pointer dark:text-[#ebd5c1] dark:placeholder-[#6e5850]" 
                    placeholder="點擊選擇日期範圍"
                  />
                </div>
                {showCalendar && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowCalendar(false)}></div>
                    <DateRangePicker 
                      value={basicData.dates}
                      onChange={(newDates) => setBasicData(prev => ({ ...prev, dates: newDates }))}
                      onClose={() => setShowCalendar(false)}
                    />
                  </>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-600 dark:text-[#d6c0b3]">風格</label>
                <select name="type" value={basicData.type} onChange={handleBasicChange} className="w-full p-3 md:p-4 bg-slate-50 dark:bg-[#2c1f1b] border border-slate-200 dark:border-[#5d4037] rounded-xl focus:ring-2 focus:ring-blue-500 dark:focus:ring-sky-400 outline-none transition-all appearance-none text-sm md:text-base dark:text-[#ebd5c1]">
                  <option>休閒 (慢步調)</option>
                  <option>購物 (商圈為主)</option>
                  <option>文化 (歷史古蹟)</option>
                  <option>深度 (在地體驗)</option>
                  <option>綜合 (購物+文化)</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-600 dark:text-[#d6c0b3]">人數</label>
                <div className="relative">
                  <Users className="absolute left-4 top-3.5 md:top-4 w-5 h-5 text-slate-400 dark:text-[#8e7c75]" />
                  <input type="number" name="travelers" value={basicData.travelers} onChange={handleBasicChange} className="w-full pl-12 p-3 md:p-4 bg-slate-50 dark:bg-[#2c1f1b] border border-slate-200 dark:border-[#5d4037] rounded-xl focus:ring-2 focus:ring-blue-500 dark:focus:ring-sky-400 outline-none transition-all text-sm md:text-base dark:text-[#ebd5c1]" />
                </div>
              </div>
            </div>
  
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-600 dark:text-[#d6c0b3]">交通偏好</label>
                <div className="relative">
                  {basicData.transportMode === 'self_driving' ? <Car className="absolute left-4 top-3.5 md:top-4 w-5 h-5 text-slate-400 dark:text-[#8e7c75]" /> : <Train className="absolute left-4 top-3.5 md:top-4 w-5 h-5 text-slate-400 dark:text-[#8e7c75]" />}
                  <select name="transportMode" value={basicData.transportMode} onChange={handleBasicChange} className="w-full pl-12 p-3 md:p-4 bg-slate-50 dark:bg-[#2c1f1b] border border-slate-200 dark:border-[#5d4037] rounded-xl focus:ring-2 focus:ring-blue-500 dark:focus:ring-sky-400 outline-none transition-all appearance-none text-sm md:text-base dark:text-[#ebd5c1]">
                    <option value="public">大眾交通</option>
                    <option value="self_driving">自駕</option>
                  </select>
                </div>
              </div>
              
              {basicData.transportMode === 'self_driving' && (
                <div className="space-y-2 flex items-center h-full pt-6">
                  <label className="flex items-center gap-3 cursor-pointer bg-slate-50 dark:bg-[#2c1f1b] p-3 rounded-xl border border-slate-200 dark:border-[#5d4037] w-full hover:bg-slate-100 dark:hover:bg-[#33241f] transition-colors">
                    <input 
                      type="checkbox" 
                      name="needParking" 
                      checked={basicData.needParking} 
                      onChange={handleBasicChange} 
                      className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500 dark:bg-[#1e1410] dark:border-[#5d4037]" 
                    />
                    <span className="text-sm font-semibold text-slate-700 dark:text-[#ebd5c1] flex items-center gap-2">
                      <ParkingCircle className="w-5 h-5 text-slate-500 dark:text-[#a08d85]" />
                      是否提供停車資訊
                    </span>
                  </label>
                </div>
              )}
            </div>
          </section>
  
          <hr className="border-slate-100 dark:border-[#5d4037]" />
  
          {/* 特殊要求與價位 */}
          <section className="space-y-4">
            <h3 className="text-lg md:text-xl font-bold text-slate-800 dark:text-[#ebd5c1] flex items-center gap-2">
              <span className="bg-purple-100 dark:bg-purple-900/50 p-2 rounded-lg text-purple-600 dark:text-purple-300"><MessageSquare className="w-5 h-5" /></span>特殊要求與偏好
            </h3>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-600 dark:text-[#d6c0b3]">特殊要求</label>
              <textarea 
                ref={textareaRef} // 綁定 ref
                name="specialRequests" 
                value={basicData.specialRequests} 
                onChange={handleBasicChange} 
                rows={2} 
                className="w-full p-3 md:p-4 bg-slate-50 dark:bg-[#2c1f1b] border border-slate-200 dark:border-[#5d4037] rounded-xl focus:ring-2 focus:ring-blue-500 dark:focus:ring-sky-400 outline-none transition-all text-sm md:text-base min-h-[80px] max-h-[240px] resize-none overflow-y-auto dark:text-[#ebd5c1] dark:placeholder-[#6e5850]" 
                placeholder="例如：一定要吃燒肉、想在天神待久一點..." 
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-600 dark:text-[#d6c0b3] flex items-center gap-2"><Banknote className="w-4 h-4" /> 餐廳價位偏好</label>
              <div className="flex flex-wrap gap-3">
                {[
                  { key: 'high', label: '高 (NT$1000+)' },
                  { key: 'medium', label: '中 (NT$301-1000)' },
                  { key: 'low', label: '低 (NT$300以下)' }
                ].map((price) => (
                  <label key={price.key} className="flex items-center gap-2 bg-slate-50 dark:bg-[#2c1f1b] px-4 py-3 rounded-xl border border-slate-200 dark:border-[#5d4037] cursor-pointer hover:bg-slate-100 dark:hover:bg-[#33241f] transition-colors">
                    <input type="checkbox" name={price.key} checked={basicData.priceRanges?.[price.key] || false} onChange={handlePriceChange} className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500 dark:bg-[#1e1410] dark:border-[#5d4037]" />
                    <span className="text-sm font-medium text-slate-700 dark:text-[#ebd5c1]">{price.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </section>

          <hr className="border-slate-100 dark:border-[#5d4037]" />
          
          {/* 信用卡區塊 */}
          <section className="space-y-4">
              <h3 className="text-lg md:text-xl font-bold text-slate-800 dark:text-[#ebd5c1] flex items-center gap-2">
              <span className="bg-emerald-100 dark:bg-emerald-900/50 p-2 rounded-lg text-emerald-600 dark:text-emerald-300"><CreditCard className="w-5 h-5" /></span>支付與回饋設定
              </h3>
              
              <div className="space-y-2 flex items-center h-full">
                  <label className="flex items-center gap-3 cursor-pointer bg-slate-50 dark:bg-[#2c1f1b] p-3 rounded-xl border border-slate-200 dark:border-[#5d4037] w-full hover:bg-slate-100 dark:hover:bg-[#33241f] transition-colors">
                      <input 
                      type="checkbox" 
                      name="enableCreditCard" 
                      checked={basicData.enableCreditCard} 
                      onChange={handleBasicChange} 
                      className="w-5 h-5 text-emerald-600 rounded focus:ring-emerald-500 dark:bg-[#1e1410] dark:border-[#5d4037]" 
                      />
                      <span className="text-sm font-semibold text-slate-700 dark:text-[#ebd5c1]">
                      開啟「信用卡回饋與優惠」推薦功能
                      </span>
                  </label>
              </div>
          
              {basicData.enableCreditCard && (
                  <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                      <label className="text-sm font-semibold text-slate-600 dark:text-[#d6c0b3]">您的信用卡發卡國家/地區</label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div className="relative">
                              <select 
                                  name="issuingCountry" 
                                  value={basicData.issuingCountry} 
                                  onChange={handleBasicChange} 
                                  className="w-full p-3 md:p-4 bg-slate-50 dark:bg-[#2c1f1b] border border-slate-200 dark:border-[#5d4037] rounded-xl focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400 outline-none transition-all appearance-none text-sm md:text-base dark:text-[#ebd5c1]"
                              >
                                  {ISSUING_COUNTRIES && ISSUING_COUNTRIES.map(c => (
                                      <option key={c.code} value={c.code}>{c.name}</option>
                                  ))}
                              </select>
                              <ChevronDown className="absolute right-4 top-4 w-4 h-4 text-slate-400 dark:text-[#8e7c75] pointer-events-none" />
                          </div>
                          {basicData.issuingCountry === 'OTHER' && (
                              <input 
                                  name="otherCountryName" 
                                  placeholder="請輸入國家名稱" 
                                  value={basicData.otherCountryName} 
                                  onChange={handleBasicChange} 
                                  className="w-full p-3 md:p-4 bg-slate-50 dark:bg-[#2c1f1b] border border-slate-200 dark:border-[#5d4037] rounded-xl focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400 outline-none text-sm dark:text-[#ebd5c1]" 
                              />
                          )}
                      </div>
                      <p className="text-xs text-slate-400 dark:text-[#8e7c75] pl-1">AI 將根據此設定，列出您可能持有的銀行列表供後續勾選。</p>
                  </div>
              )}
          </section>

          {/* 航班資訊區塊 */}
          <section className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg md:text-xl font-bold text-slate-800 dark:text-[#ebd5c1] flex items-center gap-2">
                <span className="bg-indigo-100 dark:bg-indigo-900/50 p-2 rounded-lg text-indigo-600 dark:text-indigo-300">
                   {simpleFlights.outbound.mode === 'train' ? <Train className="w-5 h-5" /> : <Plane className="w-5 h-5" />}
                </span>
                交通方式 (飛機/火車)
              </h3>
              
              <div className="flex items-center gap-4">
                 <label className="flex items-center gap-2 cursor-pointer hover:bg-slate-50 dark:hover:bg-[#33241f] p-2 rounded-lg transition-colors">
                  <input type="checkbox" checked={!basicData.hasFlights} onChange={() => setBasicData(prev => ({ ...prev, hasFlights: !prev.hasFlights }))} className="w-5 h-5 text-slate-500 rounded focus:ring-slate-500 dark:bg-[#1e1410] dark:border-[#5d4037]" />
                  <span className="text-sm font-bold text-slate-600 dark:text-[#d6c0b3]">無 (不需安排)</span>
                </label>

                {basicData.hasFlights && (
                  <label className="flex items-center gap-2 cursor-pointer hover:bg-slate-50 dark:hover:bg-[#33241f] p-2 rounded-lg transition-colors">
                    <input type="checkbox" name="isMultiCityFlight" checked={basicData.isMultiCityFlight} onChange={handleBasicChange} className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500 dark:bg-[#1e1410] dark:border-[#5d4037]" />
                    <span className="text-sm font-bold text-slate-600 dark:text-[#d6c0b3]">多段/複雜行程</span>
                  </label>
                )}
              </div>
            </div>

            {/* 提示語 */}
            {basicData.hasFlights && (
              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3 text-xs md:text-sm text-amber-800 dark:text-amber-200 flex items-start gap-2">
                 <Info className="w-4 h-4 shrink-0 mt-0.5" />
                 <div>
                   <span className="font-bold">精準規劃小撇步：</span>
                   請務必填寫詳細的 <span className="font-bold text-amber-900 dark:text-amber-100">出發與抵達時間</span>。如果僅填寫班次/車次，AI 可能會抓不到最新的時刻表而導致行程安排錯誤。
                 </div>
              </div>
            )}
            
            {basicData.hasFlights && (
              !basicData.isMultiCityFlight ? (
              <div className="bg-slate-50/50 dark:bg-[#2c1f1b]/50 p-4 md:p-6 rounded-2xl border border-slate-200 dark:border-[#5d4037] space-y-4 shadow-sm">
                {[ { label: '去程', key: 'outbound', color: 'text-emerald-600 dark:text-emerald-400' }, { label: '中轉', key: 'transit', color: 'text-amber-600 dark:text-amber-400' }, { label: '回程', key: 'inbound', color: 'text-blue-600 dark:text-blue-400' } ].map((row) => (
                  <div key={row.key} className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center bg-white dark:bg-[#33241f] p-3 rounded-xl border border-slate-100 dark:border-[#4a3b32] shadow-sm">
                    
                    {/* 標籤與模式切換 */}
                    <div className="col-span-1 md:col-span-1 flex flex-col items-center justify-center gap-1">
                      <span className={`text-sm font-bold ${row.color}`}>{row.label}</span>
                      <button 
                        onClick={() => handleSimpleFlightChange(row.key, 'mode', simpleFlights[row.key].mode === 'flight' ? 'train' : 'flight')}
                        className="p-1.5 bg-slate-100 dark:bg-[#2c1f1b] hover:bg-blue-100 dark:hover:bg-blue-900/30 text-slate-500 dark:text-[#a08d85] hover:text-blue-600 dark:hover:text-blue-300 rounded-lg transition-colors"
                        title="切換 飛機/火車"
                      >
                        {simpleFlights[row.key].mode === 'train' ? <Train className="w-4 h-4" /> : <Plane className="w-4 h-4" />}
                      </button>
                    </div>

                    {/* 日期 */}
                    <div className="col-span-1 md:col-span-3">
                      <label className="text-[10px] text-slate-400 dark:text-[#8e7c75] pl-1 block">日期</label>
                      <input type="date" value={simpleFlights[row.key].date} onChange={(e) => handleSimpleFlightChange(row.key, 'date', e.target.value)} className="w-full p-2 bg-slate-50 dark:bg-[#2c1f1b] border border-slate-200 dark:border-[#5d4037] rounded-lg text-sm font-bold text-slate-700 dark:text-[#ebd5c1]" />
                    </div>

                    {/* 時間 (拆分為出發/抵達) */}
                    <div className="col-span-2 md:col-span-2">
                        <label className="text-[10px] text-slate-400 dark:text-[#8e7c75] pl-1 block">出發時間</label>
                        <input type="time" value={simpleFlights[row.key].depTime} onChange={(e) => handleSimpleFlightChange(row.key, 'depTime', e.target.value)} className="w-full p-2 bg-slate-50 dark:bg-[#2c1f1b] border border-slate-200 dark:border-[#5d4037] rounded-lg text-sm dark:text-[#ebd5c1]" />
                    </div>
                    <div className="col-span-2 md:col-span-2 relative">
                        <label className="text-[10px] text-slate-400 dark:text-[#8e7c75] pl-1 block">抵達時間</label>
                        <input type="time" value={simpleFlights[row.key].arrTime} onChange={(e) => handleSimpleFlightChange(row.key, 'arrTime', e.target.value)} className="w-full p-2 bg-slate-50 dark:bg-[#2c1f1b] border border-slate-200 dark:border-[#5d4037] rounded-lg text-sm dark:text-[#ebd5c1]" />
                        <div className="absolute -left-2 top-8 text-slate-300 dark:text-[#5d4037] text-xs">➜</div>
                    </div>

                    {/* 班次與地點 */}
                    <div className="col-span-2 md:col-span-2">
                        <label className="text-[10px] text-slate-400 dark:text-[#8e7c75] pl-1 block">班次/車次</label>
                        <input type="text" placeholder="例如 IT202" value={simpleFlights[row.key].code} onChange={(e) => handleSimpleFlightChange(row.key, 'code', e.target.value)} className="w-full p-2 bg-slate-50 dark:bg-[#2c1f1b] border border-slate-200 dark:border-[#5d4037] rounded-lg text-sm dark:text-[#ebd5c1]" />
                    </div>
                    <div className="col-span-2 md:col-span-2">
                        <label className="text-[10px] text-slate-400 dark:text-[#8e7c75] pl-1 block">機場/車站代碼</label>
                        <input type="text" placeholder="例如 NRT" value={simpleFlights[row.key].station} onChange={(e) => handleSimpleFlightChange(row.key, 'station', e.target.value)} className="w-full p-2 bg-slate-50 dark:bg-[#2c1f1b] border border-slate-200 dark:border-[#5d4037] rounded-lg text-sm font-mono uppercase text-center dark:text-[#ebd5c1]" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {multiFlights.map((flight) => (
                  <div key={flight.id} className="bg-white dark:bg-[#33241f] border border-slate-200 dark:border-[#4a3b32] rounded-xl overflow-hidden shadow-sm">
                    <div onClick={() => toggleMultiFlight(flight.id)} className="p-4 flex items-center justify-between cursor-pointer bg-slate-50/50 dark:bg-[#2c1f1b]/50 hover:bg-slate-100 dark:hover:bg-[#3e2b26]">
                      <div className="flex items-center gap-3">
                        <span className={`font-bold text-slate-700 dark:text-[#ebd5c1] bg-white dark:bg-[#2c1f1b] px-3 py-1 rounded-md border border-slate-200 dark:border-[#4a3b32] text-sm shadow-sm flex items-center gap-2`}>
                            {flight.mode === 'train' ? <Train className="w-3 h-3" /> : <Plane className="w-3 h-3" />}
                            {flight.type}
                        </span>
                        {!flight.isOpen && <span className="text-sm text-slate-500 dark:text-[#a08d85]">{flight.date} | {flight.depTime} ➜ {flight.arrTime} | {flight.station}</span>}
                      </div>
                      <div className="flex items-center gap-2"><button onClick={(e) => { e.stopPropagation(); removeMultiFlight(flight.id); }} className="p-2 hover:bg-red-50 dark:hover:bg-red-900/30 text-slate-400 hover:text-red-500 rounded-full"><Trash2 className="w-4 h-4" /></button>{flight.isOpen ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}</div>
                    </div>
                    {flight.isOpen && (
                      <div className="p-4 grid grid-cols-2 md:grid-cols-6 gap-4 bg-white dark:bg-[#33241f]">
                        <div className="col-span-1">
                            <label className="text-[10px] text-slate-400 dark:text-[#8e7c75] block mb-1">類型</label>
                            <input placeholder="類型" value={flight.type} onChange={(e) => updateMultiFlight(flight.id, 'type', e.target.value)} className="w-full p-2 border border-slate-200 dark:border-[#5d4037] rounded-lg text-sm dark:bg-[#2c1f1b] dark:text-[#ebd5c1]" />
                        </div>
                        <div className="col-span-1">
                            <label className="text-[10px] text-slate-400 dark:text-[#8e7c75] block mb-1">交通工具</label>
                            <select value={flight.mode} onChange={(e) => updateMultiFlight(flight.id, 'mode', e.target.value)} className="w-full p-2 border border-slate-200 dark:border-[#5d4037] rounded-lg text-sm bg-white dark:bg-[#2c1f1b] dark:text-[#ebd5c1]">
                              <option value="flight">飛機</option>
                              <option value="train">火車</option>
                            </select>
                        </div>
                        <div className="col-span-2 md:col-span-1">
                            <label className="text-[10px] text-slate-400 dark:text-[#8e7c75] block mb-1">日期</label>
                            <input type="date" value={flight.date} onChange={(e) => updateMultiFlight(flight.id, 'date', e.target.value)} className="w-full p-2 border border-slate-200 dark:border-[#5d4037] rounded-lg text-sm dark:bg-[#2c1f1b] dark:text-[#ebd5c1]" />
                        </div>
                        <div className="col-span-1">
                            <label className="text-[10px] text-slate-400 dark:text-[#8e7c75] block mb-1">出發時間</label>
                            <input type="time" value={flight.depTime} onChange={(e) => updateMultiFlight(flight.id, 'depTime', e.target.value)} className="w-full p-2 border border-slate-200 dark:border-[#5d4037] rounded-lg text-sm dark:bg-[#2c1f1b] dark:text-[#ebd5c1]" />
                        </div>
                        <div className="col-span-1">
                            <label className="text-[10px] text-slate-400 dark:text-[#8e7c75] block mb-1">抵達時間</label>
                            <input type="time" value={flight.arrTime} onChange={(e) => updateMultiFlight(flight.id, 'arrTime', e.target.value)} className="w-full p-2 border border-slate-200 dark:border-[#5d4037] rounded-lg text-sm dark:bg-[#2c1f1b] dark:text-[#ebd5c1]" />
                        </div>
                        <div className="col-span-1">
                            <label className="text-[10px] text-slate-400 dark:text-[#8e7c75] block mb-1">班次</label>
                            <input placeholder="班次" value={flight.code} onChange={(e) => updateMultiFlight(flight.id, 'code', e.target.value)} className="w-full p-2 border border-slate-200 dark:border-[#5d4037] rounded-lg text-sm dark:bg-[#2c1f1b] dark:text-[#ebd5c1]" />
                        </div>
                        <div className="col-span-1">
                            <label className="text-[10px] text-slate-400 dark:text-[#8e7c75] block mb-1">地點代碼</label>
                            <input placeholder="機場/車站" value={flight.station} onChange={(e) => updateMultiFlight(flight.id, 'station', e.target.value)} className="w-full p-2 border border-slate-200 dark:border-[#5d4037] rounded-lg text-sm font-mono uppercase dark:bg-[#2c1f1b] dark:text-[#ebd5c1]" />
                        </div>
                      </div>
                    )}
                  </div>
                ))}
                <button onClick={addMultiFlight} className="w-full py-3 border-2 border-dashed border-slate-300 dark:border-[#5d4037] rounded-xl text-slate-500 dark:text-[#a08d85] hover:border-blue-400 dark:hover:border-sky-500 flex items-center justify-center gap-2"><Plus className="w-5 h-5" /> 新增行程段</button>
              </div>
            ))}

            <div className="flex items-center gap-3 pt-2 bg-blue-50/50 dark:bg-[#2c1f1b]/50 p-4 rounded-xl border border-blue-100 dark:border-[#5d4037]">
                <input type="checkbox" id="transitTour" name="hasTransitTour" checked={basicData.hasTransitTour} onChange={handleBasicChange} className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500 dark:bg-[#1e1410] dark:border-[#5d4037]" />
                <label htmlFor="transitTour" className="text-slate-700 dark:text-[#ebd5c1] font-bold cursor-pointer text-sm md:text-base">安排轉機/中途入境觀光</label>
            </div>
          </section>

          <hr className="border-slate-100 dark:border-[#5d4037]" />

          {/* 住宿資訊區塊 */}
          <section className="space-y-4">
            <h3 className="text-lg md:text-xl font-bold text-slate-800 dark:text-[#ebd5c1] flex items-center gap-2"><span className="bg-orange-100 dark:bg-orange-900/50 p-2 rounded-lg text-orange-600 dark:text-orange-300"><Hotel className="w-5 h-5" /></span>住宿資訊</h3>
            <div className="space-y-3">
              {accommodations.map((acc) => (
                <div key={acc.id} className="bg-white dark:bg-[#33241f] border border-slate-200 dark:border-[#4a3b32] rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all">
                  <div onClick={() => toggleAccommodation(acc.id)} className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-50 dark:hover:bg-[#3e2b26]">
                    <div className="flex items-center gap-3"><div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-900/50 flex items-center justify-center text-orange-600 dark:text-orange-300 font-bold"><Hotel className="w-5 h-5" /></div><div><div className="font-bold text-slate-800 dark:text-[#ebd5c1] text-sm md:text-base">{acc.name || '新住宿地點'}</div><div className="text-xs text-slate-500 dark:text-[#a08d85]">{acc.address}</div></div></div>
                    <div className="flex items-center gap-2"><button onClick={(e) => { e.stopPropagation(); removeAccommodation(acc.id); }} className="p-2 hover:bg-red-50 dark:hover:bg-red-900/30 text-slate-400 hover:text-red-500 rounded-full"><Trash2 className="w-4 h-4" /></button>{acc.isOpen ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}</div>
                  </div>
                  {acc.isOpen && (
                     <div className="p-5 bg-slate-50/50 dark:bg-[#2c1f1b]/50 border-t border-slate-100 dark:border-[#4a3b32] grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input value={acc.type} onChange={(e) => updateAccommodation(acc.id, 'type', e.target.value)} className="p-3 border border-slate-200 dark:border-[#5d4037] rounded-lg text-sm dark:bg-[#2c1f1b] dark:text-[#ebd5c1]" placeholder="類型" />
                        <input value={acc.name} onChange={(e) => updateAccommodation(acc.id, 'name', e.target.value)} className="p-3 border border-slate-200 dark:border-[#5d4037] rounded-lg text-sm dark:bg-[#2c1f1b] dark:text-[#ebd5c1]" placeholder="名稱" />
                        <input value={acc.address} onChange={(e) => updateAccommodation(acc.id, 'address', e.target.value)} className="p-3 border border-slate-200 dark:border-[#5d4037] rounded-lg text-sm md:col-span-2 dark:bg-[#2c1f1b] dark:text-[#ebd5c1]" placeholder="完整地址" />
                     </div>
                  )}
                </div>
              ))}
              <button onClick={addAccommodation} className="w-full py-3 border-2 border-dashed border-slate-300 dark:border-[#5d4037] rounded-xl text-slate-500 dark:text-[#a08d85] flex justify-center items-center gap-2 hover:border-orange-400 dark:hover:border-orange-500"><Plus className="w-5 h-5" /> 新增住宿</button>
            </div>
          </section>

        </div> 
        {/* ^ 這個 div 是 space-y-6 的結束 */}

        <div className="space-y-4 pt-4">
          <button onClick={generateItinerary} className="w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white font-bold py-5 rounded-2xl shadow-xl hover:shadow-2xl hover:scale-[1.01] transform transition-all flex justify-center items-center gap-3 text-lg md:text-xl ring-4 ring-blue-100 dark:ring-[#5d4037]">
            <Sparkles className="w-6 h-6 animate-pulse" /> 開始 AI 一鍵規劃
          </button>
          <button onClick={() => setStep('saved_list')} className="w-full bg-white dark:bg-[#33241f] border-2 border-slate-200 dark:border-[#5d4037] text-slate-600 dark:text-[#d6c0b3] font-bold py-4 rounded-2xl hover:bg-slate-50 dark:hover:bg-[#3e2b26] hover:border-slate-300 transition-all flex justify-center items-center gap-2">
            <List className="w-5 h-5" /> 查看已儲存的規劃 ({savedPlans.length})
          </button>
          <label className="w-full bg-white dark:bg-[#33241f] border-2 border-dashed border-slate-300 dark:border-[#5d4037] text-slate-500 dark:text-[#a08d85] font-bold py-4 rounded-2xl hover:bg-slate-50 dark:hover:bg-[#3e2b26] hover:border-blue-400 hover:text-blue-500 transition-all flex justify-center items-center gap-2 cursor-pointer">
            <Upload className="w-5 h-5" /> 匯入 JSON
            <input type="file" accept=".json" onChange={handleImportJSON} className="hidden" />
          </label>
        </div>
        {errorMsg && <div className="p-4 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-300 rounded-xl flex items-center gap-2 border border-red-100 dark:border-red-800 animate-shake"><AlertTriangle className="w-5 h-5" />{errorMsg}</div>}
      </div>
    );
  };

  const renderLoading = () => (
      <FunLoading destination={basicData.destinations} />
  );

  const renderSavedList = () => (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-right-8 duration-500 print:hidden">
      <div className="flex items-center gap-4">
        <button onClick={() => setStep('input')} className="p-3 bg-white rounded-full shadow-lg hover:bg-slate-50 border border-slate-100 transition-transform hover:-translate-x-1"><ArrowLeft className="w-6 h-6 text-slate-700" /></button>
        <h2 className="text-3xl font-bold text-slate-800">我的旅程記憶</h2>
      </div>
      
      {savedPlans.length === 0 ? (
        <div className="text-center py-32 bg-white/80 backdrop-blur rounded-3xl shadow-sm border border-slate-200 text-slate-400">
          <BookOpen className="w-24 h-24 mx-auto mb-6 opacity-20" />
          <p className="text-xl">目前沒有儲存的規劃</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {savedPlans.map((plan) => (
            // 使用新組件，傳入 plan, onLoad, onDelete
            <SavedPlanItem 
               key={plan.created} 
               plan={plan} 
               onLoad={loadSavedPlan} 
               onDelete={deletePlan} 
            />
          ))}
        </div>
      )}
    </div>
  );
  
  const renderResult = () => {
    // 1. 防呆檢查：如果資料讀取錯誤，顯示錯誤訊息而不是白畫面
    if (!itineraryData || !Array.isArray(itineraryData.days) || itineraryData.days.length === 0) {
      return (
        <div className="p-8 text-center text-slate-500 bg-white rounded-xl shadow-sm mt-10">
           <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-amber-400" />
           <p className="text-lg font-bold">行程資料讀取異常</p>
           <p className="text-sm mb-4">這可能是因為 AI 回傳的格式不完整或舊資料不相容。</p>
           <button onClick={() => setStep('input')} className="px-4 py-2 bg-slate-100 rounded-lg hover:bg-slate-200 font-bold text-slate-600">返回重新規劃</button>
        </div>
      );
    }

    const currentDay = itineraryData.days[activeTab] || itineraryData.days[0];
    const isSaved = isCurrentPlanSaved();

    return (
      <div className="max-w-6xl mx-auto space-y-4 md:space-y-8 animate-in fade-in zoom-in-95 duration-500 pb-20">
        <TutorialModal 
           isOpen={showResultTutorial} 
           onClose={() => setShowResultTutorial(false)} 
           title="功能導覽：行程怎麼看？"
           pages={resultTutorialPages}
           storageKey="tutorial_result_seen"
        />
        {/* Header Card */}
        <div className="bg-white/90 dark:bg-[#3a2a25]/90 backdrop-blur-md p-5 md:p-8 rounded-3xl shadow-lg border border-white/50 dark:border-[#5d4037] relative overflow-hidden print:border-none print:shadow-none print:bg-white print:p-0">
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 print:hidden"></div>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 md:gap-6 relative z-10">
            <div className="w-full">
                <div className="flex flex-wrap items-center gap-3 mb-2">
                {/* text-slate-800 -> dark:text-[#ebd5c1] */}
                <h2 className="text-2xl md:text-3xl font-extrabold text-slate-800 dark:text-[#ebd5c1] print:text-black">{basicData.destinations}</h2>
                {/* ... */}
                </div>
                {/* text-slate-600 -> dark:text-[#d6c0b3] */}
                <p className="text-slate-600 dark:text-[#d6c0b3] max-w-2xl text-base md:text-lg leading-relaxed print:text-black">{itineraryData.trip_summary}</p>
            </div>
            
            <div className="flex flex-wrap gap-3 w-full md:w-auto justify-end print:hidden">
              {/* ✅ 補回這裡：菜單幫手按鈕 */}
              <button
                onClick={() => setIsMenuModalOpen(true)}
                className="px-3 py-2 text-white bg-orange-500 hover:bg-orange-600 rounded-xl font-bold text-sm transition-colors shadow-sm flex items-center gap-2"
              >
                <ChefHat className="w-4 h-4" /> 菜單幫手
              </button>
              <button 
                onClick={() => { localStorage.removeItem('tutorial_result_seen'); setShowResultTutorial(true); }}
                className="px-3 py-2 text-slate-500 hover:text-blue-600 bg-white border border-slate-200 rounded-xl font-bold text-sm transition-colors shadow-sm flex items-center gap-2"
              >
                <Info className="w-4 h-4" /> 功能導覽
              </button>
              <div className="flex gap-2 mr-2 border-r border-slate-200 pr-4">
                <button 
                  onClick={() => setIsCurrencyModalOpen(true)}
                  className="p-3 rounded-full bg-yellow-50 text-yellow-600 hover:bg-yellow-100 transition-colors shadow-sm" 
                  title="匯率換算"
                >
                  <Coins className="w-5 h-5" />
                </button>
                <button 
                  onClick={() => setIsTravelerModalOpen(true)}
                  className="p-3 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors shadow-sm" 
                  title="設定旅伴"
                >
                  <UserCog className="w-5 h-5" />
                </button>
              </div>

              <div className="relative">
                <button 
                  onClick={() => setShowCopyMenu(!showCopyMenu)} 
                  className="p-3 md:p-4 rounded-full transition-all shadow-md hover:bg-slate-50 bg-white text-slate-500 flex items-center gap-2" 
                  title="複製文字分享"
                >
                  {copySuccess ? <Check className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5" />}
                </button>
                
                {showCopyMenu && (
                  <div className="absolute right-0 top-full mt-2 w-32 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200">
                    <button 
                      onClick={() => handleShareText('simple')}
                      className="w-full text-left px-4 py-3 text-sm text-slate-700 hover:bg-blue-50 hover:text-blue-600 font-bold border-b border-slate-50"
                    >
                      簡約內容
                    </button>
                    <button 
                      onClick={() => handleShareText('detailed')}
                      className="w-full text-left px-4 py-3 text-sm text-slate-700 hover:bg-blue-50 hover:text-blue-600 font-bold"
                    >
                      詳細內容
                    </button>
                  </div>
                )}
              </div>

              <button onClick={handleExportPDF} disabled={isExporting} className="p-3 md:p-4 rounded-full transition-all shadow-md hover:bg-slate-50 bg-white text-slate-500" title="匯出 PDF (使用瀏覽器列印)">
                {isExporting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5" />}
              </button>
              <button onClick={handleExportJSON} className="p-3 md:p-4 rounded-full transition-all shadow-md hover:bg-slate-50 bg-white text-slate-500" title="匯出 JSON (分享規劃)">
                <FileJson className="w-5 h-5" />
              </button>
              <button onClick={saveCurrentPlan} className={`p-3 md:p-4 rounded-full transition-all shadow-md ${isSaved ? 'bg-red-50 text-red-500' : 'bg-white text-slate-400'}`}>
                <Heart className={`w-5 h-5 ${isSaved ? 'fill-current' : ''}`} />
              </button>
              <button onClick={() => setStep('input')} className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200 transition-colors text-sm md:text-base">重新規劃</button>
            </div>
          </div>
          <div className="flex flex-wrap gap-3 md:gap-6 text-sm text-slate-500 mt-4 md:mt-6 pt-4 md:pt-6 border-t border-slate-100 font-medium print:text-black">
              <span className="flex items-center gap-2 bg-slate-50 px-3 py-1 rounded-lg print:bg-transparent print:p-0"><DollarSign className="w-4 h-4 text-emerald-500 print:text-black" /> 匯率: {itineraryData.currency_rate}</span>
              <span className="flex items-center gap-2 bg-slate-50 px-3 py-1 rounded-lg print:bg-transparent print:p-0"><Calendar className="w-4 h-4 text-blue-500 print:text-black" /> {basicData.dates}</span>
          </div>
        </div>

        {/* --- 功能 3: 城市指南區域 --- */}
        {itineraryData.city_guides && (
          <CityGuide 
            guideData={itineraryData.city_guides} 
            cities={Object.keys(itineraryData.city_guides)}
            basicData={basicData} 
            apiKey={apiKey}
            onSaveCreditCardAnalysis={handleUpdateCreditCardAnalysis}
            modelType={modelType}
          />
        )}

        {/* Day Tabs */}
        <div className="flex overflow-x-auto pb-4 gap-3 md:gap-4 scrollbar-hide px-2 snap-x print:hidden">
          {itineraryData.days.map((day, index) => (
            <button key={index} onClick={() => setActiveTab(index)} className={`snap-center flex-shrink-0 px-6 py-3 md:px-8 md:py-4 rounded-2xl transition-all duration-300 border-2 relative overflow-hidden group ${activeTab === index ? 'bg-slate-800 text-white border-slate-800 shadow-xl scale-105' : 'bg-white text-slate-500 border-transparent hover:border-slate-200 hover:bg-slate-50'}`}>
              <div className="text-[10px] md:text-xs opacity-60 uppercase tracking-wider mb-1 font-bold">Day {day.day_index}</div>
              <div className="text-base md:text-lg font-bold">{day.city}</div>
              <div className="text-[10px] md:text-xs mt-1 opacity-80">{day.date.slice(5)}</div>
            </button>
          ))}
        </div>

        {/* Timeline Content */}
        <div className="print:hidden">
           <DayTimeline 
             day={currentDay} 
             dayIndex={activeTab} 
             expenses={expenses}
             setExpenses={setExpenses}
             travelers={travelerNames}
             currencySettings={currencySettings}
             isPrintMode={false} 
             apiKey={apiKey}
             updateItineraryItem={updateItineraryItem}
             onSavePlan={saveCurrentPlan}
             onDeleteClick={handleDeleteItem} 
             onEditClick={openEditModal}
             onTimeUpdate={handleTimeUpdate}
             onAddClick={openAddModal}
             onIconClick={(dIdx, tIdx) => setIconSelectModalData({ dayIndex: dIdx, timelineIndex: tIdx })}
             onUpdateDayInfo={updateDayInfo}
             onRefreshWeather={handleWeatherRefresh}
           />
        </div>

        {/* Printable View */}
        <div className="hidden print:block">
           {itineraryData.days.map((day, idx) => (
             <div key={idx} className="break-before-page">
               <DayTimeline 
                 day={day} 
                 dayIndex={idx}
                 expenses={expenses}
                 setExpenses={setExpenses}
                 travelers={travelerNames}
                 currencySettings={currencySettings}
                 isPrintMode={true} 
                 apiKey={apiKey}
                 updateItineraryItem={updateItineraryItem}
                 onSavePlan={saveCurrentPlan}
                 onDeleteClick={handleDeleteItem} // 傳入刪除函數
                 onEditClick={openEditModal}
               />
             </div>
           ))}
        </div>
        
        <LedgerSummary expenses={expenses} dayIndex={null} travelers={travelerNames} currencySettings={currencySettings} />
        
        {/* 注意：這裡移除了原本錯誤的 <DeepDiveModal /> 呼叫，解決了 ReferenceError */}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-100 via-rose-50 to-amber-50 dark:from-[#2c1f1b] dark:via-[#3a2a25] dark:to-[#1e1410] bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] dark:bg-[radial-gradient(#5d4037_1px,transparent_1px)] [background-size:16px_16px] p-4 md:p-8 relative overflow-hidden transition-colors duration-500">
      
      {/* 2. 背景裝飾貼紙 (浮水印) - 調整深色模式的顏色與透明度 */}
      <div className="fixed top-20 left-10 text-sky-200 dark:text-sky-900/40 opacity-20 pointer-events-none animate-pulse"><Fish className="w-24 h-24 -rotate-12" /></div>
      <div className="fixed bottom-10 right-10 text-rose-200 dark:text-rose-900/40 opacity-20 pointer-events-none"><Palmtree className="w-32 h-32 rotate-6" /></div>
      <div className="fixed top-40 right-20 text-amber-200 dark:text-amber-900/40 opacity-20 pointer-events-none animate-bounce" style={{animationDuration: '3s'}}><Bird className="w-16 h-16" /></div>

      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* ✅ 修改 2：主標題 Header */}
        {/* dark:bg-[#3a2a25]/80 -> 半透明摩卡色 */}
        {/* dark:border-[#5d4037] -> 深咖啡邊框 */}
        <header className="text-center mb-8 md:mb-12 py-8 px-4 bg-white/60 dark:bg-[#3a2a25]/80 backdrop-blur-md rounded-[3rem] shadow-xl border-4 border-white dark:border-[#5d4037] relative overflow-hidden transition-colors duration-300">
          
          {/* 標題背景裝飾 */}
          <div className="absolute top-[-20px] left-[-20px] text-yellow-300 dark:text-yellow-600/30 opacity-30"><Sun className="w-24 h-24 animate-spin-slow" /></div>
          <div className="absolute bottom-[-10px] right-[-10px] text-blue-300 dark:text-blue-900/30 opacity-20"><CarFront className="w-20 h-20" /></div>
          
          <h1 className="text-4xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-rose-400 to-amber-400 dark:from-sky-300 dark:via-rose-300 dark:to-amber-300 drop-shadow-sm flex items-center justify-center gap-3 relative z-10">
            <Plane className="w-10 h-10 md:w-14 md:h-14 text-sky-400 dark:text-sky-300 animate-bounce-slow" /> 
            AI 旅遊規劃小幫手 
            <span className="text-2xl md:text-4xl">✨</span>
          </h1>
           {!apiKey && (
            <p className="text-slate-500 dark:text-[#d6c0b3] mt-3 text-sm md:text-base bg-white/80 dark:bg-[#2c1f1b]/50 inline-block px-4 py-1 rounded-full">
              (請先在下方設定輸入 API Key 才能啟用 AI 大腦喔！)
            </p>
          )}
        </header>
        
        {/* 👇👇👇 原本的主要內容邏輯接在這裡 👇👇👇 */}

        {step === 'input' && renderInputForm()}
        {step === 'loading' && renderLoading()}
        {step === 'result' && (
          <>
            {renderResult()}
            {isCurrencyModalOpen && <CurrencyModal onClose={() => setIsCurrencyModalOpen(false)} currencySettings={currencySettings} setCurrencySettings={setCurrencySettings} />}
            {isTravelerModalOpen && <TravelerModal travelers={travelerNames} setTravelers={setTravelerNames} onClose={() => setIsTravelerModalOpen(false)} />}
          </>
        )}
        {step === 'saved_list' && renderSavedList()}

        {/* Modal 區塊 */}
        <MenuHelperModal 
          isOpen={isMenuModalOpen}
          onClose={() => setIsMenuModalOpen(false)}
          apiKey={apiKey}
          currencySymbol={currencySettings.symbol}
        />
        
        {editModalData && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[1000] p-4">
            {/* ... 這裡放原本的編輯 Modal 內容 ... */}
            <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md animate-in slide-in-from-bottom-4">
                 {/* 省略... 請確保您原本的 Modal 代碼還在 */}
                 {/* 因為篇幅關係這裡沒展開，請保留您原本寫好的 editModalData 內容 */}
                 {/* 如果您之前的代碼不見了，我可以再補給您 */}
                 <h3 className="text-lg font-bold text-slate-800 mb-4">更換目的地</h3>
                 {/* ...Input & Buttons... */}
                 <input type="text" value={editModalData.newTitle} onChange={(e) => setEditModalData({ ...editModalData, newTitle: e.target.value })} className="w-full p-3 border border-slate-300 rounded-lg mb-6 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="請輸入新的地點名稱..." disabled={isProcessingEdit} />
                 {isProcessingEdit ? (
                    <div className="flex items-center justify-center gap-2 text-blue-600 py-4"><Loader2 className="w-5 h-5 animate-spin" /> <span className="font-bold animate-pulse">AI 正在蒐集新地點資料...</span></div>
                 ) : (
                    <div className="flex flex-col gap-3">
                        <div className="flex gap-3">
                           <button onClick={handleManualEditComplete} className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium transition-colors flex items-center justify-center gap-1"><Edit3 className="w-4 h-4" /> <span className="font-bold">手動完成</span></button>
                           <button onClick={handleAIEditComplete} className="flex-1 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg font-bold shadow-md transition-all flex items-center justify-center gap-1"><Sparkles className="w-4 h-4" /> AI 完成</button>
                        </div>
                        <button onClick={() => setEditModalData(null)} className="w-full py-2 border border-slate-300 text-slate-500 hover:bg-slate-50 rounded-lg transition-colors">取消編輯</button>
                    </div>
                 )}
            </div>
          </div>
        )}

        <IconSelectorModal 
          isOpen={!!iconSelectModalData}
          onClose={() => setIconSelectModalData(null)}
          onSelect={handleIconUpdate}
        />
        
        {addModalData && (
          // ... 原本的新增行程 Modal ...
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[1000] p-4">
             {/* 為了節省篇幅，請保留您原本寫好的 addModalData 內容 */}
             <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md animate-in slide-in-from-bottom-4">
                <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2"><Plus className="w-5 h-5 text-blue-600" /> 新增行程節點</h3>
                {/* ... inputs ... */}
                <div className="space-y-4 mb-6">
                  <div><label className="text-xs font-bold text-slate-500 mb-1 block">時間</label><input type="time" value={addModalData.time} onChange={(e) => setAddModalData({ ...addModalData, time: e.target.value })} className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-mono" /></div>
                  <div><label className="text-xs font-bold text-slate-500 mb-1 block">目的地 / 項目名稱</label><input type="text" value={addModalData.title} onChange={(e) => setAddModalData({ ...addModalData, title: e.target.value })} className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="例如：東京鐵塔、吃午餐..." disabled={isProcessingEdit} /></div>
                </div>
                {isProcessingEdit ? (<div className="flex items-center justify-center gap-2 text-blue-600 py-4"><Loader2 className="w-5 h-5 animate-spin" /> <span className="font-bold animate-pulse">AI 正在建立新行程...</span></div>) : (<div className="flex flex-col gap-3"><div className="flex gap-3"><button onClick={handleManualAddComplete} className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium transition-colors flex items-center justify-center gap-1"><Edit3 className="w-4 h-4" /> 手動完成</button><button onClick={handleAIAddComplete} className="flex-1 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg font-bold shadow-md transition-all flex items-center justify-center gap-1"><Sparkles className="w-4 h-4" /> AI 完成</button></div><button onClick={() => setAddModalData(null)} className="w-full py-2 border border-slate-300 text-slate-500 hover:bg-slate-50 rounded-lg transition-colors">取消</button></div>)}
             </div>
          </div>
        )}

      </div>
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
