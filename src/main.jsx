import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css'; 
import { 
  Plane, Hotel, MapPin, Users, Calendar, 
  Utensils, AlertTriangle, Map, DollarSign, 
  Loader2, Sparkles, Train, Globe, Plus, 
  Trash2, ChevronDown, ChevronUp, Heart,
  List, ArrowLeft, BookOpen, Search
} from 'lucide-react';

const App = () => {
  // --- 狀態管理 ---
  const [step, setStep] = useState('input'); // input, loading, result, saved_list
  const [apiKey, setApiKey] = useState('');
  const [itineraryData, setItineraryData] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [errorMsg, setErrorMsg] = useState('');
  const [savedPlans, setSavedPlans] = useState([]);

  // 初始化讀取 localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('my_travel_plans');
      if (saved) {
        setSavedPlans(JSON.parse(saved));
      }
    } catch (e) {
      console.error("無法讀取儲存的計畫", e);
    }
  }, []);

  // --- 表單資料 ---
  const [basicData, setBasicData] = useState({
    destinations: '福岡',
    dates: '2025-12-08 to 2025-12-12',
    type: '綜合 (購物+文化)',
    travelers: 2,
    hasTransitTour: true,
    isMultiCityFlight: false, 
  });

  const [simpleFlights, setSimpleFlights] = useState({
    outbound: { date: '2025-12-08', time: '16:55', code: 'IT720', airport: 'FUK', type: '去程' },
    transit:  { date: '2025-12-12', time: '12:10', code: 'TW214', airport: 'TAE', type: '中轉' },
    inbound:  { date: '2025-12-12', time: '22:40', code: 'TW663', airport: 'TPE', type: '回程' },
  });

  const [multiFlights, setMultiFlights] = useState([
    { id: 1, type: '去程', date: '', time: '', code: '', airport: '', isOpen: true }
  ]);

  const [accommodations, setAccommodations] = useState([
    { 
      id: 1, 
      type: '飯店', 
      source: 'Agoda', 
      name: '博多站前飯店', 
      address: '福岡市博多區...', 
      orderId: 'AG123456', 
      booker: '王小明',
      isOpen: true 
    }
  ]);

  // --- 操作處理函數 ---
  const handleBasicChange = (e) => {
    const { name, value, type, checked } = e.target;
    setBasicData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSimpleFlightChange = (key, field, value) => {
    setSimpleFlights(prev => ({
      ...prev,
      [key]: { ...prev[key], [field]: value }
    }));
  };

  const addMultiFlight = () => {
    setMultiFlights(prev => [
      ...prev.map(f => ({ ...f, isOpen: false })), 
      { id: Date.now(), type: '航段', date: '', time: '', code: '', airport: '', isOpen: true }
    ]);
  };

  const updateMultiFlight = (id, field, value) => {
    setMultiFlights(prev => prev.map(f => f.id === id ? { ...f, [field]: value } : f));
  };

  const toggleMultiFlight = (id) => {
    setMultiFlights(prev => prev.map(f => f.id === id ? { ...f, isOpen: !f.isOpen } : { ...f, isOpen: false }));
  };

  const removeMultiFlight = (id) => {
    setMultiFlights(prev => prev.filter(f => f.id !== id));
  };

  const addAccommodation = () => {
    setAccommodations(prev => [
      ...prev.map(a => ({ ...a, isOpen: false })), 
      { id: Date.now(), type: '飯店', source: '', name: '', address: '', orderId: '', booker: '', isOpen: true }
    ]);
  };

  const updateAccommodation = (id, field, value) => {
    setAccommodations(prev => prev.map(a => a.id === id ? { ...a, [field]: value } : a));
  };

  const toggleAccommodation = (id) => {
    setAccommodations(prev => prev.map(a => a.id === id ? { ...a, isOpen: !a.isOpen } : { ...a, isOpen: false }));
  };

  const removeAccommodation = (id) => {
    setAccommodations(prev => prev.filter(a => a.id !== id));
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
        created: itineraryData.created || Date.now()
      };
      newPlans = [planToSave, ...savedPlans];
    }
    setSavedPlans(newPlans);
    localStorage.setItem('my_travel_plans', JSON.stringify(newPlans));
    if (!itineraryData.created) {
      setItineraryData(prev => ({ ...prev, created: Date.now() }));
    }
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

  const generateItinerary = async () => {
    if (!apiKey) {
      alert("請輸入您的 Gemini API Key");
      return;
    }
    setStep('loading');
    setErrorMsg('');

    let flightsString = "";
    if (basicData.isMultiCityFlight) {
      flightsString = multiFlights.map(f => 
        `${f.type} | 日期:${f.date} | 時間:${f.time} | 航班:${f.code} | 機場:${f.airport}`
      ).join('\n');
    } else {
      flightsString = `
        去程 | 日期:${simpleFlights.outbound.date} | 時間:${simpleFlights.outbound.time} | 航班:${simpleFlights.outbound.code} | 機場:${simpleFlights.outbound.airport}
        中轉 | 日期:${simpleFlights.transit.date ? simpleFlights.transit.date : '無'} | 時間:${simpleFlights.transit.time} | 航班:${simpleFlights.transit.code} | 機場:${simpleFlights.transit.airport}
        回程 | 日期:${simpleFlights.inbound.date} | 時間:${simpleFlights.inbound.time} | 航班:${simpleFlights.inbound.code} | 機場:${simpleFlights.inbound.airport}
      `;
    }
    const accommodationString = accommodations.map(a => 
      `住處:${a.name}(${a.type}) 地址:${a.address}`
    ).join('\n');

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
        body: JSON.stringify({
          contents: [{ parts: [{ text: systemPrompt }] }],
          generationConfig: { responseMimeType: "application/json" }
        })
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
    <div className="max-w-4xl mx-auto bg-white/90 backdrop-blur-md p-8 rounded-3xl shadow-2xl space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 border border-white/20">
      <div className="text-center pb-6 border-b border-slate-100">
        <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-teal-500 flex items-center justify-center gap-3">
          <Sparkles className="w-10 h-10 text-teal-500" />
          AI 智能旅程規劃師
        </h1>
        <p className="text-slate-500 mt-3 text-lg">智慧分析航班與機場，為您量身打造深度文化之旅</p>
      </div>

      <div className="space-y-6">
        {/* API Key */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-2xl border border-blue-100 shadow-inner">
          <label className="block text-sm font-bold text-blue-800 mb-2">Gemini API Key (必填)</label>
          <div className="relative">
             <input 
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="貼上您的 API Key 以啟動 AI..."
              className="w-full pl-4 pr-4 py-3 bg-white border border-blue-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all shadow-sm"
            />
          </div>
        </div>

        {/* 基本資訊區塊 */}
        <section className="space-y-4">
          <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <span className="bg-blue-100 p-2 rounded-lg text-blue-600"><MapPin className="w-5 h-5" /></span>
            基本行程
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-600">目的城市</label>
              <input 
                name="destinations"
                value={basicData.destinations}
                onChange={handleBasicChange}
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                placeholder="例如: 福岡, 京都"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-600">旅遊日期</label>
              <div className="relative">
                <Calendar className="absolute left-4 top-4 w-5 h-5 text-slate-400" />
                <input 
                  name="dates"
                  value={basicData.dates}
                  onChange={handleBasicChange}
                  className="w-full pl-12 p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                />
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-600">風格</label>
              <select 
                name="type"
                value={basicData.type}
                onChange={handleBasicChange}
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all appearance-none"
              >
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
                <Users className="absolute left-4 top-4 w-5 h-5 text-slate-400" />
                <input 
                  type="number"
                  name="travelers"
                  value={basicData.travelers}
                  onChange={handleBasicChange}
                  className="w-full pl-12 p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                />
              </div>
            </div>
          </div>
        </section>

        <hr className="border-slate-100" />

        {/* 航班資訊 */}
        <section className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <span className="bg-indigo-100 p-2 rounded-lg text-indigo-600"><Plane className="w-5 h-5" /></span>
              航班資訊 <span className="text-xs font-normal text-slate-500 bg-slate-100 px-2 py-1 rounded ml-2">AI 將依機場代碼優化動線</span>
            </h3>
            <label className="flex items-center gap-2 cursor-pointer hover:bg-slate-50 p-2 rounded-lg transition-colors">
              <input 
                type="checkbox"
                name="isMultiCityFlight"
                checked={basicData.isMultiCityFlight}
                onChange={handleBasicChange}
                className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
              />
              <span className="text-sm font-bold text-slate-600">啟用多城市複雜航班</span>
            </label>
          </div>

          {!basicData.isMultiCityFlight ? (
            <div className="bg-slate-50/50 p-6 rounded-2xl border border-slate-200 space-y-4 shadow-sm">
              <div className="hidden md:grid grid-cols-12 gap-4 text-xs font-bold text-slate-500 px-2 uppercase tracking-wide">
                <span className="col-span-1">類型</span>
                <span className="col-span-3">日期</span>
                <span className="col-span-2">時間</span>
                <span className="col-span-4">航班代號</span>
                <span className="col-span-2">機場(重要)</span>
              </div>
              
              {[
                { label: '去程', key: 'outbound', color: 'text-emerald-600' },
                { label: '中轉', key: 'transit', color: 'text-amber-600' },
                { label: '回程', key: 'inbound', color: 'text-blue-600' }
              ].map((row) => (
                <div key={row.key} className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
                  <span className={`col-span-1 text-sm font-bold ${row.color} pt-2 md:pt-0`}>{row.label}</span>
                  <div className="col-span-3">
                     <input type="date" value={simpleFlights[row.key].date} onChange={(e) => handleSimpleFlightChange(row.key, 'date', e.target.value)} className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                  </div>
                  <div className="col-span-2">
                     <input type="time" value={simpleFlights[row.key].time} onChange={(e) => handleSimpleFlightChange(row.key, 'time', e.target.value)} className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                  </div>
                  <div className="col-span-4">
                     <input type="text" placeholder="航班 (例: CI100)" value={simpleFlights[row.key].code} onChange={(e) => handleSimpleFlightChange(row.key, 'code', e.target.value)} className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                  </div>
                  <div className="col-span-2">
                     <input type="text" placeholder="機場 (例: FUK)" value={simpleFlights[row.key].airport} onChange={(e) => handleSimpleFlightChange(row.key, 'airport', e.target.value)} className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-sm font-mono uppercase focus:ring-2 focus:ring-blue-500 outline-none text-center bg-yellow-50" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {multiFlights.map((flight) => (
                <div key={flight.id} className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm transition-all hover:shadow-md">
                  <div onClick={() => toggleMultiFlight(flight.id)} className="p-4 flex items-center justify-between cursor-pointer bg-slate-50/50 hover:bg-slate-100">
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-slate-700 bg-white px-3 py-1 rounded-md border border-slate-200 text-sm shadow-sm">{flight.type}</span>
                      {!flight.isOpen && <span className="text-sm text-slate-500">{flight.date} <span className="mx-2 text-slate-300">|</span> {flight.code} <span className="mx-2 text-slate-300">|</span> {flight.airport}</span>}
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={(e) => { e.stopPropagation(); removeMultiFlight(flight.id); }} className="p-2 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-full transition-colors"><Trash2 className="w-4 h-4" /></button>
                      {flight.isOpen ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                    </div>
                  </div>
                  {flight.isOpen && (
                    <div className="p-4 grid grid-cols-2 md:grid-cols-5 gap-4">
                      <input placeholder="類型" value={flight.type} onChange={(e) => updateMultiFlight(flight.id, 'type', e.target.value)} className="p-2.5 border rounded-lg text-sm" />
                      <input type="date" value={flight.date} onChange={(e) => updateMultiFlight(flight.id, 'date', e.target.value)} className="p-2.5 border rounded-lg text-sm" />
                      <input type="time" value={flight.time} onChange={(e) => updateMultiFlight(flight.id, 'time', e.target.value)} className="p-2.5 border rounded-lg text-sm" />
                      <input placeholder="航班代號" value={flight.code} onChange={(e) => updateMultiFlight(flight.id, 'code', e.target.value)} className="p-2.5 border rounded-lg text-sm" />
                      <input placeholder="機場代碼 (TPE)" value={flight.airport} onChange={(e) => updateMultiFlight(flight.id, 'airport', e.target.value)} className="p-2.5 border rounded-lg text-sm font-mono uppercase bg-yellow-50" />
                    </div>
                  )}
                </div>
              ))}
              <button onClick={addMultiFlight} className="w-full py-3 border-2 border-dashed border-slate-300 rounded-xl text-slate-500 hover:border-blue-400 hover:text-blue-500 hover:bg-blue-50 flex items-center justify-center gap-2 transition-all font-medium">
                <Plus className="w-5 h-5" /> 新增航段
              </button>
            </div>
          )}
          
          <div className="flex items-center gap-3 pt-2 bg-blue-50/50 p-4 rounded-xl border border-blue-100">
             <input type="checkbox" id="transitTour" name="hasTransitTour" checked={basicData.hasTransitTour} onChange={handleBasicChange} className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500" />
             <label htmlFor="transitTour" className="text-slate-700 font-bold cursor-pointer">安排轉機入境觀光</label>
             <span className="text-xs text-blue-500 bg-white px-2 py-0.5 rounded-full border border-blue-100">AI 推薦</span>
          </div>
        </section>

        <hr className="border-slate-100" />

        <section className="space-y-4">
          <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <span className="bg-orange-100 p-2 rounded-lg text-orange-600"><Hotel className="w-5 h-5" /></span>
            住宿資訊
          </h3>
          <div className="space-y-3">
            {accommodations.map((acc) => (
              <div key={acc.id} className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all">
                <div onClick={() => toggleAccommodation(acc.id)} className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-50">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold"><Hotel className="w-5 h-5" /></div>
                    <div><div className="font-bold text-slate-800">{acc.name || '新住宿地點'}</div><div className="text-xs text-slate-500 flex items-center gap-1"><MapPin className="w-3 h-3" /> {acc.address || '尚未輸入地址'}</div></div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={(e) => { e.stopPropagation(); removeAccommodation(acc.id); }} className="p-2 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-full transition-colors"><Trash2 className="w-4 h-4" /></button>
                    {acc.isOpen ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
                  </div>
                </div>
                {acc.isOpen && (
                   <div className="p-5 bg-slate-50/50 border-t border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-4">
                      <input value={acc.type} onChange={(e) => updateAccommodation(acc.id, 'type', e.target.value)} className="p-3 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" placeholder="類型 (例如: 飯店, 民宿)" />
                      <input value={acc.name} onChange={(e) => updateAccommodation(acc.id, 'name', e.target.value)} className="p-3 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" placeholder="住宿名稱" />
                      <input value={acc.address} onChange={(e) => updateAccommodation(acc.id, 'address', e.target.value)} className="p-3 border rounded-lg text-sm md:col-span-2 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="完整地址 (AI 將以此計算交通)" />
                   </div>
                )}
              </div>
            ))}
            <button onClick={addAccommodation} className="w-full py-3 border-2 border-dashed border-slate-300 rounded-xl text-slate-500 flex justify-center items-center gap-2 hover:border-orange-400 hover:text-orange-500 hover:bg-orange-50 transition-all font-medium"><Plus className="w-5 h-5" /> 新增住宿</button>
          </div>
        </section>
      </div>

      <div className="space-y-4 pt-4">
        <button onClick={generateItinerary} className="w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white font-bold py-5 rounded-2xl shadow-xl hover:shadow-2xl hover:scale-[1.01] transform transition-all flex justify-center items-center gap-3 text-xl ring-4 ring-blue-100">
          <Sparkles className="w-6 h-6 animate-pulse" /> 開始 AI 一鍵規劃
        </button>

        <button 
          onClick={() => setStep('saved_list')}
          className="w-full bg-white border-2 border-slate-200 text-slate-600 font-bold py-4 rounded-2xl hover:bg-slate-50 hover:border-slate-300 transition-all flex justify-center items-center gap-2"
        >
          <List className="w-5 h-5" /> 查看已儲存的規劃 ({savedPlans.length})
        </button>
      </div>

      {errorMsg && <div className="p-4 bg-red-50 text-red-600 rounded-xl flex items-center gap-2 border border-red-100 animate-shake"><AlertTriangle className="w-5 h-5" />{errorMsg}</div>}
    </div>
  );

  const renderLoading = () => (
    <div className="flex flex-col items-center justify-center min-h-[80vh] text-slate-600 space-y-8 animate-in fade-in duration-1000">
      <div className="relative">
        <div className="absolute inset-0 bg-blue-500 blur-xl opacity-20 rounded-full animate-pulse"></div>
        <Loader2 className="w-24 h-24 animate-spin text-blue-600 relative z-10" />
      </div>
      <div className="text-center space-y-3">
        <h2 className="text-3xl font-bold text-slate-800">AI 正在為您編織旅程...</h2>
        <p className="text-lg text-slate-500 flex items-center justify-center gap-2">
          <Globe className="w-5 h-5 animate-spin-slow" />
          正在分析 {basicData.destinations} 的歷史文化與最佳動線
        </p>
        <div className="flex gap-2 justify-center mt-4">
          <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce delay-100"></span>
          <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce delay-200"></span>
          <span className="w-2 h-2 bg-blue-600 rounded-full animate-bounce delay-300"></span>
        </div>
      </div>
    </div>
  );

  const renderSavedList = () => (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-right-8 duration-500">
      <div className="flex items-center gap-4">
        <button onClick={() => setStep('input')} className="p-3 bg-white rounded-full shadow-lg hover:bg-slate-50 border border-slate-100 transition-transform hover:-translate-x-1"><ArrowLeft className="w-6 h-6 text-slate-700" /></button>
        <h2 className="text-3xl font-bold text-slate-800">我的旅程記憶</h2>
      </div>

      {savedPlans.length === 0 ? (
        <div className="text-center py-32 bg-white/80 backdrop-blur rounded-3xl shadow-sm border border-slate-200 text-slate-400">
          <BookOpen className="w-24 h-24 mx-auto mb-6 opacity-20" />
          <p className="text-xl">目前沒有儲存的規劃</p>
          <p className="text-sm mt-2">請先進行一次 AI 規劃後點擊愛心儲存</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {savedPlans.map((plan, idx) => (
            <div 
              key={idx} 
              onClick={() => loadSavedPlan(plan)}
              className="group bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-xl hover:border-blue-200 cursor-pointer transition-all duration-300 transform hover:-translate-y-1 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-blue-100 to-transparent rounded-bl-full opacity-50 transition-opacity group-hover:opacity-100"></div>
              
              <div className="flex justify-between items-start mb-4 relative z-10">
                <h3 className="font-bold text-xl text-slate-800 group-hover:text-blue-600 transition-colors line-clamp-1">
                  {plan.basicInfo?.destinations || '旅程規劃'}
                </h3>
                <span className="text-xs bg-slate-100 text-slate-500 px-2 py-1 rounded-full font-mono">
                  {new Date(plan.created).toLocaleDateString()}
                </span>
              </div>
              <p className="text-slate-500 text-sm line-clamp-3 mb-6 min-h-[4rem] leading-relaxed relative z-10">{plan.trip_summary}</p>
              <div className="flex items-center gap-4 text-sm text-slate-400 border-t border-slate-50 pt-4">
                <div className="flex items-center gap-1.5"><Calendar className="w-4 h-4 text-blue-400" /> {plan.days.length} 天</div>
                <div className="flex items-center gap-1.5"><Users className="w-4 h-4 text-orange-400" /> {plan.basicInfo?.travelers || 2} 人</div>
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
      <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in zoom-in-95 duration-500 pb-20">
        {/* Header Card */}
        <div className="bg-white/90 backdrop-blur-md p-8 rounded-3xl shadow-lg border border-white/50 relative overflow-hidden">
           <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>
           <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-3xl font-extrabold text-slate-800">
                  {basicData.destinations} 
                </h2>
                {basicData.hasTransitTour && <span className="text-xs font-bold bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full flex items-center gap-1"><Plane className="w-3 h-3" /> 含轉機觀光</span>}
              </div>
              <p className="text-slate-600 max-w-2xl text-lg leading-relaxed">{itineraryData.trip_summary}</p>
            </div>
            <div className="flex items-center gap-3">
              <button 
                onClick={saveCurrentPlan}
                className={`p-4 rounded-full transition-all shadow-md hover:scale-110 active:scale-95 ${isSaved ? 'bg-red-50 text-red-500 ring-2 ring-red-100' : 'bg-white text-slate-400 hover:text-red-500'}`}
                title={isSaved ? "取消儲存" : "儲存此規劃"}
              >
                <Heart className={`w-6 h-6 ${isSaved ? 'fill-current' : ''}`} />
              </button>
              <button onClick={() => setStep('input')} className="px-6 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200 transition-colors">
                重新規劃
              </button>
            </div>
          </div>
          <div className="flex gap-6 text-sm text-slate-500 mt-6 pt-6 border-t border-slate-100 font-medium">
             <span className="flex items-center gap-2 bg-slate-50 px-3 py-1 rounded-lg"><DollarSign className="w-4 h-4 text-emerald-500" /> 參考匯率: {itineraryData.currency_rate}</span>
             <span className="flex items-center gap-2 bg-slate-50 px-3 py-1 rounded-lg"><Calendar className="w-4 h-4 text-blue-500" /> {basicData.dates}</span>
          </div>
        </div>

        {/* Day Tabs */}
        <div className="flex overflow-x-auto pb-4 gap-4 scrollbar-hide px-2 snap-x">
          {itineraryData.days.map((day, index) => (
            <button
              key={index}
              onClick={() => setActiveTab(index)}
              className={`snap-center flex-shrink-0 px-8 py-4 rounded-2xl transition-all duration-300 border-2 relative overflow-hidden group ${
                activeTab === index 
                  ? 'bg-slate-800 text-white border-slate-800 shadow-xl scale-105' 
                  : 'bg-white text-slate-500 border-transparent hover:border-slate-200 hover:bg-slate-50'
              }`}
            >
              <div className="text-xs opacity-60 uppercase tracking-wider mb-1 font-bold">Day {day.day_index}</div>
              <div className="text-lg font-bold">{day.city}</div>
              <div className="text-xs mt-1 opacity-80">{day.date.slice(5)}</div>
            </button>
          ))}
        </div>

        {/* Timeline Content */}
        <div className="bg-white/80 backdrop-blur rounded-3xl shadow-xl min-h-[600px] overflow-hidden border border-white/50">
          <div className="bg-slate-800 text-white p-10 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -translate-y-1/2 translate-x-1/4 blur-3xl"></div>
            <div className="relative z-10">
               <h3 className="text-5xl font-extrabold mb-2">{currentDay.city}</h3>
               <p className="text-blue-200 text-xl font-medium flex items-center gap-2"><Sparkles className="w-5 h-5" /> {currentDay.title}</p>
            </div>
          </div>

          <div className="p-8 md:p-12 relative">
            <div className="absolute left-[54px] md:left-[59px] top-12 bottom-12 w-0.5 bg-gradient-to-b from-slate-200 via-slate-300 to-slate-200"></div>
            <div className="space-y-12">
              {currentDay.timeline.map((item, idx) => (
                <div key={idx} className="relative flex gap-8 group">
                  <div className={`w-14 h-14 rounded-full flex items-center justify-center shrink-0 z-10 border-[6px] border-white shadow-lg transition-transform group-hover:scale-110 ${
                      item.type === 'flight' ? 'bg-indigo-500 text-white' : 
                      item.type === 'meal' ? 'bg-orange-500 text-white' :
                      item.type === 'transport' ? 'bg-slate-500 text-white' :
                      item.type === 'activity' ? 'bg-pink-500 text-white' :
                      'bg-blue-500 text-white'
                  }`}>
                    {item.type === 'flight' && <Plane className="w-6 h-6" />}
                    {item.type === 'transport' && <Train className="w-6 h-6" />}
                    {item.type === 'meal' && <Utensils className="w-6 h-6" />}
                    {item.type === 'hotel' && <Hotel className="w-6 h-6" />}
                    {item.type === 'activity' && <BookOpen className="w-6 h-6" />}
                  </div>

                  <div className="flex-1 bg-white border border-slate-100 rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                    <div className="flex flex-col md:flex-row justify-between items-start mb-4 gap-4">
                      <div>
                        <div className="inline-flex items-center gap-2 bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-xs font-bold mb-2">
                          <span className="w-2 h-2 rounded-full bg-slate-400"></span>
                          {item.time}
                        </div>
                        <h4 className="font-bold text-2xl text-slate-800 flex flex-wrap items-center gap-3">
                          {item.title}
                          {item.price_level && (
                            <span className={`text-xs px-2 py-0.5 rounded border ${
                              item.price_level === 'High' ? 'bg-red-50 text-red-600 border-red-100' : 
                              item.price_level === 'Mid' ? 'bg-yellow-50 text-yellow-600 border-yellow-100' : 
                              'bg-green-50 text-green-600 border-green-100'
                            }`}>
                              {item.price_level === 'High' ? '$$$' : item.price_level === 'Mid' ? '$$' : '$'}
                            </span>
                          )}
                        </h4>
                      </div>
                      <a 
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(item.location_query || item.title)}`} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="flex items-center gap-2 text-blue-500 hover:text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-full transition-colors bg-white border border-blue-100 shadow-sm"
                      >
                        <Map className="w-4 h-4" /> <span className="text-sm font-bold">地圖</span>
                      </a>
                    </div>
                    
                    <div className="text-slate-600 leading-relaxed mb-6 whitespace-pre-line border-l-4 border-slate-100 pl-4 py-1">
                      {item.description}
                    </div>

                    {item.transport_detail && (
                      <div className="bg-slate-50 p-4 rounded-xl mb-4 flex items-start gap-4 border border-slate-100">
                        <div className="bg-white p-2 rounded-full shadow-sm"><Train className="w-4 h-4 text-slate-500" /></div>
                        <div className="text-sm text-slate-600 flex-1">
                          <span className="block font-bold text-slate-800 mb-1">交通建議</span>
                          {item.transport_detail}
                        </div>
                      </div>
                    )}
                    
                    {item.warnings_tips && (
                      <div className="bg-amber-50 border border-amber-100 p-4 rounded-xl mb-4 flex items-start gap-4">
                        <div className="bg-white p-2 rounded-full shadow-sm"><AlertTriangle className="w-4 h-4 text-amber-500" /></div>
                        <div className="text-sm text-amber-800 flex-1">
                          <span className="block font-bold text-amber-900 mb-1">重要提醒 (Tips)</span>
                          {item.warnings_tips}
                        </div>
                      </div>
                    )}

                    {item.menu_recommendations && (
                      <div className="mt-6 border-t border-slate-100 pt-4">
                        <h5 className="text-sm font-bold text-orange-600 mb-3 flex items-center gap-2"><Globe className="w-4 h-4" /> 點餐翻譯小幫手</h5>
                        <div className="bg-orange-50/50 rounded-xl overflow-hidden border border-orange-100">
                          <table className="w-full text-sm text-left">
                            <thead className="bg-orange-100 text-orange-800">
                              <tr>
                                <th className="p-3 pl-4 font-bold">當地菜名</th>
                                <th className="p-3 font-bold">中文</th>
                                <th className="p-3 font-bold">預估價格</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-orange-100 text-slate-700">
                              {item.menu_recommendations.map((menu, mIdx) => (
                                <tr key={mIdx} className="hover:bg-orange-50 transition-colors">
                                  <td className="p-3 pl-4 font-medium text-orange-900">{menu.local}</td>
                                  <td className="p-3">{menu.cn}</td>
                                  <td className="p-3 text-slate-500 font-mono">{menu.price}</td>
                                </tr>
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
    <div className="min-h-screen bg-slate-100 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-100 via-slate-100 to-slate-200 p-4 md:p-8 font-sans selection:bg-blue-200 selection:text-blue-900">
      <div id="tailwind-injector"></div>
      {step === 'input' && renderInputForm()}
      {step === 'loading' && renderLoading()}
      {step === 'result' && renderResult()}
      {step === 'saved_list' && renderSavedList()}
    </div>
  );
};

// --- 初始化 React (安全渲染) ---
const rootElement = document.getElementById('root');
if (rootElement) {
  const root = createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
} else {
  console.error("找不到 root 元素，請確認 index.html 包含 <div id='root'></div>");
}
