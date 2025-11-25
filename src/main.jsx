import React, { useState, useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { 
  Plane, Hotel, MapPin, Users, Calendar, 
  Utensils, AlertTriangle, Map, DollarSign, 
  Loader2, Sparkles, Train, Globe, Plus, 
  Trash2, ChevronDown, ChevronUp, Heart,
  List, ArrowLeft, BookOpen, Search, Key, 
  MessageSquare, Banknote, Share2, Download, Copy, Check,
  FileJson, Upload
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

const App = () => {
  const [step, setStep] = useState('input'); 
  
  // --- 狀態管理 ---
  const [apiKey, setApiKey] = usePersistentState('gemini_api_key', '');

  const [basicData, setBasicData] = usePersistentState('travel_basic_data', {
    destinations: '福岡',
    dates: '2025-12-08 to 2025-12-12',
    type: '綜合 (購物+文化)',
    travelers: 2,
    hasTransitTour: true,
    isMultiCityFlight: false,
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

  const [itineraryData, setItineraryData] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [errorMsg, setErrorMsg] = useState('');
  const [savedPlans, setSavedPlans] = useState([]);
  const [isExporting, setIsExporting] = useState(false); 
  const [copySuccess, setCopySuccess] = useState(false);
  const [showCopyMenu, setShowCopyMenu] = useState(false); // 新增：控制複製選單顯示

  const printRef = useRef();
  const fileInputRef = useRef();

  useEffect(() => {
    try {
      const saved = localStorage.getItem('my_travel_plans');
      if (saved) setSavedPlans(JSON.parse(saved));
    } catch (e) {
      console.error("無法讀取儲存的計畫", e);
    }
  }, []);

  // --- 操作處理函數 ---
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
      const planToSave = { ...itineraryData, basicInfo: basicData, created: itineraryData.created || Date.now() };
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
    setStep('result');
    setActiveTab(0);
  };

  const isCurrentPlanSaved = () => {
    if (!itineraryData) return false;
    return savedPlans.some(p => p.created === itineraryData.created);
  };

  // --- 匯出 JSON ---
  const handleExportJSON = () => {
    if (!itineraryData) {
      alert('目前沒有可匯出的行程規劃');
      return;
    }
    
    const dataToExport = {
      version: 1,
      timestamp: Date.now(),
      basicData,
      simpleFlights,
      multiFlights,
      accommodations,
      itineraryData
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

  // --- 匯入 JSON ---
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

  const handleExportPDF = () => {
    window.print();
  };

  // --- 複製功能 ---
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

  // --- 新增：處理複製文字的邏輯 (支援簡約與詳細模式) ---
  const handleShareText = (mode = 'simple') => {
    if (!itineraryData) return;
    
    let text = `${basicData.destinations}\n`;
    
    itineraryData.days.forEach(day => {
      text += `\nDay ${day.day_index}\n`;
      day.timeline.forEach(item => {
        if (mode === 'simple') {
          // 簡約模式：時間｜地點
          text += `${item.time}｜${item.title}\n`;
        } else {
          // 詳細模式：時間｜地點｜預定建議
          const desc = item.description ? item.description.replace(/[\r\n]+/g, ' ').trim() : '';
          text += `${item.time}｜${item.title}｜${desc}\n`;
        }
      });
    });
    
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(() => {
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
      }).catch(() => {
        fallbackCopyTextToClipboard(text);
      });
    } else {
      fallbackCopyTextToClipboard(text);
    }
    
    // 複製完畢後關閉選單
    setShowCopyMenu(false);
  };

  const generateItinerary = async () => {
    if (!apiKey) {
      alert("請輸入您的 Gemini API Key");
      return;
    }
    setStep('loading');
    setErrorMsg('');

    let flightsString = "";
    if (basicData.isMultiCityFlight) {
      flightsString = multiFlights.map(f => `${f.type} | 日期:${f.date} | 時間:${f.time} | 航班:${f.code} | 機場:${f.airport}`).join('\n');
    } else {
      flightsString = `去程 | 日期:${simpleFlights.outbound.date} | 時間:${simpleFlights.outbound.time} | 航班:${simpleFlights.outbound.code} | 機場:${simpleFlights.outbound.airport}\n中轉 | 日期:${simpleFlights.transit.date ? simpleFlights.transit.date : '無'} | 時間:${simpleFlights.transit.time} | 航班:${simpleFlights.transit.code} | 機場:${simpleFlights.transit.airport}\n回程 | 日期:${simpleFlights.inbound.date} | 時間:${simpleFlights.inbound.time} | 航班:${simpleFlights.inbound.code} | 機場:${simpleFlights.inbound.airport}`;
    }
    const accommodationString = accommodations.map(a => `住處:${a.name}(${a.type}) 地址:${a.address}`).join('\n');

    const selectedPrices = [];
    if (basicData.priceRanges.high) selectedPrices.push("高 (1000 TWD+)");
    if (basicData.priceRanges.medium) selectedPrices.push("中 (301-1000 TWD)");
    if (basicData.priceRanges.low) selectedPrices.push("低 (<300 TWD)");
    const priceConstraint = selectedPrices.length > 0 ? selectedPrices.join(', ') : "無限制";

    const systemPrompt = `
      You are an expert AI Travel Planner API. Respond with valid JSON only.
      User Constraints:
      - Destinations: ${basicData.destinations}
      - Dates: ${basicData.dates}
      - Type: ${basicData.type}
      - Travelers: ${basicData.travelers}
      - Flights: ${flightsString} (Use Airport Codes to identify cities. E.g., FUK=Fukuoka, TAE=Daegu).
      - Accommodation: ${accommodationString}
      - Transit Tour: ${basicData.hasTransitTour}
      - Special Requests: ${basicData.specialRequests || "None"}
      - Restaurant Budget: ${priceConstraint}
      
      Requirements:
      1. Logistics: Realistic travel times + buffer.
      2. Culture & History: detailed background story for historical sites.
      3. Food: Menu translation (Local | Chinese | Est. Price).
      
      JSON Schema Structure:
      {
        "trip_summary": "String",
        "currency_rate": "String",
        "created": ${Date.now()}, 
        "days": [
          {
            "day_index": 1,
            "date": "YYYY-MM-DD",
            "city": "City Name",
            "title": "Theme",
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
      const parsedData = JSON.parse(resultText);
      if (!parsedData.created) parsedData.created = Date.now();
      setItineraryData(parsedData);
      setStep('result');
    } catch (error) {
      console.error(error);
      setErrorMsg("生成失敗: " + error.message);
      setStep('input');
    }
  };

  // --- UI 元件 ---
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
            <label className="flex items-center gap-2 cursor-pointer hover:bg-slate-50 p-2 rounded-lg transition-colors">
              <input type="checkbox" name="isMultiCityFlight" checked={basicData.isMultiCityFlight} onChange={handleBasicChange} className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500" />
              <span className="text-sm font-bold text-slate-600">複雜航班</span>
            </label>
          </div>
          {!basicData.isMultiCityFlight ? (
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
          )}
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
        <div className="flex gap-2">
          {/* 隱藏的檔案上傳欄位 */}
          <input 
            type="file" 
            accept=".json" 
            ref={fileInputRef} 
            style={{ display: 'none' }} 
            onChange={handleImportJSON} 
          />
          <button 
            onClick={() => fileInputRef.current.click()}
            className="flex-1 bg-white border-2 border-blue-600 text-blue-600 font-bold py-5 rounded-2xl shadow-md hover:bg-blue-50 hover:scale-[1.01] transform transition-all flex justify-center items-center gap-3 text-lg md:text-xl"
          >
            <Upload className="w-6 h-6" /> 匯入 JSON 規劃
          </button>
          
          <button 
            onClick={generateItinerary} 
            className="flex-[2] bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white font-bold py-5 rounded-2xl shadow-xl hover:shadow-2xl hover:scale-[1.01] transform transition-all flex justify-center items-center gap-3 text-lg md:text-xl ring-4 ring-blue-100"
          >
            <Sparkles className="w-6 h-6 animate-pulse" /> 開始 AI 一鍵規劃
          </button>
        </div>

        <button onClick={() => setStep('saved_list')} className="w-full bg-white border-2 border-slate-200 text-slate-600 font-bold py-4 rounded-2xl hover:bg-slate-50 hover:border-slate-300 transition-all flex justify-center items-center gap-2">
          <List className="w-5 h-5" /> 查看已儲存的規劃 ({savedPlans.length})
        </button>
      </div>
      {errorMsg && <div className="p-4 bg-red-50 text-red-600 rounded-xl flex items-center gap-2 border border-red-100 animate-shake"><AlertTriangle className="w-5 h-5" />{errorMsg}</div>}
    </div>
  );

  const renderLoading = () => (
    <div className="flex flex-col items-center justify-center min-h-[80vh] text-slate-600 space-y-8 animate-in fade-in duration-1000 print:hidden">
      <div className="relative">
        <div className="absolute inset-0 bg-blue-500 blur-xl opacity-20 rounded-full animate-pulse"></div>
        <Loader2 className="w-24 h-24 animate-spin text-blue-600 relative z-10" />
      </div>
      <div className="text-center space-y-3">
        <h2 className="text-3xl font-bold text-slate-800">AI 正在為您編織旅程...</h2>
        <p className="text-lg text-slate-500">正在分析 {basicData.destinations} 的歷史文化與最佳動線</p>
      </div>
    </div>
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
          {savedPlans.map((plan, idx) => (
            <div key={idx} onClick={() => loadSavedPlan(plan)} className="group bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-xl hover:border-blue-200 cursor-pointer transition-all duration-300 transform hover:-translate-y-1 relative overflow-hidden">
              <div className="flex justify-between items-start mb-4 relative z-10">
                <h3 className="font-bold text-xl text-slate-800 group-hover:text-blue-600 transition-colors line-clamp-1">{plan.basicInfo?.destinations || '旅程規劃'}</h3>
                <span className="text-xs bg-slate-100 text-slate-500 px-2 py-1 rounded-full font-mono">{new Date(plan.created).toLocaleDateString()}</span>
              </div>
              <p className="text-slate-500 text-sm line-clamp-3 mb-6 min-h-[4rem] leading-relaxed relative z-10">{plan.trip_summary}</p>
              <div className="flex items-center gap-4 text-sm text-slate-400 border-t border-slate-50 pt-4">
                <div className="flex items-center gap-1.5"><Calendar className="w-4 h-4 text-blue-400" /> {plan.days.length} 天</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderResult = () => {
    if (!itineraryData) return null;
    const currentDay = itineraryData.days[activeTab];
    const isSaved = isCurrentPlanSaved();

    return (
      <div className="max-w-6xl mx-auto space-y-4 md:space-y-8 animate-in fade-in zoom-in-95 duration-500 pb-20">
        {/* Header Card */}
        <div className="bg-white/90 backdrop-blur-md p-5 md:p-8 rounded-3xl shadow-lg border border-white/50 relative overflow-hidden print:border-none print:shadow-none print:bg-white print:p-0">
           <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 print:hidden"></div>
           <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 md:gap-6 relative z-10">
            <div className="w-full">
              <div className="flex flex-wrap items-center gap-3 mb-2">
                <h2 className="text-2xl md:text-3xl font-extrabold text-slate-800 print:text-black">{basicData.destinations}</h2>
                {basicData.hasTransitTour && <span className="text-xs font-bold bg-indigo-100 text-indigo-700 px-2 md:px-3 py-1 rounded-full flex items-center gap-1 print:hidden"><Plane className="w-3 h-3" /> 含轉機觀光</span>}
              </div>
              <p className="text-slate-600 max-w-2xl text-base md:text-lg leading-relaxed print:text-black">{itineraryData.trip_summary}</p>
            </div>
            <div className="flex flex-wrap gap-3 w-full md:w-auto justify-end print:hidden">
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

        {/* Day Tabs (Hidden on Print) */}
        <div className="flex overflow-x-auto pb-4 gap-3 md:gap-4 scrollbar-hide px-2 snap-x print:hidden">
          {itineraryData.days.map((day, index) => (
            <button key={index} onClick={() => setActiveTab(index)} className={`snap-center flex-shrink-0 px-6 py-3 md:px-8 md:py-4 rounded-2xl transition-all duration-300 border-2 relative overflow-hidden group ${activeTab === index ? 'bg-slate-800 text-white border-slate-800 shadow-xl scale-105' : 'bg-white text-slate-500 border-transparent hover:border-slate-200 hover:bg-slate-50'}`}>
              <div className="text-[10px] md:text-xs opacity-60 uppercase tracking-wider mb-1 font-bold">Day {day.day_index}</div>
              <div className="text-base md:text-lg font-bold">{day.city}</div>
              <div className="text-[10px] md:text-xs mt-1 opacity-80">{day.date.slice(5)}</div>
            </button>
          ))}
        </div>

        {/* Timeline Content (Print Area) */}
        <div ref={printRef} className="bg-white/80 backdrop-blur rounded-3xl shadow-xl min-h-[600px] overflow-hidden border border-white/50 print:shadow-none print:border-none print:bg-white print:min-h-0 print:overflow-visible" id="itinerary-content">
          <div className="bg-slate-800 text-white p-6 md:p-10 relative overflow-hidden print:bg-white print:text-black print:p-0 print:mb-6">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -translate-y-1/2 translate-x-1/4 blur-3xl print:hidden"></div>
            <div className="relative z-10">
               <h3 className="text-3xl md:text-5xl font-extrabold mb-2 print:text-black">{currentDay.city}</h3>
               <p className="text-blue-200 text-base md:text-xl font-medium flex items-center gap-2 print:text-black"><Sparkles className="w-4 h-4 md:w-5 md:h-5 print:hidden" /> {currentDay.title}</p>
            </div>
          </div>

          <div className="p-4 md:p-12 relative print:p-0">
            <div className="absolute left-[35px] md:left-[59px] top-12 bottom-12 w-0.5 bg-gradient-to-b from-slate-200 via-slate-300 to-slate-200 print:hidden"></div>
            <div className="space-y-8 md:space-y-12 print:space-y-6">
              {currentDay.timeline.map((item, idx) => (
                <div key={idx} className="relative flex gap-4 md:gap-8 group break-inside-avoid print:block">
                  {/* Icon (Hidden on Print to save space/ink) */}
                  <div className={`w-10 h-10 md:w-14 md:h-14 rounded-full flex items-center justify-center shrink-0 z-10 border-4 md:border-[6px] border-white shadow-lg transition-transform group-hover:scale-110 print:hidden ${item.type === 'flight' ? 'bg-indigo-500 text-white' : item.type === 'meal' ? 'bg-orange-500 text-white' : item.type === 'transport' ? 'bg-slate-500 text-white' : item.type === 'activity' ? 'bg-pink-500 text-white' : 'bg-blue-500 text-white'}`}>
                    {item.type === 'flight' && <Plane className="w-5 h-5 md:w-6 md:h-6" />}
                    {item.type === 'transport' && <Train className="w-5 h-5 md:w-6 md:h-6" />}
                    {item.type === 'meal' && <Utensils className="w-5 h-5 md:w-6 md:h-6" />}
                    {item.type === 'hotel' && <Hotel className="w-5 h-5 md:w-6 md:h-6" />}
                    {item.type === 'activity' && <BookOpen className="w-5 h-5 md:w-6 md:h-6" />}
                  </div>

                  <div className="flex-1 bg-white border border-slate-100 rounded-2xl p-4 md:p-6 shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 print:shadow-none print:border-l-4 print:border-slate-300 print:rounded-none print:pl-4 print:mb-4">
                    <div className="flex flex-col md:flex-row justify-between items-start mb-3 md:mb-4 gap-3 md:gap-4">
                      <div>
                        <div className="inline-flex items-center gap-2 bg-slate-100 text-slate-600 px-2 py-0.5 md:px-3 md:py-1 rounded-full text-[10px] md:text-xs font-bold mb-2 print:bg-transparent print:p-0 print:text-black">
                          <span className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-slate-400 print:hidden"></span>
                          {item.time}
                        </div>
                        <h4 className="font-bold text-xl md:text-2xl text-slate-800 flex flex-wrap items-center gap-2 md:gap-3 print:text-black">
                          {item.title}
                          {item.price_level && <span className="text-[10px] md:text-xs px-2 py-0.5 rounded border border-slate-300 text-slate-600 print:border-black print:text-black">{item.price_level === 'High' ? '$$$' : item.price_level === 'Mid' ? '$$' : '$'}</span>}
                        </h4>
                      </div>
                      {/* Hide map button on print */}
                      <a href="#" className="flex items-center gap-1 md:gap-2 text-blue-500 px-3 py-1.5 rounded-full bg-white border border-blue-100 shadow-sm text-xs md:text-sm print:hidden">
                        <Map className="w-3 h-3 md:w-4 md:h-4" /> <span className="font-bold">地圖</span>
                      </a>
                    </div>
                    
                    <div className="text-slate-600 text-sm md:text-base leading-relaxed mb-4 md:mb-6 whitespace-pre-line border-l-4 border-slate-100 pl-3 md:pl-4 py-1 print:text-black print:border-none print:pl-0">
                      {item.description}
                    </div>

                    {item.transport_detail && <div className="bg-slate-50 p-3 md:p-4 rounded-xl mb-3 md:mb-4 flex items-start gap-3 md:gap-4 border border-slate-100 print:bg-transparent print:border print:border-slate-300"><div className="bg-white p-2 rounded-full shadow-sm shrink-0 print:hidden"><Train className="w-4 h-4 text-slate-500" /></div><div className="text-xs md:text-sm text-slate-600 flex-1 print:text-black"><span className="block font-bold text-slate-800 mb-1 print:text-black">交通建議</span>{item.transport_detail}</div></div>}
                    
                    {item.warnings_tips && <div className="bg-amber-50 border border-amber-100 p-3 md:p-4 rounded-xl mb-3 md:mb-4 flex items-start gap-3 md:gap-4 print:border print:border-black print:bg-transparent"><div className="bg-white p-2 rounded-full shadow-sm shrink-0 print:hidden"><AlertTriangle className="w-4 h-4 text-amber-500" /></div><div className="text-xs md:text-sm text-amber-800 flex-1 print:text-black"><span className="block font-bold text-amber-900 mb-1 print:text-black">重要提醒 (Tips)</span>{item.warnings_tips}</div></div>}

                    {item.menu_recommendations && (
                      <div className="mt-4 md:mt-6 border-t border-slate-100 pt-3 md:pt-4 print:border-slate-300">
                        <h5 className="text-xs md:text-sm font-bold text-orange-600 mb-2 md:mb-3 flex items-center gap-2 print:text-black"><Globe className="w-4 h-4 print:hidden" /> 點餐翻譯小幫手</h5>
                        <div className="bg-orange-50/50 rounded-xl overflow-hidden border border-orange-100 overflow-x-auto print:bg-transparent print:border-slate-300">
                          <table className="w-full text-xs md:text-sm text-left min-w-[300px]">
                            <thead className="bg-orange-100 text-orange-800 print:bg-slate-100 print:text-black"><tr><th className="p-2 md:p-3 pl-3 md:pl-4 font-bold">當地菜名</th><th className="p-2 md:p-3 font-bold">中文</th><th className="p-2 md:p-3 font-bold">預估價格</th></tr></thead>
                            <tbody className="divide-y divide-orange-100 text-slate-700 print:divide-slate-300">
                              {item.menu_recommendations.map((menu, mIdx) => (
                                <tr key={mIdx} className="hover:bg-orange-50 transition-colors print:text-black"><td className="p-2 md:p-3 pl-3 md:pl-4 font-medium text-orange-900 print:text-black">{menu.local}</td><td className="p-2 md:p-3">{menu.cn}</td><td className="p-2 md:p-3 text-slate-500 font-mono print:text-black">{menu.price}</td></tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-100 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-100 via-slate-100 to-slate-200 p-4 md:p-8 font-sans selection:bg-blue-200 selection:text-blue-900 print:bg-white print:p-0">
      {step === 'input' && renderInputForm()}
      {step === 'loading' && renderLoading()}
      {step === 'result' && renderResult()}
      {step === 'saved_list' && renderSavedList()}
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
