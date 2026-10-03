import React, { useState, useEffect, useLayoutEffect, useRef, useMemo } from 'react';
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
  ExternalLink, MessageCircle, Gift, 
  CheckCircle2, Image as ImageIcon, ChefHat, Edit3, RefreshCw,
  Palmtree, Fish, Bird, CarFront, Tent,Cloud, Pin, PlusCircle, Clock, Sun
} from 'lucide-react';

// 【注意】在本地開發時，請取消下一行的註解以載入樣式
import './index.css'; 

// 跟隨系統外觀，也讓未加上 dark: 的舊卡片與 Portal 彈窗使用同一套色彩。
const travelDarkRule = (property, classes, value) => `${classes.map(name => `html[data-travel-theme="dark"] [class~="${name}"]`).join(',')} { ${property}: ${value}; }`;
const TRAVEL_THEME_CSS = `
  :root { color-scheme: light; }
  body { margin: 0; }
  .travel-shell { color: #24364c; background: radial-gradient(ellipse at 8% 0%, #dbeefe 0%, transparent 42%), radial-gradient(ellipse at 100% 32%, #fce5ee 0%, transparent 44%), linear-gradient(145deg, #f0f7ff, #fffaf4); }
  .travel-header, .travel-panel { transition: background-color .25s, border-color .25s, box-shadow .25s; }
  .travel-share-content { min-height: 18rem; height: min(48vh, 30rem); line-height: 1.8; resize: none; }
  .travel-share-overlay { background: rgb(8 18 35 / .58); backdrop-filter: blur(8px); }
  .travel-icon-input { padding-inline-start: 3rem; }
  .travel-expense-amount { padding-inline-start: 2.5rem; padding-inline-end: 7rem; }
  html[data-travel-theme="dark"] { color-scheme: dark; background: #081321; color: #e8f1ff; }
  html[data-travel-theme="dark"] .travel-shell { color: #e8f1ff; background: radial-gradient(ellipse at 8% 0%, rgb(41 108 163 / .28), transparent 44%), radial-gradient(ellipse at 96% 36%, rgb(46 129 132 / .14), transparent 42%), linear-gradient(145deg, #081321, #101e32 58%, #081623); }
  html[data-travel-theme="dark"] .travel-header { background: linear-gradient(125deg, rgb(24 45 70 / .9), rgb(15 34 49 / .92)); border-color: #304963; box-shadow: 0 20px 64px rgb(0 0 0 / .24), inset 0 1px 0 rgb(170 214 255 / .06); }
  html[data-travel-theme="dark"] .travel-panel { background-color: rgb(19 36 57 / .94); border-color: #30435d; box-shadow: 0 24px 70px rgb(0 0 0 / .24); }
  html[data-travel-theme="dark"] .travel-share-overlay { background: rgb(1 8 17 / .76); }
  html[data-travel-theme="dark"] .travel-share-dialog { background: #13243a; border-color: #36516f; box-shadow: 0 30px 90px rgb(0 0 0 / .5); }
  html[data-travel-theme="dark"] .travel-share-content { background: #0b192b; color: #dce9fa; border-color: #314861; }
  html[data-travel-theme="dark"] :is(input, textarea, select):not([type="checkbox"]):not([type="radio"]) { color: #e3edfb; background-color: #0d1b2d; border-color: #314861; }
  html[data-travel-theme="dark"] :is(input, textarea)::placeholder { color: #91a5bf; }
  html[data-travel-theme="dark"] :is(input[type="checkbox"], input[type="radio"]) { accent-color: #79baff; }
  html[data-travel-theme="dark"] :is(button, input, textarea, select, summary, a):focus-visible { outline: 2px solid #81bfff; outline-offset: 3px; }
  html[data-travel-theme="dark"] :is(button, input, select):disabled { color: #9bacbf; }
  html[data-travel-theme="dark"] .travel-decoration { opacity: .07; }
  html[data-travel-theme="dark"] [class*="shadow"]:not(.travel-header):not(.travel-panel):not(.travel-share-dialog) { box-shadow: 0 8px 28px rgb(0 0 0 / .2); }
  ${travelDarkRule('background-color', ['bg-white', 'bg-[#fffef8]'], '#13243a')}
  ${travelDarkRule('background-color', ['bg-white/50', 'bg-white/60', 'bg-white/80', 'bg-white/90'], 'rgb(19 36 57 / .9)')}
  ${travelDarkRule('background-color', ['bg-slate-50', 'bg-slate-50/50', 'bg-slate-100', 'bg-slate-200'], '#0e1d30')}
  ${travelDarkRule('color', ['text-slate-700', 'text-slate-800', 'text-slate-900', 'text-gray-800'], '#e5efff')}
  ${travelDarkRule('color', ['text-slate-500', 'text-slate-600', 'text-gray-500', 'text-gray-600'], '#b2c4dc')}
  ${travelDarkRule('color', ['text-slate-300', 'text-slate-400', 'text-gray-400'], '#92a8c3')}
  ${travelDarkRule('border-color', ['border-white', 'border-white/50', 'border-slate-50', 'border-slate-100', 'border-slate-100/50', 'border-slate-200', 'border-slate-300'], '#30455f')}
  ${[['blue', '#112e4b', '#9ecfff'], ['sky', '#112e4b', '#9edbff'], ['indigo', '#202a48', '#bbc7ff'], ['purple', '#29243f', '#d2bcff'], ['orange', '#35281f', '#ffc89a'], ['amber', '#342e1f', '#f7d792'], ['yellow', '#342e1f', '#f7d792'], ['red', '#35232e', '#ffa9b8'], ['rose', '#35232e', '#ffbbd0'], ['emerald', '#12332f', '#97e4c9'], ['green', '#12332f', '#97e4c9'], ['teal', '#163138', '#9ae3df']].map(([color, background, text]) =>
    `${travelDarkRule('background-color', [50, 100, 200].flatMap(level => [`bg-${color}-${level}`, `bg-${color}-${level}/50`, `bg-${color}-${level}/80`]), background)}
     ${travelDarkRule('color', [500, 600, 700, 800, 900].map(level => `text-${color}-${level}`), text)}
     ${travelDarkRule('border-color', [50, 100, 200].map(level => `border-${color}-${level}`), background)}`).join('\n')}
  html[data-travel-theme="dark"] button[class~="bg-white"]:hover, html[data-travel-theme="dark"] button[class~="bg-slate-100"]:hover { background-color: #233d59; }
  .travel-day-header { background: linear-gradient(125deg, #e4f0fa, #e1f1ef); color: #24495f; border-bottom: 1px solid #d3e4ea; }
  .travel-day-header input.travel-day-input { background: transparent; border-color: transparent; box-shadow: none; color: #24495f; filter: none; }
  .travel-day-header .travel-day-subtitle, .travel-day-header input.travel-day-subtitle { color: #526c7f; }
  .travel-day-header input.travel-day-input::placeholder { color: #708797; }
  .travel-day-header input.travel-day-input:hover { border-bottom-color: #9eb9c7; }
  .travel-day-header input.travel-day-input:focus { border-bottom-color: #548a9e; }
  .travel-day-header .travel-day-badge { background: rgb(255 255 255 / .65); border: 1px solid rgb(110 150 167 / .15); box-shadow: none; backdrop-filter: none; color: #42687e; }
  .travel-day-header .travel-day-clothing { color: #426c63; }
  .travel-day-header .travel-day-refresh { color: #42687e; background: rgb(255 255 255 / .45); box-shadow: none; }
  .travel-day-header .travel-day-glow { opacity: .12; }
  .travel-day-header .travel-day-plane { color: #7296a5; opacity: .25; }
  html[data-travel-theme="dark"] .travel-day-header { background: linear-gradient(125deg, #1b344c, #1b3b40); color: #e0edf7; border-bottom-color: #304e60; }
  html[data-travel-theme="dark"] .travel-day-header input.travel-day-input { background: transparent; color: #e0edf7; border-color: transparent; box-shadow: none; }
  html[data-travel-theme="dark"] .travel-day-header .travel-day-subtitle, html[data-travel-theme="dark"] .travel-day-header input.travel-day-subtitle { color: #b8cdda; }
  html[data-travel-theme="dark"] .travel-day-header input.travel-day-input::placeholder { color: #8faab9; }
  html[data-travel-theme="dark"] .travel-day-header input.travel-day-input:hover { border-bottom-color: #527084; }
  html[data-travel-theme="dark"] .travel-day-header input.travel-day-input:focus { border-bottom-color: #82b8ca; }
  html[data-travel-theme="dark"] .travel-day-header .travel-day-badge { background: rgb(255 255 255 / .045); border-color: rgb(170 211 225 / .12); color: #bdd4e4; box-shadow: none; }
  html[data-travel-theme="dark"] .travel-day-header .travel-day-clothing { color: #bdd8cc; }
  html[data-travel-theme="dark"] .travel-day-header .travel-day-refresh { background: rgb(255 255 255 / .07); color: #bdd4e4; box-shadow: none; }
  html[data-travel-theme="dark"] .travel-day-header .travel-day-glow { opacity: .035; }
  html[data-travel-theme="dark"] .travel-day-header .travel-day-plane { color: #9ab9c8; opacity: .18; }
  @media (prefers-reduced-motion: reduce) { .travel-shell *, .travel-share-overlay { animation-duration: .01ms !important; transition-duration: .01ms !important; } }
  @media print { html[data-travel-theme="dark"], html[data-travel-theme="dark"] body, .travel-shell { color-scheme: light !important; background: white !important; color: #111 !important; } html[data-travel-theme="dark"] [class*="bg-"], html[data-travel-theme="dark"] .travel-panel { background: white !important; } html[data-travel-theme="dark"] [class*="text-"] { color: #111 !important; } .travel-share-overlay { display: none !important; } }
`;

const useAdaptiveTravelTheme = () => {
  useLayoutEffect(() => {
    const root = document.documentElement;
    const previousTheme = root.getAttribute('data-travel-theme');
    const previousScheme = root.style.colorScheme;
    const media = typeof window.matchMedia === 'function' ? window.matchMedia('(prefers-color-scheme: dark)') : null;
    const sync = () => {
      const theme = media?.matches ? 'dark' : 'light';
      root.setAttribute('data-travel-theme', theme);
      root.style.colorScheme = theme;
    };
    sync();
    if (media?.addEventListener) media.addEventListener('change', sync);
    else media?.addListener?.(sync);
    return () => {
      if (media?.removeEventListener) media.removeEventListener('change', sync);
      else media?.removeListener?.(sync);
      if (previousTheme === null) root.removeAttribute('data-travel-theme'); else root.setAttribute('data-travel-theme', previousTheme);
      root.style.colorScheme = previousScheme;
    };
  }, []);
};

// --- Gemini 模型集中管理：官方清單 + 自動更新 + 同系列停用備援 ---
// 不把固定版本寫進各項功能；models.list 是名稱與能力的資料來源。
const GEMINI_API_BASE = 'https://generativelanguage.googleapis.com/v1beta';
const GEMINI_MODEL_CONFIG = {
  pro: { alias: 'gemini-pro-latest', label: 'Gemini Pro' },
  flash: { alias: 'gemini-flash-latest', label: 'Gemini Flash' },
  lite: { alias: 'gemini-flash-lite-latest', label: 'Gemini Flash-Lite' },
};
const GEMINI_MODEL_CACHE_MS = 60 * 60 * 1000;
const GEMINI_TRIP_OUTPUT_TOKENS = 32768;
const GEMINI_OUTPUT_RECOVERY_CEILING = 65536;
const GEMINI_MAX_TRANSIENT_RETRIES = 3;
const GEMINI_FREE_MAX_TRANSIENT_RETRIES = 1;
const GEMINI_FREE_RETRY_DELAY_MS = 30000;
const GEMINI_FREE_DISCOVERY_WAIT_MS = 15000;
const GEMINI_FREE_MAX_HTTP_ATTEMPTS = 4;
const GEMINI_MODEL_PROFILE_MS = 24 * 60 * 60 * 1000;
const GEMINI_MAX_RETRY_WAIT_MS = 60000;
const GEMINI_BUSY_COOLDOWN_MS = 60000;
const GEMINI_FREE_PACING_KEY = 'gemini_free_request_pacing';
const geminiModelCache = new globalThis.Map();
const geminiModelListeners = new Set();
const geminiFreePacing = new globalThis.Map();
let geminiFreeQueue = Promise.resolve();
const normalizeGeminiKey = (apiKey) => String(apiKey || '').trim();
const normalizeGeminiType = (type) => Object.hasOwn(GEMINI_MODEL_CONFIG, type) ? type : 'flash';

function getGeminiCache(apiKey) {
  const key = normalizeGeminiKey(apiKey);
  if (!geminiModelCache.has(key)) {
    geminiModelCache.set(key, {
      models: [], updatedAt: 0, pending: null, error: null, retryAfter: 0,
      unavailable: new Set(), busyUntil: new globalThis.Map(), lastUsed: {},
      modelProfiles: new globalThis.Map(), profilePromise: null, profileStorageKey: '',
      policy: { mode: 'paid', allowBusyFallback: false }, queue: Promise.resolve(),
      requestStates: new globalThis.Map(),
    });
  }
  return geminiModelCache.get(key);
}

async function hydrateGeminiModelProfiles(key) {
  const cache = getGeminiCache(key);
  if (cache.profilePromise) return cache.profilePromise;
  cache.profilePromise = (async () => {
    // 只保存模型狀態；儲存索引用 SHA-256，不把 API Key 再寫進診斷資料。
    if (!globalThis.crypto?.subtle || typeof TextEncoder !== 'function') return;
    try {
      const digest = await globalThis.crypto.subtle.digest('SHA-256', new TextEncoder().encode(key));
      cache.profileStorageKey = `gemini_model_profiles_${Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, '0')).join('')}`;
      const saved = JSON.parse(globalThis.localStorage?.getItem(cache.profileStorageKey) || 'null');
      if (saved?.revision !== 1 || !Array.isArray(saved.models)) return;
      const now = Date.now();
      for (const [id, profile] of saved.models.slice(0, 100)) {
        if (!/^gemini-[a-z0-9.-]+$/.test(id) || !profile || typeof profile !== 'object') continue;
        const future = value => Number.isFinite(value) && value > now && value <= now + GEMINI_MODEL_PROFILE_MS ? value : 0;
        const succeeded = Number.isFinite(profile.succeededAt) && profile.succeededAt <= now && now - profile.succeededAt < GEMINI_MODEL_PROFILE_MS ? profile.succeededAt : 0;
        cache.modelProfiles.set(id, { unavailableUntil: future(profile.unavailableUntil),
          schemaStyle: profile.schemaStyle === 'plain' && future(profile.schemaUntil) ? 'plain' : 'legacy',
          schemaUntil: future(profile.schemaUntil), succeededAt: succeeded });
      }
    } catch { /* 非安全來源或儲存不可用時，仍保留當頁的模型狀態。 */ }
  })();
  return cache.profilePromise;
}

function saveGeminiModelProfiles(cache) {
  if (!cache.profileStorageKey) return;
  try { globalThis.localStorage?.setItem(cache.profileStorageKey, JSON.stringify({ revision: 1, models: [...cache.modelProfiles].slice(-100) })); }
  catch { /* 儲存空間不足時不影響已取得的結果。 */ }
}

function setGeminiModelProfile(cache, id, updates) {
  cache.modelProfiles.set(id, { ...cache.modelProfiles.get(id), ...updates });
  saveGeminiModelProfiles(cache);
}

function toGeminiResponseSchema(schema) {
  if (!schema || typeof schema !== 'object' || Array.isArray(schema)) throw new Error('JSON 回覆結構必須是物件。');
  const converted = {};
  const types = { object: 'OBJECT', array: 'ARRAY', string: 'STRING', integer: 'INTEGER', number: 'NUMBER', boolean: 'BOOLEAN' };
  if (!types[schema.type]) throw new Error(`JSON 回覆結構不支援類型 ${schema.type || '未指定'}。`);
  converted.type = types[schema.type];
  for (const name of ['description', 'format', 'minimum', 'maximum', 'nullable']) if (Object.hasOwn(schema, name)) converted[name] = schema[name];
  if (schema.enum) converted.enum = [...schema.enum];
  for (const name of ['minItems', 'maxItems', 'minLength', 'maxLength']) if (Object.hasOwn(schema, name)) converted[name] = String(schema[name]);
  if (schema.properties) {
    converted.properties = Object.fromEntries(Object.entries(schema.properties).map(([name, child]) => [name, toGeminiResponseSchema(child)]));
    converted.propertyOrdering = Object.keys(schema.properties);
  }
  if (schema.required) converted.required = [...schema.required];
  if (schema.items) converted.items = toGeminiResponseSchema(schema.items);
  // responseSchema 接受 OpenAPI 子集，不能直接放 JSON Schema 的 additionalProperties。
  return converted;
}

function getGeminiSchemaPayload(payload, style) {
  const original = payload.generationConfig;
  if (!original?.responseJsonSchema && !original?.responseSchema && original?.responseMimeType !== 'application/json') return payload;
  const schema = original.responseJsonSchema || original.responseSchema;
  if (style !== 'plain' && !schema) return payload;
  const generationConfig = { ...original };
  delete generationConfig.responseJsonSchema;
  delete generationConfig.responseSchema;
  if (style !== 'plain') {
    generationConfig.responseMimeType = 'application/json';
    generationConfig.responseSchema = original.responseJsonSchema ? toGeminiResponseSchema(schema) : schema;
    return { ...payload, generationConfig };
  }
  delete generationConfig.responseMimeType;
  const instruction = `Return ONLY valid JSON, without Markdown. ${schema
    ? `Preserve every required field in this output structure: ${JSON.stringify(schema)}`
    : 'Preserve all fields and output structures requested above.'}`;
  const contents = (payload.contents || []).map((content, index, all) => index === all.length - 1
    ? { ...content, parts: [...(content.parts || []), { text: instruction }] } : content);
  return { ...payload, contents, generationConfig };
}

function getGeminiParameterIssues(error) {
  return (Array.isArray(error.details) ? error.details : []).flatMap(detail =>
    Array.isArray(detail.fieldViolations) ? detail.fieldViolations : []).map(violation =>
      `${violation.field || '參數'}：${violation.description || '內容無效'}`).slice(0, 4);
}

function isGeminiSchemaCompatibilityError(error, body) {
  if (error.status !== 400 || !(body.generationConfig?.responseSchema || body.generationConfig?.responseMimeType === 'application/json')) return false;
  const issues = getGeminiParameterIssues(error);
  const schemaField = /response_?schema|response_?json_?schema|response_?mime_?type|additionalProperties|propertyOrdering/i;
  if (issues.length) return issues.every(issue => schemaField.test(issue));
  if (schemaField.test(error.message || '')) return true;
  // Google 有時只回 INVALID_ARGUMENT；有 schema 的請求最多改一次格式，不重送相同 body。
  return /^Request contains an invalid argument[.!]?$|^Invalid argument[.!]?$/i.test(error.message || '');
}

function notifyGeminiModels(key) {
  geminiModelListeners.forEach(listener => listener(key));
}

function setGeminiRequestPolicy(apiKey, mode, allowBusyFallback = true) {
  const key = normalizeGeminiKey(apiKey);
  if (!key) return;
  const cache = getGeminiCache(key);
  const policy = { mode: mode === 'paid' ? 'paid' : 'free', allowBusyFallback: Boolean(allowBusyFallback) };
  if (cache.policy.mode === policy.mode && cache.policy.allowBusyFallback === policy.allowBusyFallback) return;
  cache.policy = policy;
  notifyGeminiModels(key);
}

function setGeminiRequestState(key, requestId, message) {
  const states = getGeminiCache(key).requestStates;
  if (message) states.set(requestId, { message });
  else states.delete(requestId);
  notifyGeminiModels(key);
}

function getGeminiFreePacing(family) {
  if (!geminiFreePacing.has(family)) {
    let saved;
    try { saved = JSON.parse(globalThis.localStorage?.getItem(GEMINI_FREE_PACING_KEY) || '{}')?.[family]; } catch { /* 可在未開放儲存的瀏覽器中使用。 */ }
    const now = Date.now();
    const validTime = value => Number.isFinite(value) && value > 0 && value <= now + 24 * 60 * 60 * 1000 ? value : 0;
    geminiFreePacing.set(family, {
      lastStartedAt: validTime(saved?.lastStartedAt),
      intervalMs: Number.isFinite(saved?.intervalMs) ? Math.min(Math.max(saved.intervalMs, 0), 60000) : 0,
      notBefore: validTime(saved?.notBefore), pausedUntil: validTime(saved?.pausedUntil),
    });
  }
  return geminiFreePacing.get(family);
}

function saveGeminiFreePacing() {
  try {
    const saved = JSON.parse(globalThis.localStorage?.getItem(GEMINI_FREE_PACING_KEY) || '{}');
    globalThis.localStorage?.setItem(GEMINI_FREE_PACING_KEY, JSON.stringify({ ...saved, ...Object.fromEntries(geminiFreePacing) }));
  } catch { /* 儲存失敗時，當頁仍有請求限速。此處不儲存 API Key。 */ }
}

function getGeminiFreeInterval(model) {
  // 依目前專案截圖保守限速；清單沒有提供 RPM，未知版本／alias 採較慢策略。
  if (model.type !== 'lite' || !model.version?.length || model.stage === 'alias') return 15000;
  return model.version[0] === 3 ? 5000 : model.version[0] <= 2 ? 7000 : 15000;
}

function throwIfGeminiCancelled(signal) {
  if (signal?.aborted) throw Object.assign(new Error('已停止規劃，填寫資料已保留。'), { code: 'GEMINI_CANCELLED' });
}

async function waitForGeminiRequest(key, requestId, until, message, signal) {
  while (until > Date.now()) {
    throwIfGeminiCancelled(signal);
    const remaining = until - Date.now();
    setGeminiRequestState(key, requestId, `${message}，剩餘 ${Math.ceil(remaining / 1000)} 秒…`);
    await new Promise(resolve => setTimeout(resolve, Math.min(remaining, 1000)));
  }
  throwIfGeminiCancelled(signal);
}

async function paceGeminiAttempt(key, model, policy, requestId, signal) {
  throwIfGeminiCancelled(signal);
  if (policy.mode !== 'free') return;
  const pacing = getGeminiFreePacing(model.type);
  const now = Date.now();
  if (pacing.pausedUntil > now) {
    throw Object.assign(new Error('Gemini 忙碌冷卻中。'), {
      status: 503, code: 'GEMINI_BUSY_COOLDOWN', retryAfterMs: pacing.pausedUntil - now,
    });
  }
  const intervalMs = getGeminiFreeInterval(model);
  const catalogReadyAt = getGeminiCache(key).updatedAt;
  const discoveryUntil = catalogReadyAt ? catalogReadyAt + GEMINI_FREE_DISCOVERY_WAIT_MS : 0;
  const until = Math.max(pacing.lastStartedAt ? pacing.lastStartedAt + Math.max(pacing.intervalMs, intervalMs) : 0, pacing.notBefore, discoveryUntil);
  if (until - now > GEMINI_MAX_RETRY_WAIT_MS) {
    throw Object.assign(new Error('Gemini 要求更長的配額等待時間。'), { status: 429, retryAfterMs: until - now });
  }
  await waitForGeminiRequest(key, requestId, until, discoveryUntil > now
    ? `已取得模型清單，等待後使用 ${model.label || formatGeminiModel(model.id)}`
    : `${model.label || formatGeminiModel(model.id)} 免費請求限速`, signal);
  // 每次實際 HTTP 嘗試都記錄，包含重試、擴充輸出與備援，不能只限制外層功能。
  pacing.lastStartedAt = Date.now();
  pacing.intervalMs = intervalMs;
  saveGeminiFreePacing();
  setGeminiRequestState(key, requestId, `正在請求 ${model.label || formatGeminiModel(model.id)}，請稍候…`);
}

function parseGeminiRetryDelay(value) {
  if (value == null || value === '') return null;
  if (typeof value === 'object') {
    const milliseconds = Number(value.seconds || 0) * 1000 + Number(value.nanos || 0) / 1e6;
    return Number.isFinite(milliseconds) && milliseconds >= 0 ? milliseconds : null;
  }
  const duration = String(value).trim();
  if (/^\d+(?:\.\d+)?s?$/.test(duration)) return Number(duration.replace(/s$/, '')) * 1000;
  const date = Date.parse(duration);
  return Number.isFinite(date) ? Math.max(0, date - Date.now()) : null;
}

function getGeminiRetryInfo(error) {
  const details = Array.isArray(error.details) ? error.details : [];
  const violations = details.flatMap(detail => Array.isArray(detail.violations) ? detail.violations : []);
  const quotaText = [error.message, error.apiStatus, ...violations.map(violation =>
    `${violation.quotaMetric || ''} ${violation.quotaId || ''} ${violation.description || ''}`)].join(' ');
  const zeroQuota = violations.some(violation => violation.quotaValue != null && Number(violation.quotaValue) === 0)
    || /(?:limit|quota(?: value)?)\s*[:=]\s*0\b/i.test(quotaText);
  const dailyQuota = /per[_ -]?day|daily|quota_exceeded|每日|每天/i.test(quotaText);
  const delays = [error.retryAfterMs, ...details.filter(detail => /(?:^|\.)RetryInfo$/.test(detail['@type'] || ''))
    .map(detail => parseGeminiRetryDelay(detail.retryDelay))].filter(delay => Number.isFinite(delay) && delay >= 0);
  const serverDelayMs = delays.length ? Math.max(...delays) : null;
  if (error.status === 429) {
    if (zeroQuota) return { retryable: false, kind: 'no-quota', serverDelayMs };
    if (dailyQuota) return { retryable: false, kind: 'daily-quota', serverDelayMs };
    const shortWindow = serverDelayMs !== null || /per[_ -]?minute|per[_ -]?second|rate.?limit|too_many_requests|\b[RT]PM\b/i.test(quotaText);
    return { retryable: shortWindow, kind: 'rate-limit', serverDelayMs };
  }
  return { retryable: [408, 500, 502, 503, 504].includes(error.status), kind: 'busy', serverDelayMs };
}

function explainGeminiError(error) {
  if (['GEMINI_REQUEST_LIMIT', 'GEMINI_SESSION_LIMIT', 'GEMINI_CANCELLED'].includes(error.code)) return error;
  const info = getGeminiRetryInfo(error);
  let message;
  let code = error.code;
  if ([500, 502, 503].includes(error.status)) {
    message = `Gemini 服務目前忙碌，${error.code === 'GEMINI_BUSY_COOLDOWN' ? '已暫停送出請求。' : '有限次重試後仍無法完成。'}${info.serverDelayMs > 0 ? `請至少等待 ${Math.ceil(info.serverDelayMs / 1000)} 秒後再試，` : '請稍後再試，'}原本填寫的資料已保留。`;
    code = 'GEMINI_SERVICE_BUSY';
  } else if ([408, 504].includes(error.status)) {
    message = 'Gemini 服務回應逾時，有限次重試後仍無法完成。請稍後再試。';
  } else if (error.status === 429) {
    code = 'GEMINI_QUOTA_LIMIT';
    message = info.kind === 'no-quota'
      ? '這把 API Key 對此模型沒有可用配額（額度為 0）。請到 Google AI Studio 檢查模型與專案配額；重試不會增加額度。'
      : info.kind === 'daily-quota'
        ? 'Gemini 每日配額已用完。請等待 Google 專案配額重置，或到 Google AI Studio 查看配額與計費設定。'
        : `Gemini 的請求或 Token 配額已達限制。${info.serverDelayMs > 0 ? `請至少等待 ${Math.ceil(info.serverDelayMs / 1000)} 秒後再試，` : '請稍後再試，'}並到 Google AI Studio 查看實際配額。`;
  } else if (error.status === 401) {
    message = 'Gemini API Key 無效或已過期，請重新確認 API Key。';
  } else if (error.status === 403) {
    message = '這把 API Key 沒有使用此資源的權限，請檢查 Google 專案與 API Key 權限。';
  } else if (error.status === 402) {
    message = 'Gemini API 計費餘額不足，請到 Google AI Studio 檢查計費設定。';
  } else if ([400, 404].includes(error.status)) {
    const issues = getGeminiParameterIssues(error);
    message = `${error.modelId ? `${formatGeminiModel(error.modelId)} ` : 'Gemini '}請求失敗（HTTP ${error.status}）：${error.message}${issues.length ? ` 參數原因：${issues.join('；')}` : ''} 已保留填寫資料。`;
    code = error.status === 400 ? 'GEMINI_INVALID_REQUEST' : 'GEMINI_MODEL_UNAVAILABLE';
  }
  return message ? Object.assign(new Error(message, { cause: error }), error, { message, code }) : error;
}

async function fetchGeminiWithRetry(apiKey, model, body, requestId, policy, retryBudget) {
  const maxRetries = policy.mode === 'free' ? GEMINI_FREE_MAX_TRANSIENT_RETRIES : GEMINI_MAX_TRANSIENT_RETRIES;
  for (let retry = 0; retry <= maxRetries; retry++) {
    throwIfGeminiCancelled(retryBudget.signal);
    if (retryBudget.session && retryBudget.session.attempts >= retryBudget.session.maxAttempts) {
      throw Object.assign(new Error('這次規劃已達自動嘗試上限，已保留輸入與完成的行程。請查看顯示的原因再調整設定。'), {
        status: retryBudget.lastError?.status, code: 'GEMINI_SESSION_LIMIT',
      });
    }
    if (policy.mode === 'free' && retryBudget.attempts >= GEMINI_FREE_MAX_HTTP_ATTEMPTS) {
      throw Object.assign(new Error(`這次需求已嘗試 ${GEMINI_FREE_MAX_HTTP_ATTEMPTS} 次，先停止送出以避免快速消耗 RPM。${retryBudget.lastError?.message || '請稍後重試。'} 已保留填寫資料。`), {
        status: retryBudget.lastError?.status || 503, code: 'GEMINI_REQUEST_LIMIT', modelId: model.id,
      });
    }
    await paceGeminiAttempt(apiKey, model, policy, requestId, retryBudget.signal);
    try {
      retryBudget.attempts++;
      if (retryBudget.session) retryBudget.session.attempts++;
      return await fetchGeminiJson(`models/${encodeURIComponent(model.id)}:generateContent`, apiKey,
        { method: 'POST', body: JSON.stringify(body), signal: retryBudget.signal }, 180000);
    } catch (error) {
      error.modelId = model.id;
      retryBudget.lastError = error;
      const info = getGeminiRetryInfo(error);
      if (policy.mode === 'free' && info.serverDelayMs > 0) {
        const pacing = getGeminiFreePacing(model.type);
        pacing.notBefore = Math.max(pacing.notBefore, Date.now() + info.serverDelayMs);
        saveGeminiFreePacing();
      }
      if (!info.retryable || retry === maxRetries || policy.mode === 'free' && retryBudget.used >= maxRetries) throw error;
      const delayMs = Math.max(info.serverDelayMs || 0, policy.mode === 'free'
        ? GEMINI_FREE_RETRY_DELAY_MS : 1000 * (2 ** retry) + Math.floor(Math.random() * 500));
      // 過長的等待交由使用者稍後重試，不提早重送，也不無限佔住生成流程。
      if (delayMs > GEMINI_MAX_RETRY_WAIT_MS) throw error;
      const label = model.label || formatGeminiModel(model.id);
      const message = `${label} ${error.status === 429 ? '已達短時間配額' : '暫時忙碌'}`;
      if (policy.mode === 'free') {
        retryBudget.used++;
        const pacing = getGeminiFreePacing(model.type);
        pacing.notBefore = Math.max(pacing.notBefore, Date.now() + delayMs);
        saveGeminiFreePacing();
        await waitForGeminiRequest(apiKey, requestId, Date.now() + delayMs, `${message}，等待後自動重試（${retryBudget.used}/${maxRetries}）`, retryBudget.signal);
      } else {
        setGeminiRequestState(apiKey, requestId, `${message}，${Math.ceil(delayMs / 1000)} 秒後自動重試（${retry + 1}/${maxRetries}）。`);
        await new Promise(resolve => setTimeout(resolve, delayMs));
      }
      setGeminiRequestState(apiKey, requestId, `正在重試 ${label}，請稍候…`);
    }
  }
}

