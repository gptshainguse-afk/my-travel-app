import React, { useState, useEffect } from 'react';
import { 
  Plane, Hotel, MapPin, Users, Calendar, 
  Utensils, AlertTriangle, Map, DollarSign, 
  Loader2, Sparkles, Train, Globe, Plus, 
  Trash2, ChevronDown, ChevronUp, Heart,
  List, ArrowLeft, BookOpen
} from 'lucide-react';

const TravelPlannerApp = () => {
  // --- 狀態管理 ---
  const [step, setStep] = useState('input'); // input, loading, result, saved_list
  const [apiKey, setApiKey] = useState('');
  const [itineraryData, setItineraryData] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [errorMsg, setErrorMsg] = useState('');
  
  // 收藏功能狀態
  const [savedPlans, setSavedPlans] = useState([]);

  // 初始化讀取 localStorage
  useEffect(() => {
    const saved = localStorage.getItem('my_travel_plans');
    if (saved) {
      setSavedPlans(JSON.parse(saved));
    }
  }, []);

  // --- 表單資料 ---
  const [basicData, setBasicData] = useState({
    destinations: '福岡',
    dates: '2024-12-08 to 2024-12-12',
    type: '綜合 (購物+文化)',
    travelers: 2,
    hasTransitTour: true,
    isMultiCityFlight: false, 
  });

  // --- 航班資料狀態 (一般模式 - 新增機場代碼) ---
  const [simpleFlights, setSimpleFlights] = useState({
    outbound: { date: '2024-12-08', time: '16:55', code: 'CI116', airport: 'FUK', type: '去程' },
    transit:  { date: '2024-12-12', time: '12:10', code: 'TW232', airport: 'TAE', type: '中轉' },
    inbound:  { date: '2024-12-12', time: '22:40', code: 'TW663', airport: 'TPE', type: '回程' },
  });

  // --- 航班資料狀態 (多城市模式) ---
  const [multiFlights, setMultiFlights] = useState([
    { id: 1, type: '去程', date: '', time: '', code: '', airport: '', isOpen: true }
  ]);

  // --- 住宿資料狀態 ---
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

  // --- 基本操作 ---
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

  // --- 多城市航班操作 ---
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

  // --- 住宿操作 ---
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

  // --- 收藏/讀取功能 ---
  const saveCurrentPlan = () => {
    if (!itineraryData) return;
    
    // 檢查是否已存在 (避免重複)
    const existingIndex = savedPlans.findIndex(p => 
      p.created === itineraryData.created // 使用建立時間戳記作為 ID
    );

    let newPlans;
    if (existingIndex >= 0) {
      // 如果已存在，則移除 (Unsave)
      newPlans = savedPlans.filter((_, idx) => idx !== existingIndex);
    } else {
      // 新增
      const planToSave = {
        ...itineraryData,
        basicInfo: basicData, // 儲存當時的輸入條件以便參考
        created: itineraryData.created || Date.now() // 確保有 ID
      };
      newPlans = [planToSave, ...savedPlans];
    }
    
    setSavedPlans(newPlans);
    localStorage.setItem('my_travel_plans', JSON.stringify(newPlans));
    
    // 若當前顯示的資料沒有 created ID，補上它以便 UI 正確顯示愛心狀態
    if (!itineraryData.created) {
      setItineraryData(prev => ({ ...prev, created: Date.now() }));
    }
  };

  const loadSavedPlan = (plan) => {
    setItineraryData(plan);
    setBasicData(plan.basicInfo || basicData); // 恢復當時的設定
    setStep('result');
    setActiveTab(0);
  };

  const isCurrentPlanSaved = () => {
    if (!itineraryData) return false;
    return savedPlans.some(p => p.created === itineraryData.created);
  };

  // --- 呼叫 Gemini API ---
  const generateItinerary = async () => {
    if (!apiKey) {
      alert("請輸入您的 Gemini API Key");
      return;
    }

    setStep('loading');
    setErrorMsg('');

    // 1. 整理航班資訊字串 (包含機場代碼)
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

    // 構建 Prompt
    const systemPrompt = `
      You are an expert AI Travel Planner API. Respond with valid JSON only.
      
      User Constraints:
      - Destinations: ${basicData.destinations}
      - Dates: ${basicData.dates}
      - Type: ${basicData.type}
      - Travelers: ${basicData.travelers}
      - Flights (Format: Type|Date|Time|Flight|Airport): 
        ${flightsString}
        (CRITICAL: Use Airport Codes to identify cities accurately. E.g., FUK=Fukuoka, TAE=Daegu).
      - Accommodation: ${accommodationString}
      - Transit Tour: ${basicData.hasTransitTour}
      
      Requirements:
      1. **Logistics**: Realistic travel times + buffer.
      2. **Culture & History (CRITICAL)**: For any historical/cultural sites (temples, old streets, monuments), the 'description' field MUST include a detailed background story, historical significance, or cultural context. Do not just say "Visit X". Explain "Why X is important".
      3. **Food**: Menu translation (Local | Chinese | Est. Price).
      
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
                "description": "Detailed description (Include history/culture context if applicable)",
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
      // 確保有 created 欄位以便儲存識別
      if (!parsedData.created) parsedData.created = Date.now();
      
      setItineraryData(parsedData);
      setStep('result');

    } catch (error) {
      console.error(error);
      setErrorMsg("生成失敗: " + error.message);
      setStep('input');
    }
  };

  // --- 元件：輸入表單 ---
  const renderInputForm = () => (
    <div className="max-w-4xl mx-auto bg-white p-6 md:p-8 rounded-2xl shadow-xl space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="text-center border-b border-slate-100 pb-6">
        <h1 className="text-3xl font-bold text-slate-800 flex items-center justify-center gap-2">
          <Sparkles className="w-8 h-8 text-blue-500" />
          AI 智能旅程規劃師
        </h1>
        <p className="text-slate-500 mt-2">智慧分析航班機場代碼，提供深度文化導覽與動線規劃</p>
      </div>

      <div className="space-y-6">
        {/* API Key */}
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
          <label className="block text-sm font-medium text-slate-700 mb-1">Gemini API Key</label>
          <input 
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="請輸入 API Key..."
            className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

        {/* 基本資訊 */}
        <section className="space-y-4">
          <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-blue-600" />
            基本行程
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">目的城市</label>
              <input 
                name="destinations"
                value={basicData.destinations}
                onChange={handleBasicChange}
                className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">旅遊日期</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                <input 
                  name="dates"
                  value={basicData.dates}
                  onChange={handleBasicChange}
                  className="w-full pl-10 p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">風格</label>
              <select 
                name="type"
                value={basicData.type}
                onChange={handleBasicChange}
                className="w-full p-3 border border-slate-200 rounded-lg bg-white outline-none"
              >
                <option>休閒 (慢步調)</option>
                <option>購物 (商圈為主)</option>
                <option>文化 (歷史古蹟)</option>
                <option>深度 (在地體驗)</option>
                <option>綜合 (購物+文化)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">人數</label>
              <input 
                type="number"
                name="travelers"
                value={basicData.travelers}
                onChange={handleBasicChange}
                className="w-full p-3 border border-slate-200 rounded-lg outline-none"
              />
            </div>
          </div>
        </section>

        <hr className="border-slate-100" />

        {/* 航班資訊 (更新版) */}
        <section className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <Plane className="w-5 h-5 text-blue-600" />
              航班資訊 (AI 依機場代碼辨識)
            </h3>
            <div className="flex items-center gap-2">
              <input 
                type="checkbox"
                id="multiCity"
                name="isMultiCityFlight"
                checked={basicData.isMultiCityFlight}
                onChange={handleBasicChange}
                className="w-4 h-4 text-blue-600 rounded"
              />
              <label htmlFor="multiCity" className="text-sm font-medium text-slate-700 cursor-pointer">
                多城市綜合航班
              </label>
            </div>
          </div>

          {!basicData.isMultiCityFlight ? (
            <div className="bg-slate-50 p-4 rounded-xl space-y-4 border border-slate-200">
              {/* Header Row */}
              <div className="hidden md:flex gap-2 text-xs font-bold text-slate-500 px-2">
                <span className="w-12">類型</span>
                <span className="w-36">日期</span>
                <span className="w-24">時間</span>
                <span className="flex-1">航班代號</span>
                <span className="w-24">機場代碼</span>
              </div>
              
              {[
                { label: '去程', key: 'outbound' },
                { label: '中轉', key: 'transit' },
                { label: '回程', key: 'inbound' }
              ].map((row) => (
                <div key={row.key} className="flex flex-col md:flex-row gap-2 items-start md:items-center">
                  <span className="w-12 text-sm font-bold text-slate-600 pt-2 md:pt-0">{row.label}</span>
                  <div className="flex gap-2 w-full md:w-auto">
                    <input 
                      type="date"
                      value={simpleFlights[row.key].date}
                      onChange={(e) => handleSimpleFlightChange(row.key, 'date', e.target.value)}
                      className="p-2 border rounded text-sm w-full md:w-36 outline-none"
                    />
                    <input 
                      type="time"
                      value={simpleFlights[row.key].time}
                      onChange={(e) => handleSimpleFlightChange(row.key, 'time', e.target.value)}
                      className="p-2 border rounded text-sm w-full md:w-24 outline-none"
                    />
                  </div>
                  <div className="flex gap-2 w-full md:flex-1">
                    <input 
                      type="text"
                      placeholder="航班 (CI100)"
                      value={simpleFlights[row.key].code}
                      onChange={(e) => handleSimpleFlightChange(row.key, 'code', e.target.value)}
                      className="p-2 border rounded text-sm flex-1 outline-none"
                    />
                    <input 
                      type="text"
                      placeholder="機場 (FUK)"
                      value={simpleFlights[row.key].airport}
                      onChange={(e) => handleSimpleFlightChange(row.key, 'airport', e.target.value)}
                      className="p-2 border rounded text-sm w-24 outline-none uppercase font-mono"
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {multiFlights.map((flight) => (
                <div key={flight.id} className="bg-slate-50 border border-slate-200 rounded-xl overflow-hidden">
                  <div 
                    onClick={() => toggleMultiFlight(flight.id)}
                    className="p-3 flex items-center justify-between cursor-pointer hover:bg-slate-100"
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-slate-700 bg-white px-2 py-0.5 rounded border border-slate-200 text-sm">
                        {flight.type}
                      </span>
                      {!flight.isOpen && (
                        <span className="text-sm text-slate-500">
                          {flight.date} {flight.code} ({flight.airport})
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={(e) => { e.stopPropagation(); removeMultiFlight(flight.id); }} className="p-1 hover:text-red-500 text-slate-400">
                        <Trash2 className="w-4 h-4" />
                      </button>
                      {flight.isOpen ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                    </div>
                  </div>
                  
                  {flight.isOpen && (
                    <div className="p-3 bg-white border-t border-slate-100 grid grid-cols-2 md:grid-cols-5 gap-3">
                      <input placeholder="類型" value={flight.type} onChange={(e) => updateMultiFlight(flight.id, 'type', e.target.value)} className="p-2 border rounded text-sm outline-none" />
                      <input type="date" value={flight.date} onChange={(e) => updateMultiFlight(flight.id, 'date', e.target.value)} className="p-2 border rounded text-sm outline-none" />
                      <input type="time" value={flight.time} onChange={(e) => updateMultiFlight(flight.id, 'time', e.target.value)} className="p-2 border rounded text-sm outline-none" />
                      <input placeholder="航班代號" value={flight.code} onChange={(e) => updateMultiFlight(flight.id, 'code', e.target.value)} className="p-2 border rounded text-sm outline-none" />
                      <input placeholder="機場代碼 (TPE)" value={flight.airport} onChange={(e) => updateMultiFlight(flight.id, 'airport', e.target.value)} className="p-2 border rounded text-sm outline-none uppercase font-mono" />
                    </div>
                  )}
                </div>
              ))}
              <button onClick={addMultiFlight} className="w-full py-2 border-2 border-dashed border-slate-300 rounded-xl text-slate-500 hover:border-blue-400 hover:text-blue-500 flex items-center justify-center gap-2 transition-colors">
                <Plus className="w-4 h-4" /> 新增航段
              </button>
            </div>
          )}
          
          <div className="flex items-center gap-2 pt-2">
             <input type="checkbox" id="transitTour" name="hasTransitTour" checked={basicData.hasTransitTour} onChange={handleBasicChange} className="w-5 h-5 text-blue-600 rounded" />
             <label htmlFor="transitTour" className="text-slate-700 font-medium cursor-pointer">安排轉機入境觀光</label>
          </div>
        </section>

        <hr className="border-slate-100" />

        <section className="space-y-4">
          <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Hotel className="w-5 h-5 text-blue-600" />
            住宿資訊
          </h3>
          {/* (住宿部分 UI 保持原樣，略微精簡以節省空間，功能邏輯不變) */}
          <div className="space-y-3">
            {accommodations.map((acc) => (
              <div key={acc.id} className="bg-slate-50 border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                <div onClick={() => toggleAccommodation(acc.id)} className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600"><Hotel className="w-4 h-4" /></div>
                    <div><div className="font-bold text-slate-700">{acc.name || '新住宿'}</div><div className="text-xs text-slate-500">{acc.address}</div></div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={(e) => { e.stopPropagation(); removeAccommodation(acc.id); }} className="p-2 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-full"><Trash2 className="w-4 h-4" /></button>
                    {acc.isOpen ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
                  </div>
                </div>
                {acc.isOpen && (
                   <div className="p-4 bg-white border-t border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* 簡化顯示核心欄位 */}
                      <input value={acc.type} onChange={(e) => updateAccommodation(acc.id, 'type', e.target.value)} className="p-2 border rounded text-sm" placeholder="類型" />
                      <input value={acc.name} onChange={(e) => updateAccommodation(acc.id, 'name', e.target.value)} className="p-2 border rounded text-sm" placeholder="名稱" />
                      <input value={acc.address} onChange={(e) => updateAccommodation(acc.id, 'address', e.target.value)} className="p-2 border rounded text-sm md:col-span-2" placeholder="完整地址" />
                   </div>
                )}
              </div>
            ))}
            <button onClick={addAccommodation} className="w-full py-2 border-2 border-dashed border-slate-300 rounded-xl text-slate-500 flex justify-center items-center gap-2"><Plus className="w-4 h-4" /> 新增住宿</button>
          </div>
        </section>
      </div>

      <div className="space-y-4">
        <button onClick={generateItinerary} className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-xl transform transition hover:-translate-y-1 flex justify-center items-center gap-2 text-lg">
          <Sparkles className="w-5 h-5" /> 開始 AI 一鍵規劃
        </button>

        <button 
          onClick={() => setStep('saved_list')}
          className="w-full bg-white border border-slate-200 text-slate-600 font-bold py-3 rounded-xl shadow-sm hover:bg-slate-50 flex justify-center items-center gap-2"
        >
          <List className="w-5 h-5" /> 查看已儲存的規劃 ({savedPlans.length})
        </button>
      </div>

      {errorMsg && <div className="p-4 bg-red-50 text-red-600 rounded-lg flex items-center gap-2"><AlertTriangle className="w-5 h-5" />{errorMsg}</div>}
    </div>
  );

  // --- 元件：載入中 ---
  const renderLoading = () => (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-slate-600">
      <Loader2 className="w-16 h-16 animate-spin text-blue-500 mb-6" />
      <h2 className="text-2xl font-bold mb-2 text-slate-800">AI 正在規劃深度文化之旅...</h2>
      <p className="text-sm">正在根據機場代碼優化轉機動線與歷史景點故事...</p>
    </div>
  );

  // --- 元件：已儲存列表 ---
  const renderSavedList = () => (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => setStep('input')} className="p-2 bg-white rounded-full shadow hover:bg-slate-50"><ArrowLeft className="w-6 h-6 text-slate-600" /></button>
        <h2 className="text-2xl font-bold text-slate-800">我的旅程記憶</h2>
      </div>

      {savedPlans.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl shadow-sm text-slate-500">
          <BookOpen className="w-16 h-16 mx-auto mb-4 opacity-20" />
          <p>目前沒有儲存的規劃。請先進行一次 AI 規劃後點擊愛心儲存。</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {savedPlans.map((plan, idx) => (
            <div 
              key={idx} 
              onClick={() => loadSavedPlan(plan)}
              className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md hover:border-blue-200 cursor-pointer transition-all group"
            >
              <div className="flex justify-between items-start mb-4">
                <h3 className="font-bold text-xl text-slate-800 group-hover:text-blue-600 transition-colors">
                  {plan.basicInfo?.destinations || '旅程規劃'}
                </h3>
                <span className="text-xs bg-slate-100 text-slate-500 px-2 py-1 rounded-full">
                  {new Date(plan.created).toLocaleDateString()}
                </span>
              </div>
              <p className="text-slate-500 text-sm line-clamp-2 mb-4">{plan.trip_summary}</p>
              <div className="flex items-center gap-4 text-sm text-slate-400">
                <div className="flex items-center gap-1"><Calendar className="w-4 h-4" /> {plan.days.length} 天</div>
                <div className="flex items-center gap-1"><Users className="w-4 h-4" /> {plan.basicInfo?.travelers || 2} 人</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  // --- 元件：結果顯示 ---
  const renderResult = () => {
    if (!itineraryData) return null;
    const currentDay = itineraryData.days[activeTab];
    const isSaved = isCurrentPlanSaved();

    return (
      <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                {basicData.destinations} 旅程表
                {basicData.hasTransitTour && <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">含轉機觀光</span>}
              </h2>
              <p className="text-slate-500 mt-2 max-w-2xl">{itineraryData.trip_summary}</p>
            </div>
            <div className="flex flex-col items-end gap-2">
              <button 
                onClick={saveCurrentPlan}
                className={`p-3 rounded-full transition-all ${isSaved ? 'bg-red-50 text-red-500' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}
                title={isSaved ? "取消儲存" : "儲存此規劃"}
              >
                <Heart className={`w-6 h-6 ${isSaved ? 'fill-current' : ''}`} />
              </button>
              <button onClick={() => setStep('input')} className="text-blue-500 underline text-sm hover:text-blue-700">
                重新規劃
              </button>
            </div>
          </div>
          <div className="flex gap-4 text-sm text-slate-500 border-t pt-4">
             <span className="flex items-center gap-1"><DollarSign className="w-4 h-4" /> {itineraryData.currency_rate}</span>
             <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> {basicData.dates}</span>
          </div>
        </div>

        <div className="flex overflow-x-auto pb-2 gap-2 scrollbar-hide">
          {itineraryData.days.map((day, index) => (
            <button
              key={index}
              onClick={() => setActiveTab(index)}
              className={`flex-shrink-0 px-6 py-3 rounded-xl font-medium transition-all duration-300 border ${
                activeTab === index 
                  ? 'bg-blue-600 text-white shadow-lg border-blue-600 transform scale-105' 
                  : 'bg-white text-slate-600 hover:bg-slate-50 border-slate-200'
              }`}
            >
              <div className="text-xs opacity-80">Day {day.day_index}</div>
              <div className="text-sm font-bold">{day.date.slice(5)} {day.city}</div>
            </button>
          ))}
        </div>

        <div className="bg-white rounded-2xl shadow-xl min-h-[500px] overflow-hidden">
          <div className="bg-slate-800 text-white p-6">
            <h3 className="text-3xl font-bold">{currentDay.city}</h3>
            <p className="text-blue-200 text-lg mt-1">{currentDay.title}</p>
          </div>

          <div className="p-6 relative">
            <div className="absolute left-[39px] top-8 bottom-8 w-0.5 bg-slate-200"></div>
            <div className="space-y-8">
              {currentDay.timeline.map((item, idx) => (
                <div key={idx} className="relative flex gap-6 group">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 z-10 border-4 border-white shadow-md ${
                      item.type === 'flight' ? 'bg-indigo-500 text-white' : 
                      item.type === 'meal' ? 'bg-orange-500 text-white' :
                      item.type === 'transport' ? 'bg-slate-500 text-white' :
                      item.type === 'activity' ? 'bg-pink-500 text-white' :
                      'bg-blue-500 text-white'
                  }`}>
                    {item.type === 'flight' && <Plane className="w-5 h-5" />}
                    {item.type === 'transport' && <Train className="w-5 h-5" />}
                    {item.type === 'meal' && <Utensils className="w-5 h-5" />}
                    {item.type === 'hotel' && <Hotel className="w-5 h-5" />}
                    {item.type === 'activity' && <BookOpen className="w-5 h-5" />}
                  </div>

                  <div className="flex-1 bg-white border border-slate-100 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <span className="inline-block bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-xs font-bold mb-1">{item.time}</span>
                        <h4 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                          {item.title}
                          {item.price_level && <span className="text-xs font-normal text-slate-400 border px-1 rounded">{item.price_level === 'High' ? '$$$' : item.price_level === 'Mid' ? '$$' : '$'}</span>}
                        </h4>
                      </div>
                      <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(item.location_query || item.title)}`} target="_blank" rel="noreferrer" className="text-blue-500 hover:bg-blue-50 p-2 rounded-full" title="開啟地圖"><Map className="w-5 h-5" /></a>
                    </div>
                    
                    <p className="text-slate-600 text-sm leading-relaxed mb-3 whitespace-pre-line">{item.description}</p>

                    {item.transport_detail && <div className="bg-slate-50 p-3 rounded-lg mb-3 flex items-start gap-3"><Train className="w-4 h-4 text-slate-500 mt-0.5" /><div className="text-sm text-slate-600"><span className="font-bold text-slate-700">交通：</span>{item.transport_detail}</div></div>}
                    
                    {item.warnings_tips && <div className="bg-amber-50 border-l-4 border-amber-400 p-3 rounded-r-lg mb-3 flex items-start gap-3"><AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5" /><div className="text-sm text-amber-800"><span className="font-bold">Tips：</span>{item.warnings_tips}</div></div>}

                    {item.menu_recommendations && (
                      <div className="mt-4 border-t border-slate-100 pt-3">
                        <h5 className="text-sm font-bold text-orange-600 mb-2 flex items-center gap-2"><Globe className="w-4 h-4" /> 點餐翻譯</h5>
                        <div className="bg-orange-50 rounded-lg overflow-hidden border border-orange-100">
                          <table className="w-full text-sm text-left">
                            <thead className="bg-orange-100 text-orange-800"><tr><th className="p-2 pl-3">菜名</th><th className="p-2">中文</th><th className="p-2">價格</th></tr></thead>
                            <tbody className="divide-y divide-orange-100 text-slate-700">
                              {item.menu_recommendations.map((menu, mIdx) => (
                                <tr key={mIdx}><td className="p-2 pl-3 font-medium">{menu.local}</td><td className="p-2">{menu.cn}</td><td className="p-2 text-slate-500">{menu.price}</td></tr>
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
    <div className="min-h-screen bg-slate-100 p-4 md:p-8 font-sans">
      {step === 'input' && renderInputForm()}
      {step === 'loading' && renderLoading()}
      {step === 'result' && renderResult()}
      {step === 'saved_list' && renderSavedList()}
    </div>
  );
};

export default TravelPlannerApp;