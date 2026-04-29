import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [language, setLanguage] = useState('en');
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);

  const isRTL = language === 'ar';

  const t = {
    en: {
      subtitle: "Gift Finder",
      placeholder: "e.g., thoughtful gift for a 6-month-old, under 200 AED",
      submit: "Find Gifts",
      loading: "Analyzing your request...",
      queryUnderstanding: "We understood:",
      age: "Age",
      budget: "Budget",
      occasion: "Occasion",
      detectedLanguage: "Language Detected",
      outOfScope: "Sorry, we couldn't find matching gifts for this query. Please try searching for baby/mom products.",
      confidence: "Confidence",
      noReasoning: "No reasoning provided.",
      months: "months",
      aed: "AED",
      notSpecified: "Not specified"
    },
    ar: {
      subtitle: "الباحث عن الهدايا",
      placeholder: "مثال: هدية مميزة لطفل عمره 6 أشهر، بأقل من 200 درهم",
      submit: "ابحث عن الهدايا",
      loading: "جاري تحليل طلبك...",
      queryUnderstanding: "لقد فهمنا:",
      age: "العمر",
      budget: "الميزانية",
      occasion: "المناسبة",
      detectedLanguage: "اللغة المكتشفة",
      outOfScope: "عذراً، لم نتمكن من العثور على هدايا مطابقة لهذا البحث. يرجى محاولة البحث عن منتجات للأطفال/الأمهات.",
      confidence: "الثقة",
      noReasoning: "لم يتم تقديم سبب.",
      months: "شهر",
      aed: "درهم",
      notSpecified: "غير محدد"
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError(null);
    setResults(null);

    try {
      const res = await fetch("http://localhost:3002/api/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, language })
      });
      
      if (!res.ok) {
        throw new Error("Failed to fetch recommendations.");
      }

      const data = await res.json();
      setResults(data);
    } catch (err) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen bg-gray-950 text-gray-100 font-sans ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-900 sticky top-0 z-10 shadow-md">
        <div className="max-w-5xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-baseline space-x-3 rtl:space-x-reverse">
            <h1 className="text-3xl font-extrabold text-rose-500 tracking-tight">mumzworld</h1>
            <span className="text-gray-400 font-medium hidden sm:inline">{t[language].subtitle}</span>
          </div>
          <button 
            onClick={() => setLanguage(language === 'en' ? 'ar' : 'en')}
            className="px-4 py-2 rounded-full bg-gray-800 hover:bg-gray-700 text-sm font-semibold transition-colors focus:ring-2 focus:ring-rose-500 outline-none"
          >
            {language === 'en' ? 'العربية' : 'English'}
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        {/* Search Section */}
        <section className="mb-12">
          <div className="max-w-2xl mx-auto text-center mb-8">
            <h2 className="text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-rose-400 to-pink-600">
              {language === 'en' ? 'Find the Perfect Gift' : 'ابحث عن الهدية المثالية'}
            </h2>
            <p className="text-gray-400 text-lg">
              {language === 'en' ? 'Tell us who you are buying for, and our AI will handpick the best options.' : 'أخبرنا لمن تشتري الهدية، وسيقوم الذكاء الاصطناعي باختيار أفضل الخيارات.'}
            </p>
          </div>
          
          <form onSubmit={handleSearch} className="max-w-3xl mx-auto relative group">
            <div className="absolute inset-y-0 start-0 flex items-center ps-4 pointer-events-none">
              <svg className="w-6 h-6 text-gray-500 group-focus-within:text-rose-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
              </svg>
            </div>
            <input
              type="text"
              className="w-full bg-gray-900 border border-gray-700 text-gray-100 rounded-2xl py-4 ps-12 pe-32 text-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all shadow-lg placeholder-gray-600"
              placeholder={t[language].placeholder}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <button
              type="submit"
              disabled={loading}
              className="absolute end-2 top-2 bottom-2 bg-rose-600 hover:bg-rose-500 text-white font-bold px-6 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
            >
              {t[language].submit}
            </button>
          </form>
        </section>

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="w-12 h-12 border-4 border-gray-800 border-t-rose-500 rounded-full animate-spin mb-4"></div>
            <p className="text-gray-400 animate-pulse">{t[language].loading}</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-900/20 border border-red-800 text-red-400 p-4 rounded-xl text-center max-w-2xl mx-auto">
            {error}
          </div>
        )}

        {/* Results */}
        {results && !loading && (
          <div className="space-y-8 animate-fade-in">
            {results.out_of_scope ? (
              <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 text-center max-w-2xl mx-auto">
                <p className="text-xl text-gray-300">{t[language].outOfScope}</p>
              </div>
            ) : (
              <>
                {/* Query Understanding Card */}
                {results.query_understanding && (
                  <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6 max-w-3xl mx-auto shadow-inner">
                    <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">{t[language].queryUnderstanding}</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-xs text-gray-500 mb-1">{t[language].age}</p>
                        <p className="font-semibold text-rose-300">
                          {results.query_understanding.recipient_age_months !== null 
                            ? `${results.query_understanding.recipient_age_months} ${t[language].months}` 
                            : t[language].notSpecified}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">{t[language].budget}</p>
                        <p className="font-semibold text-rose-300">
                          {results.query_understanding.budget_aed !== null 
                            ? `${results.query_understanding.budget_aed} ${t[language].aed}` 
                            : t[language].notSpecified}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">{t[language].occasion}</p>
                        <p className="font-semibold text-rose-300 truncate" title={results.query_understanding.occasion || t[language].notSpecified}>
                          {results.query_understanding.occasion || t[language].notSpecified}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">{t[language].detectedLanguage}</p>
                        <p className="font-semibold text-rose-300 uppercase">
                          {results.query_understanding.language_detected || '-'}
                        </p>
                      </div>
                    </div>
                    {/* Uncertainty Message */}
                    {((language === 'en' && results.uncertainty_message_en) || (language === 'ar' && results.uncertainty_message_ar)) && (
                      <div className="mt-4 pt-4 border-t border-gray-800">
                        <p className="text-sm text-amber-400/80 italic flex items-center">
                          <span className="me-2 text-amber-500">ℹ</span>
                          {language === 'en' ? results.uncertainty_message_en : results.uncertainty_message_ar}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Recommendations */}
                {results.recommendations && results.recommendations.length > 0 && (
                  <div className="space-y-6">
                    {results.recommendations.map((item, index) => (
                      <div key={item.product_id || index} className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden shadow-lg hover:border-gray-700 transition-colors">
                        <div className="p-6 md:p-8">
                          <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-6 gap-4">
                            <div className="flex-1">
                              <h3 className="text-2xl font-bold mb-2">
                                <span className="block" dir="ltr">{item.name_en}</span>
                                <span className="block text-gray-400 mt-1" dir="rtl">{item.name_ar}</span>
                              </h3>
                            </div>
                            <div className="text-start md:text-end">
                              <span className="inline-block bg-rose-500/10 text-rose-400 px-4 py-2 rounded-xl font-bold text-xl border border-rose-500/20">
                                {item.price_aed} {t[language].aed}
                              </span>
                            </div>
                          </div>
                          
                          <div className="grid md:grid-cols-2 gap-6 bg-gray-950/50 rounded-xl p-4 md:p-6 border border-gray-800/50">
                            <div dir="ltr" className="space-y-2">
                              <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Why this is great</h4>
                              <p className="text-gray-300 leading-relaxed text-sm">{item.reasoning_en || t.en.noReasoning}</p>
                            </div>
                            <div dir="rtl" className="space-y-2">
                              <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">سبب الاختيار</h4>
                              <p className="text-gray-300 leading-relaxed text-sm">{item.reasoning_ar || t.ar.noReasoning}</p>
                            </div>
                          </div>

                          {item.confidence !== undefined && (
                            <div className="mt-6 flex items-center justify-end">
                              <div className="flex items-center space-x-2 rtl:space-x-reverse">
                                <span className="text-xs font-medium text-gray-500">{t[language].confidence}:</span>
                                <div className="w-32 h-2 bg-gray-800 rounded-full overflow-hidden">
                                  <div 
                                    className="h-full bg-gradient-to-r from-rose-600 to-rose-400" 
                                    style={{ width: `${Math.min(100, Math.max(0, item.confidence * 100))}%` }}
                                  ></div>
                                </div>
                                <span className="text-xs font-bold text-gray-300">{Math.round(item.confidence * 100)}%</span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