function formatGeminiModel(id, displayName) {
  const name = String(id || '').replace(/^models\//, '');
  const match = name.match(/^gemini-(\d+(?:\.\d+)*)-(flash-lite|flash|pro)(?:-|$)/i);
  const family = match?.[2] === 'flash-lite' ? 'Flash-Lite' : match?.[2] === 'pro' ? 'Pro' : 'Flash';
  const label = displayName || (match ? `Gemini ${match[1]} ${family}` :
    Object.values(GEMINI_MODEL_CONFIG).find(config => config.alias === name)?.label || name);
  return /-preview(?:-|$)/.test(name) && !/preview|預覽/i.test(label) ? `${label}（預覽版）` : label;
}

function parseGeminiModel(model) {
  if (!model?.supportedGenerationMethods?.includes('generateContent')) return null;
  const id = String(model.name || '').replace(/^models\//, '').toLowerCase();
  const aliasType = Object.keys(GEMINI_MODEL_CONFIG).find(type => GEMINI_MODEL_CONFIG[type].alias === id);
  if (aliasType) return { id, type: aliasType, version: [], stage: 'alias', revision: [], ...model, label: formatGeminiModel(id, model.displayName) };
  const match = id.match(/^gemini-(\d+(?:\.\d+)*)-(flash-lite|flash|pro)(.*)$/);
  // 正向比對一般文字模型，排除 TTS、image、live、embedding、customtools 等專用端點。
  if (!match || !/^(?:-(?:preview|latest))?(?:-\d+)*$/.test(match[3])) return null;
  const stage = match[3].includes('preview') ? 'preview' : match[3].includes('latest') ? 'alias' : 'stable';
  const revision = (match[3].match(/\d+/g) || []).map(Number);
  // 將 preview-MM-YYYY 的日期後綴轉為 YYYY-MM，避免用字串比較日期。
  if (revision.length === 2 && revision[0] <= 12 && revision[1] >= 2000) revision.reverse();
  return {
    ...model, id, type: match[2] === 'flash-lite' ? 'lite' : match[2],
    version: match[1].split('.').map(Number), stage, revision,
    label: formatGeminiModel(id, model.displayName),
  };
}

function compareGeminiModels(a, b) {
  // 數字比較讓 3.10 排在 3.9 前面；同世代優先正式版，再選較新的修訂。
  for (let i = 0; i < Math.max(a.version.length, b.version.length); i++) {
    const difference = (b.version[i] || 0) - (a.version[i] || 0);
    if (difference) return difference;
  }
  const stageRank = { stable: 0, preview: 1, alias: 2 };
  if (stageRank[a.stage] !== stageRank[b.stage]) return stageRank[a.stage] - stageRank[b.stage];
  for (let i = 0; i < Math.max(a.revision.length, b.revision.length); i++) {
    const difference = (b.revision[i] || 0) - (a.revision[i] || 0);
    if (difference) return difference;
  }
  return a.id.localeCompare(b.id);
}

function compareFreeGeminiModels(a, b) {
  const rank = { stable: 0, preview: 1, alias: 2 };
  if (a.stage !== b.stage) return rank[a.stage] - rank[b.stage];
  // 免費主規劃採目前可用世代中較早的正式 Flash，同版本仍優先最新修訂。
  // 版本號不代表價格、剩餘配額或即時負載；不猜已退役的模型名稱。
  if (a.type === 'flash' && b.type === 'flash') {
    for (let i = 0; i < Math.max(a.version.length, b.version.length); i++) {
      const difference = (a.version[i] || 0) - (b.version[i] || 0);
      if (difference) return difference;
    }
  }
  return compareGeminiModels(a, b);
}

const getGeminiRequestFamily = (type, policy) => policy.mode === 'free' && type !== 'lite'
  ? 'flash' : normalizeGeminiType(type);

function isGeminiModelWithoutQuota(error, model) {
  if (error.status !== 429 || getGeminiRetryInfo(error).kind !== 'no-quota') return false;
  const violations = (Array.isArray(error.details) ? error.details : [])
    .flatMap(detail => Array.isArray(detail.violations) ? detail.violations : []);
  const matchesModel = value => {
    const id = String(value || '').replace(/^models\//, '').toLowerCase().replace(/[.,;]+$/, '');
    if (id === model.id) return true;
    const reported = parseGeminiModel({ name: id, supportedGenerationMethods: ['generateContent'] });
    return reported?.type === model.type && (!model.version?.length || model.stage === 'alias'
      || Array.isArray(reported.version) && reported.version.join('.') === model.version.join('.'));
  };
  const zeroInMessage = /(?:limit|quota(?: value)?)\s*[:=]\s*0\b/i.test(error.message || '');
  // 只有明確指出「此模型」額度為 0 才排除它，專案、Key 或每日額度錯誤仍直接回報。
  return violations.some(violation => matchesModel(violation.quotaDimensions?.model)
    && (violation.quotaValue != null && Number(violation.quotaValue) === 0 || zeroInMessage))
    || zeroInMessage && matchesModel(String(error.message || '').match(/\bmodel\s*:\s*[`'"]?(gemini-[\w.-]+)/i)?.[1]);
}

async function fetchGeminiJson(path, apiKey, options = {}, timeoutMs = 20000) {
  const controller = new AbortController();
  const externalSignal = options.signal;
  throwIfGeminiCancelled(externalSignal);
  const cancel = () => controller.abort();
  externalSignal?.addEventListener('abort', cancel, { once: true });
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(`${GEMINI_API_BASE}/${path}`, {
      ...options,
      headers: { 'Content-Type': 'application/json', ...options.headers, 'x-goog-api-key': normalizeGeminiKey(apiKey) },
      signal: controller.signal,
    });
    const retryAfterMs = parseGeminiRetryDelay(response.headers?.get?.('Retry-After'));
    let data;
    try {
      data = await response.json();
    } catch {
      throw Object.assign(new Error(`Gemini 回傳無法解析的資料（HTTP ${response.status}）`), { status: response.status, retryAfterMs });
    }
    if (!data || typeof data !== 'object') {
      throw Object.assign(new Error(`Gemini 回傳的資料格式不正確（HTTP ${response.status}）`), { status: response.status, retryAfterMs });
    }
    if (!response.ok || data.error) {
      const apiCode = Number(data.error?.code);
      const status = apiCode >= 400 && apiCode <= 599 ? apiCode : response.status;
      const key = normalizeGeminiKey(apiKey);
      const redact = value => typeof value === 'string' && key ? value.replaceAll(key, '[API Key]') : value;
      const details = data.error?.details == null ? undefined
        : JSON.parse(JSON.stringify(data.error.details, (_name, value) => redact(value)));
      throw Object.assign(new Error(redact(data.error?.message) || `Gemini 請求失敗（HTTP ${status}）`), {
        status, apiStatus: data.error?.status || data.error?.code, details, retryAfterMs,
      });
    }
    return data;
  } catch (error) {
    throwIfGeminiCancelled(externalSignal);
    if (error.name === 'AbortError') throw new Error('Gemini 請求逾時，請稍後再試。');
    throw error;
  } finally {
    clearTimeout(timer);
    externalSignal?.removeEventListener('abort', cancel);
  }
}

async function loadGeminiModels(apiKey, force = false) {
  const key = normalizeGeminiKey(apiKey);
  if (!key) throw new Error('請先輸入 Gemini API Key。');
  const cache = getGeminiCache(key);
  await hydrateGeminiModelProfiles(key);
  if (cache.pending) return cache.pending;
  if (!force && cache.retryAfter > Date.now()) throw cache.error;
  if (!force && cache.updatedAt && Date.now() - cache.updatedAt < GEMINI_MODEL_CACHE_MS) return cache.models;
  cache.error = null;
  cache.pending = (async () => {
    try {
      const models = [];
      const seenPages = new Set();
      let pageToken = '';
      do {
        const params = new URLSearchParams({ pageSize: '1000' });
        if (pageToken) params.set('pageToken', pageToken);
        const data = await fetchGeminiJson(`models?${params}`, key);
        if (!Array.isArray(data.models)) throw new Error('Gemini 模型清單格式不正確。');
        models.push(...data.models.map(parseGeminiModel).filter(Boolean));
        pageToken = data.nextPageToken || '';
        if (pageToken && seenPages.has(pageToken)) throw new Error('Gemini 模型清單分頁重複，請稍後再試。');
        seenPages.add(pageToken);
      } while (pageToken);
      cache.models = [...new globalThis.Map(models.map(model => [model.id, model])).values()].sort(compareGeminiModels);
      cache.updatedAt = Date.now();
      cache.unavailable = new Set([...cache.unavailable].filter(id => cache.modelProfiles.get(id)?.unavailableUntil > Date.now()));
      cache.retryAfter = 0;
      return cache.models;
    } catch (error) {
      cache.error = error;
      cache.retryAfter = Date.now() + 60000;
      throw error;
    } finally {
      cache.pending = null;
      notifyGeminiModels(key);
    }
  })();
  notifyGeminiModels(key);
  return cache.pending;
}

function getGeminiCandidates(apiKey, type, policy = getGeminiCache(apiKey).policy) {
  const family = getGeminiRequestFamily(type, policy);
  const cache = getGeminiCache(apiKey);
  const families = family === 'lite' ? ['lite', 'flash'] : [family];
  const candidates = families.flatMap(candidateType => {
    const listed = cache.models.filter(model => model.type === candidateType);
    if (policy.mode === 'free' && cache.updatedAt && !listed.length) return [];
    // 先使用清單中的具體版本，首頁名稱與實際請求相同；清單失敗時使用官方 latest alias。
    const preferCurrent = policy.mode === 'free' && candidateType === 'flash'
      && listed.some(model => model.stage === 'stable' && model.version?.[0] >= 3);
    const concrete = listed.filter(model => model.stage !== 'alias').sort((a, b) => {
      if (preferCurrent) {
        const legacyDifference = Number(a.version[0] < 3) - Number(b.version[0] < 3);
        if (legacyDifference) return legacyDifference;
      }
      return policy.mode === 'free' ? compareFreeGeminiModels(a, b) : compareGeminiModels(a, b);
    });
    const aliases = listed.filter(model => model.stage === 'alias');
    return [...concrete, ...aliases, { id: GEMINI_MODEL_CONFIG[candidateType].alias, type: candidateType }];
  });
  const usable = [...new globalThis.Map(candidates.map(model => [model.id, model])).values()].filter(model =>
    !cache.unavailable.has(model.id) && !(cache.modelProfiles.get(model.id)?.unavailableUntil > Date.now()) && !(cache.busyUntil.get(model.id) > Date.now()));
  const candidatesByStatus = usable.filter(model => {
    if (model.version?.length && model.stage !== 'alias') return true;
    const knownVersions = cache.models.filter(version => version.type === model.type && version.stage !== 'alias');
    if (policy.mode === 'free' && knownVersions.length && knownVersions.every(version =>
      cache.unavailable.has(version.id) || cache.modelProfiles.get(version.id)?.unavailableUntil > Date.now() || cache.busyUntil.get(version.id) > Date.now())) return false;
    const hasBusyVersion = cache.models.some(version => version.type === model.type && version.stage !== 'alias'
      && cache.busyUntil.get(version.id) > Date.now());
    // 所有已知具體版本都在冷卻時，不用 latest 別名繞過剛才的忙碌等待。
    return !hasBusyVersion || usable.some(version => version.type === model.type && version.version?.length && version.stage !== 'alias');
  });
  if (policy.mode !== 'free') return candidatesByStatus;
  const verified = candidatesByStatus.filter(model => model.type === family && cache.modelProfiles.get(model.id)?.succeededAt > Date.now() - GEMINI_MODEL_PROFILE_MS)
    .sort((a, b) => cache.modelProfiles.get(b.id).succeededAt - cache.modelProfiles.get(a.id).succeededAt)[0];
  return verified ? [verified, ...candidatesByStatus.filter(model => model.id !== verified.id)] : candidatesByStatus;
}

function getGeminiText(data) {
  const candidate = data.candidates?.[0];
  if (candidate?.finishReason === 'MAX_TOKENS') {
    throw Object.assign(new Error('AI 回覆已達輸出上限，尚未取得完整內容。'), {
      code: 'GEMINI_OUTPUT_TRUNCATED', modelVersion: data.modelVersion,
    });
  }
  const text = candidate?.content?.parts?.filter(part => !part.thought && typeof part.text === 'string').map(part => part.text).join('');
  if (!text?.trim()) throw new Error(`AI 未傳回文字內容${data.promptFeedback?.blockReason ? `（${data.promptFeedback.blockReason}）` : ''}。`);
  return text;
}

async function requestGemini(apiKey, type, payload, requestOptions = {}) {
  const key = normalizeGeminiKey(apiKey);
  if (!key) throw new Error('請先輸入 Gemini API Key。');
  const cache = getGeminiCache(key);
  const policy = { ...cache.policy };
  const run = () => performGeminiRequest(key, type, payload, policy, requestOptions);
  // 同一頁的免費功能與不同 Key 共用佇列；換 Key 不能繞過同一專案的限速。
  if (policy.mode !== 'free') return run();
  const result = geminiFreeQueue.then(run, run);
  geminiFreeQueue = result.then(() => {}, () => {});
  cache.queue = geminiFreeQueue;
  return result;
}

async function performGeminiRequest(key, type, payload, policy, requestOptions = {}) {
  const family = getGeminiRequestFamily(type, policy);
  const requestId = Symbol('gemini-request');
  try {
    return await performGeminiModelRequest(key, family, payload, policy, requestId, requestOptions);
  } catch (error) {
    throw explainGeminiError(error);
  } finally {
    setGeminiRequestState(key, requestId, null);
  }
}

async function performGeminiModelRequest(key, family, payload, policy, requestId, requestOptions = {}) {
  throwIfGeminiCancelled(requestOptions.signal);
  const cache = getGeminiCache(key);
  if (policy.mode === 'free') {
    const remaining = getGeminiFreePacing(family).pausedUntil - Date.now();
    if (remaining > 0) throw Object.assign(new Error('Gemini 忙碌冷卻中。'), { status: 503, code: 'GEMINI_BUSY_COOLDOWN', retryAfterMs: remaining });
  }
  try {
    await loadGeminiModels(key);
  } catch (error) {
    if ([400, 401, 402, 403].includes(error.status)) throw error;
    if (policy.mode === 'free' && family === 'flash' && !cache.updatedAt) throw error;
    // 清單暫時無法讀取時，仍可嘗試快取中的模型或官方 alias。
  }
  const attempted = new Set();
  let refreshed = false;
  let lastError;
  let busyFallbacks = 0;
  let backupModel = null;
  throwIfGeminiCancelled(requestOptions.signal);
  const retryBudget = { used: 0, attempts: 0, lastError: null, schemaFallbackUsed: false, ...requestOptions };
  for (let attempt = 0; attempt < (policy.mode === 'free' ? 8 : 4); attempt++) {
    const model = backupModel || getGeminiCandidates(key, family, policy).find(candidate => !attempted.has(candidate.id));
    backupModel = null;
    if (!model) break;
    attempted.add(model.id);
    try {
      const profile = cache.modelProfiles.get(model.id);
      let schemaStyle = profile?.schemaStyle === 'plain' && profile.schemaUntil > Date.now() ? 'plain' : 'legacy';
      let modelPayload = getGeminiSchemaPayload(payload, schemaStyle);
      let generationConfig = modelPayload.generationConfig ? { ...modelPayload.generationConfig } : undefined;
      if (generationConfig?.maxOutputTokens && model.outputTokenLimit) {
        generationConfig.maxOutputTokens = Math.min(generationConfig.maxOutputTokens, model.outputTokenLimit);
      }
      let data;
      for (let lengthAttempt = 0; lengthAttempt < 2; lengthAttempt++) {
        let body = generationConfig ? { ...modelPayload, generationConfig } : modelPayload;
        try {
          data = await fetchGeminiWithRetry(key, model, body, requestId, policy, retryBudget);
        } catch (error) {
          if (schemaStyle === 'plain' || retryBudget.schemaFallbackUsed || !isGeminiSchemaCompatibilityError(error, body)) throw error;
          retryBudget.schemaFallbackUsed = true;
          schemaStyle = 'plain';
          setGeminiRequestState(key, requestId, `${model.label || formatGeminiModel(model.id)} 不接受 JSON 格式設定，改用一次相容請求…`);
          modelPayload = getGeminiSchemaPayload(payload, 'plain');
          generationConfig = { ...modelPayload.generationConfig, maxOutputTokens: generationConfig?.maxOutputTokens };
          if (!generationConfig.maxOutputTokens) delete generationConfig.maxOutputTokens;
          body = { ...modelPayload, generationConfig };
          data = await fetchGeminiWithRetry(key, model, body, requestId, policy, retryBudget);
        }
        try {
          getGeminiText(data); // 只接受完整回應，避免把半截 JSON 當成行程。
          break;
        } catch (error) {
          const currentLimit = generationConfig?.maxOutputTokens || 0;
          const ceiling = Math.min(model.outputTokenLimit || GEMINI_OUTPUT_RECOVERY_CEILING, GEMINI_OUTPUT_RECOVERY_CEILING);
          if (error.code === 'GEMINI_OUTPUT_TRUNCATED' && lengthAttempt === 0 && currentLimit > 0 && currentLimit < ceiling) {
            generationConfig.maxOutputTokens = Math.min(currentLimit * 2, ceiling);
            continue; // 只擴充一次；仍截斷時交由行程產生器拆小批次。
          }
          throw error;
        }
      }
      cache.lastUsed[family] = { id: data.modelVersion || model.id, label: formatGeminiModel(data.modelVersion || model.id), requested: model.id };
      cache.busyUntil.delete(model.id);
      cache.unavailable.delete(model.id);
      setGeminiModelProfile(cache, model.id, { unavailableUntil: 0, succeededAt: Date.now(), schemaStyle, schemaUntil: Date.now() + GEMINI_MODEL_PROFILE_MS });
      notifyGeminiModels(key);
      return data;
    } catch (error) {
      lastError = error;
      if (['GEMINI_REQUEST_LIMIT', 'GEMINI_SESSION_LIMIT', 'GEMINI_CANCELLED'].includes(error.code)) throw error;
      if (error.status === 503) {
        if (error.code === 'GEMINI_BUSY_COOLDOWN') throw error;
        const serverDelayMs = getGeminiRetryInfo(error).serverDelayMs || 0;
        cache.busyUntil.set(model.id, Date.now() + Math.max(GEMINI_BUSY_COOLDOWN_MS, serverDelayMs));
        // 持續忙碌時只允許一次同系列具體版本備援；不把 alias 當成不同模型重試。
        const alternatives = getGeminiCandidates(key, family, policy).filter(candidate =>
          candidate.version?.length && candidate.stage !== 'alias' && !attempted.has(candidate.id)
          && candidate.type === model.type);
        backupModel = alternatives.find(candidate => candidate.stage === 'stable') || alternatives[0];
        if (!policy.allowBusyFallback || busyFallbacks >= 1 || !backupModel
            || serverDelayMs > GEMINI_MAX_RETRY_WAIT_MS) {
          if (policy.mode === 'free') {
            const pacing = getGeminiFreePacing(model.type);
            pacing.pausedUntil = Date.now() + Math.max(GEMINI_BUSY_COOLDOWN_MS, serverDelayMs);
            saveGeminiFreePacing();
            error.retryAfterMs = Math.max(error.retryAfterMs || 0, GEMINI_BUSY_COOLDOWN_MS, serverDelayMs);
          }
          throw error;
        }
        busyFallbacks++;
        setGeminiRequestState(key, requestId, `${model.label || formatGeminiModel(model.id)} 持續忙碌，改用 ${backupModel.label || formatGeminiModel(backupModel.id)} 完成同一筆需求…`);
        continue;
      }
      const unavailable = error.status === 404
        || (error.status === 400 && /model.*(?:not found|not supported|does not support)|not supported for generateContent/i.test(error.message))
        || (error.status === 403 && error.message?.includes(model.id)
          && /model.*(?:not available|not enabled|not accessible)|(?:access to|permission to use) (?:this |the )?model/i.test(error.message));
      const noModelQuota = policy.mode === 'free' && isGeminiModelWithoutQuota(error, model);
      // 不重送同一個零配額模型；Key、專案、每日額度或格式錯誤仍立即回報。
      if (!unavailable && !noModelQuota) throw error;
      cache.unavailable.add(model.id);
      if (unavailable) setGeminiModelProfile(cache, model.id, { unavailableUntil: Date.now() + GEMINI_MODEL_PROFILE_MS, succeededAt: 0 });
      if (noModelQuota) cache.models.filter(candidate => candidate.stage !== 'alias'
        && isGeminiModelWithoutQuota(error, candidate)).forEach(candidate => cache.unavailable.add(candidate.id));
      if (unavailable && !refreshed) {
        refreshed = true;
        try { await loadGeminiModels(key, true); } catch (refreshError) {
          if ([400, 401, 402, 403].includes(refreshError.status)) throw refreshError;
        }
        attempted.forEach(id => cache.unavailable.add(id));
      }
      notifyGeminiModels(key);
    }
  }
  if (!lastError && [...cache.busyUntil.values()].some(until => until > Date.now())) {
    throw Object.assign(new Error('Gemini 模型仍在忙碌，請稍後重試。'), { status: 503 });
  }
  throw lastError || new Error(`目前找不到可用的 ${GEMINI_MODEL_CONFIG[family].label} 模型，請更新模型清單後再試。`);
}

function getGeminiSnapshot(apiKey) {
  const key = normalizeGeminiKey(apiKey);
  const cache = key ? geminiModelCache.get(key) : null;
  const labels = {};
  for (const type of Object.keys(GEMINI_MODEL_CONFIG)) {
    const candidates = cache ? getGeminiCandidates(key, type, { ...cache.policy, mode: 'paid' }) : [];
    const recommended = candidates.find(model => model.type === type && model.stage !== 'alias');
    labels[type] = recommended?.label || GEMINI_MODEL_CONFIG[type].label;
  }
  return {
    key, labels, lastUsed: { ...cache?.lastUsed }, updatedAt: cache?.updatedAt || 0,
    listedModels: cache ? cache.models.map(model => ({ id: model.id, label: model.label, type: model.type, stage: model.stage })) : [],
    freeModel: cache ? getGeminiCandidates(key, 'flash', { ...cache.policy, mode: 'free' })[0] || null : null,
    requestState: cache ? Array.from(cache.requestStates.values()).at(-1) || null : null,
    status: !key ? 'idle' : cache?.pending ? 'loading' : cache?.error ? 'error' : cache?.updatedAt ? 'ready' : 'loading',
    error: cache?.error?.message || '',
  };
}

function useGeminiModels(apiKey, usageMode, allowBusyFallback) {
  const key = normalizeGeminiKey(apiKey);
  const [snapshot, setSnapshot] = useState(() => getGeminiSnapshot(key));
  useEffect(() => {
    setGeminiRequestPolicy(key, usageMode, allowBusyFallback);
    setSnapshot(getGeminiSnapshot(key));
  }, [key, usageMode, allowBusyFallback]);
  useEffect(() => {
    let active = true;
    const update = (changedKey) => {
      if (active && changedKey === key) setSnapshot(getGeminiSnapshot(key));
    };
    geminiModelListeners.add(update);
    update(key);
    const load = () => { if (key) loadGeminiModels(key).catch(() => {}); };
    const timer = setTimeout(load, 700); // 等待貼上或輸入完成，避免每個字元都送一次請求。
    const interval = setInterval(load, GEMINI_MODEL_CACHE_MS);
    const onFocus = () => { if (!document.hidden) load(); };
    window.addEventListener('focus', onFocus);
    return () => {
      active = false;
      clearTimeout(timer);
      clearInterval(interval);
      window.removeEventListener('focus', onFocus);
      geminiModelListeners.delete(update);
    };
  }, [key]);
  const refresh = () => { if (key) loadGeminiModels(key, true).catch(() => {}); };
  return { ...(snapshot.key === key ? snapshot : getGeminiSnapshot(key)), refresh };
}


function mergeMenuData(results) {
  const categories = [];
  for (const result of results) {
    if (!Array.isArray(result?.categories)) throw new Error('菜單辨識資料格式不完整，請重新分析。');
    for (const category of result.categories) {
      if (typeof category.name !== 'string' || !Array.isArray(category.items)) throw new Error('菜單分類資料格式不完整。');
      const existing = categories.find(item => item.name === category.name);
      if (existing) existing.items.push(...category.items);
      else categories.push({ ...category, items: [...category.items] });
    }
  }
  return { categories };
}

// --- 自定義 Hook: 自動處理 localStorage 儲存與讀取 ---

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
const DeepDiveModal = ({ isOpen, onClose, data, isLoading, itemTitle, onRegenerate, requestMessage, error }) => {
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
      <div role="dialog" aria-modal="true" aria-labelledby="deep-dive-title" className="bg-white rounded-t-2xl md:rounded-3xl w-full h-[85vh] md:h-auto md:max-h-[85vh] md:max-w-2xl flex flex-col shadow-2xl overflow-hidden animate-in slide-in-from-bottom-10 duration-300 absolute bottom-0 md:relative md:bottom-auto">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-4 md:p-6 flex justify-between items-center shrink-0">
          <div className="text-white overflow-hidden">
            <div className="flex items-center gap-2 text-purple-200 text-xs md:text-sm font-bold mb-1">
              <Sparkles className="w-4 h-4" /> AI 深度導遊
            </div>
            <h3 id="deep-dive-title" className="text-lg md:text-2xl font-bold truncate pr-2">{itemTitle}</h3>
          </div>
          <button onClick={onClose} aria-label="關閉 AI 深度導覽" className="bg-white/20 hover:bg-white/30 text-white p-2 rounded-full transition-colors shrink-0">
            <X className="w-5 h-5 md:w-6 md:h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-slate-50 overscroll-contain">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-full space-y-4 text-slate-500">
              <Loader2 className="w-10 h-10 md:w-12 md:h-12 animate-spin text-purple-600" />
              <p role="status" aria-live="polite" className="font-medium text-sm md:text-base text-center">{requestMessage || '正在等待生成此景點的深度導覽，請稍候…'}</p>
              <p className="text-xs text-center">只針對此景點獨立請求；完成後會保留內容。關閉視窗可停止等待。</p>
            </div>
          ) : data ? (
            <div className="space-y-4 md:space-y-6 pb-4">
               {error && <p role="alert" className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">{error} 已保留上次的導覽內容。</p>}
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
              <p role={error ? 'alert' : undefined}>{error || '資料讀取失敗，請重試'}</p>
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
          {!isLoading && (data || error) && (
            <button 
              onClick={onRegenerate} 
              className="px-5 py-2.5 rounded-xl bg-purple-600 text-white font-bold hover:bg-purple-700 shadow-lg shadow-purple-200 transition-all flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" /> {data ? '重新生成' : '重試導覽'}
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
             className="travel-expense-amount w-full p-2 border rounded outline-none focus:border-emerald-500" 
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
const FunLoading = ({ destination, status, selectedInfo = [], onCancel }) => {
  const [startedAt] = useState(() => Date.now());
  const [elapsed, setElapsed] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setElapsed(Math.floor((Date.now() - startedAt) / 1000)), 1000);
    return () => clearInterval(timer);
  }, [startedAt]);
  return (
    <div className="flex flex-col items-center justify-center min-h-[75vh] px-4 animate-in fade-in duration-500">
      <div className="w-full max-w-lg space-y-5 text-center">
        <Plane className="w-14 h-14 mx-auto text-blue-600 animate-bounce" />
        <h2 className="text-xl md:text-2xl font-bold text-slate-700 dark:text-[#e8f1ff]">正在規劃 {destination || '你的旅程'}</h2>
        <div className="rounded-2xl border border-blue-200 dark:border-[#314861] bg-blue-50 dark:bg-[#0e1b2d] p-5 space-y-3" role="status" aria-live="polite">
          <Loader2 className="w-6 h-6 mx-auto animate-spin text-blue-600" />
          <p className="text-sm text-blue-800 dark:text-sky-200">{status?.message || '正在處理行程資料…'}</p>
          {status?.remainingSeconds > 0 && <p className="text-3xl font-bold tabular-nums text-blue-700 dark:text-sky-300">{status.remainingSeconds} 秒</p>}
          <p className="text-xs text-slate-500 dark:text-[#9bafc9]">已等待 {elapsed} 秒；請保持此頁開啟。結果完成後會自動顯示。</p>
        </div>
        {selectedInfo.length > 0 && <p className="text-xs text-slate-500 dark:text-[#9bafc9]">此次一併產生：{selectedInfo.join('、')}。資訊越多，通常需要較長時間。</p>}
        <button type="button" onClick={onCancel} className="rounded-xl border border-slate-300 dark:border-[#314861] px-5 py-2 text-sm text-slate-600 dark:text-[#c0cfe2] hover:bg-slate-100 dark:hover:bg-[#132338]">停止等待，保留資料</button>
      </div>
    </div>
  );
};
// --- City Guide ---
const ShareItineraryModal = ({ mode, text, onModeChange, onClose }) => {
  const dialogRef = useRef(null);
  const previewRef = useRef(null);
  const closeRef = useRef(null);
  const mounted = useRef(true);
  const copyVersion = useRef(0);
  const [copyState, setCopyState] = useState('idle');
  useEffect(() => {
    mounted.current = true;
    const previousFocus = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeRef.current?.focus();
    const onKeyDown = event => {
      if (event.key === 'Escape') { event.preventDefault(); onClose(); return; }
      if (event.key !== 'Tab') return;
      const controls = [...dialogRef.current.querySelectorAll('button:not(:disabled), textarea, [tabindex="0"]')];
      const first = controls[0], last = controls.at(-1);
      if (event.shiftKey && (document.activeElement === first || !dialogRef.current.contains(document.activeElement))) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && (document.activeElement === last || !dialogRef.current.contains(document.activeElement))) { event.preventDefault(); first?.focus(); }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => {
      mounted.current = false;
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', onKeyDown);
      if (previousFocus?.isConnected) previousFocus.focus();
    };
  }, []);
  useEffect(() => { copyVersion.current++; setCopyState('idle'); if (previewRef.current) previewRef.current.scrollTop = 0; }, [mode, text]);
  const copyPreview = async () => {
    if (copyState === 'copying') return;
    const version = ++copyVersion.current;
    setCopyState('copying');
    let copied = false;
    if (navigator.clipboard?.writeText && window.isSecureContext) {
      try { await navigator.clipboard.writeText(text); copied = true; } catch { /* 未取得權限時改用目前可見的文字。 */ }
    }
    if (!copied && mounted.current && version === copyVersion.current) {
      const preview = previewRef.current;
      try {
        preview?.focus(); preview?.select(); preview?.setSelectionRange(0, text.length);
        copied = typeof document.execCommand === 'function' && document.execCommand('copy');
      } catch { copied = false; }
    }
    if (mounted.current && version === copyVersion.current) setCopyState(copied ? 'copied' : 'error');
  };
  return createPortal(
    <div className="travel-share-overlay fixed inset-0 z-[10000] flex items-center justify-center p-3 md:p-6 print:hidden" onClick={event => { if (event.target === event.currentTarget) onClose(); }}>
      <div ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="share-preview-title" className="travel-share-dialog w-full max-w-2xl max-h-[90dvh] flex flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl">
        <div className="flex items-center justify-between gap-3 px-5 py-4 md:px-6 border-b border-slate-100">
          <div><h3 id="share-preview-title" className="text-lg font-bold text-slate-800">行程文字預覽</h3><p className="mt-1 text-xs text-slate-500">確認內容後，再複製分享給旅伴。</p></div>
          <button ref={closeRef} type="button" aria-label="關閉行程預覽" onClick={onClose} className="rounded-full p-2 text-slate-500 hover:bg-slate-100"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-4 md:p-6 flex-1 min-h-0 overflow-y-auto space-y-4">
          <div className="flex gap-2 rounded-xl bg-slate-100 p-1" role="group" aria-label="行程文字格式">
            {[['simple', '簡約內容'], ['detailed', '詳細內容']].map(([value, label]) => <button key={value} type="button" aria-pressed={mode === value} onClick={() => onModeChange(value)} className={`flex-1 rounded-lg px-4 py-2 text-sm font-bold transition-colors ${mode === value ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:bg-white'}`}>{label}</button>)}
          </div>
          <textarea ref={previewRef} aria-label={`${mode === 'simple' ? '簡約' : '詳細'}行程預覽`} readOnly value={text} className="travel-share-content w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700 outline-none font-mono" />
        </div>
        <div className="border-t border-slate-100 px-4 pb-4 pt-3 md:px-6 md:pb-5 space-y-3 shrink-0">
          {copyState === 'copied' && <p role="status" className="text-sm text-emerald-600 text-center">已複製行程到剪貼簿。</p>}
          {copyState === 'error' && <p role="alert" className="text-sm text-red-600">目前無法自動複製，已選取預覽文字；可使用 Ctrl／⌘ + C，或長按文字手動複製。</p>}
          <button type="button" onClick={copyPreview} disabled={copyState === 'copying'} className="w-full rounded-xl bg-blue-600 px-5 py-3 font-bold text-white hover:bg-blue-700 disabled:opacity-60 flex justify-center items-center gap-2">
            {copyState === 'copying' ? <Loader2 className="w-5 h-5 animate-spin" /> : copyState === 'copied' ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}複製行程到剪貼簿
          </button>
        </div>
      </div>
    </div>, document.body
  );
};

const CityGuide = ({ guideData, cities }) => {
  const [selectedCity, setSelectedCity] = useState(cities[0]);
  const [isOpen, setIsOpen] = useState(false);
  const currentGuide = guideData[selectedCity];
  

  if (!currentGuide) return null;


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


        </div>
      )}
    </div>
  );
};

// --- Day Timeline ---
const DayAdjustmentModal = ({ state, onClose, onInstructionChange, onSubmit, requestMessage }) => {
  const dialogRef = useRef(null);
  const inputRef = useRef(null);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;
  useEffect(() => {
    const previousFocus = document.activeElement;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    inputRef.current?.focus();
    const keyboard = event => {
      if (event.key === 'Escape') { event.preventDefault(); closeRef.current(); }
      if (event.key !== 'Tab') return;
      const controls = [...(dialogRef.current?.querySelectorAll('button:not(:disabled), textarea:not(:disabled), summary') || [])];
      const first = controls[0], last = controls.at(-1);
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
    };
    document.addEventListener('keydown', keyboard);
    return () => {
      document.body.style.overflow = overflow;
      document.removeEventListener('keydown', keyboard);
      if (previousFocus?.isConnected) previousFocus.focus();
    };
  }, []);
  return createPortal(
    <div className="travel-share-overlay fixed inset-0 z-[10000] flex items-center justify-center p-3 md:p-6 print:hidden" onClick={event => { if (event.target === event.currentTarget) onClose(); }}>
      <div ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="day-adjustment-title" className="travel-share-dialog w-full max-w-2xl max-h-[90dvh] flex flex-col rounded-3xl border border-slate-200 bg-white shadow-2xl overflow-hidden">
        <div className="px-5 py-4 md:px-6 border-b border-slate-100 flex items-center justify-between gap-3">
          <div><h3 id="day-adjustment-title" className="font-bold text-lg text-slate-800">單日調整 · 第 {state.snapshot.day_index} 天</h3><p className="text-xs text-slate-500 mt-1">{state.snapshot.date} · {state.snapshot.city}</p></div>
          <button type="button" onClick={onClose} aria-label="關閉單日調整" className="rounded-full p-2 text-slate-500 hover:bg-slate-100"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-5 md:p-6 flex-1 min-h-0 overflow-y-auto space-y-4">
          <p className="text-sm leading-relaxed text-slate-600">AI 會先讀取目前這一天的內容，再修改你指定的部分與必要的接駁時間。已訂交通、住宿與固定活動會保留。</p>
          <details className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600">
            <summary className="font-bold cursor-pointer">查看目前當日行程（{state.snapshot.timeline.length} 項）</summary>
            <ol className="mt-3 space-y-2">{state.snapshot.timeline.map((item, index) => <li key={index}><span className="font-mono mr-2">{item.time}</span>{item.title}</li>)}</ol>
          </details>
          <div>
            <label htmlFor="day-adjustment-request" className="block font-bold text-sm text-slate-700 mb-2">這一天想怎麼微調？</label>
            <textarea ref={inputRef} id="day-adjustment-request" value={state.instruction} onChange={event => onInstructionChange(event.target.value)} maxLength={2000} rows={5} disabled={state.processing} placeholder="例如：下午改逛秋葉原，晚餐延後到 20:00，上午行程維持原樣。" className="w-full resize-y rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-blue-400 disabled:opacity-60" />
            <p className="mt-1 text-xs text-slate-500">僅生成這一天的修改內容，其他天的行程保持原樣。</p>
          </div>
          {state.processing && <div role="status" aria-live="polite" className="rounded-xl bg-blue-50 p-3 text-sm text-blue-700 flex items-start gap-2"><Loader2 className="w-4 h-4 shrink-0 animate-spin mt-0.5" /><span>{requestMessage || '正在讀取目前行程並調整這一天…'}</span></div>}
          {state.error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{state.error}</p>}
          {state.summary && <p role="status" className="rounded-xl bg-emerald-50 p-3 text-sm text-emerald-700 whitespace-pre-wrap">{state.summary}</p>}
        </div>
        <div className="px-5 py-4 md:px-6 border-t border-slate-100 flex flex-wrap gap-3 justify-end shrink-0">
          <button type="button" onClick={onClose} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-50">{state.processing ? '停止等待，保留行程' : '關閉'}</button>
          <button type="button" onClick={onSubmit} disabled={state.processing || !state.instruction.trim()} className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"><Sparkles className="w-4 h-4" /> 重新生成這一天</button>
        </div>
      </div>
    </div>, document.body
  );
};

const DayTimeline = ({ day, dayIndex, expenses, setExpenses, travelers, currencySettings, isPrintMode = false, apiKey, geminiRequestMessage = '', updateItineraryItem, onSavePlan, onDeleteClick, onEditClick, onTimeUpdate, onAddClick, onUpdateDayInfo, onRefreshWeather, onIconClick, onAdjustDay }) => {
  const [editingExpense, setEditingExpense] = useState(null); 
  const [expenseToEdit, setExpenseToEdit] = useState(null); 
  const [activeNote, setActiveNote] = useState(null); 
  const [activeDeepDive, setActiveDeepDive] = useState(null);
  const [editingTimeId, setEditingTimeId] = useState(null);
  const [isRefreshingWeather, setIsRefreshingWeather] = useState(false);
  const deepDiveRequestRef = useRef(null);

  useEffect(() => {
    setActiveDeepDive(null);
    return () => {
      deepDiveRequestRef.current?.controller.abort();
      deepDiveRequestRef.current = null;
    };
  }, [apiKey, dayIndex, day.date]);

  const closeDeepDive = () => {
    deepDiveRequestRef.current?.controller.abort();
    deepDiveRequestRef.current = null;
    setActiveDeepDive(null);
  };

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

  // 2. 照片功能
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
  const handleNoteChange = (timelineIndex, text) => { updateItineraryItem(dayIndex, timelineIndex, { user_notes: text }); };
  const handleDeepDive = async (timelineIndex, item, regenerate = false) => {
    // 同一次點擊只建立一筆工作；重開已完成的景點直接讀取快取。
    if (deepDiveRequestRef.current) return;
    if (item.ai_details && !regenerate) {
      setActiveDeepDive({ timelineIndex, isLoading: false, data: item.ai_details, title: item.title });
      return;
    }
    if (!normalizeGeminiKey(apiKey)) return alert("需要 API Key 才能使用此功能");
    
    const request = { controller: new AbortController() };
    deepDiveRequestRef.current = request;
    setActiveDeepDive({ timelineIndex, isLoading: true, data: item.ai_details || null, title: item.title, error: '' });
    const freeMode = getGeminiCache(apiKey).policy.mode === 'free';
    
    // 按需導覽只送出單一景點，不附上整份行程、航班或住宿訂單。
    const prompt = `
      以繁體中文針對景點/地點: ${JSON.stringify(item.title)} (位於 ${JSON.stringify(day.city)}，地圖搜尋: ${JSON.stringify(item.location_query || item.title)}) 進行深度分析。
      請提供精簡、實用的在地導覽。僅推薦能確認的地點；不確定的店名、出口或營業資訊請明確標示需確認，不要編造。
      請以 JSON 格式回傳，不要有 Markdown 標記，純 JSON 字串。
      請務必回傳合法的 JSON 物件，不要有其他文字。
      包含以下欄位:
      1. "route_guide": 詳細步行或參觀路線建議 (100字以內)
      2. "must_visit_shops": 3間附近必去店舖或攤位 (名稱 + 特色)
      3. "safety_alert": 針對此地的具體治安或避雷提示
      4. "mini_map_desc": 文字描述周邊地圖重點 (例如: "出口X出來直走看到Y地標右轉")
      5. "walking_route": [
           "起點: 建議的最近車站出口或地標",
           "途經1: 沿途好逛或好拍的點",
           "途經2: (選填)",
           "終點: ${item.title}" 
         ]
    `;

    try {
      const data = await requestGemini(apiKey, 'lite', {
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: 'application/json', ...(freeMode ? { maxOutputTokens: 2048 } : {}) },
      }, { signal: request.controller.signal });
      
      const resultText = getGeminiText(data);
      if (!resultText) throw new Error("AI 無回應");
      
      const cleanedText = cleanJsonResult(resultText);
      const aiResult = JSON.parse(cleanedText);
      if (!aiResult || typeof aiResult !== 'object' || Array.isArray(aiResult)
          || ['route_guide', 'must_visit_shops', 'safety_alert', 'mini_map_desc'].some(field => !safeRender(aiResult[field]).trim())) {
        throw new Error('AI 導覽資料不完整，尚未覆蓋已儲存的內容。');
      }
      const route = Array.isArray(aiResult.walking_route)
        ? aiResult.walking_route.filter(point => typeof point === 'string' && point.trim()).slice(0, 5) : [];
      if (route.length) aiResult.walking_route = route;
      else delete aiResult.walking_route;
      if (deepDiveRequestRef.current !== request || request.controller.signal.aborted) return;
      
      updateItineraryItem(dayIndex, timelineIndex, { ai_details: aiResult });
      setActiveDeepDive({ timelineIndex, isLoading: false, data: aiResult, title: item.title });
    } catch (error) {
      if (deepDiveRequestRef.current !== request || request.controller.signal.aborted) return;
      console.error(error);
      setActiveDeepDive({ timelineIndex, isLoading: false, data: item.ai_details || null, title: item.title, error: `AI 導覽暫時無法完成：${error.message}` });
    } finally {
      if (deepDiveRequestRef.current === request) deepDiveRequestRef.current = null;
    }
  };

  const handleRegenerateDeepDive = () => {
    if (!activeDeepDive || activeDeepDive.isLoading) return;
    const item = day.timeline[activeDeepDive.timelineIndex];
    if (item) return handleDeepDive(activeDeepDive.timelineIndex, item, true);
  };
  const convertToHomeCurrency = (amount) => { if (!currencySettings.rate || currencySettings.rate === 0) return ''; const homeAmount = Math.round(amount * currencySettings.rate); return `(≈ NT$${homeAmount.toLocaleString()})`; };
  const handleWeatherClick = async () => { setIsRefreshingWeather(true); await onRefreshWeather(dayIndex, day.city, day.date); setIsRefreshingWeather(false); };
  const typeColors = { flight: 'bg-sky-100 text-sky-500 ring-sky-200', transport: 'bg-indigo-100 text-indigo-500 ring-indigo-200', meal: 'bg-orange-100 text-orange-500 ring-orange-200', hotel: 'bg-rose-100 text-rose-500 ring-rose-200', activity: 'bg-teal-100 text-teal-500 ring-teal-200', spot: 'bg-emerald-100 text-emerald-500 ring-emerald-200', shopping: 'bg-pink-100 text-pink-500 ring-pink-200', default: 'bg-slate-100 text-slate-500 ring-slate-200' };

  return (
    <div className={`bg-[#fffef8] dark:bg-[#14243a] rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.08)] min-h-[600px] overflow-hidden border-4 border-white dark:border-[#0e1b2d] relative ${isPrintMode ? 'shadow-none border-none bg-white min-h-0 overflow-visible mb-8 break-inside-avoid' : ''}`}>
      {!isPrintMode && (<><div className="absolute bottom-0 right-0 opacity-[0.07] dark:opacity-20 pointer-events-none text-amber-600 dark:text-amber-400"><Tent className="w-48 h-48 -rotate-12 translate-x-10 translate-y-10" /></div><div className="absolute top-1/2 left-0 opacity-[0.07] dark:opacity-20 pointer-events-none text-sky-600 dark:text-sky-400"><Cloud className="w-32 h-32 rotate-12 -translate-x-10" /></div></>)}
      <div className={`bg-gradient-to-r from-sky-400 via-cyan-400 to-teal-300 p-6 md:p-10 relative overflow-hidden ${isPrintMode ? 'bg-white text-black p-0 mb-4 border-b-2 border-slate-800 pb-2' : 'travel-day-header'}`}>
        {!isPrintMode && (<><div className="travel-day-glow absolute top-[-20%] right-[-10%] w-40 h-40 bg-white opacity-20 rounded-full blur-2xl"></div><div className="travel-day-glow absolute bottom-[-20%] left-[-10%] w-60 h-60 bg-teal-200 opacity-20 rounded-full blur-3xl"></div><div className="travel-day-plane absolute top-4 right-4 text-white opacity-50"><Plane className="w-8 h-8 rotate-45" /></div></>)}
        <div className="relative z-10">
          <div className="flex flex-wrap items-start gap-3 justify-between">
            <div className="min-w-0 flex-1 basis-64">
           <div className="flex items-end gap-2 mb-2">{isPrintMode ? (<h3 className="text-4xl font-extrabold text-black"><span className="text-xl block text-slate-500 mb-1">Day {day.day_index}</span>{day.city}</h3>) : (<input value={day.city} onChange={(e) => onUpdateDayInfo(dayIndex, { city: e.target.value })} className="travel-day-input bg-transparent text-3xl md:text-5xl font-extrabold text-white border-b-2 border-transparent hover:border-white/50 focus:border-white focus:outline-none w-full min-w-0 transition-colors placeholder-white/70 drop-shadow-sm" placeholder="輸入城市名稱" />)}</div>
           <div className={`flex items-center gap-2 text-sky-100 text-base md:text-xl font-medium ${isPrintMode ? 'text-slate-700' : 'travel-day-subtitle'}`}><Sparkles className={`w-5 h-5 flex-shrink-0 ${isPrintMode ? 'hidden' : ''}`} /> {isPrintMode ? <span>{day.title}</span> : (<input value={day.title} onChange={(e) => onUpdateDayInfo(dayIndex, { title: e.target.value })} className="travel-day-input travel-day-subtitle bg-transparent border-b border-transparent hover:border-sky-200/50 focus:border-sky-100 focus:outline-none w-full min-w-0 transition-colors placeholder-sky-100/70" placeholder="輸入行程主題" />)}</div>
            </div>
            {!isPrintMode && onAdjustDay && <button type="button" onClick={() => onAdjustDay(dayIndex)} aria-label={`單日調整：第 ${day.day_index} 天`} className="travel-day-refresh shrink-0 rounded-xl border border-slate-200/60 px-3 py-2 text-sm font-bold flex items-center gap-2 hover:opacity-80 transition-opacity"><Edit3 className="w-4 h-4" /> 單日調整</button>}
          </div>
           {day.planning_notes && <p className="travel-day-subtitle mt-3 text-xs">{day.planning_notes}</p>}
           {(day.weather_forecast || day.clothing_suggestion) && (<div className={`mt-4 flex flex-wrap gap-3 items-center ${isPrintMode ? 'text-sm mt-2' : 'text-sm md:text-base'}`}>{day.weather_forecast && (<div className={`flex items-center gap-2 bg-white/80 backdrop-blur-md px-3 py-1.5 rounded-full text-sky-600 font-medium shadow-sm ${isPrintMode ? 'bg-slate-100 border-slate-200 text-slate-800' : 'travel-day-badge'}`}><CloudSun className="w-4 h-4" /><span>{day.weather_forecast}</span></div>)}{day.clothing_suggestion && (<div className={`flex items-center gap-2 bg-white/80 backdrop-blur-md px-3 py-1.5 rounded-full text-orange-600 font-medium shadow-sm ${isPrintMode ? 'bg-slate-100 border-slate-200 text-slate-800' : 'travel-day-badge travel-day-clothing'}`}><Shirt className="w-4 h-4" /><span>{day.clothing_suggestion}</span></div>)}{!isPrintMode && (<button onClick={handleWeatherClick} disabled={isRefreshingWeather} className={`travel-day-refresh p-2 rounded-full bg-white/20 hover:bg-white/40 transition-all text-white ${isRefreshingWeather ? 'animate-spin' : 'hover:rotate-180'}`} title="重新預測天氣"><RefreshCw className="w-5 h-5" /></button>)}</div>)}
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
                  <div onClick={() => !isPrintMode && onIconClick(dayIndex, timelineIndex)} className={`w-12 h-12 md:w-16 md:h-16 rounded-full flex items-center justify-center shrink-0 z-10 border-[5px] border-[#fffef8] shadow-md transition-all group-hover:scale-110 cursor-pointer hover:shadow-lg ring-4 ${colorClass.split(' ')[2]} ${isPrintMode ? 'hidden' : colorClass}`} title="點擊更換圖示">
                    {item.type === 'flight' && <Plane className="w-6 h-6 md:w-7 md:h-7" />}{item.type === 'transport' && <Train className="w-6 h-6 md:w-7 md:h-7" />}{item.type === 'meal' && <Utensils className="w-6 h-6 md:w-7 md:h-7" />}{item.type === 'hotel' && <Hotel className="w-6 h-6 md:w-7 md:h-7" />}{item.type === 'activity' && <BookOpen className="w-6 h-6 md:w-7 md:h-7" />}{item.type === 'shopping' && <Wallet className="w-6 h-6 md:w-7 md:h-7" />}{(item.type === 'spot' || !['flight','transport','meal','hotel','activity','shopping'].includes(item.type)) && <MapPin className="w-6 h-6 md:w-7 md:h-7" />}
                  </div>

                  <div className={`min-w-0 flex-1 bg-white rounded-[2rem] p-5 md:p-7 shadow-[0_4px_20px_rgb(0,0,0,0.06)] hover:shadow-[0_8px_25px_rgb(0,0,0,0.1)] transition-all duration-300 transform relative group border-2 border-slate-50 ${isPrintMode ? 'shadow-none border-l-4 border-slate-300 rounded-none pl-4 border-t-0 border-r-0 border-b-0 hover:transform-none' : ''}`}>
                    <div className="flex flex-wrap justify-between items-start mb-3 md:mb-4 gap-3 md:gap-4">
                      <div className="min-w-0 flex-1 basis-64 break-words">
                        {editingTimeId === timelineIndex && !isPrintMode ? (<input type="time" defaultValue={item.time} autoFocus onBlur={(e) => { onTimeUpdate(dayIndex, timelineIndex, e.target.value); setEditingTimeId(null); }} onKeyDown={(e) => { if(e.key === 'Enter') { onTimeUpdate(dayIndex, timelineIndex, e.currentTarget.value); setEditingTimeId(null); } }} className="bg-sky-50 text-sky-700 px-3 py-1 rounded-full text-sm font-bold border-2 border-sky-200 outline-none mb-2 font-mono" />) : (<div onClick={() => !isPrintMode && setEditingTimeId(timelineIndex)} className={`inline-flex items-center gap-2 bg-sky-50 text-sky-700 px-3 py-1 rounded-full text-xs md:text-sm font-bold mb-2 cursor-pointer hover:bg-sky-100 transition-colors ${isPrintMode ? 'bg-transparent p-0 text-black pl-0' : ''}`} title="點擊修改時間"><Clock className={`w-3.5 h-3.5 ${isPrintMode ? 'hidden' : ''}`} />{item.time_estimated && item.time !== '待確認' ? '約 ' : ''}{item.time}</div>)}
                        <h4 className="font-bold text-xl md:text-2xl text-slate-700 flex flex-wrap items-center gap-2">{item.title}{item.price_level && <span className={`text-[10px] md:text-xs px-2 py-1 rounded-full font-bold ${isPrintMode ? 'border-black text-black border' : item.price_level === 'High' ? 'bg-rose-100 text-rose-600' : item.price_level === 'Mid' ? 'bg-amber-100 text-amber-600' : 'bg-green-100 text-green-600'}`}>{item.price_level === 'High' ? '$$$' : item.price_level === 'Mid' ? '$$' : '$'}</span>}</h4>
                      </div>
                      <div role="toolbar" aria-label={`${item.title}的功能`} className={`travel-card-toolbar max-w-full flex flex-wrap shrink-0 items-center gap-1 ${isPrintMode ? 'hidden' : ''}`}>
                         <a aria-label={`地圖：${item.title}`} href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(item.location_query || item.title)}`} target="_blank" rel="noreferrer" className="p-2.5 rounded-full hover:bg-sky-100 text-sky-400 hover:text-sky-600 transition-colors"><Map className="w-5 h-5" /></a>
                         <button aria-label={`筆記：${item.title}`} onClick={() => setActiveNote(activeNote === timelineIndex ? null : timelineIndex)} className={`p-2.5 rounded-full transition-colors ${item.user_notes ? 'bg-amber-100 text-amber-600' : 'text-amber-300 hover:bg-amber-50 hover:text-amber-500'}`}><FileText className="w-5 h-5" /></button>
                         
                         {/* ✅ 修改：加入照片按鈕 + 提示文字 */}
                         <label className="p-2.5 rounded-full hover:bg-rose-50 text-rose-300 hover:text-rose-500 cursor-pointer transition-colors relative group/cam">
                             <input type="file" accept="image/*" className="hidden" onChange={(e) => handlePhotoUpload(e, timelineIndex)} />
                             <Camera className="w-5 h-5" />
                             {/* 提示 Tooltip */}
                             <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover/cam:opacity-100 pointer-events-none transition-opacity">
                                iOS建議拍照
                             </span>
                         </label>

                         <button onClick={() => handleDeepDive(timelineIndex, item)} disabled={activeDeepDive?.isLoading} aria-label={`AI 深度導覽：${item.title}`} title={item.ai_details ? '查看已生成的 AI 深度導覽' : '點擊後獨立生成 AI 深度導覽'} className={`p-2.5 rounded-full transition-colors relative disabled:opacity-50 ${item.ai_details ? 'text-violet-600 bg-violet-100 ring-2 ring-violet-200' : 'text-violet-400 hover:bg-violet-50 hover:text-violet-600'}`}><Bot className="w-5 h-5" />{item.ai_details && <span className="absolute -top-1 -right-1 w-3 h-3 bg-violet-500 rounded-full border-2 border-white"></span>}</button>
                         <div className="flex items-center gap-1 ml-1 pl-1 border-l border-slate-200 print:hidden">
                           <button aria-label={`編輯：${item.title}`} onClick={(e) => { e.stopPropagation(); onEditClick(dayIndex, timelineIndex, item.title, day.city); }} className="p-2.5 text-slate-400 hover:text-sky-500 hover:bg-sky-50 rounded-full transition-colors" title="編輯"><Edit3 className="w-4 h-4" /></button>
                           <button aria-label={`刪除：${item.title}`} onClick={(e) => { e.stopPropagation(); onDeleteClick(dayIndex, timelineIndex); }} className="p-2.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-full transition-colors" title="刪除"><Trash2 className="w-4 h-4" /></button>
                         </div>
                      </div>
                    </div>
                    <div className={`text-slate-600 text-sm md:text-base leading-relaxed mb-4 md:mb-6 whitespace-pre-line pl-2 ${isPrintMode ? 'text-black pl-0' : ''}`}>{item.description}</div>
                    
                    {/* ... (AI 內容保持不變) ... */}
                    {isPrintMode && item.ai_details && (<div className="mt-2 mb-4 p-5 bg-violet-50 rounded-2xl border-2 border-violet-100 text-sm break-inside-avoid relative overflow-hidden"><div className="absolute top-0 right-0 text-violet-200 opacity-30"><Sparkles className="w-16 h-16" /></div><h5 className="font-bold text-violet-800 mb-3 flex items-center gap-2 border-b border-violet-200 pb-2 relative z-10"><Sparkles className="w-5 h-5" /> AI 深度導遊情報</h5><div className="space-y-2.5 text-slate-700 relative z-10"><div><span className="font-bold text-purple-700 bg-purple-100 px-1.5 py-0.5 rounded-md mr-1">📍 路線:</span> {safeRender(item.ai_details.route_guide)}</div><div><span className="font-bold text-orange-700 bg-orange-100 px-1.5 py-0.5 rounded-md mr-1">🍽️ 必訪:</span> {safeRender(item.ai_details.must_visit_shops)}</div><div><span className="font-bold text-red-700 bg-red-100 px-1.5 py-0.5 rounded-md mr-1">🛡️ 安全:</span> {safeRender(item.ai_details.safety_alert)}</div><div className="text-xs text-slate-500 pt-2 border-t border-violet-200"><span className="font-bold mr-1">🗺️ 地圖:</span> {safeRender(item.ai_details.mini_map_desc)}</div></div></div>)}
                    {(activeNote === timelineIndex || item.user_notes) && (<div className="mb-5 relative rotate-1 transition-transform hover:rotate-0"><div className="absolute -top-2 -left-2 text-yellow-400 opacity-50"><Pin className="w-5 h-5" /></div><textarea value={item.user_notes||''} onChange={(e)=>handleNoteChange(timelineIndex,e.target.value)} className="w-full p-4 bg-yellow-100/80 border-none rounded-xl text-sm outline-none resize-none shadow-sm text-yellow-800 placeholder-yellow-800/50 font-handwriting" rows="3" placeholder="寫點什麼紀錄一下..."/></div>)}
                    
                    {/* ✅ 照片牆 (已修改：永遠顯示紅色 X 按鈕，方便刪除) */}
                    {item.photos?.length > 0 && (
                      <div className="flex gap-3 overflow-x-auto pb-4 mb-2 pl-2">
                        {item.photos.map((photo, pIdx) => (
                           <div key={pIdx} className="relative shrink-0">
                              <img src={photo} className="h-28 w-28 object-cover rounded-md border border-slate-100 shadow-md rotate-1 hover:rotate-0 transition-all"/>
                              {/* 刪除按鈕：移除 group-hover，改為永遠顯示 */}
                              <button 
                                onClick={() => removePhoto(timelineIndex, pIdx)}
                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600 transition-colors z-10"
                              >
                                <X className="w-3 h-3" />
                              </button>
                           </div>
                        ))}
                      </div>
                    )}

                    {/* ... (交通、警示、翻譯保持不變) ... */}
                    {item.transport_detail && (<div className={`bg-indigo-50 p-4 rounded-2xl mb-3 flex items-start gap-3 border-2 border-indigo-100 ${isPrintMode ? 'bg-transparent border-slate-300' : ''}`}><div className={`bg-white p-2.5 rounded-full shadow-sm shrink-0 text-indigo-500 ${isPrintMode ? 'hidden' : ''}`}><Train className="w-5 h-5" /></div><div className="text-sm text-indigo-900 flex-1 pt-0.5"><span className="block font-bold mb-1">交通建議</span>{item.transport_detail}</div></div>)}
                    {item.warnings_tips && (<div className={`bg-amber-50 border-2 border-amber-100 p-4 rounded-2xl mb-3 flex items-start gap-3 ${isPrintMode ? 'bg-transparent border-black' : ''}`}><div className={`bg-white p-2.5 rounded-full shadow-sm shrink-0 text-amber-500 ${isPrintMode ? 'hidden' : ''}`}><AlertTriangle className="w-5 h-5" /></div><div className="text-sm text-amber-900 flex-1 pt-0.5"><span className="block font-bold mb-1">重要提醒 (Tips)</span>{item.warnings_tips}</div></div>)}
                    {item.menu_recommendations && item.menu_recommendations.length > 0 && (<div className={`mt-6 border-t-2 border-orange-100 pt-4 ${isPrintMode ? 'border-slate-300' : ''}`}><h5 className="text-sm font-bold text-orange-600 mb-3 flex items-center gap-2"><ChefHat className={`w-5 h-5 ${isPrintMode ? 'hidden' : ''}`} /> 點餐翻譯小幫手</h5><div className={`bg-orange-50/80 rounded-2xl overflow-hidden border-2 border-orange-100 overflow-x-auto shadow-sm ${isPrintMode ? 'bg-transparent border-slate-300' : ''}`}><table className="w-full text-sm text-left min-w-[300px]"><thead className={`bg-orange-200/50 text-orange-800 ${isPrintMode ? 'bg-slate-100 text-black' : ''}`}><tr><th className="p-3 pl-4 font-bold rounded-tl-2xl">當地菜名</th><th className="p-3 font-bold">中文</th><th className="p-3 font-bold rounded-tr-2xl">預估價格</th></tr></thead><tbody className={`divide-y divide-orange-100 text-slate-700 ${isPrintMode ? 'divide-slate-300' : ''}`}>{item.menu_recommendations.map((menu, mIdx) => (<tr key={mIdx} className={`hover:bg-orange-100/50 transition-colors ${isPrintMode ? 'hover:bg-transparent' : ''}`}><td className="p-3 pl-4 font-bold text-orange-700">{menu.local}</td><td className="p-3">{menu.cn}</td><td className="p-3 text-slate-500 font-mono">{menu.price}</td></tr>))}</tbody></table></div></div>)}

                    {!isPrintMode && (
                      <div className="mt-6 pt-4 border-t-2 border-emerald-100/50">
                          {/* ... (記帳功能保持不變) ... */}
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
        <DeepDiveModal 
           isOpen={activeDeepDive !== null}
           onClose={closeDeepDive}
           data={activeDeepDive?.data}
           isLoading={activeDeepDive?.isLoading}
           itemTitle={activeDeepDive?.title}
           onRegenerate={handleRegenerateDeepDive} 
           requestMessage={geminiRequestMessage}
           error={activeDeepDive?.error}
        />
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
  // 背景工作交由集中模型管理器選擇最新 Flash-Lite。
  const modelFamily = 'lite'; 
  
  console.log(`[AI Edit] 正在使用模型類型: ${modelFamily} 進行生成...`);

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
    const data = await requestGemini(apiKey, modelFamily, { contents: [{ parts: [{ text: prompt }] }], generationConfig: { responseMimeType: "application/json" } });

    const resultText = getGeminiText(data);
    if (!resultText) {
        throw new Error("AI 無法生成內容 (Empty Response)");
    }

    const cleanedText = cleanJsonResult(resultText); 
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

  // 處理圖片選擇 (針對 iOS 優化)
  const handleImageSelect = (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newFiles = Array.from(files);
    setSelectedImages(prev => [...prev, ...newFiles]);

    const newPreviews = newFiles.map(file => URL.createObjectURL(file));
    setImagePreviews(prev => [...prev, ...newPreviews]);
    
    // iOS 修正：延遲清空 value
    setTimeout(() => {
        if (e.target) {
            e.target.value = ''; 
        }
    }, 500); 
  };

  const handleAnalyzeMenu = async () => {
    if (selectedImages.length === 0) return alert("請先選擇菜單照片");
    if (!normalizeGeminiKey(apiKey)) return alert("請輸入 API Key");

    setIsAnalyzingMenu(true);
    try {
        const imageParts = await Promise.all(selectedImages.map(async (file) => ({
            inlineData: {
                data: await fileToBase64(file),
                mimeType: file.type || "image/jpeg"
            }
        })));

        const modelFamily = 'lite'; 

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
        
        const imagesPerBatch = imageParts.length;
        const results = [];
        for (let offset = 0; offset < imageParts.length; offset += imagesPerBatch) {
          const data = await requestGemini(apiKey, modelFamily, {
            contents: [{ parts: [{ text: prompt }, ...imageParts.slice(offset, offset + imagesPerBatch)] }],
            generationConfig: { responseMimeType: 'application/json', maxOutputTokens: 8192 },
          });
          results.push(JSON.parse(cleanJsonResult(getGeminiText(data))));
        }
        setMenuData(mergeMenuData(results));

    } catch (error) {
        console.error(error);
        alert("菜單分析失敗: " + error.message);
    } finally {
        setIsAnalyzingMenu(false);
    }
  };

  const handleRecommend = async () => {
    if (!menuData) return;
    if (!normalizeGeminiKey(apiKey)) return alert("請輸入 API Key");

    setIsRecommending(true);
    try {
        const prompt = `
           我有一份已整理好的菜單資料 (JSON): ${JSON.stringify(menuData)}
           我的需求如下:
           - 預算限制: ${budget ? budget + currencySymbol : '無限制'}
           - 特殊要求: ${requests || '無'}
           請擔任一位專業點餐顧問，推薦一套組合並說明理由。請直接用繁體中文回答。
           請適當分段，讓閱讀更舒適。
        `;

         const data = await requestGemini(apiKey, 'lite', { contents: [{ parts: [{ text: prompt }] }] });
          setRecommendation(getGeminiText(data));

    } catch (error) {
        alert("推薦失敗: " + error.message);
    } finally {
        setIsRecommending(false);
    }
  };
  
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-[2000] flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#14243a] rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl relative transition-colors duration-300">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500 to-red-500 p-4 flex justify-between items-center text-white shrink-0">
            <h3 className="font-bold text-lg flex items-center gap-2"><ChefHat/> AI 菜單翻譯助手</h3>
            <button onClick={onClose}><X /></button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-8">
            <div>
                <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-4 mb-2 overflow-x-auto pb-2 min-h-[100px]">
                        {imagePreviews.map((src, idx) => (
                            <div key={idx} className="relative shrink-0">
                                <img src={src} alt="preview" className="h-24 w-24 object-cover rounded-lg border-2 border-orange-200" />
                            </div>
                        ))}
                        
                        {/* 上傳按鈕 */}
                        <div className="h-24 w-24 flex flex-col items-center justify-center border-2 border-dashed border-slate-300 dark:border-[#314861] rounded-lg hover:bg-slate-50 dark:hover:bg-[#29405b] hover:border-orange-400 transition-colors shrink-0 relative">
                            <Camera className="w-6 h-6 text-slate-400 dark:text-[#9bafc9]" />
                            <span className="text-xs text-slate-500 dark:text-[#9bafc9] mt-1">加入照片</span>
                            <input 
                                type="file" 
                                accept="image/png, image/jpeg, image/jpg" 
                                multiple 
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-50"
                                onChange={handleImageSelect} 
                            />
                        </div>
                    </div>
                    <p className="text-[10px] text-red-500 dark:text-red-400 font-bold bg-red-50 dark:bg-red-900/20 p-2 rounded-lg text-center">
                        ⚠️ iOS 用戶請直接使用「拍照」功能，從圖庫選取可能會失敗。
                    </p>
                </div>

                <button 
                    onClick={handleAnalyzeMenu} 
                    disabled={isAnalyzingMenu || selectedImages.length === 0}
                    className="w-full py-3 bg-orange-500 hover:bg-orange-600 disabled:bg-slate-300 dark:disabled:bg-[#29405b] text-white rounded-xl font-bold flex justify-center items-center gap-2 transition-all shadow-md mt-4"
                >
                    {isAnalyzingMenu ? <Loader2 className="animate-spin"/> : <Sparkles />} 
                    {isAnalyzingMenu ? 'AI 正在努力看菜單...' : '開始翻譯與整理菜單'}
                </button>
            </div>

            {menuData && (
                <div className="space-y-6 animate-in slide-in-from-bottom-4">
                    {menuData.categories.map((cat, catIdx) => (
                        <div key={catIdx}>
                            <h4 className="font-bold text-orange-700 dark:text-orange-400 text-lg mb-2 pb-1 border-b border-orange-100 dark:border-orange-900/30">{cat.name}</h4>
                            <div className="space-y-3">
                                {cat.items.map((item, itemIdx) => (
                                    <div key={itemIdx} className="flex justify-between items-start bg-slate-50 dark:bg-[#0e1b2d] p-3 rounded-lg border border-transparent dark:border-[#29405b]">
                                        <div>
                                            <div className="font-bold text-slate-800 dark:text-[#e8f1ff]">{item.translated_name}</div>
                                            <div className="text-xs text-slate-500 dark:text-[#9bafc9]">{item.original_name}</div>
                                            {item.description && <div className="text-sm text-slate-600 dark:text-[#c0cfe2] mt-1">{item.description}</div>}
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

        {/* Footer */}
        {menuData && (
            <div className="p-4 bg-orange-50 dark:bg-[#0e1b2d] border-t border-orange-100 dark:border-[#29405b] shrink-0">
                <div className="flex flex-col gap-3">
                    {/* 輸入框 */}
                    <div className="flex gap-3">
                        <input 
                            type="number" 
                            placeholder={`預算 (例如: 2000${currencySymbol})`} 
                            value={budget} 
                            onChange={e=>setBudget(e.target.value)} 
                            className="w-1/3 p-3 border rounded-xl text-sm outline-none focus:border-orange-400 dark:bg-[#132338] dark:border-[#314861] dark:text-[#e8f1ff]" 
                        />
                        <input 
                            type="text" 
                            placeholder="特殊要求 (例如: 不吃牛、對蝦過敏)" 
                            value={requests} 
                            onChange={e=>setRequests(e.target.value)} 
                            className="w-2/3 p-3 border rounded-xl text-sm outline-none focus:border-orange-400 dark:bg-[#132338] dark:border-[#314861] dark:text-[#e8f1ff]" 
                        />
                    </div>

                    {/* 按鈕 */}
                    <button 
                        onClick={handleRecommend} 
                        disabled={isRecommending} 
                        className="w-full py-3 bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white rounded-xl font-bold flex justify-center items-center gap-2 disabled:opacity-50 transition-all shadow-md"
                    >
                        {isRecommending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />} 
                        {isRecommending ? 'AI 正在思考中...' : '✨ AI 幫我推薦組合'}
                    </button>
                </div>

                {recommendation && (
                    // ✅ 關鍵修正：
                    // 1. max-h-60 + overflow-y-auto: 限制高度並允許卷動
                    // 2. whitespace-pre-line: 讓 AI 的換行符號 (\n) 生效，文章不再擠成一團
                    <div className="mt-4 bg-white dark:bg-[#132338] p-4 rounded-xl border border-red-100 dark:border-red-900/30 shadow-sm text-slate-700 dark:text-[#c0cfe2] leading-relaxed animate-in fade-in max-h-60 overflow-y-auto whitespace-pre-line">
                        <h5 className="font-bold text-red-700 dark:text-red-400 mb-2 flex items-center gap-1 sticky top-0 bg-white dark:bg-[#132338] pb-2 border-b border-red-50 dark:border-red-900/10">💡 推薦結果：</h5>
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
  const modelFamily = 'lite'; 
  
  const prompt = `
    請查詢並預測 "${city}" 在日期 "${date}" 的天氣狀況。
    請回傳一個純 JSON 物件，包含以下兩個欄位 (繁體中文)：
    1. "weather_forecast": 簡短天氣敘述與氣溫 (例如: "🌤️ 多雲時晴 18°C-24°C，降雨機率 10%")
    2. "clothing_suggestion": 針對該氣溫的具體穿著建議 (例如: "早晚溫差大，建議洋蔥式穿搭，帶件薄外套")
    
    只需回傳 JSON，不要 Markdown。
  `;

  try {
    const data = await requestGemini(apiKey, modelFamily, { contents: [{ parts: [{ text: prompt }] }], generationConfig: { responseMimeType: "application/json" } });

    const resultText = getGeminiText(data);
    const cleanedText = cleanJsonResult(resultText); 
    return JSON.parse(cleanedText);

  } catch (error) {
    console.error("天氣更新失敗:", error);
    throw error;
  }
}


// --- 行程輸出恢復：保留欄位與天數，超長時拆分生成後再合併 ---
const bookingText = value => typeof value === 'string' ? value.trim() : '';
const isTripDate = value => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value || '')) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value;
};
const tripTimeMinutes = value => {
  const match = bookingText(value).match(/^(\d{2}):(\d{2})$/);
  if (!match || Number(match[2]) > 59 || Number(match[1]) > 24 || (Number(match[1]) === 24 && Number(match[2]) !== 0)) return null;
  return Number(match[1]) * 60 + Number(match[2]);
};
const tripTimeLabel = minutes => `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`;
const shiftTripDate = (date, offset) => {
  const value = new Date(`${date}T00:00:00Z`);
  value.setUTCDate(value.getUTCDate() + offset);
  return value.toISOString().slice(0, 10);
};

// 舊版 time / airport 僅作資料遷移；表單與生成皆使用相同的新欄位。
function normalizeTransportInput(value = {}) {
  value = value || {};
  return {
    ...value, mode: value.mode === 'train' ? 'train' : 'flight', role: value.role || 'auto',
    date: value.date || '', arrivalDate: value.arrivalDate || '',
    depTime: value.depTime || value.time || '', arrTime: value.arrTime || '',
    code: value.code || '', station: value.station || value.airport || '',
    departureStation: value.departureStation || '', arrivalStation: value.arrivalStation || '',
  };
}

function buildTripBookingContext({ basicData, simpleFlights, multiFlights, accommodations, dateList }) {
  const assumptions = [];
  const firstDate = dateList[0];
  const lastDate = dateList.at(-1);
  const datedTrip = dateList.every(isTripDate);
  const buffer = (field, fallback) => {
    if (basicData[field] === undefined || basicData[field] === null || basicData[field] === '') return fallback;
    const value = Number(basicData[field]);
    if (!Number.isInteger(value) || value < 0 || value > 720) throw new Error('機場預留時間請填 0 至 720 之間的整數分鐘。');
    return value;
  };
  const buffers = {
    flight_departure: buffer('flightDepartureBuffer', 180), flight_arrival: buffer('flightArrivalBuffer', 90),
    train_departure: 30, train_arrival: 15,
  };
  const inputs = !basicData.hasFlights ? [] : basicData.isMultiCityFlight
    ? (multiFlights || []).map(normalizeTransportInput).filter(item => ['date', 'arrivalDate', 'depTime', 'arrTime', 'code', 'station', 'departureStation', 'arrivalStation'].some(key => bookingText(item[key])))
    : ['outbound', 'transit', 'inbound'].filter(role => simpleFlights?.[role]?.enabled !== false).map(role => ({ ...normalizeTransportInput(simpleFlights?.[role]), role })).filter(item => ['date', 'arrivalDate', 'depTime', 'arrTime', 'code', 'station', 'departureStation', 'arrivalStation'].some(key => bookingText(item[key])));
  const transport = inputs.map((input, index) => {
    const inferredRole = /回程|返程|回國/.test(input.type || '') ? 'inbound' : /去程|出國/.test(input.type || '') ? 'outbound'
      : /中轉|轉機/.test(input.type || '') ? 'transit' : index === 0 ? 'outbound' : index === inputs.length - 1 ? 'inbound' : 'transfer';
    const role = ['outbound', 'inbound', 'transit', 'transfer'].includes(input.role) ? input.role : inferredRole;
    if (basicData.isMultiCityFlight && input.role === 'auto') assumptions.push(`第 ${index + 1} 段交通暫按「${({ outbound: '去程', inbound: '回程', transit: '中轉', transfer: '旅途中移動' })[role]}」規劃，可在航段用途修改。`);
    let departureDate = bookingText(input.date);
    if (departureDate && !isTripDate(departureDate)) throw new Error('交通日期格式不正確，請重新選擇日期。');
    if (!departureDate && datedTrip && ['outbound', 'inbound'].includes(role)) {
      departureDate = role === 'outbound' ? firstDate : lastDate;
      assumptions.push(`${input.type || role}未填出發日期，暫用 ${departureDate}。`);
    }
    if (!departureDate && datedTrip) throw new Error(`「${input.type || '中途交通'}」請填寫出發日期，以免跨城市移動排錯天。`);
    const arrivalDate = bookingText(input.arrivalDate) || departureDate;
    if (arrivalDate && !isTripDate(arrivalDate)) throw new Error('抵達日期格式不正確，請重新選擇日期。');
    if (input.mode === 'train' && arrivalDate && departureDate && arrivalDate < departureDate) throw new Error('火車抵達日期不可早於出發日期，請確認班次資料。');
    for (const field of ['depTime', 'arrTime']) {
      if (input[field] && (tripTimeMinutes(input[field]) === null || tripTimeMinutes(input[field]) === 1440)) throw new Error('出發／抵達時間請使用有效的 HH:mm 格式。');
    }
    if (!input.arrivalDate && input.depTime && input.arrTime && tripTimeMinutes(input.arrTime) < tripTimeMinutes(input.depTime)) {
      throw new Error(`「${input.code || input.type || '交通班次'}」抵達時間早於出發時間，請填寫抵達日期；跨日或時差航班請依各地當地日期填寫。`);
    }
    if (!input.arrivalDate && arrivalDate) assumptions.push(`${input.code || input.type || role}未填抵達日期，暫用出發當日 ${arrivalDate}。`);
    if (datedTrip && role === 'outbound' && arrivalDate > lastDate) throw new Error('去程抵達日期晚於旅遊結束日期，請調整旅遊日期或航班日期。');
    if (datedTrip && role === 'inbound' && departureDate < firstDate) throw new Error('回程出發日期早於旅遊開始日期，請確認日期範圍。');
    const stationHint = bookingText(input.station);
    return {
      booking_id: `transport-${index + 1}`, role, mode: input.mode, label: input.type || role,
      departure_date: departureDate || null, arrival_date: arrivalDate || null,
      departure_time: bookingText(input.depTime) || null, arrival_time: bookingText(input.arrTime) || null,
      code: bookingText(input.code) || null, station_hint: stationHint || null,
      departure_station: bookingText(input.departureStation) || (role === 'inbound' ? stationHint : null),
      arrival_station: bookingText(input.arrivalStation) || (role === 'outbound' || role === 'transit' ? stationHint : null),
      departure_buffer_minutes: buffers[`${input.mode}_departure`], arrival_buffer_minutes: buffers[`${input.mode}_arrival`],
    };
  });
  const knownStays = (accommodations || []).filter(stay => bookingText(stay.name) || bookingText(stay.address));
  if (!datedTrip && (transport.some(item => item.departure_date) || knownStays.some(stay => stay.checkInDate || stay.checkOutDate))) {
    throw new Error('請先選擇旅遊日期，才能把已訂交通與住宿安排到正確的日期。');
  }
  const entryDates = transport.filter(item => ['outbound', 'transit'].includes(item.role) && item.arrival_date).map(item => item.arrival_date).sort();
  const departure = transport.find(item => item.role === 'inbound');
  const stays = knownStays.map((stay, index) => {
    let checkIn = bookingText(stay.checkInDate);
    let checkOut = bookingText(stay.checkOutDate);
    if (knownStays.length > 1 && (!checkIn || !checkOut)) throw new Error('有多間住宿時，請填寫每間的入住與退房日期，才能正確安排換飯店與跨城市路線。');
    if (datedTrip && knownStays.length === 1) {
      const inferredCheckIn = entryDates.at(-1) && entryDates.at(-1) > firstDate ? entryDates.at(-1) : firstDate;
      if (!checkIn) { checkIn = inferredCheckIn; assumptions.push(`「${stay.name || stay.address}」未填入住日期，暫用 ${checkIn}。`); }
      if (!checkOut) {
        checkOut = departure?.departure_date && departure.departure_date >= checkIn ? departure.departure_date : lastDate;
        if (checkOut === checkIn && !departure) checkOut = shiftTripDate(checkIn, 1);
        assumptions.push(`「${stay.name || stay.address}」未填退房日期，暫用 ${checkOut}。`);
      }
    }
    if ((checkIn && !isTripDate(checkIn)) || (checkOut && !isTripDate(checkOut))) throw new Error('住宿日期格式不正確，請重新選擇日期。');
    if (checkIn && checkOut && checkOut <= checkIn) throw new Error(`「${stay.name || '住宿'}」的退房日期必須晚於入住日期。`);
    const checkInTime = bookingText(stay.checkInTime) || '15:00';
    const checkOutTime = bookingText(stay.checkOutTime) || '11:00';
    if ([checkInTime, checkOutTime].some(value => tripTimeMinutes(value) === null || tripTimeMinutes(value) === 1440)) throw new Error('住宿入住／退房時間格式不正確。');
    return { booking_id: `stay-${index + 1}`, name: bookingText(stay.name), type: bookingText(stay.type), address: bookingText(stay.address), check_in_date: checkIn || null, check_out_date: checkOut || null, check_in_time: checkInTime, check_out_time: checkOutTime };
  });
  for (let i = 0; i < stays.length; i++) for (let j = i + 1; j < stays.length; j++) {
    if (stays[i].check_in_date < stays[j].check_out_date && stays[j].check_in_date < stays[i].check_out_date) throw new Error('住宿日期重疊，請確認每晚要入住哪一間；同日退房再入住另一間可以正常安排。');
  }
  const days = dateList.map(date => ({ date, start_stay: null, end_stay: null, required_events: [], blocked_intervals: [], terminal_windows: [] }));
  const byDate = new globalThis.Map(days.map(day => [day.date, day]));
  const addEvent = (date, event) => byDate.get(date)?.required_events.push(event);
  const addBlock = (startDate, startMinute, endDate, endMinute, reason, transportId) => {
    if (!datedTrip || !startDate || !endDate || startDate > endDate || (startDate === endDate && startMinute >= endMinute)) return;
    for (const day of days) if (day.date >= startDate && day.date <= endDate) {
      const start = day.date === startDate ? startMinute : 0;
      const end = day.date === endDate ? endMinute : 1440;
      if (start < end) day.blocked_intervals.push({ start, end, reason, booking_id: transportId });
    }
  };
  const addTerminalWindow = (startDate, startMinute, endDate, endMinute, record, station) => {
    if (!datedTrip || !startDate || !endDate || startDate > endDate) return;
    for (const day of days) if (day.date >= startDate && day.date <= endDate) {
      const start = day.date === startDate ? startMinute : 0;
      const end = day.date === endDate ? endMinute : 1440;
      if (start < end) day.terminal_windows.push({ start, end, booking_id: record.booking_id, station: station || record.station_hint });
    }
  };
  const flightPoint = (record, event, time, station) => ({ booking_id: record.booking_id, booking_event: event, type: record.mode === 'flight' ? 'flight' : 'transport', time, station: station || record.station_hint, code: record.code });
  for (const record of transport) {
    const dep = tripTimeMinutes(record.departure_time);
    const arr = tripTimeMinutes(record.arrival_time);
    const ready = arr === null ? null : arr + record.arrival_buffer_minutes;
    const readyDate = ready === null || !record.arrival_date ? null : shiftTripDate(record.arrival_date, Math.floor(ready / 1440));
    if (readyDate) { record.city_ready_date = readyDate; record.city_ready_time = tripTimeLabel(ready % 1440); }
    if (readyDate && record.role !== 'inbound') addTerminalWindow(record.arrival_date, arr, readyDate, ready % 1440, record, record.arrival_station);
    if (record.role !== 'inbound') {
      addEvent(record.arrival_date, flightPoint(record, 'arrival', record.arrival_time, record.arrival_station));
      if (record.role === 'outbound') {
        if (record.arrival_date && record.arrival_date > firstDate) addBlock(firstDate, 0, record.arrival_date, arr ?? 0, '尚未抵達旅遊目的地', record.booking_id);
        if (readyDate) addBlock(firstDate, 0, readyDate, ready % 1440, '抵達前及入境／下車預留時間', record.booking_id);
        if (record.departure_date < record.arrival_date) addEvent(record.departure_date, flightPoint(record, 'departure', record.departure_time, record.departure_station));
      }
    }
    if (record.role !== 'outbound') {
      addEvent(record.departure_date, flightPoint(record, 'departure', record.departure_time, record.departure_station));
      if (dep !== null && record.departure_date) {
        const terminalMinute = dep - record.departure_buffer_minutes;
        const terminalDate = shiftTripDate(record.departure_date, terminalMinute < 0 ? -1 : 0);
        const terminalTime = (terminalMinute + 1440) % 1440;
        record.terminal_arrival_date = terminalDate;
        record.terminal_arrival_time = tripTimeLabel(terminalTime);
        addTerminalWindow(terminalDate, terminalTime, record.departure_date, dep, record, record.departure_station);
        addEvent(terminalDate, { ...flightPoint(record, 'terminal_arrival', tripTimeLabel(terminalTime), record.departure_station), type: 'transport' });
        if (record.role === 'inbound') addBlock(terminalDate, terminalTime, lastDate, 1440, '回程報到及離境後，不再安排目的地活動', record.booking_id);
        else if (readyDate) addBlock(terminalDate, terminalTime, readyDate, ready % 1440, '中途交通、報到及抵達後預留時間', record.booking_id);
        else addBlock(terminalDate, terminalTime, record.departure_date, 1440, '中途交通的抵達時間未確認', record.booking_id);
      }
    }
  }
  const connections = transport.filter(record => ['outbound', 'transit'].includes(record.role));
  for (let i = 1; i < connections.length; i++) {
    const previous = connections[i - 1], next = connections[i];
    const arr = tripTimeMinutes(previous.arrival_time), dep = tripTimeMinutes(next.departure_time);
    if (arr === null || dep === null || !previous.arrival_date || !next.departure_date) continue;
    const availableMinutes = (new Date(`${next.departure_date}T00:00:00Z`) - new Date(`${previous.arrival_date}T00:00:00Z`)) / 60000 + dep - arr - previous.arrival_buffer_minutes - next.departure_buffer_minutes;
    // 360 分鐘是本工具的保守規劃門檻，不是航空公司或入境規定。
    if (!basicData.hasTransitTour || availableMinutes < 360) {
      addBlock(previous.arrival_date, arr, next.departure_date, dep, !basicData.hasTransitTour ? '未勾選中轉觀光，僅安排機場內候機與銜接' : '中轉扣除預留時間後不足六小時，僅安排機場內活動', previous.booking_id);
      addTerminalWindow(previous.arrival_date, arr, next.departure_date, dep, previous, previous.arrival_station);
    }
  }
  for (const day of days) {
    if (!isTripDate(day.date)) continue;
    // 凌晨回程若需前一晚報到，住宿保留原訂日期，但實際路線提早退房。
    const actualCheckOut = stay => departure?.terminal_arrival_date && stay.check_out_date === departure.departure_date && departure.terminal_arrival_date < stay.check_out_date ? departure.terminal_arrival_date : stay.check_out_date;
    const entry = connections.at(-1);
    const actualCheckIn = stay => entry?.city_ready_date && stay.check_in_date < entry.city_ready_date && stay.check_out_date >= entry.city_ready_date ? entry.city_ready_date : stay.check_in_date;
    day.start_stay = stays.find(stay => stay.check_in_date < day.date && actualCheckIn(stay) <= day.date && actualCheckOut(stay) >= day.date) || null;
    day.end_stay = stays.find(stay => actualCheckIn(stay) <= day.date && actualCheckOut(stay) > day.date) || null;
    for (const stay of stays) if (actualCheckIn(stay) === day.date) {
      const lateArrival = actualCheckIn(stay) !== stay.check_in_date;
      addEvent(day.date, { booking_id: stay.booking_id, booking_event: 'check_in', type: 'hotel', name: stay.name, address: stay.address, earliest_time: lateArrival ? entry.city_ready_time : stay.check_in_time });
      if (lateArrival) assumptions.push(`「${stay.name || stay.address}」原訂 ${stay.check_in_date} 入住，抵達及入境後須延至 ${day.date} 凌晨；晚到入住需向住宿確認。`);
    }
    if (day.start_stay) {
      const stay = day.start_stay;
      const checkOut = actualCheckOut(stay) === day.date;
      const checkoutDeadline = actualCheckOut(stay) === stay.check_out_date ? stay.check_out_time : departure?.terminal_arrival_time;
      addEvent(day.date, { booking_id: stay.booking_id, booking_event: checkOut ? 'check_out' : 'leave_hotel', type: 'hotel', name: stay.name, address: stay.address, latest_time: checkOut ? checkoutDeadline : null });
    }
    if (day.end_stay) {
      const stay = day.end_stay;
      if (actualCheckIn(stay) !== day.date) addEvent(day.date, { booking_id: stay.booking_id, booking_event: 'return_to_hotel', type: 'hotel', name: stay.name, address: stay.address });
    }
  }
  return { transport, stays, days, assumptions, buffers, allow_transit_tour: Boolean(basicData.hasTransitTour) };
}

function findTripBookingConflicts(day, rules) {
  if (!rules || (!rules.required_events.length && !rules.blocked_intervals.length)) return [];
  const conflicts = [];
  const normalize = value => bookingText(value).toLowerCase().replace(/\s+/g, '');
  const events = rules.required_events;
  const optionalHotelEvents = events.flatMap(event => event.booking_event === 'check_in' ? [{ ...event, booking_event: 'return_to_hotel' }]
    : event.booking_event === 'check_out' ? ['leave_hotel', 'return_to_hotel'].map(booking_event => ({ ...event, booking_event, latest_time: null })) : []);
  const allowedEvents = [...events, ...optionalHotelEvents];
  let previousStart = -1;
  let previousEnd = -1;
  for (const item of day.timeline) {
    const start = tripTimeMinutes(item.time), end = tripTimeMinutes(item.end_time);
    const expected = allowedEvents.find(event => event.booking_id === item.booking_id && event.booking_event === item.booking_event);
    if (start === null && expected && !expected.time && item.time === '待確認') continue;
    if (start === null || start === 1440) { conflicts.push(`「${item.title}」需要有效的 HH:mm 開始時間。`); continue; }
    if (start < previousStart) conflicts.push('時間軸未按時間順序排列。');
    previousStart = start;
    if (end !== null && end < start) conflicts.push(`「${item.title}」的結束時間早於開始時間。`);
    if (!expected && !['hotel', 'flight'].includes(item.type) && end === null) conflicts.push(`「${item.title}」缺少 end_time，無法確認是否會延誤交通。`);
    if (start < previousEnd) conflicts.push(`「${item.title}」與前一項行程時間重疊。`);
    previousEnd = Math.max(start, end ?? start);
    const terminalItem = item.at_terminal === true && (rules.terminal_windows || []).some(window => window.booking_id === item.booking_id && start >= window.start && (end ?? start) <= window.end && (!window.station || normalize(item.location_query).includes(normalize(window.station)))) && ['meal', 'activity', 'transport'].includes(item.type);
    if (!expected && !terminalItem && rules.blocked_intervals.some(block => start >= block.start && start < block.end || (end !== null && start < block.end && end > block.start))) {
      conflicts.push(`「${item.title}」排在尚未抵達、交通移動、候機或離境的時段。`);
    }
    if (item.type === 'hotel' && !expected) conflicts.push(`「${item.title}」未對應當天使用者提供的住宿。`);
    if (item.type === 'flight' && !expected) conflicts.push(`「${item.title}」未對應使用者提供的航班。`);
    if (expected && item.type === 'hotel') {
      if (rules.blocked_intervals.some(block => start >= block.start && start < block.end)) conflicts.push('住宿事件排在尚未抵達、交通移動或離境的時段。');
      if (expected.name && !normalize(item.title).includes(normalize(expected.name))) conflicts.push(`住宿名稱必須保留「${expected.name}」。`);
      const location = expected.address || expected.name;
      if (location && !normalize(item.location_query).includes(normalize(location))) conflicts.push(`住宿地圖查詢必須使用「${location}」。`);
    }
  }
  for (const expected of events) {
    const matches = day.timeline.filter(item => item.booking_id === expected.booking_id && item.booking_event === expected.booking_event);
    if (matches.length !== 1) { conflicts.push(`必須恰好安排一次 ${expected.booking_id} / ${expected.booking_event}。`); continue; }
    const item = matches[0], minute = tripTimeMinutes(item.time);
    if (item.type !== expected.type) conflicts.push(`${expected.booking_id} / ${expected.booking_event} 類型錯誤。`);
    if (expected.time && item.time !== expected.time) conflicts.push(`${expected.booking_id} / ${expected.booking_event} 必須是使用者的 ${expected.time}。`);
    if (expected.earliest_time && minute < tripTimeMinutes(expected.earliest_time)) conflicts.push(`「${expected.name}」入住早於 ${expected.earliest_time}，應先安排寄放行李或其他活動。`);
    if (expected.latest_time && minute > tripTimeMinutes(expected.latest_time)) conflicts.push(`「${expected.name}」退房晚於 ${expected.latest_time}。`);
    if (expected.name && !normalize(item.title).includes(normalize(expected.name))) conflicts.push(`住宿名稱必須保留「${expected.name}」。`);
    const location = expected.address || expected.station || expected.name;
    if (location && !normalize(item.location_query).includes(normalize(location))) conflicts.push(`${expected.booking_id} 的地圖查詢必須使用使用者提供的「${location}」。`);
    if (expected.code && !normalize(`${item.title} ${item.transport_detail}`).includes(normalize(expected.code))) conflicts.push(`交通內容必須保留班次 ${expected.code}。`);
    if (expected.booking_event === 'leave_hotel' || expected.booking_event === 'check_out') {
      if (rules.blocked_intervals.some(block => minute >= block.start && minute < block.end)) conflicts.push('離開／退房住宿排在交通移動或離境的時段，應提早安排。');
      const index = day.timeline.indexOf(item);
      const morningDeparture = day.timeline.slice(0, index).some(other => other.type === 'hotel' && other.booking_id === expected.booking_id && other.booking_event === 'leave_hotel');
      if (!morningDeparture && day.timeline.slice(0, index).some(other => ['spot', 'activity'].includes(other.type) && other.at_terminal !== true)) conflicts.push('當日活動應從前一晚住宿出發，不能先逛景點才離開住宿。');
    }
    if (expected.booking_event === 'check_in' || expected.booking_event === 'return_to_hotel') {
      if (rules.blocked_intervals.some(block => minute >= block.start && minute < block.end)) conflicts.push('入住／返回住宿排在尚未抵達或已離境的時段。');
    }
  }
  if (rules.end_stay) {
    const lastHotel = day.timeline.findLastIndex(item => item.booking_id === rules.end_stay.booking_id && item.type === 'hotel' && ['check_in', 'return_to_hotel'].includes(item.booking_event));
    if (lastHotel >= 0 && day.timeline.slice(lastHotel + 1).some(item => ['spot', 'activity', 'meal'].includes(item.type) && item.at_terminal !== true)) conflicts.push('結束活動與用餐後應回到當晚住宿；若入住後再出門，需補上 return_to_hotel。');
  }
  return [...new Set(conflicts)];
}

function tripShapeError(message) {
  return Object.assign(new Error(message), { code: 'GEMINI_TRIP_SHAPE' });
}

function canSplitTripOutput(error) {
  return ['GEMINI_OUTPUT_TRUNCATED', 'GEMINI_TRIP_JSON', 'GEMINI_TRIP_SHAPE'].includes(error.code);
}

function getTripContinuation(days, previousContext) {
  const day = days.at(-1);
  if (!day) return previousContext;
  const item = day.timeline?.at(-1);
  return `Ended Day ${day.day_index} in ${day.city} at ${item?.title || 'Hotel'}. Continue logically from here.`;
}

function getTripBookingSummary(context) {
  if (!context) return '';
  // 全程只帶日期與路線骨架；班次、時間、完整地址留在相關日期的訂單中。
  return `TRIP ROUTE SUMMARY (overview only; daily bookings are authoritative): ${JSON.stringify({
    routes: context.transport.map(record => ({ booking_id: record.booking_id, mode: record.mode, role: record.role,
      from: [record.departure_date, record.departure_station], to: [record.arrival_date, record.arrival_station] })),
    stays: context.stays.map(stay => ({ booking_id: stay.booking_id, base: stay.name || 'Booked accommodation',
      nights: [stay.check_in_date, stay.check_out_date] })),
    allow_transit_tour: context.allow_transit_tour,
  })}`;
}

function getTripPromptBookings(context, dates) {
  if (!context) return null;
  const selected = new Set(dates);
  const days = context.days.filter(day => selected.has(day.date));
  const ids = new Set();
  for (const day of days) {
    for (const stay of [day.start_stay, day.end_stay]) if (stay) ids.add(stay.booking_id);
    for (const event of [...day.required_events, ...day.blocked_intervals, ...day.terminal_windows]) ids.add(event.booking_id);
  }
  return {
    transport: context.transport.filter(record => ids.has(record.booking_id)
      || (!record.departure_date && !record.arrival_date)),
    stays: context.stays.filter(stay => ids.has(stay.booking_id) || (!stay.check_in_date && !stay.check_out_date)),
    days: days.map(day => ({ ...day,
      start_stay: day.start_stay?.booking_id || null, end_stay: day.end_stay?.booking_id || null,
    })),
  };
}

const TRIP_SCHEDULE_FIELDS = ['time', 'end_time', 'type', 'title', 'location_query', 'transport_detail', 'booking_id', 'booking_event', 'at_terminal'];
const TRIP_DETAIL_FIELDS = ['description', 'location_query', 'transport_detail', 'price_level', 'warnings_tips', 'menu_recommendations'];
const tripObjectSchema = (properties, required = Object.keys(properties)) => ({ type: 'object', properties, required, additionalProperties: false });
const tripStringSchema = () => ({ type: 'string' });
const TRIP_MENU_SCHEMA = { type: 'array', items: tripObjectSchema({ local: tripStringSchema(), cn: tripStringSchema(), price: tripStringSchema() }) };
const TRIP_DETAILS_SCHEMA = {
  description: tripStringSchema(), location_query: tripStringSchema(), transport_detail: tripStringSchema(),
  price_level: { type: 'string', enum: ['Low', 'Mid', 'High'] }, warnings_tips: tripStringSchema(), menu_recommendations: TRIP_MENU_SCHEMA,
};

function getTripScheduleSchema(dates) {
  const item = tripObjectSchema({
    time: tripStringSchema(), end_time: tripStringSchema(),
    type: { type: 'string', enum: ['transport', 'activity', 'meal', 'hotel', 'flight', 'spot'] },
    title: tripStringSchema(), location_query: tripStringSchema(), transport_detail: tripStringSchema(),
    booking_id: tripStringSchema(), booking_event: tripStringSchema(), at_terminal: { type: 'boolean' },
  }, ['time', 'type', 'title', 'location_query', 'transport_detail']);
  const day = tripObjectSchema({
    day_index: { type: 'integer' }, date: { type: 'string', enum: dates }, city: tripStringSchema(), title: tripStringSchema(),
    timeline: { type: 'array', items: item },
  });
  return tripObjectSchema({ days: { type: 'array', items: day, minItems: dates.length, maxItems: dates.length } });
}

function getTripScheduleProjection(day) {
  return { day_index: day.day_index, date: day.date, city: day.city, title: day.title,
    timeline: day.timeline.map(item => Object.fromEntries(TRIP_SCHEDULE_FIELDS
      .filter(field => Object.hasOwn(item, field)).map(field => [field, item[field]]))),
  };
}

function protectTripBookingDay(day, rules) {
  if (!rules) return day;
  const allowed = [...rules.required_events, ...rules.required_events.flatMap(event =>
    event.booking_event === 'check_in' ? [{ ...event, booking_event: 'return_to_hotel' }]
      : event.booking_event === 'check_out' ? ['leave_hotel', 'return_to_hotel'].map(booking_event => ({ ...event, booking_event })) : [])];
  const contains = (text, value) => !value || bookingText(text).toLowerCase().replace(/\s+/g, '').includes(bookingText(value).toLowerCase().replace(/\s+/g, ''));
  const protect = (item, event) => {
    const next = { ...item, type: event.type, booking_id: event.booking_id, booking_event: event.booking_event };
    if (event.time) next.time = event.time;
    else if (event.type !== 'hotel' && !event.time) next.time = '待確認';
    if (event.name && !contains(next.title, event.name)) next.title = `${event.name}｜${next.title || event.booking_event}`;
    if (event.code && !contains(`${next.title} ${next.transport_detail}`, event.code)) next.title = `${event.code}｜${next.title || event.booking_event}`;
    const location = event.address || event.station || event.name;
    if (location) next.location_query = location;
    return next;
  };
  const timeline = day.timeline.map(item => {
    const event = allowed.find(event => event.booking_id === item.booking_id && event.booking_event === item.booking_event);
    return event ? protect(item, event) : { ...item };
  });
  // 只有訂單已提供的交通點能由程式補回；住宿動線與移動時間仍須規劃及驗證。
  for (const event of rules.required_events.filter(event => event.type !== 'hotel')) {
    if (timeline.some(item => item.booking_id === event.booking_id && item.booking_event === event.booking_event)) continue;
    const label = { arrival: '抵達', departure: '出發', terminal_arrival: '到機場／車站報到' }[event.booking_event] || event.booking_event;
    const item = protect({ time: event.time || '待確認', type: event.type, title: `${event.code || '已訂交通'} ${label}`,
      description: '依使用者提供的交通訂單保留此事件。', location_query: event.station || '交通地點待確認',
      transport_detail: event.code || '', price_level: 'Mid', warnings_tips: event.time ? '請依實際訂單確認班次與報到要求。' : '交通時間未提供，請確認訂單後更新。', menu_recommendations: [],
    }, event);
    const minute = tripTimeMinutes(item.time);
    const position = minute === null ? -1 : timeline.findIndex(other => {
      const start = tripTimeMinutes(other.time);
      return start !== null && start > minute;
    });
    if (position < 0) timeline.push(item); else timeline.splice(position, 0, item);
  }
  return { ...day, timeline };
}

function mergeTripItemDetails(item, details) {
  const completed = { ...item };
  for (const field of TRIP_DETAIL_FIELDS) if (Object.hasOwn(details, field)) completed[field] = details[field];
  // 補文案不得更改已驗證的時間、訂單、目的地或交通路線。
  for (const field of TRIP_SCHEDULE_FIELDS) {
    if (['location_query', 'transport_detail'].includes(field) && !bookingText(item[field])) continue;
    if (Object.hasOwn(item, field)) completed[field] = item[field];
    else if (!['location_query', 'transport_detail'].includes(field)) delete completed[field];
  }
  return completed;
}

const TRIP_CHECKPOINT_KEY = 'gemini_trip_generation_checkpoint';
const getTripCheckpointSignature = ({ baseConstraints, dateList, bookingContext, modelFamily, planningMode = 'full', basicPreferences }) =>
  JSON.stringify({ revision: planningMode === 'basic' ? 'basic-requests-details-3' : 'flash-schedule-1', baseConstraints, dateList, bookingContext,
    ...(planningMode === 'basic' ? { preferences: getBasicTripPreferences(baseConstraints, basicPreferences) } : {}), modelFamily: modelFamily === 'lite' ? 'flash' : modelFamily });
function readTripCheckpoint(signature) {
  try {
    const saved = JSON.parse(globalThis.localStorage?.getItem(TRIP_CHECKPOINT_KEY) || 'null');
    return saved?.signature === signature && Date.now() - saved.updatedAt < 24 * 60 * 60 * 1000 ? saved : null;
  } catch { return null; }
}
function writeTripCheckpoint(checkpoint) {
  try { globalThis.localStorage?.setItem(TRIP_CHECKPOINT_KEY, JSON.stringify({ ...checkpoint, updatedAt: Date.now() })); } catch { /* 儲存空間不足時，仍可完成當次生成。 */ }
}
function clearTripCheckpoint() {
  try { globalThis.localStorage?.removeItem(TRIP_CHECKPOINT_KEY); } catch { /* 不影響已完成的行程。 */ }
}

const basicTripText = (value, length = 100) => bookingText(value).slice(0, length);
const BASIC_TRIP_DETAIL_OPTIONS = [
  { key: 'introductions', label: '景點簡短介紹', detail: '認識看點與安排理由', default: true },
  { key: 'transportTips', label: '交通方式建議', detail: '步行、地鐵或自駕的概略路線', default: true },
  { key: 'practicalTips', label: '門票、預約與行李提醒', detail: '出發前需要確認的事項', default: false },
  { key: 'dining', label: '餐飲與點餐建議', detail: '簡短菜色翻譯與預估價位', default: false },
  { key: 'cityGuides', label: '城市指南與常用語', detail: '交通、文化與旅遊提醒', default: false },
  { key: 'seasonalAdvice', label: '季節與穿著建議', detail: '依季節概估，並非即時天氣預報', default: false },
];
const normalizeBasicDetailOptions = value => Object.fromEntries(BASIC_TRIP_DETAIL_OPTIONS.map(option =>
  [option.key, typeof value?.[option.key] === 'boolean' ? value[option.key] : option.default]));

function getTripAutomaticRetryDelay(error, recovery) {
  if (['GEMINI_CANCELLED', 'GEMINI_SESSION_LIMIT', 'TRIP_INPUT_CONFLICT'].includes(error.code)) return null;
  if (canSplitTripOutput(error)) return 15000;
  const info = getGeminiRetryInfo(error);
  if (error.status === 429 && !info.retryable) return null;
  if (![408, 429, 500, 502, 503, 504].includes(error.status)) return null;
  const delay = Math.max(info.serverDelayMs || 0, 60000 * (2 ** recovery));
  // 每日配額、權限與過長的伺服器等待不能用無限重試解決。
  return delay <= 5 * 60000 ? delay : null;
}

async function runTripWithWaiting(generate, { mode, signal, session, onStatus = () => {} }) {
  for (let recovery = 0; recovery <= 2; recovery++) {
    throwIfGeminiCancelled(signal);
    onStatus({ stage: 'generating', message: recovery ? '正在接續未完成的行程…' : '正在依交通、住宿與特殊要求規劃…' });
    try {
      const result = await generate();
      throwIfGeminiCancelled(signal);
      return result;
    } catch (error) {
      throwIfGeminiCancelled(signal);
      const delay = mode === 'free' && recovery < 2 && (!session || session.attempts < session.maxAttempts)
        ? getTripAutomaticRetryDelay(error, recovery) : null;
      if (delay === null) throw error;
      const until = Date.now() + delay;
      const reason = canSplitTripOutput(error) ? '正在補齊未完成的景點與特殊要求' : '服務或短時間配額暫時受限';
      while (until > Date.now()) {
        throwIfGeminiCancelled(signal);
        const seconds = Math.ceil((until - Date.now()) / 1000);
        onStatus({ stage: 'waiting', remainingSeconds: seconds, message: `${reason}，${seconds} 秒後自動接續（${recovery + 1}/2）。不需要再按規劃。` });
        await new Promise(resolve => setTimeout(resolve, Math.min(1000, until - Date.now())));
      }
    }
  }
}

function getBasicTripRequests(text, dateList, fixedActivities = []) {
  const requests = bookingText(text).split(/\r?\n|[；;]/u).map(line => line.replace(/^\s*(?:[-•]\s*|\d+[.)、]\s*)/u, '').trim()).filter(Boolean)
    .map((text, index) => ({ id: `request-${index + 1}`, text }));
  const pins = [];
  const addPin = (value, requestId) => {
    const title = bookingText(value.title), start = tripTimeMinutes(value.startTime), explicitEnd = tripTimeMinutes(value.endTime);
    if (!title || !value.date || start === null) throw Object.assign(new Error('固定活動需要填寫日期、開始時間與名稱。'), { code: 'TRIP_INPUT_CONFLICT' });
    if (!dateList.includes(value.date)) throw Object.assign(new Error(`「${title}」的日期不在這次旅程內。`), { code: 'TRIP_INPUT_CONFLICT' });
    const type = ['meal', 'logistics', 'activity', 'spot'].includes(value.type) ? value.type
      : /行李|寄放|寄存|luggage/iu.test(title) ? 'logistics' : /餐|燒肉|焼肉|料理|dinner|lunch/iu.test(title) ? 'meal' : 'activity';
    const duration = type === 'logistics' ? 20 : type === 'meal' ? 90 : /演唱會|演唱会|concert/iu.test(title) ? 180 : 90;
    const end = explicitEnd ?? start + duration;
    if (end <= start || end > 1439) throw Object.assign(new Error(`「${title}」的結束時間必須晚於開始時間，跨日活動請拆成兩天。`), { code: 'TRIP_INPUT_CONFLICT' });
    pins.push({ id: value.id || `fixed-${pins.length + 1}`, request_id: requestId, date: value.date, title,
      type, area: bookingText(value.area), start, end, end_estimated: explicitEnd === null });
  };
  for (const request of requests) {
    const days = new Set();
    for (const match of request.text.matchAll(/(?:第\s*(\d{1,2})\s*天|\bday\s*(\d{1,2})\b)/giu)) {
      const date = dateList[Number(match[1] || match[2]) - 1]; if (date) days.add(date);
    }
    for (const match of request.text.matchAll(/\b\d{4}-\d{2}-\d{2}\b/g)) if (dateList.includes(match[0])) days.add(match[0]);
    const times = [...request.text.matchAll(/\b(?:[01]?\d|2[0-3]):[0-5]\d\b/g)].map(match => match[0].padStart(5, '0'));
    if (days.size && times.length && !/不要|不想|避免|不必|不用|之前|之後|前後|航班|班機|起飛|報到|新幹線|車次|\b(?:flight|train)\b/iu.test(request.text)) {
      const title = request.text.replace(/\b\d{4}-\d{2}-\d{2}\b|第\s*\d{1,2}\s*天|\bday\s*\d{1,2}\b|\b(?:[01]?\d|2[0-3]):[0-5]\d\b/giu, '')
        .replace(/^[\s:：,，、~～–—-]*(?:一定要|必須|請安排)?\s*/u, '').replace(/^[到至~～–—-]+\s*/u, '').trim();
      if (title) for (const date of days) addPin({ id: `${request.id}-${date}`, date, startTime: times[0], endTime: times[1], title }, request.id);
    }
  }
  for (const activity of fixedActivities) {
    if (![activity.title, activity.date, activity.startTime, activity.endTime].some(bookingText)) continue;
    const id = `fixed-request-${pins.length + 1}`;
    requests.push({ id, text: `${activity.date} ${activity.startTime}–${activity.endTime || '結束待確認'} ${activity.title}${activity.area ? `（${activity.area}）` : ''}` });
    addPin(activity, id);
  }
  return { requests, pins };
}
// 這些別名只協助辨識城市，不取代地圖查詢；無法辨識時保留使用者的地區文字。
const BASIC_TRIP_CITY_HINTS = [
  ['東京', /東京|东京|墨田|台東|淺草|浅草|上野|押上|\b(?:tokyo|sumida|taito|asakusa|ueno|narita|haneda|nrt|hnd)\b|淺草寺|浅草寺|晴空塔|skytree|senso[ -]?ji|阿美橫町|合羽橋/iu],
  ['名古屋', /名古屋|千種|今池|\b(?:nagoya|chikusa|imaike|aichi|ngo)\b|德川園|徳川園|熱田神宮|大須觀音|大須観音|名古屋城/iu],
  ['京都', /京都|\bkyoto\b|清水寺|伏見稻荷|伏見稲荷|金閣寺/iu],
  ['大阪', /大阪|\bosaka\b|\bkix\b|道頓堀|通天閣/iu],
  ['首爾', /首爾|首尔|서울|\b(?:seoul|hongdae|icn|gmp)\b|弘大|明洞|景福宮/iu],
  ['台北', /台北|臺北|\b(?:taipei|tpe|tsa)\b/iu],
];
const basicTripCities = text => BASIC_TRIP_CITY_HINTS.filter(([, pattern]) => pattern.test(bookingText(text))).map(([city]) => city);
const basicTripCity = text => { const cities = basicTripCities(text); return cities.length === 1 ? cities[0] : ''; };
function basicStayArea(stay) {
  const text = bookingText(stay?.address || stay?.name);
  const city = basicTripCity(text);
  if (city === '東京') {
    if (/asakusa|淺草|浅草/iu.test(text)) return '東京・淺草周邊';
    if (/ueno|上野/iu.test(text)) return '東京・上野周邊';
    if (/sumida|墨田|押上/iu.test(text)) return '東京・墨田／押上周邊';
  }
  if (city === '名古屋' && /chikusa|imaike|千種|今池/iu.test(text)) return '名古屋・千種／今池周邊';
  return basicTripText(text);
}
const basicTripDayMinute = (eventDate, time, date) => {
  const minute = tripTimeMinutes(time);
  return minute === null || !isTripDate(eventDate) || !isTripDate(date) ? null
    : (new Date(`${eventDate}T00:00:00Z`) - new Date(`${date}T00:00:00Z`)) / 60000 + minute;
};

function getBasicTripDayContext(bookingContext, date, fallbackArea = '', planningPins = []) {
  const rules = bookingContext?.days?.find(day => day.date === date)
    || { required_events: [], blocked_intervals: [], start_stay: null, end_stay: null };
  const records = bookingContext?.transport || [];
  const startArea = basicStayArea(rules.start_stay) || basicStayArea(rules.end_stay) || fallbackArea;
  const endArea = basicStayArea(rules.end_stay);
  const startCity = basicTripCity(startArea), endCity = basicTripCity(endArea);
  const hasLeftDestination = records.some(record => record.role === 'inbound' && record.departure_date && record.departure_date <= date);
  const connectionFrom = new Set(), connectionTo = new Set(), blocks = [...rules.blocked_intervals], transfers = [];
  const clipBlock = (start, end, extras = {}) => {
    if (start !== null && end !== null && start < 1440 && end > 0 && end > start) return { start: Math.max(0, start), end: Math.min(1440, end), ...extras };
    return null;
  };
  // 自動用途有時把第二班轉機標成 transfer。短時間的連續航班仍按機場銜接處理。
  for (let i = 0; i + 1 < records.length; i++) {
    const previous = records[i], next = records[i + 1];
    if (previous.mode !== 'flight' || next.mode !== 'flight' || previous.role === 'inbound') continue;
    const arrival = basicTripDayMinute(previous.arrival_date, previous.arrival_time, date);
    const departure = basicTripDayMinute(next.departure_date, next.departure_time, date);
    if (arrival === null || departure === null || departure < arrival) continue;
    const gap = departure - arrival;
    const connectingRole = ['outbound', 'transit'].includes(previous.role) || next.role === 'transit';
    const sameAirport = previous.arrival_station && previous.arrival_station.toLowerCase() === next.departure_station?.toLowerCase();
    if (!(connectingRole || sameAirport) || gap > 1440) continue;
    const usable = gap - previous.arrival_buffer_minutes - next.departure_buffer_minutes;
    if (bookingContext?.allow_transit_tour && usable >= 360) continue;
    connectionFrom.add(previous.booking_id); connectionTo.add(next.booking_id);
    const block = clipBlock(arrival, departure);
    if (block) blocks.push(block);
    const ready = basicTripDayMinute(previous.city_ready_date, previous.city_ready_time, date);
    const terminal = basicTripDayMinute(next.terminal_arrival_date, next.terminal_arrival_time, date);
    const waiting = clipBlock(ready ?? arrival, terminal ?? departure, { kind: 'connection',
      title: `中轉候機：${previous.code || '前段航班'} → ${next.code || '後段航班'}（不進市區）`,
      area: previous.arrival_station || previous.station_hint || '中轉機場', booking_id: previous.booking_id });
    if (waiting) transfers.push(waiting);
  }
  const arrivalArea = record => {
    const city = basicTripCity(record.arrival_station || record.station_hint);
    if (endArea && (!city || !endCity || city === endCity)) return endArea;
    return basicTripText(record.arrival_station || record.station_hint) || endArea || startArea;
  };
  const arrivals = [];
  for (const record of records) {
    if (!connectionTo.has(record.booking_id) && record.terminal_arrival_date) {
      const end = basicTripDayMinute(record.terminal_arrival_date, record.terminal_arrival_time, date);
      const transfer = clipBlock(end === null ? null : end - (record.mode === 'train' ? 30 : 60), end,
        { kind: 'departure', title: record.mode === 'train' ? '前往出發車站' : '前往出發機場',
          area: record.departure_station || record.station_hint || '', booking_id: record.booking_id });
      if (transfer) transfers.push(transfer);
    }
    if (record.role === 'inbound' || connectionFrom.has(record.booking_id)) continue;
    const ready = basicTripDayMinute(record.city_ready_date, record.city_ready_time, date);
    if (ready === null || ready < 0 || ready >= 1440) continue;
    const area = arrivalArea(record);
    const duration = record.mode === 'train' ? 30 : /\bnrt\b|narita|成田/iu.test(record.arrival_station || record.station_hint || '') ? 90 : 60;
    const transfer = clipBlock(ready, ready + duration, { kind: 'arrival', title: record.mode === 'train' ? '抵達車站後前往住宿地區／市區' : '抵達機場後前往住宿地區／市區',
      area, booking_id: record.booking_id });
    // 接駁不能跨入下一段已訂交通；沒有足夠時間時不宣稱已進市區。
    if (transfer && !blocks.some(block => block.start < transfer.end && block.end > transfer.start)) {
      transfers.push(transfer);
      arrivals.push({ minute: transfer.end, area, city: basicTripCity(area) || basicTripCity(record.arrival_station || record.station_hint), booking_id: record.booking_id });
    }
  }
  arrivals.sort((a, b) => a.minute - b.minute);
  const unknownTransport = records.some(record => record.departure_date === date && !record.departure_time
    || record.arrival_date === date && !record.arrival_time);
  let windows = unknownTransport || hasLeftDestination && !records.some(record => record.role === 'inbound' && record.departure_date === date)
    ? [] : [{ start: Math.max(0, Math.min(540, ...planningPins.map(pin => pin.start - 30))), end: 1380 }];
  for (const block of [...blocks, ...transfers]) windows = windows.flatMap(window => {
    if (block.end <= window.start || block.start >= window.end) return [window];
    return [...(block.start > window.start ? [{ start: window.start, end: block.start }] : []),
      ...(block.end < window.end ? [{ start: block.end, end: window.end }] : [])];
  });
  windows = windows.map((window, index) => {
    const arrival = arrivals.filter(point => point.minute <= window.start).at(-1);
    const area = arrival?.area || startArea, city = arrival?.city || startCity;
    const nextDeparture = transfers.find(transfer => transfer.kind === 'departure' && transfer.start === window.end);
    const collectLuggage = rules.start_stay && rules.required_events.some(event => event.booking_event === 'check_out') && nextDeparture
      && (!city || !startCity || city === startCity);
    const returnToStay = index === windows.length - 1 && rules.end_stay && !hasLeftDestination;
    return { ...window, end: Math.max(window.start, window.end - (collectLuggage || returnToStay ? 30 : 0)),
      id: `w${index + 1}`, area, city, collectLuggage: Boolean(collectLuggage), returnToStay: Boolean(returnToStay), departure: nextDeparture || null };
  }).filter(window => window.end - window.start >= 45);
  return { rules, startArea, endArea, startCity, endCity, windows, transfers, arrivals, unknownTransport, hasLeftDestination };
}

const basicStopIdentity = title => bookingText(title).toLowerCase().replace(/[\s・·（）()、，,。.!！／/：:—-]/gu, '');
const isBasicPlaceholder = (title, type) => /自行選|自行挑|自由活動|鄰近地區|住宿地區散步|附近景點|景點\s*\d+|待安排|待選擇|placeholder|free time|nearby sights/iu.test(title)
  || /^(?:附近用餐|附近午餐|附近晚餐|早餐|午餐|晚餐|用餐|散步|觀光|景點|旅遊景點)(?:[（(].*[）)])?$/u.test(title)
  || type === 'spot' && /^(?:附近|周邊|市區|住宿附近|nearby)$/iu.test(title);

function buildBasicTripDay(raw, date, dayIndex, bookingContext, fallbackArea, source = 'ai', usedSpots = new Set()) {
  const context = getBasicTripDayContext(bookingContext, date, fallbackArea, raw?.fixed_pins || []);
  const { rules, windows, startArea, endArea, transfers, unknownTransport, hasLeftDestination } = context;
  const timeline = [];
  const item = (time, type, title, extras = {}) => ({ time, type, title, description: '', location_query: startArea,
    transport_detail: '', price_level: '', warnings_tips: '', menu_recommendations: [], is_basic: true, time_estimated: true, ...extras });
  const seenEvents = new Set();
  const transportEvents = [...rules.required_events.filter(event => event.type !== 'hotel')];
  for (const record of bookingContext?.transport || []) for (const event of ['departure', 'arrival']) {
    if (record[`${event}_date`] === date) transportEvents.push({ booking_id: record.booking_id, booking_event: event,
      type: record.mode === 'flight' ? 'flight' : 'transport', time: record[`${event}_time`], code: record.code,
      station: record[`${event}_station`] || record.station_hint });
  }
  for (const event of transportEvents) {
    const identity = `${event.booking_id}:${event.booking_event}`;
    if (seenEvents.has(identity)) continue;
    seenEvents.add(identity);
    const label = { arrival: '抵達', departure: '出發', terminal_arrival: '抵達機場／車站報到' }[event.booking_event] || '交通';
    timeline.push(item(event.time || '待確認', event.type, `${event.code || '已填交通'} ${label}`, {
      booking_id: event.booking_id, booking_event: event.booking_event, location_query: event.station || '',
      transport_detail: event.code || '', time_estimated: event.booking_event === 'terminal_arrival' || !event.time,
      warnings_tips: '班次與出發／抵達時間取自你的輸入，各地時間與報到要求請依訂單確認。',
    }));
  }
  for (const transfer of transfers) timeline.push(item(tripTimeLabel(transfer.start), 'transport', transfer.title, {
    end_time: tripTimeLabel(transfer.end), location_query: transfer.area,
    ...(transfer.kind === 'connection' ? { at_terminal: true, booking_id: transfer.booking_id } : {}),
    transport_detail: transfer.kind === 'connection' ? '預留轉機與候機，不安排市區景點；航廈銜接依航空公司指示。'
      : `接駁概估 ${transfer.end - transfer.start} 分鐘，請依實際距離與交通確認。`,
  }));
  const hotelDeparture = transfers.filter(transfer => transfer.kind === 'departure').at(0);
  if (rules.start_stay && (windows.length || hotelDeparture || unknownTransport)) {
    const checkout = rules.required_events.find(event => event.booking_event === 'check_out');
    const leave = unknownTransport ? null : Math.max(0, Math.min(540, windows[0]?.start ?? 540, hotelDeparture ? hotelDeparture.start - 10 : 540,
      checkout ? (tripTimeMinutes(checkout.latest_time) ?? 550) - 10 : 540));
    timeline.push(item(leave === null ? '待確認' : tripTimeLabel(leave), 'hotel', `${checkout ? '退房／寄放行李' : '從住宿地區出發'}：${startArea}`, {
      booking_id: rules.start_stay.booking_id, booking_event: checkout ? 'check_out' : 'leave_hotel',
      location_query: rules.start_stay.address || rules.start_stay.name,
      warnings_tips: checkout ? '退房與寄放／領取行李需向住宿確認；早班交通應提早完成退房。' : '每日起點以住宿地區概估。',
    }));
  }
  const options = normalizeBasicDetailOptions(raw?.detail_options);
  const pins = Array.isArray(raw?.fixed_pins) ? raw.fixed_pins : [];
  const reservations = pins.map(pin => {
    const city = basicTripCity(`${pin.area} ${pin.title}`);
    const window = windows.find(window => pin.start >= window.start + 30 && pin.end <= window.end && (!city || !window.city || city === window.city));
    if (!window) throw Object.assign(new Error(`第 ${dayIndex} 天「${pin.title}」${tripTimeLabel(pin.start)}–${tripTimeLabel(pin.end)} 與已填交通、住宿或可用城市時段衝突，請調整固定活動。`), { code: 'TRIP_INPUT_CONFLICT' });
    return { ...pin, window, from: Math.max(window.start, pin.start - 30), to: pin.end };
  });
  for (let i = 0; i < reservations.length; i++) if (reservations.slice(i + 1).some(other =>
    other.window.id === reservations[i].window.id && other.from < reservations[i].to && other.to > reservations[i].from)) {
    throw Object.assign(new Error(`第 ${dayIndex} 天的固定活動與接駁時間重疊，請調整起訖時間。`), { code: 'TRIP_INPUT_CONFLICT' });
  }
  const periods = { morning: 540, noon: 720, afternoon: 840, evening: 1080 };
  const states = new globalThis.Map(windows.map(window => [window.id, { cursor: window.start, area: window.area, lastEnd: null }]));
  let omitted = 0;
  const proposed = (Array.isArray(raw?.stops) ? raw.stops.slice(0, 8) : []).filter(stop => {
    if (stop?.type !== 'meal') return true;
    const minute = tripTimeMinutes(stop.start_time) ?? (stop.period === 'evening' ? 1080 : stop.period === 'noon' ? 720 : 540);
    return !reservations.some(pin => pin.type === 'meal' && pin.window.id === stop.window_id && Math.abs(pin.start - minute) <= 180
      && !stop.request_ids?.includes(pin.request_id) && basicStopIdentity(stop.title) !== basicStopIdentity(pin.title));
  });
  const matchesPin = (stop, pin) => stop?.request_ids?.includes(pin.request_id)
    || basicStopIdentity(stop?.title) === basicStopIdentity(pin.title);
  const fixed = reservations.map(pin => ({ ...proposed.find(stop => matchesPin(stop, pin)), title: pin.title, area: pin.area || pin.window.area,
    window_id: pin.window.id, type: pin.type, fixed_pin: pin, start_time: tripTimeLabel(pin.start), end_time: tripTimeLabel(pin.end), request_ids: [pin.request_id] }));
  const stops = [...proposed.filter(stop => !reservations.some(pin => matchesPin(stop, pin))), ...fixed]
    .sort((a, b) => (tripTimeMinutes(a.start_time) ?? periods[a.period] ?? 540) - (tripTimeMinutes(b.start_time) ?? periods[b.period] ?? 540));
  for (const stop of stops) {
    const title = basicTripText(stop?.title, 120).replace(/^(?:約\s*)?(?:[01]?\d|2[0-3]):[0-5]\d\s*[｜|:：-]?\s*/u, '');
    if (!['spot', 'meal', 'activity', 'logistics'].includes(stop?.type) || !title || isBasicPlaceholder(title, stop.type)) { omitted++; continue; }
    const window = windows.find(window => window.id === stop.window_id);
    if (!window) { omitted++; continue; }
    const cities = basicTripCities(`${title} ${bookingText(stop.area)}`);
    if (window.city && cities.some(city => city !== window.city)) { omitted++; continue; }
    const identity = basicStopIdentity(title);
    if (stop.type === 'spot' && !stop.fixed_pin && usedSpots.has(identity)) { omitted++; continue; }
    const state = states.get(window.id), area = basicTripText(stop.area) || window.area;
    const familyRest = Boolean(raw?.family_profile) && stop.type === 'logistics' && /休息|午休|午睡|餵奶|換尿布|rest|nap|feeding/iu.test(title);
    const sameAreaRest = familyRest && basicStopIdentity(state.area) === basicStopIdentity(area);
    const travel = stop.fixed_pin ? 30 : sameAreaRest ? Math.min(120, Math.max(0, Number(stop.travel_minutes) || 0))
      : Math.min(120, Math.max(15, Number(stop.travel_minutes) || (state.lastEnd !== null && basicStopIdentity(state.area) === basicStopIdentity(area) ? 15 : 30)));
    const requestedStart = tripTimeMinutes(stop.start_time) ?? tripTimeMinutes(bookingText(stop.title).match(/^(\d{1,2}:\d{2})\b/)?.[1]);
    const requestedEnd = tripTimeMinutes(stop.end_time);
    const typicalDuration = stop.type === 'meal' || familyRest ? 60 : stop.type === 'logistics' ? 20 : /演唱會|concert/iu.test(title) ? 180 : 90;
    const duration = stop.fixed_pin ? stop.fixed_pin.end - stop.fixed_pin.start
      : requestedStart !== null && requestedEnd !== null && requestedEnd > requestedStart ? requestedEnd - requestedStart
        : Math.min(360, Math.max(15, Number(stop.duration_minutes) || typicalDuration));
    let activityStart = stop.fixed_pin ? stop.fixed_pin.start : Math.max(state.cursor + travel, requestedStart ?? (periods[stop.period] ?? state.cursor) + travel);
    let start = activityStart - travel, end = activityStart + duration;
    if (!stop.fixed_pin && reservations.some(pin => pin.window.id === window.id && start < pin.to && end > pin.from)) { omitted++; continue; }
    // 指定的城市／時段放不下就略過，不能搬到下一個城市繼續排原地景點。
    if (end > window.end || start < state.cursor) {
      if (stop.fixed_pin) throw Object.assign(new Error(`第 ${dayIndex} 天「${title}」的固定時間無法銜接，請調整活動或接駁時間。`), { code: 'TRIP_INPUT_CONFLICT' });
      omitted++; continue;
    }
    if (travel > 0) timeline.push(item(tripTimeLabel(start), 'transport', `前往 ${title}`, {
      end_time: tripTimeLabel(activityStart), location_query: `${window.city || ''} ${area} ${title}`.trim(),
      activity_city: window.city || cities[0] || basicTripText(raw?.city), planning_window_id: window.id,
      transport_detail: `${options.transportTips && bookingText(stop.route_suggestion) ? `${basicTripText(stop.route_suggestion, 200)}\n` : ''}接駁概估 ${travel} 分鐘，實際路線請用地圖確認。`,
    }));
    timeline.push(item(tripTimeLabel(activityStart), stop.type === 'logistics' ? 'activity' : stop.type, title, {
      end_time: tripTimeLabel(end), location_query: `${window.city || ''} ${area} ${title}`.trim(),
      activity_city: window.city || cities[0] || basicTripText(raw?.city), planning_window_id: window.id,
      description: options.introductions ? basicTripText(stop.description, 240) : '',
      warnings_tips: `${options.practicalTips && bookingText(stop.tips) ? `${basicTripText(stop.tips, 240)}\n` : ''}${familyRest ? '依孩子狀況彈性調整休息長度；休息、育兒設施與推車通行條件請先確認。' : stop.type === 'logistics' ? '行李寄放服務、預約與營業時間需先向店家或車站確認。' : '營業、票價與交通請於出發前確認。'}${stop.fixed_pin?.end_estimated ? ' 此活動只提供開始時間，停留長度為概估。' : ''}`,
      menu_recommendations: options.dining && stop.type === 'meal' && Array.isArray(stop.menu_recommendations)
        ? stop.menu_recommendations.slice(0, 2).filter(menu => ['local', 'cn', 'price'].every(field => typeof menu?.[field] === 'string')) : [],
      price_level: options.dining && ['Low', 'Mid', 'High'].includes(stop.price_level) ? stop.price_level : '',
      request_ids: Array.isArray(stop.request_ids) ? stop.request_ids.filter(id => typeof id === 'string') : [],
      is_logistics: stop.type === 'logistics', fixed_activity_id: stop.fixed_pin?.id,
      time_estimated: !stop.fixed_pin, end_time_estimated: !stop.fixed_pin || stop.fixed_pin.end_estimated,
    }));
    if (stop.type === 'spot') usedSpots.add(identity);
    state.cursor = end; state.lastEnd = end; state.area = area;
    if (stop.type === 'logistics' && /寄放|寄存|存放|storage|locker/iu.test(title)) state.luggageAt = { title, location: `${window.city || ''} ${area} ${title}`.trim() };
  }
  for (const window of windows.filter(window => window.collectLuggage || states.get(window.id).luggageAt)) {
    const state = states.get(window.id);
    if (state.lastEnd === null) continue;
    const pickup = state.lastEnd + 30;
    timeline.push(item(tripTimeLabel(state.lastEnd), 'transport', state.luggageAt ? `領取行李：${state.luggageAt.title}` : `返回住宿領取行李：${startArea}`, {
      end_time: tripTimeLabel(pickup), location_query: state.luggageAt?.location || rules.start_stay.address || rules.start_stay.name,
      transport_detail: '領取行李與接駁概估 30 分鐘，寄放服務、營業時間與最後領取時間需先確認。',
    }));
    state.lastEnd = pickup; state.cursor = pickup;
  }
  if (rules.end_stay && !hasLeftDestination) {
    const checkIn = rules.required_events.find(event => event.booking_event === 'check_in');
    const afterArrival = Math.max(0, ...transfers.filter(transfer => transfer.kind === 'arrival').map(transfer => transfer.end));
    const finalWindow = windows.at(-1), finalState = finalWindow ? states.get(finalWindow.id) : null;
    const lastEnd = finalState?.lastEnd;
    const hotelMinute = unknownTransport ? null : Math.max(afterArrival, lastEnd !== null && lastEnd !== undefined ? lastEnd + 30 : (rules.start_stay && !afterArrival ? 1080 : 900),
      tripTimeMinutes(checkIn?.earliest_time) ?? 0);
    const time = hotelMinute !== null && hotelMinute < 1440 ? tripTimeLabel(hotelMinute) : '待確認';
    if (lastEnd !== null && lastEnd !== undefined && hotelMinute < 1440) timeline.push(item(tripTimeLabel(Math.max(lastEnd, hotelMinute - 30)), 'transport', `返回住宿地區：${endArea}`, {
      end_time: time, location_query: rules.end_stay.address || rules.end_stay.name, transport_detail: '返回住宿概估 30 分鐘，請依實際位置確認。',
    }));
    timeline.push(item(time, 'hotel', `入住／返回住宿地區：${endArea}`, {
      booking_id: rules.end_stay.booking_id, booking_event: checkIn ? 'check_in' : 'return_to_hotel', location_query: rules.end_stay.address || rules.end_stay.name,
      warnings_tips: '入住時間、晚到安排與行李寄放需向住宿確認。',
    }));
  }
  timeline.sort((a, b) => (tripTimeMinutes(a.time) ?? 1500) - (tripTimeMinutes(b.time) ?? 1500));
  const warnings = ['活動與接駁時間為概估；跨城市交通抵達後，活動改在抵達地安排。'];
  if (unknownTransport) warnings.push('當天交通時間未填完整，先保留交通與住宿，暫不安排景點。');
  if (omitted) warnings.push('重複、過於籠統、城市不符或時間不足的建議已略過。');
  const returnArrival = hasLeftDestination && !windows.length && bookingContext?.transport?.find(record => record.role === 'inbound' && record.arrival_date === date);
  const cities = [...new Set([context.startCity, ...windows.map(window => window.city), context.endCity].filter(Boolean))];
  return { day_index: dayIndex, date, city: cities.join(' → ') || basicTripText(raw?.city) || fallbackArea || '目的地',
    ...(returnArrival ? { city: basicTripCity(returnArrival.arrival_station) || returnArrival.arrival_station || '回程抵達地' } : {}),
    title: basicTripText(raw?.title) || '每日景點與交通規劃',
    weather_forecast: options.seasonalAdvice ? basicTripText(raw?.seasonal_advice, 160) : '',
    clothing_suggestion: options.seasonalAdvice ? basicTripText(raw?.clothing_suggestion, 160) : '',
    timeline, planning_mode: 'basic', generation_source: source, planning_notes: warnings.join(' ') };
}

const FAMILY_TRAVEL_STYLE = '育兒旅遊行程';
const isFamilyTravelStyle = style => bookingText(style).includes(FAMILY_TRAVEL_STYLE);

function getFamilyTravelProfile(data = {}) {
  if (!isFamilyTravelStyle(data.type || data.style)) return null;
  const saved = data.family;
  const count = Number(data.childCount ?? saved?.child_count ?? '');
  if (!Number.isSafeInteger(count) || count < 1) throw Object.assign(new Error('育兒旅遊請填寫小孩人數（至少 1 位）。'), { code: 'TRIP_INPUT_CONFLICT' });
  const text = bookingText(data.childAges ?? (Array.isArray(saved?.ages) ? saved.ages.join('、')
    : Array.isArray(saved?.ages_years) ? saved.ages_years.join('、') : '')).normalize('NFKC').trim();
  const ages = text.split(/[、,，;；/\n]+|(?:和|與|及)/u).map(age => age.trim()).filter(Boolean);
  if (ages.length !== count) throw Object.assign(new Error(`請填寫 ${count} 位小孩各自的年齡，以逗號分隔，例如「3、7」或「6 個月、3 歲」。`), { code: 'TRIP_INPUT_CONFLICT' });
  const agesYears = ages.map(age => {
    const compact = age.replace(/\s+/gu, '');
    const combined = compact.match(/^(\d+)(?:歲|岁|年)(\d+)(?:個|个)?月$/u);
    const simple = compact.match(/^(\d+(?:\.\d+)?)(歲|岁|年|years?|y|(?:個|个)?月|months?|m)?$/iu);
    const years = combined && Number(combined[2]) < 12 ? Number(combined[1]) + Number(combined[2]) / 12
      : !combined && simple ? Number(simple[1]) / (/月|months?|^m$/iu.test(simple[2] || '') ? 12 : 1) : NaN;
    if (!Number.isFinite(years) || years < 0 || years >= 18) throw Object.assign(new Error(`小孩年齡「${age}」格式不正確；請填 0 至未滿 18 歲，嬰兒可填「6 個月」。`), { code: 'TRIP_INPUT_CONFLICT' });
    return Number(years.toFixed(4));
  });
  if (data.travelers !== undefined && (!Number.isSafeInteger(Number(data.travelers)) || Number(data.travelers) < count)) {
    throw Object.assign(new Error('旅遊總人數請包含成人與小孩，且不能少於小孩人數。'), { code: 'TRIP_INPUT_CONFLICT' });
  }
  return { child_count: count, ages, ages_years: agesYears };
}

function getFamilyTravelGuidance(family, adjustment = false) {
  if (!family) return '';
  const youngest = Math.min(...family.ages_years);
  return `FAMILY TRAVEL NEEDS (important): ${adjustment ? 'Apply to changed/new stops only; preserve unmentioned items. ' : 'Plan only 1-2 main visits per ordinary day; never add sights just to fill time. '}
Use every child's age, especially the youngest, to select suitable real named venues and realistic durations. Cluster nearby stops, shorten walks/transfers, allow generous meals, bathroom/snack breaks and an early return when bookings allow it. Prefer interactive indoor/outdoor options suited to these ages; avoid strenuous hikes and adult-oriented venues.
${youngest < 3 ? 'Include flexible feeding/diaper breaks and a timed quiet rest/nap, with easy access back to the lodging area. Prefer stroller-friendly routes and elevators where available; availability must be confirmed.'
  : youngest < 6 ? 'Include a timed midday rest and short play breaks; prefer short walks and routes usable with a stroller when needed. Confirm elevators and stroller access.'
    : 'Balance interactive experiences with breaks; respect different interests and stamina when the children have different ages.'}
Rest/nap is logistics, not a sightseeing attraction. Keep its location specific and allow its full duration. Choose child-appropriate meals and meal times. Never invent childcare, stroller access, child ticket prices, age/height limits or facilities; mark unverified details as requiring confirmation. Preserve fixed bookings/events; reduce optional sightseeing first when family needs cannot all fit.`;
}

function getDayTravelPreferences(itinerary, basicData = {}) {
  const source = itinerary?.travel_preferences || { style: basicData.type, transportMode: basicData.transportMode,
    travelers: basicData.travelers, restaurantBudget: basicData.priceRanges, specialRequests: basicData.specialRequests,
    childCount: basicData.childCount, childAges: basicData.childAges };
  const family = getFamilyTravelProfile(source);
  return { style: source.style, transportMode: source.transportMode, travelers: source.travelers,
    restaurantBudget: source.restaurantBudget, specialRequests: bookingText(source.specialRequests).slice(0, 6000),
    ...(family ? { family } : {}) };
}

function getBasicTripPreferences(baseConstraints, basicPreferences) {
  const fromConstraints = label => baseConstraints.match(new RegExp(`- ${label}: ([^\\n]*)`))?.[1] || '';
  const style = basicTripText(basicPreferences?.style || fromConstraints('Travel Style & Pacing'), 100);
  let savedFamily = null;
  if (isFamilyTravelStyle(style) && fromConstraints('Children')) {
    try { savedFamily = JSON.parse(fromConstraints('Children')); } catch { /* 由下方驗證顯示可修正的輸入提示。 */ }
  }
  const family = getFamilyTravelProfile({ ...basicPreferences, style, family: basicPreferences?.family || savedFamily });
  const requestText = basicPreferences && Object.hasOwn(basicPreferences, 'requests') ? bookingText(basicPreferences.requests)
    : bookingText(baseConstraints.match(/- Special Requests: ([\s\S]*?)(?=\n\s*- [A-Za-z &]+:|$)/)?.[1]);
  return {
    destinations: basicTripText(basicPreferences?.destinations || fromConstraints('Destinations'), 200),
    style,
    transport: basicTripText(basicPreferences?.transport || fromConstraints('Transport Mode'), 80),
    requests: /^(?:none|無|沒有|n\/a)$/iu.test(requestText) ? '' : requestText,
    budget: basicTripText(basicPreferences?.budget || fromConstraints('Restaurant Budget'), 80),
    details: normalizeBasicDetailOptions(basicPreferences?.details),
    fixedActivities: Array.isArray(basicPreferences?.fixedActivities) ? basicPreferences.fixedActivities : [],
    ...(family ? { family, travelers: basicPreferences?.travelers || fromConstraints('Travelers') } : {}),
  };
}

function getBasicTripSchema(dates, options, requests) {
  const stop = { window_id: tripStringSchema(), type: { type: 'string', enum: ['spot', 'meal', 'activity', 'logistics'] },
    title: tripStringSchema(), area: tripStringSchema(), period: { type: 'string', enum: ['morning', 'noon', 'afternoon', 'evening'] },
    start_time: tripStringSchema(), end_time: tripStringSchema(), duration_minutes: { type: 'integer' }, travel_minutes: { type: 'integer' },
    request_ids: { type: 'array', items: tripStringSchema() } };
  if (options.introductions) stop.description = tripStringSchema();
  if (options.transportTips) stop.route_suggestion = tripStringSchema();
  if (options.practicalTips) stop.tips = tripStringSchema();
  if (options.dining) { stop.price_level = { type: 'string', enum: ['Low', 'Mid', 'High'] }; stop.menu_recommendations = { ...TRIP_MENU_SCHEMA, maxItems: 2 }; }
  const day = { day_index: { type: 'integer' }, date: { type: 'string', enum: dates }, city: tripStringSchema(), title: tripStringSchema(),
    stops: { type: 'array', maxItems: 8, items: tripObjectSchema(stop) } };
  if (options.seasonalAdvice) { day.seasonal_advice = tripStringSchema(); day.clothing_suggestion = tripStringSchema(); }
  const root = { days: { type: 'array', minItems: dates.length, maxItems: dates.length, items: tripObjectSchema(day) } };
  if (requests.length) root.request_reports = { type: 'array', items: tripObjectSchema({ id: tripStringSchema(),
    status: { type: 'string', enum: ['scheduled', 'considered', 'needs_confirmation', 'cannot_fit'] }, note: tripStringSchema() }) };
  if (options.cityGuides) root.city_infos = { type: 'array', maxItems: 6, items: tripObjectSchema({ city: tripStringSchema(),
    history_culture: tripStringSchema(), transport_tips: tripStringSchema(), safety_scams: tripStringSchema(), subsidies: tripStringSchema(), tax_refund: tripStringSchema(),
    basic_phrases: { type: 'array', maxItems: 3, items: tripObjectSchema({ label: tripStringSchema(), local: tripStringSchema(), roman: tripStringSchema() }) } }) };
  return tripObjectSchema(root);
}

async function generateBasicTripData({ apiKey, baseConstraints, dateList, bookingContext, basicPreferences, requestOptions = {} }) {
  const preferences = getBasicTripPreferences(baseConstraints, basicPreferences);
  const { requests, pins } = getBasicTripRequests(preferences.requests, dateList, preferences.fixedActivities);
  // 在呼叫 AI 前確認使用者指定的時段有空間，避免把輸入衝突当成服務錯誤重試。
  for (const date of dateList) if (pins.some(pin => pin.date === date)) buildBasicTripDay({ stops: [], fixed_pins: pins.filter(pin => pin.date === date) }, date, dateList.indexOf(date) + 1, bookingContext, preferences.destinations);
  const signature = getTripCheckpointSignature({ baseConstraints, dateList, bookingContext, basicPreferences, modelFamily: 'flash', planningMode: 'basic' });
  const checkpoint = readTripCheckpoint(signature) || { signature, scheduleDays: [], completedDays: [] };
  const saved = new globalThis.Map((checkpoint.completedDays || []).filter(day => day.planning_mode === 'basic'
    && day.generation_source === 'ai' && day.date === dateList[day.day_index - 1] && Array.isArray(day.timeline)).map(day => [day.date, day]));
  const usedSpots = new Set([...saved.values()].flatMap(day => day.timeline.filter(item => item.type === 'spot').map(item => basicStopIdentity(item.title))));
  const days = [];
  const guideData = preferences.details.cityGuides ? { ...checkpoint.city_guides } : {};
  const reports = new globalThis.Map((checkpoint.request_reports || []).map(report => [report.id, report]));
  for (let offset = 0; offset < dateList.length;) {
    throwIfGeminiCancelled(requestOptions.signal);
    if (saved.has(dateList[offset])) { days.push(saved.get(dateList[offset++])); continue; }
    let end = Math.min(offset + 10, dateList.length);
    for (let i = offset + 1; i < end; i++) if (saved.has(dateList[i])) { end = i; break; }
    const dates = dateList.slice(offset, end);
    const contexts = dates.map(date => getBasicTripDayContext(bookingContext, date, preferences.destinations, pins.filter(pin => pin.date === date)));
    const compactDays = dates.map((date, i) => ({ date,
      windows: contexts[i].windows.map(window => ({ id: window.id, from: tripTimeLabel(window.start), to: tripTimeLabel(window.end), city: window.city, base_area: window.area })),
    }));
    const response = await requestGemini(apiKey, 'flash', {
      contents: [{ parts: [{ text: `Plan a BASIC travel itinerary in Traditional Chinese. Output compact JSON only.
Preferences: ${JSON.stringify({ destinations: preferences.destinations, style: preferences.style, transport: preferences.transport, budget: preferences.budget,
  ...(preferences.family ? { travelers: preferences.travelers, family: preferences.family } : {}) })}
${getFamilyTravelGuidance(preferences.family)}
SPECIAL REQUESTS (higher priority than extra sightseeing): ${JSON.stringify(requests)}
FIXED ACTIVITIES (exact dates/start/end; never shorten, move or repeat): ${JSON.stringify(pins.filter(pin => dates.includes(pin.date)).map(pin => ({ ...pin, start: tripTimeLabel(pin.start), end: tripTimeLabel(pin.end) })))}
REQUESTED INFORMATION: ${JSON.stringify(preferences.details)}
Days and local-time CITY WINDOWS: ${JSON.stringify(compactDays)}
Previously visited sights (avoid repeats): ${JSON.stringify([...usedSpots].slice(-90))}
Previous incomplete attempt: ${checkpoint.last_issue || 'None'}
Return exactly these dates, indexed ${offset + 1}-${end}. Each day: day_index, date, city, title, stops.
${preferences.family ? 'A family full day needs only 1-2 REAL NAMED sights, age-appropriate meals and breaks; do not force sightseeing into every city window.' : 'An ordinary full day needs 2-3 REAL NAMED sights and 1-2 meals;'} at most 8 stops. Concert/reservation days prioritize the actual event and need fewer extra sights.
Each stop: window_id from THAT date, type (spot/meal/activity/logistics), specific title WITHOUT clock text, nearby area, period, start_time/end_time (HH:mm or empty), duration_minutes, travel_minutes from the preceding area and request_ids.
Give useful planned times and appropriate duration: meals 45-90 min, luggage 15-30 min, sights 45-120 min; concerts must retain the full requested duration, not become 90-min sightseeing. Sort by city window and time.
Include each fixed activity with its request ID; exact user times take precedence. Allow 30 minutes of travel before fixed activities. Plan optional stops around them, not over them.
Every stop MUST stay in that window's city. A rail arrival changes the activity city immediately. Do not reuse the departure hotel's area after arrival.
Cluster each day's stops in one or two nearby districts. Allow 30 minutes from the base, 15-30 minutes between nearby stops, and 45-60 minutes for distant districts. Respect requested pace and restaurant budget; do not fill an event day with unnecessary sights.
The app reserves airport/station connections and hotel/luggage return time. Fit stops entirely inside windows; use [] when none are usable.
Sight titles must name actual attractions, markets, museums or shopping streets. NEVER use generic walks, free time, nearby sights, hotel-area sightseeing or choose-it-yourself placeholders.
Meal titles should name a restaurant or a specific district AND food suggestion. Avoid duplicate attractions across the trip.
Luggage handling is logistics, not a sight. Do not assume a convenience store has luggage storage; mark service availability as unconfirmed. Once luggage is stored at a station, collect it there rather than returning to the old hotel.
${preferences.family ? 'For rest/nap/feeding use type:logistics, a specific area in the title, explicit start_time/end_time and adequate duration_minutes. Use travel_minutes:0 when staying in the preceding stop\'s area; do not count a rest break as an attraction.' : ''}
If introductions=true, each visit needs a useful 40-90 character description of its highlights or why it suits this day. If transportTips=true, give a short route_suggestion from the preceding area; label routes as suggestions, no invented live schedules.
If practicalTips=true, add brief tickets/reservation/storage tips. If dining=true, meals may include at most 2 menu_recommendations (local/cn/estimated price) and price_level. Omit unselected fields.
If seasonalAdvice=true, add seasonal_advice and clothing_suggestion explicitly labeled seasonal estimates, not real-time weather. If cityGuides=true, return short city_infos only for cities in this batch, with at most 3 basic_phrases each.
For every special request, return request_reports with its id, status (scheduled/considered/needs_confirmation/cannot_fit) and a brief honest note. scheduled requires matching request_ids on the actual stop. Never claim all requests fulfilled when dates, times or services are unknown.
Do not output booking IDs, exchange rates, unrequested long guides or full hotel addresses.
The app preserves original booked flight/train codes and times; you only select meaningful local visits.` }] }],
      generationConfig: { responseMimeType: 'application/json', maxOutputTokens: Object.values(preferences.details).filter(Boolean).length > 2 ? 24576 : 16384,
        responseJsonSchema: getBasicTripSchema(dates, preferences.details, requests),
      },
    }, requestOptions);
    const incomplete = message => { checkpoint.last_issue = message; writeTripCheckpoint(checkpoint); return tripShapeError(message); };
    let parsed;
    try { parsed = JSON.parse(cleanJsonResult(getGeminiText(response))); }
    catch { throw incomplete('AI 回覆尚未形成有效的景點資料，已保留輸入與完成的部分。'); }
    if (!Array.isArray(parsed?.days) || parsed.days.length !== dates.length) throw incomplete('AI 行程日期尚未完整，正在保留已完成資料。');
    const byDate = new globalThis.Map(parsed.days.map(day => [day.date, day]));
    if (byDate.size !== dates.length) throw incomplete('AI 行程日期重複，尚未完成有效規劃。');
    // 同一份回覆中的選填資訊也要保存，補生成其他日期時不必重新索取。
    if (preferences.details.cityGuides && Array.isArray(parsed.city_infos)) for (const guide of parsed.city_infos) {
      if (bookingText(guide?.city) && ['history_culture', 'transport_tips', 'safety_scams', 'subsidies', 'tax_refund'].every(field => typeof guide[field] === 'string') && Array.isArray(guide.basic_phrases)) guideData[guide.city] = guide;
    }
    if (Array.isArray(parsed.request_reports)) for (const report of parsed.request_reports) if (requests.some(request => request.id === report?.id)) {
      if (reports.get(report.id)?.status !== 'scheduled') reports.set(report.id, report);
    }
    checkpoint.city_guides = guideData; checkpoint.request_reports = [...reports.values()];
    for (let i = 0; i < dates.length; i++) {
      const raw = byDate.get(dates[i]);
      if (raw?.day_index !== offset + i + 1 || !Array.isArray(raw.stops)) throw incomplete('AI 景點資料尚未完整。');
      const context = contexts[i];
      const day = buildBasicTripDay({ ...raw, detail_options: preferences.details, family_profile: preferences.family,
        fixed_pins: pins.filter(pin => pin.date === dates[i]) }, dates[i], offset + i + 1, bookingContext, preferences.destinations, 'ai', usedSpots);
      const available = context.windows.reduce((total, window) => total + window.end - window.start, 0);
      const hasLongActivity = day.timeline.some(item => item.type === 'activity' && !item.is_logistics && tripTimeMinutes(item.end_time) - tripTimeMinutes(item.time) >= 120);
      const minimumSights = hasLongActivity ? 1 : preferences.family ? (context.windows.some(window => window.end - window.start >= 150) ? 1 : 0)
        : available >= 420 ? 2 : context.windows.some(window => window.end - window.start >= 150) ? 1 : 0;
      if (day.timeline.filter(item => item.type === 'spot' || item.type === 'activity' && !item.is_logistics).length < minimumSights) {
        throw incomplete(`第 ${day.day_index} 天缺少符合城市與可用時間的具名景點或指定活動，AI 尚未完成有效規劃。`);
      }
      for (const window of context.windows) if (!preferences.family && window.end - window.start >= 150
          && !day.timeline.some(item => (item.type === 'spot' || item.type === 'activity' && !item.is_logistics) && item.planning_window_id === window.id)) {
        throw incomplete(`第 ${day.day_index} 天的 ${window.city || window.area || '可用時段'} 尚未安排有效景點或指定活動。`);
      }
      if (preferences.details.introductions && day.timeline.some(item => ['spot', 'meal', 'activity'].includes(item.type) && !item.is_logistics && !item.fixed_activity_id && !bookingText(item.description))) {
        throw incomplete(`第 ${day.day_index} 天尚未完成你選擇的景點簡短介紹。`);
      }
      days.push(day); saved.set(day.date, day);
      checkpoint.scheduleDays = [...saved.values()]; checkpoint.completedDays = [...saved.values()];
      writeTripCheckpoint(checkpoint);
    }
    checkpoint.city_guides = guideData; checkpoint.request_reports = [...reports.values()]; checkpoint.last_issue = '';
    writeTripCheckpoint(checkpoint);
    offset = end;
  }
  clearTripCheckpoint();
  const requestReports = requests.map(request => {
    const report = reports.get(request.id);
    const scheduled = days.some(day => day.timeline.some(item => item.request_ids?.includes(request.id)));
    return { ...request, status: scheduled ? 'scheduled' : ['considered', 'needs_confirmation', 'cannot_fit'].includes(report?.status) ? report.status : 'needs_confirmation',
      note: scheduled ? bookingText(report?.note) || '已依日期與時段納入行程。' : report?.status === 'scheduled'
        ? '時間表中未找到對應安排，請確認此需求。' : bookingText(report?.note) || 'AI 未提供可核對的安排，請確認此需求。' };
  });
  return { planning_mode: 'basic',
    trip_summary: `免費簡易行程：${preferences.destinations || '旅遊目的地'}。保留具名景點，依已填交通時間與住宿地區安排每日路線。`,
    currency_rate: '簡易模式未查詢匯率；記帳預設台幣，可自行調整', currency_rate_val: 1, currency_code: 'TWD',
    city_guides: guideData, detail_options: preferences.details, request_reports: requestReports, days, ...(bookingContext ? { booking_context: bookingContext } : {}) };
}

async function generateTripData({ apiKey, modelFamily, baseConstraints, dateList, batchSize = 4, bookingContext = null, basicPreferences = null, requestOptions = {} }) {
  if (getGeminiCache(apiKey).policy.mode === 'free') return generateBasicTripData({ apiKey, baseConstraints, dateList, bookingContext, basicPreferences, requestOptions });
  const totalDays = dateList.length;
  const effectiveBatchSize = Math.max(1, Math.floor(batchSize));
  const planningFamily = modelFamily === 'lite' ? 'flash' : modelFamily;
  const freeMode = getGeminiCache(apiKey).policy.mode === 'free';
  const detailFamily = freeMode ? 'lite' : planningFamily;
  const checkpointSignature = getTripCheckpointSignature({ baseConstraints, dateList, bookingContext, modelFamily: planningFamily });
  const checkpoint = readTripCheckpoint(checkpointSignature) || { signature: checkpointSignature, scheduleDays: [], completedDays: [] };
  const bookingDays = new globalThis.Map((bookingContext?.days || []).map(day => [day.date, day]));
  const scheduleFirst = freeMode || bookingContext?.days.some(day => day.required_events.length || day.blocked_intervals.length);
  const constraints = `${baseConstraints}\n${getTripBookingSummary(bookingContext)}`;
  const summaryConstraints = `${constraints}\n${bookingContext?.assumptions?.length
    ? `PLANNING ASSUMPTIONS: ${JSON.stringify(bookingContext.assumptions)}. Disclose these in trip_summary; do not claim live confirmation.` : ''}`;
  const dayRules = dates => bookingContext ? `
    AUTHORITATIVE BOOKINGS FOR THIS CHUNK: ${JSON.stringify(getTripPromptBookings(bookingContext, dates))}
    - Daily start_stay/end_stay refer to stays by booking_id. Start at the previous night's hotel; finish at the booked overnight hotel. Nights are [check_in_date, check_out_date); never replace a booking.
    - Include each required_event exactly once with its exact booking_id, booking_event, type and known time. Preserve flight/train codes in title/transport_detail, hotel names in title and full original station/address in location_query.
    - Respect blocked_intervals, including cross-midnight buffers. Only terminal meals/waiting/transfers may occupy terminal_windows, with at_terminal:true, matching booking_id and actual terminal location.
    - Times are local. Unknown transport time is "待確認" with a warning; never invent endpoints, timetables or confirmed hotel policies. Respect check-in earliest_time and checkout latest_time; disclose planning defaults.
    - Add realistic airport/station/hotel transfers and luggage time. For hotel changes include checkout, luggage and travel. Late arrival means transfer/nearby food/rest; early departure means checkout/terminal transfer. Group nearby sights and avoid infeasible detours.
    - Before check-in, luggage drop is a separate transport item. After check-in outings require a final return_to_hotel. On checkout day, any earlier sightseeing needs leave_hotel and a feasible return for checkout; luggage return is not another overnight stay. Midnight departures may require checkout the previous evening, without changing reservation dates.
    - Sort the timeline by local HH:mm. Meals, activities, spots and transfers need end_time, with no overlapping intervals or extension into blocked time. Booking markers are point events; do not add overnight end_time within one date.
  ` : '';
  const guideFields = ['history_culture', 'transport_tips', 'safety_scams', 'subsidies', 'tax_refund', 'basic_phrases'];
  const itemFields = ['time', 'type', 'title', 'description', 'location_query', 'transport_detail', 'price_level', 'warnings_tips', 'menu_recommendations'];
  const guideSchema = '{"history_culture":"...","transport_tips":"...","safety_scams":"...","subsidies":"...","tax_refund":"...","basic_phrases":[{"label":"...","local":"...","roman":"..."}]}';
  const itemSchema = '{"time":"10:00","type":"spot","title":"...","description":"...","location_query":"...","transport_detail":"...","price_level":"Mid","warnings_tips":"...","menu_recommendations":[{"local":"...","cn":"...","price":"..."}]}';
  const isRecord = value => value !== null && typeof value === 'object' && !Array.isArray(value);
  const hasFields = (value, fields) => isRecord(value) && fields.every(field => Object.hasOwn(value, field));
  const isGuide = value => hasFields(value, guideFields) && Array.isArray(value.basic_phrases);
  const isItem = value => hasFields(value, itemFields) && itemFields.filter(field => field !== 'menu_recommendations').every(field => typeof value[field] === 'string')
    && ['transport', 'activity', 'meal', 'hotel', 'flight', 'spot'].includes(value.type)
    && ['Low', 'Mid', 'High'].includes(value.price_level) && Array.isArray(value.menu_recommendations)
    && value.menu_recommendations.every(menu => isRecord(menu) && ['local', 'cn', 'price'].every(field => typeof menu[field] === 'string'));

  const fetchTripJson = async (prompt, schema = null, taskFamily = planningFamily) => {
    const response = await requestGemini(apiKey, taskFamily, {
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { responseMimeType: 'application/json', maxOutputTokens: schema || taskFamily === 'lite' ? 8192 : GEMINI_TRIP_OUTPUT_TOKENS,
        ...(schema ? { responseJsonSchema: schema } : {}),
      },
    }, requestOptions);
    try {
      const parsed = JSON.parse(cleanJsonResult(getGeminiText(response)));
      if (!isRecord(parsed)) throw new Error('Expected a JSON object.');
      return parsed;
    } catch (error) {
      if (error.code === 'GEMINI_OUTPUT_TRUNCATED') throw error;
      throw Object.assign(new Error('AI 行程資料格式不完整。'), { code: 'GEMINI_TRIP_JSON' });
    }
  };

  const baseRequirements = `
    "trip_summary": Overall trip summary.
    "currency_rate": String (e.g. "1 JPY ≈ 0.21 TWD").
    "currency_rate_val": Number (e.g. 0.21).
    "currency_code": String (e.g. "JPY").
  `;
  const validBase = data => hasFields(data, ['trip_summary', 'currency_rate', 'currency_rate_val', 'currency_code']);
  let baseData = checkpoint.baseData;
  if (!validBase(baseData) || !isRecord(baseData?.city_guides) || !Object.keys(baseData.city_guides).length || !Object.values(baseData.city_guides).every(isGuide)) {
    try {
      baseData = await fetchTripJson(`You are an expert AI Travel Planner. Generate the base trip info. Respond with valid JSON only.
        ${summaryConstraints}
        Requirements: ${baseRequirements}
        "city_guides": An object with one entry for EVERY unique major city visited. Each guide must include all these fields: ${guideSchema}.
        Provide exactly 5 basic phrases per city. Keep all history, transport, safety, subsidies and tax-refund details.
        Output: {"trip_summary":"...","currency_rate":"...","currency_rate_val":0.21,"currency_code":"JPY","city_guides":{"CityA":${guideSchema}}}`, null, detailFamily);
      if (!validBase(baseData) || !isRecord(baseData.city_guides) || !Object.keys(baseData.city_guides).length || !Object.values(baseData.city_guides).every(isGuide)) {
        throw tripShapeError('城市指南資料不完整。');
      }
    } catch (error) {
      if (!canSplitTripOutput(error)) throw error;
      // 城市多時先產生摘要與城市清單，再逐城市取得完整指南，不刪減指南內容。
      const core = await fetchTripJson(`You are an expert AI Travel Planner. Generate the trip summary, currency and guide-city list ONLY. Respond with valid JSON only.
        ${summaryConstraints}
        Requirements: ${baseRequirements}
        "guide_cities": An array of EVERY unique major city actually visited. Do not omit any destination.
        Output: {"trip_summary":"...","currency_rate":"...","currency_rate_val":0.21,"currency_code":"JPY","guide_cities":["CityA","CityB"]}`, null, detailFamily);
      if (!validBase(core) || !Array.isArray(core.guide_cities) || !core.guide_cities.length || !core.guide_cities.every(city => typeof city === 'string' && city.trim())) {
        throw tripShapeError('AI 未提供完整的旅遊城市清單，請稍後重試。');
      }
      const { guide_cities: guideCities, ...summary } = core;
      const cityGuides = {};
      for (const city of [...new Set(guideCities.map(value => value.trim()))]) {
        const guide = await fetchTripJson(`Generate the complete travel city guide for "${city}". Respond with one valid JSON object only.
          ${constraints}
          Include history, transport and ticketing, safety/scams, travel subsidies, tax refunds and exactly 5 local phrases.
          Required output fields: ${guideSchema}. Do not wrap it in city_guides or remove any field.`, null, detailFamily);
        if (!isGuide(guide)) throw tripShapeError(`「${city}」的城市指南資料不完整，請稍後重試。`);
        cityGuides[city] = guide;
      }
      baseData = { ...summary, city_guides: cityGuides };
    }
  }
  checkpoint.baseData = baseData;
  writeTripCheckpoint(checkpoint);

  function validateDays(data, dates, startDayIdx, fullItems = true) {
    if (!Array.isArray(data?.days) || data.days.length !== dates.length) throw tripShapeError('AI 回傳的行程天數不完整。');
    const byIndex = new globalThis.Map(data.days.map(day => [Number(day?.day_index), day]));
    if (byIndex.size !== dates.length) throw tripShapeError('AI 回傳了重複的行程日期。');
    return dates.map((date, offset) => {
      const index = startDayIdx + offset;
      const day = byIndex.get(index);
      const dayFields = ['day_index', 'date', 'city', 'title', 'timeline', ...(fullItems ? ['weather_forecast', 'clothing_suggestion'] : [])];
      if (!hasFields(day, dayFields) || !Array.isArray(day.timeline)
        || !['city', 'title', ...(fullItems ? ['weather_forecast', 'clothing_suggestion'] : [])].every(field => typeof day[field] === 'string')) {
        throw tripShapeError(`第 ${index} 天的行程資料不完整。`);
      }
      if (/^\d{4}-\d{2}-\d{2}$/.test(date) && day.date !== date) throw tripShapeError(`第 ${index} 天的日期不正確。`);
      const validItem = fullItems ? isItem : item => hasFields(item, ['time', 'type', 'title'])
        && ['time', 'type', 'title'].every(field => typeof item[field] === 'string');
      if (!day.timeline.every(validItem)) throw tripShapeError(`第 ${index} 天的景點資料不完整。`);
      return { ...day, day_index: index, date };
    });
  }

  const bookingError = (day, rules, conflicts) => {
    const eventLabels = { terminal_arrival: '到機場／車站報到', arrival: '抵達', departure: '出發', check_in: '入住', check_out: '退房', leave_hotel: '從住宿出發', return_to_hotel: '返回住宿', end_time: '結束時間' };
    const readable = conflicts.slice(0, 2).map(message => {
      let value = message;
      for (const event of rules.required_events) value = value.replaceAll(event.booking_id, event.name || event.code || event.station || '交通班次');
      for (const [field, label] of Object.entries(eventLabels)) value = value.replaceAll(field, label);
      return value;
    });
    return Object.assign(new Error(`第 ${day.day_index} 天仍與已訂交通／住宿衝突：${readable.join(' ')}`), { code: 'GEMINI_TRIP_BOOKING' });
  };

  const verifyBookedDays = async days => {
    const verified = [];
    for (const original of days) {
      const rules = bookingDays.get(original.date);
      let day = protectTripBookingDay(original, rules);
      let conflicts = findTripBookingConflicts(day, rules);
      for (let attempt = 0; conflicts.length && attempt < 2; attempt++) {
        try {
          // 修復只處理時間表，避免同時輸出菜單與長篇景點介紹而再次漏欄位。
          const repaired = await fetchTripJson(`Repair ONLY Day ${day.day_index} on "${day.date}" to respect the user's fixed transport and hotel bookings.
            ${constraints}
            ${dayRules([day.date])}
            Conflicts to correct: ${JSON.stringify(conflicts)}
            Current schedule: ${JSON.stringify(getTripScheduleProjection(day))}
            Return the COMPLETE single-day schedule under "days". Each stop needs time, type, title, location_query and transport_detail.
            Add end_time for all meals, activities and transfers. Preserve exact booking_id and booking_event.
            Include the journey back to the booked hotel and return_to_hotel after any post-check-in outings, with enough travel time.
            Move/reorder stops into feasible windows and keep needed meals/transfers. Do not change reservations or invent traffic, timetable or hotel-policy confirmations.
            Output schedule ONLY; descriptions, menus, weather and clothing will be filled separately. Do not leave unfinished JSON.
            ${attempt ? 'The previous repair was invalid. Correct every listed conflict before responding.' : ''}`, getTripScheduleSchema([day.date]));
          day = protectTripBookingDay(validateDays(repaired, [day.date], day.day_index, false)[0], rules);
          conflicts = findTripBookingConflicts(day, rules);
        } catch (error) {
          if (!canSplitTripOutput(error) || attempt === 1) throw error;
        }
      }
      if (conflicts.length) throw bookingError(day, rules, conflicts);
      verified.push(day);
    }
    return verified;
  };

  const completeTripDay = async (skeleton, previousContext, forceItems = false) => {
    let day = { ...skeleton, timeline: skeleton.timeline.map(item => ({ ...item })) };
    const weatherReady = () => typeof day.weather_forecast === 'string' && typeof day.clothing_suggestion === 'string';
    const missingIndices = () => day.timeline.flatMap((item, index) => isItem(item) ? [] : [index]);
    if (!missingIndices().length && weatherReady()) return day;
    // 通常一次補齊當天文字；只在格式錯誤／截斷時，把尚未完成的項目逐一補齊。
    if (!forceItems) {
      const indices = missingIndices();
      try {
        const details = await fetchTripJson(`Complete details ONLY for Day ${day.day_index} in "${day.city}" on "${day.date}".
          ${constraints}
          ${dayRules([day.date])}
          LOCKED SCHEDULE: ${JSON.stringify(getTripScheduleProjection(day))}
          Previous context: "${previousContext}"
          Required item indices: ${JSON.stringify(indices)} (zero-based).
          Keep the schedule fixed. Return weather_forecast, clothing_suggestion and "items" with exactly one detail object per requested item_index.
          Each item needs description, location_query, transport_detail, price_level, warnings_tips and menu_recommendations with local/cn/price.
          Preserve all original features, including menu recommendations, driving/parking or public-transport advice when requested. Use [] for non-food items.
          Do not change times, titles, stops, booking references or locations. Distinguish travel/weather estimates from live confirmation.`,
        tripObjectSchema({ weather_forecast: tripStringSchema(), clothing_suggestion: tripStringSchema(),
          items: { type: 'array', minItems: indices.length, maxItems: indices.length,
            items: tripObjectSchema({ item_index: { type: 'integer' }, ...TRIP_DETAILS_SCHEMA }) },
        }), detailFamily);
        if (typeof details.weather_forecast === 'string') day.weather_forecast = details.weather_forecast;
        if (typeof details.clothing_suggestion === 'string') day.clothing_suggestion = details.clothing_suggestion;
        if (!Array.isArray(details.items)) throw tripShapeError('當天的景點補充資料不完整。');
        const counts = new globalThis.Map();
        for (const detailsItem of details.items) if (Number.isInteger(detailsItem?.item_index)) counts.set(detailsItem.item_index, (counts.get(detailsItem.item_index) || 0) + 1);
        for (const detailsItem of details.items) {
          const index = detailsItem?.item_index;
          if (!indices.includes(index) || counts.get(index) !== 1) continue;
          const completed = mergeTripItemDetails(day.timeline[index], detailsItem);
          if (isItem(completed)) day.timeline[index] = completed;
        }
      } catch (error) {
        if (!canSplitTripOutput(error)) throw error;
      }
    }
    for (const index of missingIndices()) {
      const item = day.timeline[index];
      let completed;
      for (let attempt = 0; attempt < 2; attempt++) {
        try {
          const details = await fetchTripJson(`Complete ONE itinerary item for Day ${day.day_index} in "${day.city}" on "${day.date}". Respond with one valid JSON object only.
            ${constraints}
            ${dayRules([day.date])}
            Previous day context: "${previousContext}"
            Full schedule: ${JSON.stringify(getTripScheduleProjection(day).timeline)}
            Target item: ${JSON.stringify(item)}
            Include complete description, Google Maps query, transport details, price level, warnings and menu recommendations.
            Required fields: ${itemSchema}. Use [] for menu_recommendations when there is no food.
            Keep the supplied schedule and original bookings. Do not wrap in days or timeline.`,
          tripObjectSchema({ time: tripStringSchema(), type: tripStringSchema(), title: tripStringSchema(), ...TRIP_DETAILS_SCHEMA }), detailFamily);
          completed = mergeTripItemDetails(item, details);
          if (!isItem(completed)) throw tripShapeError(`「${item.title}」的景點資料不完整。`);
          break;
        } catch (error) {
          if (!canSplitTripOutput(error) || attempt === 1) throw error;
        }
      }
      day.timeline[index] = completed;
    }
    if (!weatherReady()) {
      const weather = await fetchTripJson(`Complete weather_forecast and clothing_suggestion ONLY for "${day.city}" on "${day.date}".
        ${constraints}
        ${dayRules([day.date])}
        Describe seasonal expectations as estimates when a live forecast is unavailable. Respond with valid JSON.`,
      tripObjectSchema({ weather_forecast: tripStringSchema(), clothing_suggestion: tripStringSchema() }), detailFamily);
      if (typeof weather.weather_forecast !== 'string' || typeof weather.clothing_suggestion !== 'string') throw tripShapeError(`第 ${day.day_index} 天的天氣與穿著資料不完整。`);
      day = { ...day, weather_forecast: weather.weather_forecast, clothing_suggestion: weather.clothing_suggestion };
    }
    const rules = bookingDays.get(day.date);
    day = protectTripBookingDay(day, rules);
    validateDays({ days: [day] }, [day.date], day.day_index);
    const conflicts = findTripBookingConflicts(day, rules);
    if (conflicts.length) throw bookingError(day, rules, conflicts);
    return day;
  };

  const generateSingleDayByItem = async (date, dayIndex, previousContext) => {
    const skeleton = await fetchTripJson(`Plan ONLY Day ${dayIndex} on "${date}". Return a valid JSON object with one day under "days".
      ${constraints}
      ${dayRules([date])}
      Previous Context: "${previousContext}"
      Plan the COMPLETE schedule with the original travel pace, all needed meals, transport, flights and accommodation.
      Each item needs time, type, title, location_query and transport_detail; details will be filled separately.
      Also retain end_time, booking_id, booking_event and at_terminal when applicable.
      Include travel back to the booked hotel after the final outing. Do not omit stops to fit the response.
      Output schedule ONLY, with day_index, date, city, title and timeline.`, getTripScheduleSchema([date]));
    const day = (await verifyBookedDays(validateDays(skeleton, [date], dayIndex, false)))[0];
    return scheduleFirst ? [day] : [await completeTripDay(day, previousContext, true)];
  };

  const generateDays = async (dates, startDayIdx, previousContext) => {
    const endDayIdx = startDayIdx + dates.length - 1;
    try {
      if (scheduleFirst) {
        const skeleton = await fetchTripJson(`You are an expert AI Travel Planner. Plan a schedule skeleton ONLY for a portion of a ${totalDays}-day trip.
          ${constraints}
          ${dayRules(dates)}
          We are CURRENTLY generating Day ${startDayIdx} to Day ${endDayIdx}.
          Specific Dates for this chunk: ${dates.join(', ')}.
          Previous Context: "${previousContext}"
          Output exactly ${dates.length} days under "days", indexed ${startDayIdx} to ${endDayIdx}.
          Include ALL needed spots, meals, transfers and booked events at the original travel pace. Group nearby places into a feasible route.
          Each stop needs time, type, title, precise location_query and a brief transport_detail. Add end_time for stops and transfers.
          Add exact booking_id and booking_event to reservation markers, and at_terminal for terminal activities.
          On a hotel day, include the route back and return_to_hotel after the final outing. Keep sufficient travel time.
          An entirely blocked travel day may have an empty timeline when no local event is due; explain it in the day title.
          Do not add descriptions, menus, weather or clothing yet; those will be completed after the schedule passes validation.`, getTripScheduleSchema(dates));
        return await verifyBookedDays(validateDays(skeleton, dates, startDayIdx, false));
      }
      const data = await fetchTripJson(`You are an expert AI Travel Planner. Generate a portion of a ${totalDays}-day trip.
        ${constraints}
        ${dayRules(dates)}
        We are CURRENTLY generating Day ${startDayIdx} to Day ${endDayIdx}.
        Specific Dates for this chunk: ${dates.join(', ')}.
        Previous Context (Where the user ended up before this chunk): "${previousContext}"
        Requirements:
        1. ONLY output an array of day objects under "days". Include exactly ${dates.length} days, indexed ${startDayIdx} to ${endDayIdx}. Do not skip or duplicate any date.
        2. Keep all original travel details: weather_forecast, clothing_suggestion, meals, activities, flights, hotels, transport, warnings and menu recommendations.
        3. Timeline type must be transport|activity|meal|hotel|flight|spot; price_level must be Low|Mid|High. Required item fields: ${itemSchema}.
        4. For each fixed booking event add its booking_id and booking_event. For normal stops/transfers add end_time. Follow daily route/time rules even when this chunk begins midway through a hotel stay or ends before a booked flight.
        Output: {"days":[{"day_index":${startDayIdx},"date":"${dates[0]}","city":"City Name","title":"Daily Theme","weather_forecast":"...","clothing_suggestion":"...","timeline":[${itemSchema}]}]}`);
      return await verifyBookedDays(validateDays(data, dates, startDayIdx));
    } catch (error) {
      if (!canSplitTripOutput(error)) throw error; // 配額、Key、網路錯誤照實回報，不連續重送。
      if (dates.length === 1) return generateSingleDayByItem(dates[0], startDayIdx, previousContext);
      const middle = Math.ceil(dates.length / 2);
      const left = await generateDays(dates.slice(0, middle), startDayIdx, previousContext);
      const right = await generateDays(dates.slice(middle), startDayIdx + middle, getTripContinuation(left, previousContext));
      return [...left, ...right];
    }
  };

  const restoreDays = (values, fullItems) => {
    const restored = new globalThis.Map();
    for (const value of Array.isArray(values) ? values : []) {
      const index = dateList.indexOf(value?.date);
      if (index < 0 || value.day_index !== index + 1) continue;
      try {
        const day = protectTripBookingDay(validateDays({ days: [value] }, [value.date], index + 1, fullItems)[0], bookingDays.get(value.date));
        if (!findTripBookingConflicts(day, bookingDays.get(value.date)).length) restored.set(value.date, day);
      } catch { /* 未驗證成功的日期重新生成。 */ }
    }
    return restored;
  };
  const savedSchedules = restoreDays(checkpoint.scheduleDays, false);
  const savedCompleted = restoreDays(checkpoint.completedDays, true);
  const scheduleDays = [];
  let previousContext = 'Trip is just starting. Start from the arrival flight or airport if applicable.';
  for (let offset = 0; offset < totalDays;) {
    const saved = savedCompleted.get(dateList[offset]) || savedSchedules.get(dateList[offset]);
    if (saved) {
      scheduleDays.push(saved);
      previousContext = getTripContinuation([saved], previousContext);
      offset++;
      continue;
    }
    let end = Math.min(offset + effectiveBatchSize, totalDays);
    for (let i = offset + 1; i < end; i++) if (savedCompleted.has(dateList[i]) || savedSchedules.has(dateList[i])) { end = i; break; }
    const chunk = await generateDays(dateList.slice(offset, end), offset + 1, previousContext);
    scheduleDays.push(...chunk);
    chunk.forEach(day => savedSchedules.set(day.date, day));
    checkpoint.scheduleDays = Array.from(savedSchedules.values());
    writeTripCheckpoint(checkpoint);
    previousContext = getTripContinuation(chunk, previousContext);
    offset = end;
  }
  const days = [];
  previousContext = 'Trip is just starting.';
  for (const schedule of scheduleDays) {
    const day = savedCompleted.get(schedule.date) || await completeTripDay(schedule, previousContext);
    days.push(day);
    savedCompleted.set(day.date, day);
    checkpoint.completedDays = Array.from(savedCompleted.values());
    writeTripCheckpoint(checkpoint);
    previousContext = getTripContinuation([day], previousContext);
  }
  if (days.length !== totalDays) throw tripShapeError('行程天數不完整，請稍後重試。');
  clearTripCheckpoint();
  return { ...baseData, days, ...(bookingContext ? { booking_context: bookingContext } : {}) };
}

// --- 單日微調：AI 回傳局部修改，程式合併、保留個人資料並驗證訂單 ---
const DAY_ADJUSTMENT_FIELDS = ['time', 'end_time', 'type', 'title', 'description', 'location_query', 'transport_detail',
  'price_level', 'warnings_tips', 'menu_recommendations', 'booking_id', 'booking_event', 'at_terminal'];
const dayAdjustmentError = message => Object.assign(new Error(message), { code: 'GEMINI_DAY_ADJUSTMENT' });

function getDayAdjustmentLocks(item, rules) {
  const event = rules?.required_events?.find(event => event.booking_id === item.booking_id && event.booking_event === item.booking_event)
    || rules?.required_events?.find(event => event.code && event.type === item.type && event.time === item.time
      && bookingText(`${item.title} ${item.transport_detail}`).toLowerCase().includes(event.code.toLowerCase()));
  const booked = Boolean(event || item.booking_id && item.booking_event) || ['flight', 'hotel'].includes(item.type);
  const fields = booked ? ['type', 'title', 'location_query', 'booking_id', 'booking_event'] : [];
  if (item.type === 'flight' || event?.time || booked && item.time === '待確認') fields.push('time', 'end_time');
  if (item.fixed_activity_id) fields.push('time', 'end_time', 'type', 'title', 'location_query');
  return { cannot_remove: booked || Boolean(item.fixed_activity_id), fields: [...new Set(fields)] };
}

function getDayAdjustmentSchema(day) {
  const fields = Object.fromEntries(DAY_ADJUSTMENT_FIELDS.filter(field => !['menu_recommendations', 'at_terminal', 'type'].includes(field))
    .map(field => [field, tripStringSchema()]));
  fields.type = { type: 'string', enum: ['spot', 'activity', 'meal', 'shopping', 'transport', 'hotel', 'flight'] };
  fields.at_terminal = { type: 'boolean' };
  fields.menu_recommendations = { ...TRIP_MENU_SCHEMA, maxItems: 3 };
  return tripObjectSchema({
    day_index: { type: 'integer' }, date: { type: 'string', enum: [day.date] }, summary: tripStringSchema(),
    title: tripStringSchema(),
    changes: { type: 'array', maxItems: 30, items: tripObjectSchema({
      action: { type: 'string', enum: ['update', 'remove', 'add'] }, item_id: tripStringSchema(), fields: tripObjectSchema(fields, []),
    }, ['action', 'item_id']) },
  }, ['day_index', 'date', 'summary', 'changes']);
}

function applyDayAdjustment(day, patch, bookingContext) {
  if (patch?.day_index !== day.day_index || patch?.date !== day.date || !Array.isArray(patch.changes)
      || patch.changes.length > 30 || typeof patch.summary !== 'string' || !patch.summary.trim()) {
    throw dayAdjustmentError('AI 未回傳完整的單日修改內容，原行程已保留。');
  }
  if (Object.keys(patch).some(key => !['day_index', 'date', 'summary', 'title', 'changes'].includes(key))) {
    throw dayAdjustmentError('AI 試圖修改單日以外的資料，原行程已保留。');
  }
  const rules = bookingContext?.days?.find(value => value.date === day.date);
  const entries = day.timeline.map((item, index) => ({ id: `item-${index + 1}`, originalIndex: index, item, changed: false }));
  const touched = new Set();
  for (const change of patch.changes) {
    if (!change || typeof change.item_id !== 'string' || touched.has(change.item_id)
        || !['update', 'remove', 'add'].includes(change.action)) throw dayAdjustmentError('AI 的修改項目重複或無法辨識，原行程已保留。');
    touched.add(change.item_id);
    const index = entries.findIndex(entry => entry.id === change.item_id);
    const current = entries[index];
    const fields = change.fields || {};
    if (!fields || typeof fields !== 'object' || Array.isArray(fields)
        || Object.keys(fields).some(field => !DAY_ADJUSTMENT_FIELDS.includes(field))) throw dayAdjustmentError('AI 回傳了不支援的修改欄位。');
    for (const [field, value] of Object.entries(fields)) {
      const valid = field === 'at_terminal' ? typeof value === 'boolean' : field === 'menu_recommendations'
        ? Array.isArray(value) && value.length <= 3 && value.every(menu => menu && ['local', 'cn', 'price'].every(key => typeof menu[key] === 'string'))
        : typeof value === 'string' && value.length <= 6000;
      if (!valid) throw dayAdjustmentError('AI 回傳的景點資料格式不完整。');
    }
    if (change.action !== 'add' && !current || change.action === 'add' && (current || !/^new-[\w-]+$/.test(change.item_id))) {
      throw dayAdjustmentError('AI 修改了不存在的行程項目，原行程已保留。');
    }
    if (current) {
      const locks = getDayAdjustmentLocks(current.item, rules);
      if (change.action === 'remove' && locks.cannot_remove
          || change.action === 'update' && [...locks.fields, 'booking_id', 'booking_event', 'at_terminal']
            .some(field => Object.hasOwn(fields, field) && fields[field] !== current.item[field])) {
        throw dayAdjustmentError(`「${current.item.title}」屬於已訂交通、住宿或固定活動，不能更改訂單或移除。`);
      }
    }
    if (change.action === 'remove') { entries.splice(index, 1); continue; }
    const next = change.action === 'add'
      ? { description: '', location_query: '', transport_detail: '', warnings_tips: '', price_level: '', menu_recommendations: [],
          ...(day.planning_mode === 'basic' ? { is_basic: true, time_estimated: true, end_time_estimated: true } : {}), ...fields }
      : { ...current.item, ...fields };
    if (current && ['hotel', 'flight'].includes(next.type) && next.type !== current.item.type) throw dayAdjustmentError('不能把一般活動改成新的交通或住宿訂單。');
    if (!['spot', 'activity', 'meal', 'shopping', 'transport', 'hotel', 'flight'].includes(next.type)
        || typeof next.title !== 'string' || !next.title.trim()) throw dayAdjustmentError('調整後的項目缺少類型或名稱。');
    const identityChanged = current && (next.title !== current.item.title || next.location_query !== current.item.location_query);
    if (change.action === 'add' || identityChanged) {
      if (!fields.description?.trim() || !fields.location_query?.trim()) throw dayAdjustmentError(`「${next.title}」缺少新地點的介紹或地圖查詢名稱。`);
      if (isBasicPlaceholder(next.title, next.type)) throw dayAdjustmentError('調整後需要具名景點或店家，不能以自由活動代替。');
      if (identityChanged) {
        next.ai_details = null;
        next.request_ids = [];
        if (!Object.hasOwn(fields, 'menu_recommendations')) next.menu_recommendations = [];
        for (const field of ['transport_detail', 'warnings_tips', 'price_level']) if (!Object.hasOwn(fields, field)) next[field] = '';
      }
    }
    if (change.action === 'add' && (next.type === 'flight' || next.booking_id && next.type !== 'hotel')) throw dayAdjustmentError('單日調整不能新增已訂航班或交通班次。');
    if (change.action === 'add' && next.type === 'hotel'
        && !(next.booking_id === rules?.end_stay?.booking_id && next.booking_event === 'return_to_hotel')) throw dayAdjustmentError('新增住宿事件必須是返回當晚已訂住宿。');
    const start = tripTimeMinutes(next.time), end = tripTimeMinutes(next.end_time);
    if (change.action === 'add' && next.at_terminal && !rules?.terminal_windows?.some(window =>
      window.booking_id === next.booking_id && start >= window.start && end <= window.end)) throw dayAdjustmentError('候機區活動缺少可確認的航班銜接時段。');
    if (start === null || start >= 1440 || end !== null && end < start
        || !['hotel', 'flight'].includes(next.type) && !next.booking_event && (end === null || end <= start)) {
      throw dayAdjustmentError(`「${next.title}」的時間不完整，需提供合理的開始與結束時間。`);
    }
    const entry = { id: change.item_id, originalIndex: current?.originalIndex ?? null, item: next, changed: true };
    if (current) entries[index] = entry; else entries.push(entry);
  }
  if (!entries.length) throw dayAdjustmentError('調整後沒有任何行程，原行程已保留。');
  if (patch.changes.some(change => change.action !== 'update' || Object.hasOwn(change.fields || {}, 'time'))) {
    entries.sort((a, b) => (tripTimeMinutes(a.item.time) ?? 1500) - (tripTimeMinutes(b.item.time) ?? 1500));
  }
  const overlappingPairs = list => {
    const pairs = new Set();
    for (let i = 0; i < list.length; i++) for (let j = i + 1; j < list.length; j++) {
      const a = list[i], b = list[j];
      const fromA = tripTimeMinutes(a.item.time), fromB = tripTimeMinutes(b.item.time);
      const toA = tripTimeMinutes(a.item.end_time) ?? fromA, toB = tripTimeMinutes(b.item.end_time) ?? fromB;
      if (fromA !== null && fromB !== null && (fromA < toB && fromB < toA || fromA === fromB && toA > fromA && toB > fromB)) pairs.add([a.id, b.id].sort().join('|'));
    }
    return pairs;
  };
  const originalPairs = overlappingPairs(day.timeline.map((item, index) => ({ id: `item-${index + 1}`, item })));
  if ([...overlappingPairs(entries)].some(pair => !originalPairs.has(pair))) throw dayAdjustmentError('調整後的活動或接駁時間互相重疊，原行程已保留。');
  const nextDay = { ...day, timeline: entries.map(entry => entry.item),
    ...(Object.hasOwn(patch, 'title') ? { title: typeof patch.title === 'string' && patch.title.trim() ? patch.title : day.title } : {}) };
  const originalConflicts = new Set(findTripBookingConflicts(protectTripBookingDay(day, rules), rules));
  const conflicts = findTripBookingConflicts(protectTripBookingDay(nextDay, rules), rules).filter(message => !originalConflicts.has(message));
  if (conflicts.length) throw dayAdjustmentError(`調整後與已訂交通／住宿衝突：${conflicts.slice(0, 2).join(' ')}`);
  if (bookingContext) {
    const activityStarts = entries.filter(entry => ['spot', 'activity', 'meal', 'shopping'].includes(entry.item.type))
      .map(entry => ({ start: tripTimeMinutes(entry.item.time) })).filter(pin => pin.start !== null);
    const context = getBasicTripDayContext(bookingContext, day.date, day.city, activityStarts);
    // 09:00／23:00 是簡易生成的預設步調，不是訂單限制；微調可明確要求更早或更晚。
    const eveningBoundary = Math.min(1440, ...[...(rules?.blocked_intervals || []), ...context.transfers]
      .filter(block => block.end > 1380).map(block => Math.max(1380, block.start)));
    const windows = context.windows.map(window => !window.departure && window.end + (window.returnToStay ? 30 : 0) === 1380
      ? { ...window, end: eveningBoundary - (window.returnToStay ? 30 : 0) } : window);
    for (const entry of entries.filter(entry => entry.changed && ['spot', 'activity', 'meal', 'shopping'].includes(entry.item.type))) {
      const item = entry.item, start = tripTimeMinutes(item.time), end = tripTimeMinutes(item.end_time);
      if (item.at_terminal) continue;
      const window = windows.find(window => start >= window.start && end <= window.end);
      if (!window) throw dayAdjustmentError(`「${item.title}」超出當天可活動的時間，原行程已保留。`);
      const city = basicTripCity(item.location_query) || basicTripCity(item.activity_city);
      if (city && window.city && basicStopIdentity(city) !== basicStopIdentity(window.city)) throw dayAdjustmentError(`「${item.title}」的城市與當時所在城市不符。`);
    }
  }
  return { day: nextDay, summary: patch.summary.trim(), changesCount: patch.changes.length + Number(nextDay.title !== day.title),
    indexMap: Object.fromEntries(entries.filter(entry => entry.originalIndex !== null).map(entry =>
      [entry.originalIndex, entries.indexOf(entry)])) };
}

async function generateDayAdjustment({ apiKey, modelFamily = 'flash', day, instruction, bookingContext, preferences = {}, requestOptions = {} }) {
  const request = bookingText(instruction).trim();
  if (!request || request.length > 2000) throw dayAdjustmentError('請填寫 2,000 字以內的單日調整需求。');
  const family = getFamilyTravelProfile(preferences);
  const rules = bookingContext?.days?.find(value => value.date === day.date);
  const projection = { day_index: day.day_index, date: day.date, city: day.city, title: day.title,
    timeline: day.timeline.map((item, index) => ({ item_id: `item-${index + 1}`,
      ...Object.fromEntries([...DAY_ADJUSTMENT_FIELDS, 'fixed_activity_id', 'activity_city'].filter(field => Object.hasOwn(item, field)).map(field => [field, item[field]])),
      user_notes: bookingText(item.user_notes).slice(0, 1000), locks: getDayAdjustmentLocks(item, rules) })) };
  const prompt = `Adjust ONLY the existing single travel day below. Respond in Traditional Chinese with one valid JSON object.
READ CURRENT DAY FIRST: ${JSON.stringify(projection)}
USER ADJUSTMENT: ${JSON.stringify(request)}
TRAVEL PREFERENCES: ${JSON.stringify({ ...preferences, family })}
${getFamilyTravelGuidance(family, true)}
AUTHORITATIVE BOOKINGS FOR THIS DATE: ${JSON.stringify(getTripPromptBookings(bookingContext, [day.date]))}
Return a MINIMAL patch, not a replacement itinerary. Use the original item_id for update/remove, and unique new-* item_id for add. Each item_id may appear only once. fields contains ONLY changed fields; add requires time, end_time, type, title, description and location_query. Moving an item means changing time/end_time. Preserve descriptions and all unmentioned items. Change only what the request asks and the transfers/times necessary to connect it logically; do not redesign the rest of the day.
Keep day_index, date, city, booked train/flight codes and times, hotel identity, check-in/out limits and fixed activities. Respect each item's locks and cannot_remove. For lodging only arrival/return/departure time may be adjusted within constraints. After an evening outing, update the final hotel return or add a hotel return_to_hotel with the booked hotel ID/name/address. Preserve enough travel and luggage time. Cross-city activities must take place in the city reached at that time. Never overlap events, use an impossible transit window or invent booked transport.
Replacing a location requires its new description, location_query and transport_detail, plus any relevant tips/menu. Include end_time on changed/new activities and transfers. Keep actual named sights/eateries and useful brief introductions. Retain all original user data; do not send photos or ai_details back. If a request cannot fit or requires altering a locked booking, return changes:[] and explain why in summary. title is optional and must be omitted unless its change is needed. summary briefly describes the actual modifications or unmet request. Do not return any other day, city guides, currency or booking changes.`;
  const data = await requestGemini(apiKey, modelFamily, { contents: [{ parts: [{ text: prompt }] }],
    generationConfig: { responseMimeType: 'application/json', responseJsonSchema: getDayAdjustmentSchema(day), maxOutputTokens: 8192 } }, requestOptions);
  let patch;
  try { patch = JSON.parse(cleanJsonResult(getGeminiText(data))); }
  catch (error) { if (error.code) throw error; throw dayAdjustmentError('AI 回覆格式不完整，原行程已保留。'); }
  throwIfGeminiCancelled(requestOptions.signal);
  return applyDayAdjustment(day, patch, bookingContext);
}

function mergeDayAdjustment(itinerary, dayIndex, adjustment) {
  const days = itinerary.days.map((day, index) => index === dayIndex ? adjustment.day : day);
  const activeRequestIds = new Set(days.flatMap(day => day.timeline.flatMap(item => item.request_ids || [])));
  const removedIds = new Set(itinerary.days[dayIndex].timeline.flatMap(item => item.request_ids || []).filter(id => !activeRequestIds.has(id)));
  return { ...itinerary, days, ...(removedIds.size && itinerary.request_reports ? { request_reports: itinerary.request_reports.map(report =>
    removedIds.has(report.id) ? { ...report, status: 'needs_confirmation', note: '此項安排已於單日調整中變更，請確認是否仍符合原先要求。' } : report) } : {}) };
}

const getItineraryShareText = (itinerary, destination, mode = 'simple') => {
  if (!itinerary) return '';
  let text = `${destination || ''}\n`;
  if (itinerary.planning_mode === 'basic') text += '免費簡易行程：活動與接駁時間為概估，班次時間依輸入保留。\n';
  if (itinerary.fallback_message) text += `${itinerary.fallback_message}\n`;
  (itinerary.days || []).forEach(day => {
    text += `\nDay ${day.day_index}${day.planning_mode === 'basic' ? `｜${day.city}` : ''}\n`;
    (day.timeline || []).forEach(item => {
      const time = `${item.time_estimated && tripTimeMinutes(item.time) !== null ? '約 ' : ''}${item.time}`;
      const description = String(item.description || '').replace(/[\r\n]+/g, ' ').trim();
      text += mode === 'simple' ? `${time}｜${item.title}\n` : `${time}｜${item.title}｜${description}\n`;
    });
  });
  return text;
};

const App = () => {
  useAdaptiveTravelTheme();
  const [showCalendar, setShowCalendar] = useState(false);
  const [modelType, setModelType] = usePersistentState('gemini_model_type', 'pro');
  const [itineraryData, setItineraryData] = usePersistentState('current_itinerary_data', null);
  const [step, setStep] = useState(() => itineraryData ? 'result' : 'input');
  const [apiKey, setApiKey] = usePersistentState('gemini_api_key', '');
  const [apiUsageMode, setApiUsageMode] = usePersistentState('gemini_api_usage_mode', 'free');
  const [allowBusyFallback, setAllowBusyFallback] = usePersistentState('gemini_busy_fallback', true);
  const [detailOptions, setDetailOptions] = usePersistentState('travel_detail_options', normalizeBasicDetailOptions());
  const [fixedActivities, setFixedActivities] = usePersistentState('travel_fixed_activities', []);
  const [generationStatus, setGenerationStatus] = useState(null);
  const generationController = useRef(null);
  const effectiveModelType = apiUsageMode === 'paid' ? (modelType === 'pro' ? 'pro' : 'flash') : 'flash';
  const geminiModels = useGeminiModels(apiKey, apiUsageMode, allowBusyFallback);
  const [showInputTutorial, setShowInputTutorial] = useState(true); // 預設開啟，內部會檢查 localStorage
  const [showResultTutorial, setShowResultTutorial] = useState(true);
  const textareaRef = useRef(null);
  const [showApiKeyTutorial, setShowApiKeyTutorial] = useState(false);
  const [editModalData, setEditModalData] = useState(null);
  const [dayAdjustment, setDayAdjustment] = useState(null);
  const dayAdjustmentRequest = useRef(null);
  const itineraryRef = useRef(itineraryData);
  itineraryRef.current = itineraryData;
  useEffect(() => {
    setDayAdjustment(null);
    return () => {
      dayAdjustmentRequest.current?.controller.abort();
      dayAdjustmentRequest.current = null;
    };
  }, [apiKey, step]);
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
    childCount: '',
    childAges: '',
    hasTransitTour: false, // 預設關閉
    isMultiCityFlight: false,
    hasFlights: true, // 預設開啟航班填寫
    flightDepartureBuffer: 180,
    flightArrivalBuffer: 90,
    transportMode: 'public', 
    needParking: false,
    specialRequests: '', // 清空
    priceRanges: { high: false, medium: false, low: false }    
  });

  const [accommodations, setAccommodations] = usePersistentState('travel_accommodations', []);
  useEffect(() => {
    setSimpleFlights(previous => Object.fromEntries(['outbound', 'transit', 'inbound'].map(role => [role, normalizeTransportInput(previous?.[role])])));
    setMultiFlights(previous => (previous || []).map(normalizeTransportInput));
  }, []);
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
  const [sharePreviewMode, setSharePreviewMode] = useState(null);
  const inputTutorialPages = [
    { icon: '🌍', title: '第一步：設定目的地與日期', desc: '輸入您想去的城市（如：東京、巴黎），並點擊日曆圖示選擇出發與回程日期。' },
    { icon: '✈️', title: '第二步：航班與交通', desc: '填寫已訂航班／車次的出發與抵達時間，跨日航班加填抵達日期。多段交通可指定航段用途；自駕遊可在交通偏好選擇「自駕」並開啟停車建議。' },
    { icon: '💰', title: '第三步：預算與偏好', desc: '設定餐廳價位、旅遊步調與特殊需求，AI 會依照您的偏好安排景點、美食與交通。' },
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
    if (!normalizeGeminiKey(apiKey)) return alert("需要 API Key");
    
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
    if (!normalizeGeminiKey(apiKey)) return alert("需要 API Key");

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
      desc: '點擊展開下方的藍色指南區塊，可查看歷史文化、交通建議、在地用語、治安提醒與補助/退稅情報。' 
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
  const setSimpleFlightEnabled = (key, enabled) => handleSimpleFlightChange(key, 'enabled', enabled);

  const addMultiFlight = () => setMultiFlights(prev => [...prev.map(f => ({ ...f, isOpen: false })), normalizeTransportInput({ id: Date.now(), type: '航段', isOpen: true })]);
  const updateMultiFlight = (id, field, value) => setMultiFlights(prev => prev.map(f => f.id === id ? { ...f, [field]: value } : f));
  const toggleMultiFlight = (id) => setMultiFlights(prev => prev.map(f => f.id === id ? { ...f, isOpen: !f.isOpen } : { ...f, isOpen: false }));
  const removeMultiFlight = (id) => setMultiFlights(prev => prev.filter(f => f.id !== id));
  
  const addAccommodation = () => setAccommodations(prev => [...prev.map(a => ({ ...a, isOpen: false })), { id: Date.now(), type: '飯店', source: '', name: '', address: '', checkInDate: '', checkOutDate: '', checkInTime: '', checkOutTime: '', orderId: '', booker: '', isOpen: true }]);
  const updateAccommodation = (id, field, value) => setAccommodations(prev => prev.map(a => a.id === id ? { ...a, [field]: value } : a));
  const toggleAccommodation = (id) => setAccommodations(prev => prev.map(a => a.id === id ? { ...a, isOpen: !a.isOpen } : { ...a, isOpen: false }));
  const removeAccommodation = (id) => setAccommodations(prev => prev.filter(a => a.id !== id));

  const resetForm = () => {
    if (confirm('確定要清空所有輸入欄位嗎？')) {
      clearTripCheckpoint();
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
      simpleFlights,
      multiFlights,
      accommodations,
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
    geminiModelCache.delete(normalizeGeminiKey(apiKey));
    setApiKey('');
    localStorage.removeItem('gemini_api_key');
  };

  const loadSavedPlan = (plan) => {
    setItineraryData(plan);
    setBasicData(plan.basicInfo || basicData);
    const bookings = plan.booking_inputs || plan;
    if (bookings.simpleFlights) setSimpleFlights(Object.fromEntries(['outbound', 'transit', 'inbound'].map(role => [role, normalizeTransportInput(bookings.simpleFlights[role])])));
    if (bookings.multiFlights) setMultiFlights(bookings.multiFlights.map(normalizeTransportInput));
    if (bookings.accommodations) setAccommodations(bookings.accommodations);
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
            setSimpleFlights(Object.fromEntries(['outbound', 'transit', 'inbound'].map(role => [role, normalizeTransportInput(imported.simpleFlights?.[role])])));
            setMultiFlights((imported.multiFlights || []).map(normalizeTransportInput));
            setAccommodations(imported.accommodations || []);
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

  const updateItineraryItem = (dayIndex, timelineIndex, updates) => {
     setItineraryData(prev => {
        const newDays = [...prev.days];
        const newTimeline = [...newDays[dayIndex].timeline];
        newTimeline[timelineIndex] = { ...newTimeline[timelineIndex], ...updates };
        newDays[dayIndex].timeline = newTimeline;
        return { ...prev, days: newDays };
     });
  };

  const closeDayAdjustment = () => {
    dayAdjustmentRequest.current?.controller.abort();
    dayAdjustmentRequest.current = null;
    setDayAdjustment(null);
  };
  const openDayAdjustment = dayIndex => {
    if (dayAdjustmentRequest.current) return;
    const day = itineraryRef.current?.days?.[dayIndex];
    if (!day) return;
    setDayAdjustment({ dayIndex, snapshot: JSON.parse(JSON.stringify(day)), instruction: '', processing: false, error: '', summary: '' });
  };
  const submitDayAdjustment = async () => {
    if (!dayAdjustment || dayAdjustmentRequest.current || !dayAdjustment.instruction.trim()) return;
    if (!normalizeGeminiKey(apiKey)) {
      setDayAdjustment(prev => ({ ...prev, error: '請先填入 Gemini API Key 才能使用單日調整。' }));
      return;
    }
    const { dayIndex, instruction } = dayAdjustment;
    const sourceItinerary = itineraryRef.current;
    const day = sourceItinerary?.days?.[dayIndex];
    if (!day) return;
    const request = { controller: new AbortController(), original: JSON.stringify(day) };
    dayAdjustmentRequest.current = request;
    setDayAdjustment(prev => ({ ...prev, snapshot: JSON.parse(request.original), processing: true, error: '', summary: '' }));
    try {
      const inputs = sourceItinerary.booking_inputs || { simpleFlights, multiFlights, accommodations };
      const bookingContext = sourceItinerary.booking_context || buildTripBookingContext({ basicData, ...inputs,
        dateList: sourceItinerary.days.map(value => value.date) });
      const result = await generateDayAdjustment({ apiKey, modelFamily: effectiveModelType, day: JSON.parse(request.original), instruction,
        bookingContext, preferences: getDayTravelPreferences(sourceItinerary, basicData),
        requestOptions: { signal: request.controller.signal, ...(apiUsageMode === 'free' ? { session: { attempts: 0, maxAttempts: 4 } } : {}) } });
      if (dayAdjustmentRequest.current !== request || request.controller.signal.aborted) return;
      const latest = itineraryRef.current;
      if (JSON.stringify(latest?.days?.[dayIndex]) !== request.original) {
        throw dayAdjustmentError('這一天在等待期間已有其他修改，已保留最新內容。請再次送出調整以讀取新版行程。');
      }
      if (result.changesCount) {
        result.day = { ...result.day, adjustment_revision: Date.now() };
        setItineraryData(mergeDayAdjustment(latest, dayIndex, result));
        setExpenses(prev => prev.map(expense => {
          if (expense.dayIndex !== dayIndex || !Number.isInteger(expense.timelineIndex) || expense.timelineIndex < 0) return expense;
          const index = Object.hasOwn(result.indexMap, expense.timelineIndex) ? result.indexMap[expense.timelineIndex] : -1;
          return index === expense.timelineIndex ? expense : { ...expense, timelineIndex: index };
        }));
      }
      setDayAdjustment(prev => ({ ...prev, snapshot: JSON.parse(JSON.stringify(result.changesCount ? result.day : day)), processing: false,
        summary: `${result.changesCount ? `已完成第 ${day.day_index} 天的調整。` : '目前行程未更動。'}\n${result.summary}`, error: '' }));
    } catch (error) {
      if (dayAdjustmentRequest.current !== request || request.controller.signal.aborted) return;
      setDayAdjustment(prev => ({ ...prev, processing: false, error: `${error.message}\n原行程與其他天的內容已保留。` }));
    } finally {
      if (dayAdjustmentRequest.current === request) dayAdjustmentRequest.current = null;
    }
  };

  const generateItinerary = async () => {
    if (generationController.current && !generationController.current.signal.aborted) return;
    if (!normalizeGeminiKey(apiKey)) {
      alert("請輸入您的 Gemini API Key");
      return;
    }
    let travelerPreferences;
    try { travelerPreferences = getDayTravelPreferences(null, basicData); }
    catch (error) { setErrorMsg(error.message); return; }
    const familyProfile = travelerPreferences.family || null;
    setStep('loading');
    setErrorMsg('');

    // --- 1. 計算總天數與拆分日期陣列 ---
    let dateList = [];
    try {
        if (basicData.dates) {
            const parts = basicData.dates.split(' to ');
            const start = parts[0];
            const end = parts[1] || start;
            if (!isTripDate(start) || !isTripDate(end) || end < start) throw new Error('旅遊日期格式或順序不正確，請重新選擇日期。');
            for (let current = start; current <= end; current = shiftTripDate(current, 1)) {
                dateList.push(current);
                if (dateList.length > 30) throw new Error('目前支援最多 30 天，請調整旅遊日期範圍。');
            }
        }
    } catch(e) {
        setErrorMsg(e.message);
        setStep('input');
        return;
    }
    
    // 防呆：若未選日期預設給 3 天
    if (dateList.length === 0) {
        dateList = ["未定日期 (Day 1)", "未定日期 (Day 2)", "未定日期 (Day 3)"];
    }
    
    const totalDays = dateList.length;
    const batchSize = 4; // 完整模式分批；免費模式另以精簡全程請求處理。

    // --- 2. 準備使用者約束條件 ---
    let bookingContext;
    try {
      bookingContext = buildTripBookingContext({ basicData, simpleFlights, multiFlights, accommodations, dateList });
    } catch (error) {
      setErrorMsg(error.message);
      setStep('input');
      return;
    }

    const selectedPrices = [];
    if (basicData.priceRanges?.high) selectedPrices.push("高 (1000 TWD+)");
    if (basicData.priceRanges?.medium) selectedPrices.push("中 (301-1000 TWD)");
    if (basicData.priceRanges?.low) selectedPrices.push("低 (<300 TWD)");
    const priceConstraint = selectedPrices.length > 0 ? selectedPrices.join(', ') : "無限制";

    const transportConstraint = basicData.transportMode === 'self_driving' 
      ? "Self-driving (Prioritize driving routes/distances)" 
      : "Public Transport";
    
    const parkingConstraint = (basicData.transportMode === 'self_driving' && basicData.needParking)
      ? "Include nearby parking lot recommendations with estimated prices for each stop."
      : "";
    
    // 動態風格指令
    let styleInstruction = "";
    if (familyProfile) {
        styleInstruction = "FAMILY PACE. Only 1-2 main visits daily, clustered nearby, with age-appropriate meals and generous breaks. Follow the children's ages and FAMILY TRAVEL NEEDS below.";
    } else if (basicData.type.includes('休閒')) {
        styleInstruction = "VERY SLOW PACE. Max 2-3 main spots per day. Focus on relaxing vibes.";
    } else if (basicData.type.includes('購物')) {
        styleInstruction = "HIGH DENSITY. Focus heavily on shopping districts, malls. 4-5 items per day.";
    } else if (basicData.type.includes('文化')) {
        styleInstruction = "MODERATE PACE. Focus on museums, historical sites. 3-4 items per day.";
    } else if (basicData.type.includes('深度')) {
        styleInstruction = "IMMERSIVE LOCAL. Focus on hidden alleys, local eateries. 3-4 items per day.";
    } else {
        styleInstruction = "BALANCED PACE. 3-4 items per day.";
    }

    const modelFamily = effectiveModelType;
    console.log(`開始${apiUsageMode === 'free' ? '簡易' : '完整分段'}生成行程 (總天數: ${totalDays}, AI: Gemini, 模型類型: ${modelFamily})`);

    const baseConstraints = `
      User Constraints:
      - Destinations: ${basicData.destinations}
      - Total Trip Length: ${totalDays} days (${basicData.dates})
      - Travel Style & Pacing: ${basicData.type}. CRITICAL: ${styleInstruction}
      - Travelers: ${basicData.travelers}
      ${familyProfile ? `- Children: ${JSON.stringify(familyProfile)}\n      - Parenting Needs: ${getFamilyTravelGuidance(familyProfile)}` : ''}
      - Transit Sightseeing: ${basicData.hasTransitTour ? 'Only when connection time, luggage, entry and return-to-terminal buffers allow it.' : 'No city sightseeing during connections; stay inside the airport/station.'}
      - Transport Mode: ${transportConstraint}
      - Parking: ${parkingConstraint || 'No extra parking requirement.'}
      - Special Requests: ${basicData.specialRequests || "None"}
      - Restaurant Budget: ${priceConstraint}
      - Output Language: Traditional Chinese (Taiwan)
    `;

    const controller = new AbortController();
    generationController.current = controller;
    const session = apiUsageMode === 'free' ? { attempts: 0, maxAttempts: 6 } : null;
    const planningPreferences = { destinations: basicData.destinations, style: basicData.type, transport: transportConstraint,
      requests: basicData.specialRequests, budget: priceConstraint, details: normalizeBasicDetailOptions(detailOptions),
      fixedActivities: Array.isArray(fixedActivities) ? fixedActivities : [],
      ...(familyProfile ? { family: familyProfile, travelers: basicData.travelers } : {}) };
    try {
      const tripData = await runTripWithWaiting(() => generateTripData({
        apiKey: apiKey, modelFamily, baseConstraints, dateList, batchSize, bookingContext,
        basicPreferences: planningPreferences, requestOptions: { signal: controller.signal, session },
      }), { mode: apiUsageMode, signal: controller.signal, session, onStatus: setGenerationStatus });
      throwIfGeminiCancelled(controller.signal);
      const finalItinerary = { ...tripData, booking_inputs: { simpleFlights, multiFlights, accommodations },
        travel_preferences: travelerPreferences, created: Date.now() };

      // 根據 AI 回傳的幣別設定符號
      if (finalItinerary.currency_code) {
        let symbol = '$';
        const code = finalItinerary.currency_code.toUpperCase();
        if (code === 'JPY') symbol = '¥';
        if (code === 'KRW') symbol = '₩';
        if (code === 'EUR') symbol = '€';
        if (code === 'GBP') symbol = '£';
        if (code === 'THB') symbol = '฿';
        if (code === 'INR') symbol = '₹';
        if (code === 'CNY') symbol = '¥';
        
        setCurrencySettings({
           rate: finalItinerary.currency_rate_val || 0.21,
           symbol: symbol,
           code: code
        });
      }

      setItineraryData(finalItinerary);
      setActiveTab(0);
      setExpenses([]);
      setStep('result');

    } catch (error) {
      if (controller.signal.aborted || error.code === 'GEMINI_CANCELLED') {
        if (generationController.current === controller) { setErrorMsg('已停止規劃，填寫資料與已完成的部分會保留。'); setStep('input'); }
        return;
      }
      console.error(error);
      const progress = readTripCheckpoint(getTripCheckpointSignature({ baseConstraints, dateList, bookingContext, modelFamily,
        planningMode: apiUsageMode === 'free' ? 'basic' : 'full', basicPreferences: planningPreferences }));
      const schedules = Array.isArray(progress?.scheduleDays) ? progress.scheduleDays.length : 0;
      const completed = Array.isArray(progress?.completedDays) ? progress.completedDays.length : 0;
      setErrorMsg("行程生成失敗：" + error.message + (schedules || completed
        ? ` 已保留 ${schedules} 天時間表與 ${completed} 天完整行程；下次規劃會接續未完成的部分。` : ''));
      setStep('input');
    } finally {
      if (generationController.current === controller) { generationController.current = null; setGenerationStatus(null); }
    }
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
    if (!normalizeGeminiKey(apiKey)) return alert("需要 API Key 才能使用 AI 功能");

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
      <div className="travel-panel max-w-4xl mx-auto bg-white/80 dark:bg-[#14243a]/90 backdrop-blur-xl p-6 md:p-8 rounded-3xl shadow-2xl space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 border border-white/50 dark:border-[#314861] print:hidden transition-colors duration-300">
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
        <div className="pb-6 border-b border-slate-100/50 dark:border-[#314861]/50">
          
          {/* 1. 上排：功能按鈕區 */}
          <div className="flex justify-start mb-4">
            <button 
              onClick={() => { localStorage.removeItem('tutorial_input_seen'); setShowInputTutorial(true); }}
              className="px-3 py-2 text-slate-500 dark:text-[#c0cfe2] hover:text-blue-600 dark:hover:text-sky-300 transition-colors flex items-center gap-2 text-sm font-bold border border-slate-200 dark:border-[#314861] rounded-xl hover:bg-blue-50 dark:hover:bg-[#29405b] bg-white dark:bg-[#0e1b2d] shadow-sm"
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
            <p className="text-slate-500 dark:text-[#c0cfe2] mt-3 text-base md:text-lg">智慧分析航班與機場，為您量身打造深度文化之旅</p>
          </div>
        </div>

        <div className="space-y-6">
          {/* API Key 區塊 */}
          <div id="ai-settings" className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-[#102033] dark:to-[#132338] p-5 md:p-6 rounded-2xl border border-blue-100 dark:border-[#314861] shadow-inner transition-colors duration-300">
            <div className="flex justify-between items-center mb-2">
              <label htmlFor="ai-api-key" className="block text-sm font-bold text-blue-800 dark:text-sky-200 flex items-center gap-2 flex-wrap">
                <Key className="w-4 h-4" /> Gemini API Key (必填)
                <button type="button"
                  onClick={() => setShowApiKeyTutorial(true)}
                  className="text-xs bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-200 px-2 py-0.5 rounded-full hover:bg-amber-200 dark:hover:bg-amber-800 transition-colors flex items-center gap-1 font-normal cursor-pointer"
                >
                  <Info className="w-3 h-3" /> 如何獲取?
                </button>
              </label>
              <div className="flex gap-2">
                <button onClick={resetForm} className="text-xs text-slate-500 dark:text-[#9bafc9] hover:text-slate-700 dark:hover:text-[#e8f1ff] underline transition-colors">重置所有欄位</button>
                {apiKey && <button onClick={clearApiKey} className="text-xs text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 underline transition-colors">清除儲存的 Key</button>}
              </div>
            </div>
            <div className="relative">
               <input 
                 id="ai-api-key"
                 type="password" 
                 value={apiKey} 
                 onChange={(e) => setApiKey(e.target.value)} 
                 placeholder="貼上您的 Gemini API Key (將自動儲存在本機)"
                 className="w-full pl-4 pr-4 py-3 bg-white dark:bg-[#0e1b2d] border border-blue-200 dark:border-[#314861] rounded-xl focus:ring-4 focus:ring-blue-100 dark:focus:ring-[#314861]/50 focus:border-blue-500 dark:focus:border-sky-400 outline-none transition-all shadow-sm text-sm md:text-base dark:text-[#e8f1ff]" 
               />
            </div>
            
            <fieldset className="mt-4 space-y-2">
              <legend className="text-xs font-bold text-slate-600 dark:text-[#c0cfe2] mb-2">這把 API Key 使用哪種方案？</legend>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {[{ value: 'free', title: '免費 API：簡易規劃', detail: '保留特殊要求、簡短介紹與概略路線；可自選資訊，盡量一次生成。' },
                  { value: 'paid', title: '已開通 API 計費', detail: '可選 Pro 或 Flash；費用依 Google 專案計費。' }].map(mode => (
                  <label key={mode.value} className={`flex items-start gap-2 border rounded-lg p-3 cursor-pointer ${apiUsageMode === mode.value ? 'border-blue-500 bg-blue-50 dark:bg-[#20334d]' : 'border-slate-200 dark:border-[#314861] bg-white dark:bg-[#0e1b2d]'}`}>
                    <input type="radio" name="apiUsageMode" value={mode.value} checked={apiUsageMode === mode.value} onChange={() => setApiUsageMode(mode.value)} className="mt-1" />
                    <span><span className="block text-sm font-bold text-slate-800 dark:text-[#e8f1ff]">{mode.title}</span><span className="block text-xs text-slate-500 dark:text-[#9bafc9] mt-1">{mode.detail}</span></span>
                  </label>
                ))}
              </div>
              <p className="text-xs text-slate-500 dark:text-[#9bafc9]">此選項只調整呼叫策略，不會開通計費或改變額度。實際免費額度、模型資格與費用由 API Key 所屬的 Google 專案決定。</p>
            </fieldset>

            {/* 免費規劃使用 Flash；已開通計費者保留 Pro / Flash 選擇。 */}
            <div className="bg-white/60 dark:bg-[#0e1b2d]/60 p-3 rounded-xl border border-blue-100/50 dark:border-[#314861]/50 mt-4">
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="text-xs font-bold text-slate-500 dark:text-[#9bafc9] flex items-center gap-1">
                  <Bot className="w-3 h-3" /> 選擇 AI 模型引擎 · 自動更新
                </div>
                {normalizeGeminiKey(apiKey) && (
                  <button type="button" onClick={geminiModels.refresh} disabled={geminiModels.status === 'loading'} className="flex items-center gap-1 text-xs text-blue-600 dark:text-sky-300 disabled:opacity-50" aria-label="更新 Gemini 模型清單">
                    <RefreshCw className={`w-3 h-3 ${geminiModels.status === 'loading' ? 'animate-spin' : ''}`} /> 更新模型
                  </button>
                )}
              </div>
              <p className="text-xs text-slate-500 dark:text-[#9bafc9] mb-3" role="status" aria-live="polite">
                {geminiModels.status === 'idle' && '輸入 API Key 後會自動取得可用模型。'}
                {geminiModels.status === 'loading' && '正在取得可用模型…'}
                {geminiModels.status === 'ready' && '已同步官方模型清單；實際使用資格仍依這把 Key 的配額決定。'}
                {geminiModels.status === 'error' && `模型清單更新失敗：${geminiModels.error} 可按「更新模型」重試。`}
              </p>
              {apiUsageMode !== 'paid' && <div className="rounded-lg border border-indigo-500 dark:border-sky-400 bg-indigo-50 dark:bg-[#20334d] p-3 mb-3">
                <span className="block text-sm font-bold text-slate-800 dark:text-[#e8f1ff]">免費模式：{geminiModels.freeModel?.label || GEMINI_MODEL_CONFIG.flash.label}</span>
                <p className="text-xs text-slate-600 dark:text-[#c0cfe2] mt-1">免費模式的運算與配額有限，保留具名景點、簡短介紹、用餐與特殊要求；依交通時間切換城市，以住宿地區安排起終點。進階資訊可在下方勾選，與行程一起產生。10 天內先嘗試一次生成全程，較長行程每批最多 10 天。</p>
                <p className="text-xs text-slate-600 dark:text-[#c0cfe2] mt-2">免費版也可使用 AI 深度導覽：生成行程後，點選景點的紫色 AI 按鈕才獨立生成該景點的步行路線、周邊店舖與提醒。已生成內容再次開啟會直接讀取，並共用免費請求限速。</p>
                <p className="text-xs text-slate-600 dark:text-[#c0cfe2] mt-2">服務忙碌、短時間配額或部分內容未完成時，會留在等待畫面倒數並有限次自動接續。整次規劃最多送出 6 次生成嘗試；每日額度、權限或輸入衝突會明確停止。成功時只需一次請求，等待本身不消耗生成額度。</p>
                <p className="text-xs text-slate-600 dark:text-[#c0cfe2] mt-2">直接查詢官方模型清單，不消耗文字生成 Token。免費規劃優先現行正式 Flash，並沿用這把 Key 最近成功使用的模型；無法存取的模型會暫時略過。取得清單後至少等 15 秒，後續生成也至少間隔 15 秒。清單有列出不代表專案有使用權限或配額，實際額度請在 AI Studio 確認。</p>
                {geminiModels.listedModels?.length > 0 && <details className="mt-2 text-xs text-slate-500 dark:text-[#9bafc9]">
                  <summary className="cursor-pointer">查看查詢到的文字模型（{geminiModels.listedModels.length} 個）</summary>
                  <ul className="mt-1 space-y-1">{geminiModels.listedModels.map(model => <li key={model.id}>{model.label} · {model.id}</li>)}</ul>
                  <p className="mt-1">清單包含 Flash、Flash-Lite 與 Pro；列出不代表具有免費配額。主行程使用 Flash。</p>
                </details>}
                <p className="text-xs text-slate-600 dark:text-[#c0cfe2] mt-2">建議開通 Gemini API 計費後使用完整模式，可取得較高配額與更完整的規劃。Flash 少量文字規劃可能只需幾元；實際費用依模型、Token 用量、重試與當時費率而定，付費仍可能遇到服務忙碌。</p>
                <details className="mt-2 text-xs text-slate-500 dark:text-[#9bafc9]">
                  <summary className="cursor-pointer">查看費用估算範例</summary>
                  <p className="mt-1">以 2026/10/02 公告、2026/12/31 前 Gemini 3.8 Flash 標準費率估算：輸入 10,000 Token、輸出 20,000 Token（含思考）約 US$0.0825；假設 US$1＝NT$32，約 NT$2.64。這是範例而非每次費用上限；Pro 或較多輸出可能更高。</p>
                </details>
                <div className="flex flex-wrap gap-3 mt-2 text-xs font-bold">
                  <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noreferrer" className="text-indigo-600 dark:text-sky-300 underline">查看 Google API 計費設定</a>
                  <a href="https://ai.google.dev/gemini-api/docs/pricing" target="_blank" rel="noreferrer" className="text-indigo-600 dark:text-sky-300 underline">官方最新價格</a>
                </div>
                {geminiModels.lastUsed.flash && <p className="text-xs text-slate-500 dark:text-[#9bafc9] mt-1">上次實際使用：{geminiModels.lastUsed.flash.label}</p>}
              </div>}
              <div className="flex flex-col md:flex-row gap-3">
                {[{ type: 'pro', detail: '自動選擇最新 Pro，適合深度與複雜規劃。' },
                  { type: 'flash', detail: '自動選擇最新 Flash，適合快速規劃。' }].map(model => (
                  <label key={model.type} className={`flex-1 border rounded-lg p-3 transition-all ${apiUsageMode !== 'paid' ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'} ${effectiveModelType === model.type ? 'bg-indigo-50 dark:bg-[#20334d] border-indigo-500 dark:border-sky-400 shadow-sm' : 'bg-white dark:bg-[#0e1b2d] border-slate-200 dark:border-[#314861]'}`}>
                    <div className="flex items-start gap-3">
                      <input type="radio" name="modelType" value={model.type} checked={effectiveModelType === model.type} disabled={apiUsageMode !== 'paid'} onChange={() => setModelType(model.type)} className="mt-1 w-4 h-4 text-indigo-600 focus:ring-indigo-500 dark:bg-[#081321] dark:border-[#314861]" />
                      <div>
                        <span className="block text-sm font-bold text-slate-800 dark:text-[#e8f1ff]">{geminiModels.labels[model.type]}</span>
                        <span className="block text-xs text-slate-500 dark:text-[#9bafc9] mt-1">{apiUsageMode === 'paid' ? model.detail : '已開通 API 計費模式可選用。'}</span>
                        {geminiModels.lastUsed[model.type] && <span className="block text-[10px] text-slate-500 dark:text-[#9bafc9] mt-1">上次使用：{geminiModels.lastUsed[model.type].label}</span>}
                      </div>
                    </div>
                  </label>
                ))}
              </div>
              <label className="flex items-start gap-2 mt-3 text-xs text-slate-600 dark:text-[#c0cfe2] cursor-pointer">
                <input type="checkbox" name="allowBusyFallback" checked={Boolean(allowBusyFallback)} onChange={e => setAllowBusyFallback(e.target.checked)} className="mt-0.5" />
                <span>持續忙碌時自動使用同系列備援模型（最多切換一次）。模型停用時仍會尋找可用版本。</span>
              </label>
              <p className="mt-2 text-xs text-slate-500 dark:text-[#9bafc9]">{apiUsageMode === 'free' ? '免費模式每筆需求最多自動重試 1 次，至少等待 30 秒；同系列備援也共用重試額度。持續 503 時暫停該系列 60 秒，等待過程會顯示倒數。' : '短時間限制會等待後重試，每個模型最多重試 3 次。'} 模型仍可能忙碌，限速無法保證消除 503。免費模式遇到模型額度為 0 時會尋找其他候選；每日額度用完會直接提示。</p>
            </div>
          </div>
          
          <section className="space-y-4">
            <h3 className="text-lg md:text-xl font-bold text-slate-800 dark:text-[#e8f1ff] flex items-center gap-2">
              <span className="bg-blue-100 dark:bg-sky-900/50 p-2 rounded-lg text-blue-600 dark:text-sky-300"><MapPin className="w-5 h-5" /></span>基本行程
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-600 dark:text-[#c0cfe2]">
                  目的城市 
                  <span className="text-xs text-slate-400 dark:text-[#8ea3bf] font-normal ml-2">
                    (多個城市請用逗號或空白隔開)
                  </span>
                </label>
                <input 
                  name="destinations" 
                  value={basicData.destinations} 
                  onChange={handleBasicChange} 
                  placeholder="例如：福岡, 熊本, 由布院"
                  className="w-full p-3 md:p-4 bg-slate-50 dark:bg-[#0e1b2d] border border-slate-200 dark:border-[#314861] rounded-xl focus:ring-2 focus:ring-blue-500 dark:focus:ring-sky-400 outline-none transition-all text-sm md:text-base dark:text-[#e8f1ff] dark:placeholder-[#7f96b2]" 
                />
              </div>
              
              {/* 日期選擇 (含月曆) */}
              <div className="space-y-2 relative">
                <label className="text-sm font-semibold text-slate-600 dark:text-[#c0cfe2]">旅遊日期</label>
                <div 
                  className="relative cursor-pointer"
                  onClick={() => setShowCalendar(!showCalendar)}
                >
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 pointer-events-none text-slate-400 dark:text-[#8ea3bf]" />
                  <input 
                    name="dates" 
                    value={basicData.dates} 
                    readOnly 
                    className="travel-icon-input w-full p-3 md:p-4 bg-slate-50 dark:bg-[#0e1b2d] border border-slate-200 dark:border-[#314861] rounded-xl focus:ring-2 focus:ring-blue-500 dark:focus:ring-sky-400 outline-none transition-all text-sm md:text-base cursor-pointer dark:text-[#e8f1ff] dark:placeholder-[#7f96b2]" 
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
                <label className="text-sm font-semibold text-slate-600 dark:text-[#c0cfe2]">風格</label>
                <select name="type" value={basicData.type} onChange={handleBasicChange} className="w-full p-3 md:p-4 bg-slate-50 dark:bg-[#0e1b2d] border border-slate-200 dark:border-[#314861] rounded-xl focus:ring-2 focus:ring-blue-500 dark:focus:ring-sky-400 outline-none transition-all appearance-none text-sm md:text-base dark:text-[#e8f1ff]">
                  <option>休閒 (慢步調)</option>
                  <option>購物 (商圈為主)</option>
                  <option>文化 (歷史古蹟)</option>
                  <option>深度 (在地體驗)</option>
                  <option>綜合 (購物+文化)</option>
                  <option>{FAMILY_TRAVEL_STYLE}</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-600 dark:text-[#c0cfe2]">人數</label>
                <div className="relative">
                  <Users className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 pointer-events-none text-slate-400 dark:text-[#8ea3bf]" />
                  <input type="number" name="travelers" value={basicData.travelers} onChange={handleBasicChange} className="travel-icon-input w-full p-3 md:p-4 bg-slate-50 dark:bg-[#0e1b2d] border border-slate-200 dark:border-[#314861] rounded-xl focus:ring-2 focus:ring-blue-500 dark:focus:ring-sky-400 outline-none transition-all text-sm md:text-base dark:text-[#e8f1ff]" />
                </div>
              </div>
            </div>

            {isFamilyTravelStyle(basicData.type) && <fieldset className="rounded-2xl border border-teal-200 dark:border-teal-900/70 bg-teal-50/50 dark:bg-teal-950/20 p-4 md:p-5 space-y-3">
              <legend className="px-2 text-sm font-bold text-teal-800 dark:text-teal-200">同行小孩資料</legend>
              <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] gap-4">
                <div className="space-y-2">
                  <label htmlFor="travel-child-count" className="block text-sm font-semibold text-slate-600 dark:text-[#c0cfe2]">小孩人數</label>
                  <input id="travel-child-count" type="number" name="childCount" min="1" step="1" value={basicData.childCount ?? ''}
                    onChange={handleBasicChange} aria-describedby="travel-children-hint" placeholder="例如：2"
                    className="w-full min-w-0 p-3 md:p-4 bg-white dark:bg-[#0e1b2d] border border-slate-200 dark:border-[#314861] rounded-xl focus:ring-2 focus:ring-teal-500 outline-none text-sm md:text-base dark:text-[#e8f1ff] dark:placeholder-[#7f96b2]" />
                </div>
                <div className="space-y-2">
                  <label htmlFor="travel-child-ages" className="block text-sm font-semibold text-slate-600 dark:text-[#c0cfe2]">每位小孩的年齡</label>
                  <input id="travel-child-ages" type="text" name="childAges" maxLength={500} value={basicData.childAges ?? ''}
                    onChange={handleBasicChange} aria-describedby="travel-children-hint" placeholder="例如：3、7，或 6 個月、3 歲"
                    className="w-full min-w-0 p-3 md:p-4 bg-white dark:bg-[#0e1b2d] border border-slate-200 dark:border-[#314861] rounded-xl focus:ring-2 focus:ring-teal-500 outline-none text-sm md:text-base dark:text-[#e8f1ff] dark:placeholder-[#7f96b2]" />
                </div>
              </div>
              <p id="travel-children-hint" className="text-xs leading-relaxed text-slate-600 dark:text-[#a9bdd7]">每位小孩填一個年齡，以逗號分隔；嬰兒可填月齡。上方人數請包含成人與小孩。AI 會依年齡安排合適景點、用餐、休息及較輕鬆的路線。</p>
            </fieldset>}
  
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-600 dark:text-[#c0cfe2]">交通偏好</label>
                <div className="relative">
                  {basicData.transportMode === 'self_driving' ? <Car className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 pointer-events-none text-slate-400 dark:text-[#8ea3bf]" /> : <Train className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 pointer-events-none text-slate-400 dark:text-[#8ea3bf]" />}
                  <select name="transportMode" value={basicData.transportMode} onChange={handleBasicChange} className="travel-icon-input w-full p-3 md:p-4 bg-slate-50 dark:bg-[#0e1b2d] border border-slate-200 dark:border-[#314861] rounded-xl focus:ring-2 focus:ring-blue-500 dark:focus:ring-sky-400 outline-none transition-all appearance-none text-sm md:text-base dark:text-[#e8f1ff]">
                    <option value="public">大眾交通</option>
                    <option value="self_driving">自駕</option>
                  </select>
                </div>
              </div>
              
              {basicData.transportMode === 'self_driving' && (
                <div className="space-y-2 flex items-center h-full pt-6">
                  <label className="flex items-center gap-3 cursor-pointer bg-slate-50 dark:bg-[#0e1b2d] p-3 rounded-xl border border-slate-200 dark:border-[#314861] w-full hover:bg-slate-100 dark:hover:bg-[#132338] transition-colors">
                    <input 
                      type="checkbox" 
                      name="needParking" 
                      checked={basicData.needParking} 
                      onChange={handleBasicChange} 
                      className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500 dark:bg-[#081321] dark:border-[#314861]" 
                    />
                    <span className="text-sm font-semibold text-slate-700 dark:text-[#e8f1ff] flex items-center gap-2">
                      <ParkingCircle className="w-5 h-5 text-slate-500 dark:text-[#9bafc9]" />
                      是否提供停車資訊
                    </span>
                  </label>
                </div>
              )}
            </div>
          </section>
  
          <hr className="border-slate-100 dark:border-[#314861]" />
  
          {/* 特殊要求與價位 */}
          <section className="space-y-4">
            <h3 className="text-lg md:text-xl font-bold text-slate-800 dark:text-[#e8f1ff] flex items-center gap-2">
              <span className="bg-purple-100 dark:bg-purple-900/50 p-2 rounded-lg text-purple-600 dark:text-purple-300"><MessageSquare className="w-5 h-5" /></span>特殊要求與偏好
            </h3>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-600 dark:text-[#c0cfe2]">特殊要求</label>
              <textarea 
                ref={textareaRef} // 綁定 ref
                name="specialRequests" 
                value={basicData.specialRequests} 
                maxLength={apiUsageMode === 'free' ? 6000 : undefined}
                onChange={handleBasicChange} 
                rows={2} 
                className="w-full p-3 md:p-4 bg-slate-50 dark:bg-[#0e1b2d] border border-slate-200 dark:border-[#314861] rounded-xl focus:ring-2 focus:ring-blue-500 dark:focus:ring-sky-400 outline-none transition-all text-sm md:text-base min-h-[80px] max-h-[240px] resize-none overflow-y-auto dark:text-[#e8f1ff] dark:placeholder-[#7f96b2]" 
                placeholder="例如：一定要吃燒肉、想在天神待久一點..." 
              />
              {apiUsageMode === 'free' && <p className="text-xs text-slate-500 dark:text-[#9bafc9]">每行一項需求，最多 6,000 字，送出時會完整保留。固定時間可寫「第 3 天 17:00–21:00 名古屋巨蛋演唱會」，或填寫下方固定活動；未提供的營業與寄存服務會標示待確認。</p>}
            </div>
            {apiUsageMode === 'free' && <>
              <fieldset className="rounded-2xl border border-purple-200 dark:border-[#314861] p-4 space-y-3">
                <legend className="px-2 text-sm font-bold text-slate-700 dark:text-[#e8f1ff]">希望一起產生哪些資訊？</legend>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {BASIC_TRIP_DETAIL_OPTIONS.map(option => <label key={option.key} className="flex items-start gap-3 cursor-pointer">
                    <input type="checkbox" name={`detail_${option.key}`} checked={normalizeBasicDetailOptions(detailOptions)[option.key]}
                      onChange={event => setDetailOptions(previous => ({ ...normalizeBasicDetailOptions(previous), [option.key]: event.target.checked }))} className="mt-1 w-4 h-4 rounded text-purple-600" />
                    <span><span className="block text-sm font-semibold text-slate-700 dark:text-[#e8f1ff]">{option.label}</span><span className="block text-xs text-slate-500 dark:text-[#9bafc9]">{option.detail}</span></span>
                  </label>)}
                </div>
                <p className="text-xs text-slate-500 dark:text-[#9bafc9]">建議全選，以獲得更完整的旅遊規劃體驗；若持續生成失敗，可考慮取消部分選項後再試。選取的資訊會併入同一次行程生成。</p>
              </fieldset>
              <details className="rounded-2xl border border-purple-200 dark:border-[#314861] p-4" open={fixedActivities.length > 0 || undefined}>
                <summary className="cursor-pointer text-sm font-bold text-slate-700 dark:text-[#e8f1ff]">固定活動／訂位時間（選填）</summary>
                <p className="mt-2 text-xs text-slate-500 dark:text-[#9bafc9]">演唱會、餐廳訂位或必排行程先保留，再安排其他景點。請填日期與開始時間；填結束時間可避免活動被提早結束。</p>
                <div className="mt-3 space-y-3">{fixedActivities.map((activity, index) => <div key={activity.id} className="rounded-xl bg-slate-50 dark:bg-[#0e1b2d] p-3 space-y-2">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                    {[{ key: 'date', label: '活動日期', type: 'date' }, { key: 'startTime', label: '開始時間', type: 'time' }, { key: 'endTime', label: '結束時間（選填）', type: 'time' },
                      { key: 'title', label: '活動／餐廳名稱', type: 'text' }, { key: 'area', label: '城市／地區（選填）', type: 'text' }].map(field => <label key={field.key} className="text-xs text-slate-600 dark:text-[#c0cfe2]">
                      {field.label}<input type={field.type} aria-label={`固定活動 ${index + 1} ${field.label}`} value={activity[field.key] || ''}
                        onChange={event => setFixedActivities(previous => previous.map(item => item.id === activity.id ? { ...item, [field.key]: event.target.value } : item))}
                        className="mt-1 w-full rounded-lg border border-slate-200 dark:border-[#314861] bg-white dark:bg-[#081321] p-2" />
                    </label>)}
                    <label className="text-xs text-slate-600 dark:text-[#c0cfe2]">活動類型<select aria-label={`固定活動 ${index + 1} 活動類型`} value={activity.type || 'activity'}
                      onChange={event => setFixedActivities(previous => previous.map(item => item.id === activity.id ? { ...item, type: event.target.value } : item))}
                      className="mt-1 w-full rounded-lg border border-slate-200 dark:border-[#314861] bg-white dark:bg-[#081321] p-2">
                      <option value="activity">活動／演唱會</option><option value="meal">用餐／訂位</option><option value="spot">必訪景點</option><option value="logistics">行李／接送</option>
                    </select></label>
                  </div>
                  <button type="button" onClick={() => setFixedActivities(previous => previous.filter(item => item.id !== activity.id))} className="text-xs text-red-500">移除此固定活動</button>
                </div>)}</div>
                <button type="button" onClick={() => setFixedActivities(previous => [...previous, { id: `fixed-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, date: '', startTime: '', endTime: '', title: '', area: '', type: 'activity' }])}
                  className="mt-3 flex items-center gap-1 text-sm font-bold text-purple-600 dark:text-purple-300"><Plus className="w-4 h-4" />新增固定活動</button>
              </details>
            </>}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-600 dark:text-[#c0cfe2] flex items-center gap-2"><Banknote className="w-4 h-4" /> 餐廳價位偏好</label>
              <div className="flex flex-wrap gap-3">
                {[
                  { key: 'high', label: '高 (NT$1000+)' },
                  { key: 'medium', label: '中 (NT$301-1000)' },
                  { key: 'low', label: '低 (NT$300以下)' }
                ].map((price) => (
                  <label key={price.key} className="flex items-center gap-2 bg-slate-50 dark:bg-[#0e1b2d] px-4 py-3 rounded-xl border border-slate-200 dark:border-[#314861] cursor-pointer hover:bg-slate-100 dark:hover:bg-[#132338] transition-colors">
                    <input type="checkbox" name={price.key} checked={basicData.priceRanges?.[price.key] || false} onChange={handlePriceChange} className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500 dark:bg-[#081321] dark:border-[#314861]" />
                    <span className="text-sm font-medium text-slate-700 dark:text-[#e8f1ff]">{price.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </section>

          <hr className="border-slate-100 dark:border-[#314861]" />
          
          {/* 航班資訊區塊 */}
          <section className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg md:text-xl font-bold text-slate-800 dark:text-[#e8f1ff] flex items-center gap-2">
                <span className="bg-indigo-100 dark:bg-indigo-900/50 p-2 rounded-lg text-indigo-600 dark:text-indigo-300">
                   {simpleFlights.outbound.mode === 'train' ? <Train className="w-5 h-5" /> : <Plane className="w-5 h-5" />}
                </span>
                交通方式 (飛機/火車)
              </h3>
              
              <div className="flex items-center gap-4">
                 <label className="flex items-center gap-2 cursor-pointer hover:bg-slate-50 dark:hover:bg-[#132338] p-2 rounded-lg transition-colors">
                  <input type="checkbox" checked={!basicData.hasFlights} onChange={() => setBasicData(prev => ({ ...prev, hasFlights: !prev.hasFlights }))} className="w-5 h-5 text-slate-500 rounded focus:ring-slate-500 dark:bg-[#081321] dark:border-[#314861]" />
                  <span className="text-sm font-bold text-slate-600 dark:text-[#c0cfe2]">無 (不需安排)</span>
                </label>

                {basicData.hasFlights && (
                  <label className="flex items-center gap-2 cursor-pointer hover:bg-slate-50 dark:hover:bg-[#132338] p-2 rounded-lg transition-colors">
                    <input type="checkbox" name="isMultiCityFlight" checked={basicData.isMultiCityFlight} onChange={handleBasicChange} className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500 dark:bg-[#081321] dark:border-[#314861]" />
                    <span className="text-sm font-bold text-slate-600 dark:text-[#c0cfe2]">多段/複雜行程</span>
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
                   <span className="block mt-1">日期與時間請填各地當地時間；跨日或時差航班請加填抵達日期。原機場／車站欄位：去程填抵達地，回程填出發地；多段交通請補上兩端地點。</span>
                 </div>
              </div>
            )}
            
            {basicData.hasFlights && (
              !basicData.isMultiCityFlight ? (
              <div className="bg-slate-50/50 dark:bg-[#0e1b2d]/50 p-4 md:p-6 rounded-2xl border border-slate-200 dark:border-[#314861] space-y-4 shadow-sm">
                <p className="text-xs text-slate-500 dark:text-[#9bafc9]">可直接修改時間、班次與交通工具，也可移除不需要的航段；移除後可加回，不必切換複雜行程。</p>
                {[ { label: '去程', key: 'outbound', color: 'text-emerald-600 dark:text-emerald-400' }, { label: '中轉', key: 'transit', color: 'text-amber-600 dark:text-amber-400' }, { label: '回程', key: 'inbound', color: 'text-blue-600 dark:text-blue-400' } ].filter(row => simpleFlights[row.key].enabled !== false).map((row) => (
                  <div key={row.key} className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center bg-white dark:bg-[#132338] p-3 rounded-xl border border-slate-100 dark:border-[#29405b] shadow-sm">
                    
                    {/* 標籤與模式切換 */}
                    <div className="col-span-1 md:col-span-12 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                      <span className={`text-sm font-bold ${row.color}`}>{row.label}</span>
                      <button 
                        onClick={() => handleSimpleFlightChange(row.key, 'mode', simpleFlights[row.key].mode === 'flight' ? 'train' : 'flight')}
                        className="p-1.5 bg-slate-100 dark:bg-[#0e1b2d] hover:bg-blue-100 dark:hover:bg-blue-900/30 text-slate-500 dark:text-[#9bafc9] hover:text-blue-600 dark:hover:text-blue-300 rounded-lg transition-colors"
                        title="切換 飛機/火車"
                        aria-label={`切換${row.label}交通工具`}
                      >
                        {simpleFlights[row.key].mode === 'train' ? <Train className="w-4 h-4" /> : <Plane className="w-4 h-4" />}
                      </button>
                      </div>
                      <button type="button" aria-label={`移除${row.label}航段`} onClick={() => setSimpleFlightEnabled(row.key, false)} className="flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs text-slate-500 hover:bg-red-50 hover:text-red-600"><Trash2 className="w-4 h-4" />移除</button>
                    </div>

                    {/* 日期 */}
                    <div className="col-span-1 md:col-span-4">
                      <label className="text-[10px] text-slate-400 dark:text-[#8ea3bf] pl-1 block">日期</label>
                      <input type="date" aria-label={`${row.label}出發日期`} value={simpleFlights[row.key].date} onChange={(e) => handleSimpleFlightChange(row.key, 'date', e.target.value)} className="w-full p-2 bg-slate-50 dark:bg-[#0e1b2d] border border-slate-200 dark:border-[#314861] rounded-lg text-sm font-bold text-slate-700 dark:text-[#e8f1ff]" />
                    </div>

                    {/* 時間 (拆分為出發/抵達) */}
                    <div className="col-span-2 md:col-span-2">
                        <label className="text-[10px] text-slate-400 dark:text-[#8ea3bf] pl-1 block">出發時間</label>
                        <input type="time" aria-label={`${row.label}出發時間`} value={simpleFlights[row.key].depTime} onChange={(e) => handleSimpleFlightChange(row.key, 'depTime', e.target.value)} className="w-full p-2 bg-slate-50 dark:bg-[#0e1b2d] border border-slate-200 dark:border-[#314861] rounded-lg text-sm dark:text-[#e8f1ff]" />
                    </div>
                    <div className="col-span-2 md:col-span-2 relative">
                        <label className="text-[10px] text-slate-400 dark:text-[#8ea3bf] pl-1 block">抵達時間</label>
                        <input type="time" aria-label={`${row.label}抵達時間`} value={simpleFlights[row.key].arrTime} onChange={(e) => handleSimpleFlightChange(row.key, 'arrTime', e.target.value)} className="w-full p-2 bg-slate-50 dark:bg-[#0e1b2d] border border-slate-200 dark:border-[#314861] rounded-lg text-sm dark:text-[#e8f1ff]" />
                        <div className="absolute -left-2 top-8 text-slate-300 dark:text-[#314861] text-xs">➜</div>
                    </div>

                    {/* 班次與地點 */}
                    <div className="col-span-2 md:col-span-2">
                        <label className="text-[10px] text-slate-400 dark:text-[#8ea3bf] pl-1 block">班次/車次</label>
                        <input type="text" aria-label={`${row.label}班次`} placeholder="例如 IT202" value={simpleFlights[row.key].code} onChange={(e) => handleSimpleFlightChange(row.key, 'code', e.target.value)} className="w-full p-2 bg-slate-50 dark:bg-[#0e1b2d] border border-slate-200 dark:border-[#314861] rounded-lg text-sm dark:text-[#e8f1ff]" />
                    </div>
                    <div className="col-span-2 md:col-span-2">
                        <label className="text-[10px] text-slate-400 dark:text-[#8ea3bf] pl-1 block">機場/車站代碼</label>
                        <input type="text" placeholder="例如 NRT" value={simpleFlights[row.key].station} onChange={(e) => handleSimpleFlightChange(row.key, 'station', e.target.value)} className="w-full p-2 bg-slate-50 dark:bg-[#0e1b2d] border border-slate-200 dark:border-[#314861] rounded-lg text-sm font-mono uppercase text-center dark:text-[#e8f1ff]" />
                    </div>
                    <div className="col-span-1 md:col-span-12 grid grid-cols-1 md:grid-cols-3 gap-3">
                      <label className="text-xs text-slate-500 dark:text-[#9bafc9]">抵達日期（未填預設同日）
                        <input type="date" aria-label={`${row.label}抵達日期`} value={simpleFlights[row.key].arrivalDate || ''} onChange={e => handleSimpleFlightChange(row.key, 'arrivalDate', e.target.value)} className="mt-1 w-full p-2 border border-slate-200 dark:border-[#314861] rounded-lg text-sm bg-slate-50 dark:bg-[#0e1b2d] dark:text-[#e8f1ff]" />
                      </label>
                      <label className="text-xs text-slate-500 dark:text-[#9bafc9]">出發機場／車站（選填）
                        <input aria-label={`${row.label}出發地點`} placeholder="例如 TPE 桃園機場" value={simpleFlights[row.key].departureStation || ''} onChange={e => handleSimpleFlightChange(row.key, 'departureStation', e.target.value)} className="mt-1 w-full p-2 border border-slate-200 dark:border-[#314861] rounded-lg text-sm bg-slate-50 dark:bg-[#0e1b2d] dark:text-[#e8f1ff]" />
                      </label>
                      <label className="text-xs text-slate-500 dark:text-[#9bafc9]">抵達機場／車站（選填）
                        <input aria-label={`${row.label}抵達地點`} placeholder="例如 NRT 成田機場" value={simpleFlights[row.key].arrivalStation || ''} onChange={e => handleSimpleFlightChange(row.key, 'arrivalStation', e.target.value)} className="mt-1 w-full p-2 border border-slate-200 dark:border-[#314861] rounded-lg text-sm bg-slate-50 dark:bg-[#0e1b2d] dark:text-[#e8f1ff]" />
                      </label>
                    </div>
                  </div>
                ))}
                <div className="flex flex-wrap gap-2">
                  {[['outbound', '去程'], ['transit', '中轉'], ['inbound', '回程']].filter(([key]) => simpleFlights[key].enabled === false).map(([key, label]) => <button key={key} type="button" onClick={() => setSimpleFlightEnabled(key, true)} className="flex items-center gap-1 rounded-xl border border-dashed border-slate-300 px-3 py-2 text-sm font-bold text-blue-600 hover:bg-blue-50"><Plus className="w-4 h-4" />新增{label}航段</button>)}
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {multiFlights.map((flight) => (
                  <div key={flight.id} className="bg-white dark:bg-[#132338] border border-slate-200 dark:border-[#29405b] rounded-xl overflow-hidden shadow-sm">
                    <div onClick={() => toggleMultiFlight(flight.id)} className="p-4 flex items-center justify-between cursor-pointer bg-slate-50/50 dark:bg-[#0e1b2d]/50 hover:bg-slate-100 dark:hover:bg-[#20334d]">
                      <div className="flex items-center gap-3">
                        <span className={`font-bold text-slate-700 dark:text-[#e8f1ff] bg-white dark:bg-[#0e1b2d] px-3 py-1 rounded-md border border-slate-200 dark:border-[#29405b] text-sm shadow-sm flex items-center gap-2`}>
                            {flight.mode === 'train' ? <Train className="w-3 h-3" /> : <Plane className="w-3 h-3" />}
                            {flight.type}
                        </span>
                        {!flight.isOpen && <span className="text-sm text-slate-500 dark:text-[#9bafc9]">{flight.date} | {flight.depTime} ➜ {flight.arrTime} | {flight.station}</span>}
                      </div>
                      <div className="flex items-center gap-2"><button onClick={(e) => { e.stopPropagation(); removeMultiFlight(flight.id); }} className="p-2 hover:bg-red-50 dark:hover:bg-red-900/30 text-slate-400 hover:text-red-500 rounded-full"><Trash2 className="w-4 h-4" /></button>{flight.isOpen ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}</div>
                    </div>
                    {flight.isOpen && (
                      <div className="p-4 grid grid-cols-2 md:grid-cols-6 gap-4 bg-white dark:bg-[#132338]">
                        <div className="col-span-1">
                            <label className="text-[10px] text-slate-400 dark:text-[#8ea3bf] block mb-1">類型</label>
                            <input placeholder="類型" value={flight.type} onChange={(e) => updateMultiFlight(flight.id, 'type', e.target.value)} className="w-full p-2 border border-slate-200 dark:border-[#314861] rounded-lg text-sm dark:bg-[#0e1b2d] dark:text-[#e8f1ff]" />
                        </div>
                        <div className="col-span-1">
                            <label className="text-[10px] text-slate-400 dark:text-[#8ea3bf] block mb-1">交通工具</label>
                            <select value={flight.mode} onChange={(e) => updateMultiFlight(flight.id, 'mode', e.target.value)} className="w-full p-2 border border-slate-200 dark:border-[#314861] rounded-lg text-sm bg-white dark:bg-[#0e1b2d] dark:text-[#e8f1ff]">
                              <option value="flight">飛機</option>
                              <option value="train">火車</option>
                            </select>
                        </div>
                        <label className="col-span-2 md:col-span-1 text-xs text-slate-500 dark:text-[#9bafc9]">航段用途
                          <select aria-label="航段用途" value={flight.role || 'auto'} onChange={e => updateMultiFlight(flight.id, 'role', e.target.value)} className="mt-1 w-full p-2 border border-slate-200 dark:border-[#314861] rounded-lg text-sm bg-white dark:bg-[#0e1b2d] dark:text-[#e8f1ff]">
                            <option value="auto">依順序判斷</option><option value="outbound">去程抵達</option><option value="transit">中轉銜接</option><option value="transfer">旅途中移動</option><option value="inbound">回程離境</option>
                          </select>
                        </label>
                        <div className="col-span-2 md:col-span-1">
                            <label className="text-[10px] text-slate-400 dark:text-[#8ea3bf] block mb-1">日期</label>
                            <input type="date" value={flight.date} onChange={(e) => updateMultiFlight(flight.id, 'date', e.target.value)} className="w-full p-2 border border-slate-200 dark:border-[#314861] rounded-lg text-sm dark:bg-[#0e1b2d] dark:text-[#e8f1ff]" />
                        </div>
                        <div className="col-span-1">
                            <label className="text-[10px] text-slate-400 dark:text-[#8ea3bf] block mb-1">出發時間</label>
                            <input type="time" value={flight.depTime} onChange={(e) => updateMultiFlight(flight.id, 'depTime', e.target.value)} className="w-full p-2 border border-slate-200 dark:border-[#314861] rounded-lg text-sm dark:bg-[#0e1b2d] dark:text-[#e8f1ff]" />
                        </div>
                        <div className="col-span-1">
                            <label className="text-[10px] text-slate-400 dark:text-[#8ea3bf] block mb-1">抵達時間</label>
                            <input type="time" value={flight.arrTime} onChange={(e) => updateMultiFlight(flight.id, 'arrTime', e.target.value)} className="w-full p-2 border border-slate-200 dark:border-[#314861] rounded-lg text-sm dark:bg-[#0e1b2d] dark:text-[#e8f1ff]" />
                        </div>
                        <div className="col-span-1">
                            <label className="text-[10px] text-slate-400 dark:text-[#8ea3bf] block mb-1">班次</label>
                            <input placeholder="班次" value={flight.code} onChange={(e) => updateMultiFlight(flight.id, 'code', e.target.value)} className="w-full p-2 border border-slate-200 dark:border-[#314861] rounded-lg text-sm dark:bg-[#0e1b2d] dark:text-[#e8f1ff]" />
                        </div>
                        <div className="col-span-1">
                            <label className="text-[10px] text-slate-400 dark:text-[#8ea3bf] block mb-1">地點代碼</label>
                            <input placeholder="機場/車站" value={flight.station} onChange={(e) => updateMultiFlight(flight.id, 'station', e.target.value)} className="w-full p-2 border border-slate-200 dark:border-[#314861] rounded-lg text-sm font-mono uppercase dark:bg-[#0e1b2d] dark:text-[#e8f1ff]" />
                        </div>
                        <label className="col-span-2 md:col-span-2 text-xs text-slate-500 dark:text-[#9bafc9]">抵達日期（未填預設同日）
                          <input type="date" aria-label="航段抵達日期" value={flight.arrivalDate || ''} onChange={e => updateMultiFlight(flight.id, 'arrivalDate', e.target.value)} className="mt-1 w-full p-2 border border-slate-200 dark:border-[#314861] rounded-lg text-sm dark:bg-[#0e1b2d] dark:text-[#e8f1ff]" />
                        </label>
                        <label className="col-span-1 md:col-span-2 text-xs text-slate-500 dark:text-[#9bafc9]">出發機場／車站
                          <input aria-label="航段出發地點" placeholder="出發地" value={flight.departureStation || ''} onChange={e => updateMultiFlight(flight.id, 'departureStation', e.target.value)} className="mt-1 w-full p-2 border border-slate-200 dark:border-[#314861] rounded-lg text-sm dark:bg-[#0e1b2d] dark:text-[#e8f1ff]" />
                        </label>
                        <label className="col-span-1 md:col-span-2 text-xs text-slate-500 dark:text-[#9bafc9]">抵達機場／車站
                          <input aria-label="航段抵達地點" placeholder="抵達地" value={flight.arrivalStation || ''} onChange={e => updateMultiFlight(flight.id, 'arrivalStation', e.target.value)} className="mt-1 w-full p-2 border border-slate-200 dark:border-[#314861] rounded-lg text-sm dark:bg-[#0e1b2d] dark:text-[#e8f1ff]" />
                        </label>
                      </div>
                    )}
                  </div>
                ))}
                <button onClick={addMultiFlight} className="w-full py-3 border-2 border-dashed border-slate-300 dark:border-[#314861] rounded-xl text-slate-500 dark:text-[#9bafc9] hover:border-blue-400 dark:hover:border-sky-500 flex items-center justify-center gap-2"><Plus className="w-5 h-5" /> 新增行程段</button>
              </div>
            ))}

            {basicData.hasFlights && <div className="grid grid-cols-1 md:grid-cols-2 gap-3 rounded-xl bg-slate-50 dark:bg-[#0e1b2d] p-4">
              <label className="text-xs text-slate-600 dark:text-[#c0cfe2]">飛機起飛前到機場預留（分鐘）
                <input type="number" min="0" max="720" name="flightDepartureBuffer" value={basicData.flightDepartureBuffer ?? 180} onChange={handleBasicChange} className="ml-2 w-20 p-2 border border-slate-200 dark:border-[#314861] rounded-lg dark:bg-[#132338]" />
              </label>
              <label className="text-xs text-slate-600 dark:text-[#c0cfe2]">飛機抵達後入境／領行李預留（分鐘）
                <input type="number" min="0" max="720" name="flightArrivalBuffer" value={basicData.flightArrivalBuffer ?? 90} onChange={handleBasicChange} className="ml-2 w-20 p-2 border border-slate-200 dark:border-[#314861] rounded-lg dark:bg-[#132338]" />
              </label>
              <p className="md:col-span-2 text-xs text-slate-500 dark:text-[#9bafc9]">以上是可調整的規劃預留值；往返機場交通另計。火車預設提前 30 分鐘到站、下車後預留 15 分鐘。</p>
            </div>}

            <div className="flex items-center gap-3 pt-2 bg-blue-50/50 dark:bg-[#0e1b2d]/50 p-4 rounded-xl border border-blue-100 dark:border-[#314861]">
                <input type="checkbox" id="transitTour" name="hasTransitTour" checked={basicData.hasTransitTour} onChange={handleBasicChange} className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500 dark:bg-[#081321] dark:border-[#314861]" />
                <label htmlFor="transitTour" className="text-slate-700 dark:text-[#e8f1ff] font-bold cursor-pointer text-sm md:text-base">安排轉機/中途入境觀光</label>
            </div>
          </section>

          <hr className="border-slate-100 dark:border-[#314861]" />

          {/* 住宿資訊區塊 */}
          <section className="space-y-4">
            <h3 className="text-lg md:text-xl font-bold text-slate-800 dark:text-[#e8f1ff] flex items-center gap-2"><span className="bg-orange-100 dark:bg-orange-900/50 p-2 rounded-lg text-orange-600 dark:text-orange-300"><Hotel className="w-5 h-5" /></span>住宿資訊</h3>
            <p className="text-xs md:text-sm text-slate-500 dark:text-[#9bafc9]">多間住宿請填每間入住與退房日期，行程會依每晚住處安排動線。單間未填日期時會暫用抵達至回程期間。入住／退房時間未填時暫用 15:00／11:00，請依訂單調整。</p>
            <div className="space-y-3">
              {accommodations.map((acc) => (
                <div key={acc.id} className="bg-white dark:bg-[#132338] border border-slate-200 dark:border-[#29405b] rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all">
                  <div onClick={() => toggleAccommodation(acc.id)} className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-50 dark:hover:bg-[#20334d]">
                    <div className="flex items-center gap-3"><div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-900/50 flex items-center justify-center text-orange-600 dark:text-orange-300 font-bold"><Hotel className="w-5 h-5" /></div><div><div className="font-bold text-slate-800 dark:text-[#e8f1ff] text-sm md:text-base">{acc.name || '新住宿地點'}</div><div className="text-xs text-slate-500 dark:text-[#9bafc9]">{acc.address}</div></div></div>
                    <div className="flex items-center gap-2"><button onClick={(e) => { e.stopPropagation(); removeAccommodation(acc.id); }} className="p-2 hover:bg-red-50 dark:hover:bg-red-900/30 text-slate-400 hover:text-red-500 rounded-full"><Trash2 className="w-4 h-4" /></button>{acc.isOpen ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}</div>
                  </div>
                  {acc.isOpen && (
                     <div className="p-5 bg-slate-50/50 dark:bg-[#0e1b2d]/50 border-t border-slate-100 dark:border-[#29405b] grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input value={acc.type} onChange={(e) => updateAccommodation(acc.id, 'type', e.target.value)} className="p-3 border border-slate-200 dark:border-[#314861] rounded-lg text-sm dark:bg-[#0e1b2d] dark:text-[#e8f1ff]" placeholder="類型" />
                        <input value={acc.name} onChange={(e) => updateAccommodation(acc.id, 'name', e.target.value)} className="p-3 border border-slate-200 dark:border-[#314861] rounded-lg text-sm dark:bg-[#0e1b2d] dark:text-[#e8f1ff]" placeholder="名稱" />
                        <input value={acc.address} onChange={(e) => updateAccommodation(acc.id, 'address', e.target.value)} className="p-3 border border-slate-200 dark:border-[#314861] rounded-lg text-sm md:col-span-2 dark:bg-[#0e1b2d] dark:text-[#e8f1ff]" placeholder={apiUsageMode === 'free' ? '住宿地區即可，例如東京上野、首爾弘大' : '完整地址'} />
                        <label className="text-xs text-slate-500 dark:text-[#9bafc9]">入住日期
                          <input type="date" aria-label="住宿入住日期" value={acc.checkInDate || ''} onChange={e => updateAccommodation(acc.id, 'checkInDate', e.target.value)} className="mt-1 w-full p-3 border border-slate-200 dark:border-[#314861] rounded-lg text-sm dark:bg-[#0e1b2d] dark:text-[#e8f1ff]" />
                        </label>
                        <label className="text-xs text-slate-500 dark:text-[#9bafc9]">退房日期
                          <input type="date" aria-label="住宿退房日期" value={acc.checkOutDate || ''} onChange={e => updateAccommodation(acc.id, 'checkOutDate', e.target.value)} className="mt-1 w-full p-3 border border-slate-200 dark:border-[#314861] rounded-lg text-sm dark:bg-[#0e1b2d] dark:text-[#e8f1ff]" />
                        </label>
                        <label className="text-xs text-slate-500 dark:text-[#9bafc9]">最早入住時間（預設 15:00）
                          <input type="time" aria-label="住宿最早入住時間" value={acc.checkInTime || ''} onChange={e => updateAccommodation(acc.id, 'checkInTime', e.target.value)} className="mt-1 w-full p-3 border border-slate-200 dark:border-[#314861] rounded-lg text-sm dark:bg-[#0e1b2d] dark:text-[#e8f1ff]" />
                        </label>
                        <label className="text-xs text-slate-500 dark:text-[#9bafc9]">最晚退房時間（預設 11:00）
                          <input type="time" aria-label="住宿最晚退房時間" value={acc.checkOutTime || ''} onChange={e => updateAccommodation(acc.id, 'checkOutTime', e.target.value)} className="mt-1 w-full p-3 border border-slate-200 dark:border-[#314861] rounded-lg text-sm dark:bg-[#0e1b2d] dark:text-[#e8f1ff]" />
                        </label>
                     </div>
                  )}
                </div>
              ))}
              <button onClick={addAccommodation} className="w-full py-3 border-2 border-dashed border-slate-300 dark:border-[#314861] rounded-xl text-slate-500 dark:text-[#9bafc9] flex justify-center items-center gap-2 hover:border-orange-400 dark:hover:border-orange-500"><Plus className="w-5 h-5" /> 新增住宿</button>
            </div>
          </section>

        </div> 
        {/* ^ 這個 div 是 space-y-6 的結束 */}

        <div className="space-y-4 pt-4">
          <button onClick={generateItinerary} className="w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white font-bold py-5 rounded-2xl shadow-xl hover:shadow-2xl hover:scale-[1.01] transform transition-all flex justify-center items-center gap-3 text-lg md:text-xl ring-4 ring-blue-100 dark:ring-[#314861]">
            <Sparkles className="w-6 h-6 animate-pulse" /> 開始 AI 一鍵規劃
          </button>
          <button onClick={() => setStep('saved_list')} className="w-full bg-white dark:bg-[#132338] border-2 border-slate-200 dark:border-[#314861] text-slate-600 dark:text-[#c0cfe2] font-bold py-4 rounded-2xl hover:bg-slate-50 dark:hover:bg-[#20334d] hover:border-slate-300 transition-all flex justify-center items-center gap-2">
            <List className="w-5 h-5" /> 查看已儲存的規劃 ({savedPlans.length})
          </button>
          <label className="w-full bg-white dark:bg-[#132338] border-2 border-dashed border-slate-300 dark:border-[#314861] text-slate-500 dark:text-[#9bafc9] font-bold py-4 rounded-2xl hover:bg-slate-50 dark:hover:bg-[#20334d] hover:border-blue-400 hover:text-blue-500 transition-all flex justify-center items-center gap-2 cursor-pointer">
            <Upload className="w-5 h-5" /> 匯入 JSON
            <input type="file" accept=".json" onChange={handleImportJSON} className="hidden" />
          </label>
        </div>
        {errorMsg && <div role="alert" className="p-4 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-300 rounded-xl space-y-3 border border-red-100 dark:border-red-800 animate-shake">
          <div className="flex items-start gap-2"><AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" /><span>{errorMsg}</span></div>
        </div>}
      </div>
    );
  };

  const renderLoading = () => (
      <FunLoading destination={basicData.destinations} status={generationStatus?.stage === 'waiting' ? generationStatus : geminiModels.requestState || generationStatus}
        selectedInfo={apiUsageMode === 'free' ? BASIC_TRIP_DETAIL_OPTIONS.filter(option => normalizeBasicDetailOptions(detailOptions)[option.key]).map(option => option.label) : []}
        onCancel={() => generationController.current?.abort()} />
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
        <div className="travel-panel bg-white/90 dark:bg-[#14243a]/90 backdrop-blur-md p-5 md:p-8 rounded-3xl shadow-lg border border-white/50 dark:border-[#314861] relative overflow-hidden print:border-none print:shadow-none print:bg-white print:p-0">
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 print:hidden"></div>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 md:gap-6 relative z-10">
            <div className="w-full">
                <div className="flex flex-wrap items-center gap-3 mb-2">
                {/* text-slate-800 -> dark:text-[#e8f1ff] */}
                <h2 className="text-2xl md:text-3xl font-extrabold text-slate-800 dark:text-[#e8f1ff] print:text-black">{basicData.destinations}</h2>
                {/* ... */}
                </div>
                {/* text-slate-600 -> dark:text-[#c0cfe2] */}
                <p className="text-slate-600 dark:text-[#c0cfe2] max-w-2xl text-base md:text-lg leading-relaxed print:text-black">{itineraryData.trip_summary}</p>
                {itineraryData.booking_context?.assumptions?.length > 0 && <details className="mt-3 text-sm text-amber-800 dark:text-amber-200 bg-amber-50 dark:bg-amber-900/20 rounded-xl p-3">
                  <summary className="cursor-pointer font-bold">規劃時採用的假設（{itineraryData.booking_context.assumptions.length}）</summary>
                  <ul className="list-disc pl-5 mt-2 space-y-1">{itineraryData.booking_context.assumptions.map((assumption, index) => <li key={index}>{assumption}</li>)}</ul>
                </details>}
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

              <div>
                <button
                  type="button" aria-label="預覽與複製行程" aria-haspopup="dialog"
                  onClick={() => setSharePreviewMode('simple')}
                  className="p-3 md:p-4 rounded-full transition-all shadow-md hover:bg-slate-50 bg-white text-slate-500 flex items-center gap-2" 
                  title="複製文字分享"
                >
                  <Copy className="w-5 h-5" />
                </button>
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

        {itineraryData.planning_mode === 'basic' && <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          <p className="font-bold">免費簡易行程：交通時間保留，活動時間與住宿地區路線為概估。</p>
          <p className="mt-1">{itineraryData.detail_options ? `本次選擇：${BASIC_TRIP_DETAIL_OPTIONS.filter(option => itineraryData.detail_options[option.key]).map(option => option.label).join('、') || '景點與交通時間表'}。` : '景點與交通時間表。'}路線、價格與季節資訊為建議，營業、寄存服務與住宿政策請於出發前確認。</p>
          <p className="mt-2">點選景點右上方的紫色 AI 按鈕，即可按需生成深度導覽；已生成的內容可直接重看。</p>
          {itineraryData.fallback_message && <p className="mt-2 font-medium">{itineraryData.fallback_message}</p>}
        </div>}
        {itineraryData.request_reports?.length > 0 && <details className="rounded-2xl border border-purple-200 bg-purple-50 p-4 text-sm text-purple-900">
          <summary className="cursor-pointer font-bold">特殊要求檢核（{itineraryData.request_reports.length} 項）</summary>
          <ul className="mt-3 space-y-3">{itineraryData.request_reports.map(report => <li key={report.id}>
            <span className="font-bold">{{ scheduled: '已安排', considered: '已納入偏好', needs_confirmation: '需要確認', cannot_fit: '目前無法安排' }[report.status] || '需要確認'}：</span>{report.text}
            <p className="mt-1 text-xs text-purple-700">{report.note}</p>
          </li>)}</ul>
        </details>}

        {/* --- 功能 3: 城市指南區域 --- */}
        {itineraryData.city_guides && Object.keys(itineraryData.city_guides).length > 0 && (
          <CityGuide 
            guideData={itineraryData.city_guides} 
            cities={Object.keys(itineraryData.city_guides)}
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
             key={`${activeTab}-${currentDay.adjustment_revision || 0}`}
             day={currentDay} 
             dayIndex={activeTab} 
             expenses={expenses}
             setExpenses={setExpenses}
             travelers={travelerNames}
             currencySettings={currencySettings}
             isPrintMode={false} 
             apiKey={apiKey}
             geminiRequestMessage={geminiModels.requestState?.message}
             updateItineraryItem={updateItineraryItem}
             onSavePlan={saveCurrentPlan}
             onDeleteClick={handleDeleteItem} 
             onEditClick={openEditModal}
             onTimeUpdate={handleTimeUpdate}
             onAddClick={openAddModal}
             onIconClick={(dIdx, tIdx) => setIconSelectModalData({ dayIndex: dIdx, timelineIndex: tIdx })}
             onUpdateDayInfo={updateDayInfo}
             onRefreshWeather={handleWeatherRefresh}
             onAdjustDay={openDayAdjustment}
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
    <div className="travel-shell min-h-screen p-4 md:p-8 relative overflow-hidden transition-colors duration-500">
      <style id="travel-adaptive-theme">{TRAVEL_THEME_CSS}</style>
      
      {/* 2. 背景裝飾貼紙 (浮水印) - 調整深色模式的顏色與透明度 */}
      <div className="travel-decoration fixed top-20 left-10 text-sky-200 dark:text-sky-900/40 opacity-20 pointer-events-none animate-pulse"><Fish className="w-24 h-24 -rotate-12" /></div>
      <div className="travel-decoration fixed bottom-10 right-10 text-rose-200 dark:text-rose-900/40 opacity-20 pointer-events-none"><Palmtree className="w-32 h-32 rotate-6" /></div>
      <div className="travel-decoration fixed top-40 right-20 text-amber-200 dark:text-amber-900/40 opacity-20 pointer-events-none animate-bounce" style={{animationDuration: '3s'}}><Bird className="w-16 h-16" /></div>

      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* ✅ 修改 2：主標題 Header */}
        {/* 系統深色模式：深藍卡片與柔和光暈 */}
        
        <header className="travel-header text-center mb-8 md:mb-12 py-8 px-4 bg-white/60 dark:bg-[#14243a]/80 backdrop-blur-md rounded-[3rem] shadow-xl border-4 border-white dark:border-[#314861] relative overflow-hidden transition-colors duration-300">
          
          {/* 標題背景裝飾 */}
          <div className="absolute top-[-20px] left-[-20px] text-yellow-300 dark:text-yellow-600/30 opacity-30"><Sun className="w-24 h-24 animate-spin-slow" /></div>
          <div className="absolute bottom-[-10px] right-[-10px] text-blue-300 dark:text-blue-900/30 opacity-20"><CarFront className="w-20 h-20" /></div>
          
          <h1 className="text-4xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-rose-400 to-amber-400 dark:from-sky-300 dark:via-indigo-300 dark:to-teal-200 drop-shadow-sm flex items-center justify-center gap-3 relative z-10">
            <Plane className="w-10 h-10 md:w-14 md:h-14 text-sky-400 dark:text-sky-300 animate-bounce-slow" /> 
            AI 旅遊規劃小幫手 
            <span className="text-2xl md:text-4xl">✨</span>
          </h1>
           {!apiKey && (
            <p className="text-slate-500 dark:text-[#c0cfe2] mt-3 text-sm md:text-base bg-white/80 dark:bg-[#0e1b2d]/50 inline-block px-4 py-1 rounded-full">
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

        {geminiModels.requestState && (
          <div role="status" aria-live="polite" className="fixed bottom-4 left-4 right-4 mx-auto max-w-xl z-[1100] flex items-start gap-2 rounded-xl border border-blue-200 dark:border-[#314861] bg-white dark:bg-[#0e1b2d] p-4 shadow-lg text-sm text-blue-700 dark:text-sky-300">
            <Loader2 className="w-4 h-4 mt-0.5 shrink-0 animate-spin" />
            <span>{geminiModels.requestState.message}</span>
          </div>
        )}

        {/* Modal 區塊 */}
        {step === 'result' && dayAdjustment && <DayAdjustmentModal state={dayAdjustment} onClose={closeDayAdjustment}
          onInstructionChange={instruction => setDayAdjustment(prev => ({ ...prev, instruction, error: '', summary: '' }))}
          onSubmit={submitDayAdjustment} requestMessage={geminiModels.requestState?.message} />}
        {step === 'result' && sharePreviewMode && <ShareItineraryModal mode={sharePreviewMode}
          text={getItineraryShareText(itineraryData, basicData.destinations, sharePreviewMode)}
          onModeChange={setSharePreviewMode} onClose={() => setSharePreviewMode(null)} />}
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
