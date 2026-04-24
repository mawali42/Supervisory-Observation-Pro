import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  ClipboardCheck, 
  ChevronLeft, 
  ChevronRight, 
  User, 
  Calendar, 
  BookOpen, 
  Award, 
  TrendingUp, 
  MessageSquare,
  Mail,
  Printer,
  FileText,
  Info,
  RotateCcw,
  Sparkles,
  Loader2
} from "lucide-react";
import { 
  INDICATORS, 
  VISITOR_ROLES, 
  DAYS_AR, 
  PERIODS, 
  GRADES_AR 
} from "./constants";
import { VisitInfo, EvaluationState } from "./types";
import { generateProfessionalReport, GeneratedReport } from "./services/geminiService";

export default function App() {
  const [step, setStep] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedReport, setGeneratedReport] = useState<GeneratedReport | null>(null);
  const [visitInfo, setVisitInfo] = useState<VisitInfo>({
    visitorRole: "",
    visitorName: "",
    teacherName: "",
    visitDate: "",
    visitDay: "",
    subject: "",
    period: "",
    grade: "",
    section: "",
    lessonTitle: "",
  });

  const [ratings, setRatings] = useState<EvaluationState>({});
  const [activeHint, setActiveHint] = useState<number | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const handleVisitInfoChange = (field: keyof VisitInfo, value: string) => {
    setVisitInfo((prev) => ({ ...prev, [field]: value }));
  };

  const handleRatingChange = (indicatorId: number, value: number) => {
    setRatings((prev) => ({ ...prev, [indicatorId]: value }));
    // Invalidate report if ratings change
    setGeneratedReport(null);
  };

  const handleGenerateReport = async () => {
    setStep(3);
    if (generatedReport) return;

    setIsGenerating(true);
    const excellenceItems = INDICATORS
      .filter(ind => ratings[ind.id] !== undefined && (ratings[ind.id] === 1 || ratings[ind.id] === 2))
      .map(ind => ({ indicator: ind, rating: ratings[ind.id]! }));
    
    const improvementItems = INDICATORS
      .filter(ind => ratings[ind.id] !== undefined && ratings[ind.id] >= 3)
      .map(ind => ({ indicator: ind, rating: ratings[ind.id]! }));

    // Force prompt to focus only on recommendations and support since we handle excellence/improvement statically
    const result = await generateProfessionalReport(excellenceItems, improvementItems);
    setGeneratedReport(result);
    setIsGenerating(false);
  };

  const staticReport = useMemo(() => {
    const excellenceEntries = INDICATORS
      .filter(ind => ratings[ind.id] !== undefined && (ratings[ind.id] === 1 || ratings[ind.id] === 2))
      .map(ind => {
        const optionText = ind.options.find(opt => opt.value === ratings[ind.id])?.text || "";
        return `في معيار (${ind.standard}): ${optionText}. وثبت ذلك من خلال ${ind.goodEvidence}`;
      });

    const improvementEntries = INDICATORS
      .filter(ind => ratings[ind.id] !== undefined && ratings[ind.id] >= 3)
      .map(ind => {
        const optionText = ind.options.find(opt => opt.value === ratings[ind.id])?.text || "";
        return `في معيار (${ind.standard}): ${optionText}. وثبت ذلك من خلال ${ind.improvementEvidence}`;
      });

    return {
      excellence: excellenceEntries.join("\n\n"),
      improvement: improvementEntries.join("\n\n")
    };
  }, [ratings]);

  const resetForm = () => {
    setStep(1);
    setGeneratedReport(null);
    setVisitInfo({
      visitorRole: "",
      visitorName: "",
      teacherName: "",
      visitDate: "",
      visitDay: "",
      subject: "",
      period: "",
      grade: "",
      section: "",
      lessonTitle: "",
    });
    setRatings({});
    setShowResetConfirm(false);
  };

  const isStep1Valid = useMemo(() => {
    return Object.values(visitInfo).every((v) => v !== "");
  }, [visitInfo]);

  const isStep2Valid = useMemo(() => {
    return INDICATORS.every((ind) => ratings[ind.id] !== undefined);
  }, [ratings]);

  const getRatingLabel = (val: number) => {
    switch (val) {
      case 1: return "1 - متميز";
      case 2: return "2 - جيد";
      case 3: return "3 - ملائم";
      case 4: return "4 - غير ملائم";
      case 5: return "5 - يحتاج تدخل";
      default: return "-";
    }
  };

  const getRatingColor = (val: number) => {
    switch (val) {
      case 1: return "text-emerald-700 border-emerald-500 bg-emerald-50";
      case 2: return "text-blue-700 border-blue-500 bg-blue-50";
      case 3: return "text-amber-700 border-amber-500 bg-amber-50";
      case 4: return "text-orange-700 border-orange-500 bg-orange-50";
      case 5: return "text-rose-700 border-rose-500 bg-rose-50";
      default: return "bg-gray-100 border-gray-200 text-gray-400";
    }
  };

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8" dir="rtl">
      <div className="max-w-4xl mx-auto">
        <div className="hd-container">
          <header className="hd-header text-right">
            <h1 className="text-2xl font-bold mb-1">استمارة الزيارة الإشرافية</h1>
            <p className="text-sm opacity-80">تعبئة البيانات الأساسية للزيارة الصفية</p>
            
            <div className="flex justify-center items-center mt-6 gap-2 no-print">
              {[1, 2, 3].map((s) => (
                <div key={s} className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${step >= s ? 'bg-white text-primary shadow-sm' : 'bg-white/20 text-white/50'}`}>
                    {s}
                  </div>
                  {s < 3 && <div className={`w-8 h-px transition-colors ${step > s ? 'bg-white' : 'bg-white/20'} w-10 md:w-16`} />}
                </div>
              ))}
            </div>
          </header>

          <main>
            <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="hd-form-grid"
              >
                <div className="space-y-2">
                  <label className="hd-label">صفة الزائر</label>
                  <select
                    value={visitInfo.visitorRole}
                    onChange={(e) => handleVisitInfoChange("visitorRole", e.target.value)}
                    className="hd-input"
                  >
                    <option value="">اختر الصفة...</option>
                    {VISITOR_ROLES.map(role => <option key={role} value={role}>{role}</option>)}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="hd-label">اسم الزائر</label>
                  <input
                    type="text"
                    placeholder="أدخل اسم الزائر"
                    value={visitInfo.visitorName}
                    onChange={(e) => handleVisitInfoChange("visitorName", e.target.value)}
                    className="hd-input"
                  />
                </div>

                <div className="space-y-2">
                  <label className="hd-label">المعلم المزور</label>
                  <input
                    type="text"
                    placeholder="اسم المعلم المزور"
                    value={visitInfo.teacherName}
                    onChange={(e) => handleVisitInfoChange("teacherName", e.target.value)}
                    className="hd-input"
                  />
                </div>

                <div className="space-y-2">
                  <label className="hd-label">المادة</label>
                  <input
                    type="text"
                    placeholder="أدخل اسم المادة"
                    value={visitInfo.subject}
                    onChange={(e) => handleVisitInfoChange("subject", e.target.value)}
                    className="hd-input"
                  />
                </div>

                <div className="space-y-2">
                  <label className="hd-label">تاريخ الزيارة</label>
                  <input
                    type="date"
                    value={visitInfo.visitDate}
                    onChange={(e) => handleVisitInfoChange("visitDate", e.target.value)}
                    className="hd-input"
                  />
                </div>

                <div className="space-y-2">
                  <label className="hd-label">اليوم</label>
                  <select
                    value={visitInfo.visitDay}
                    onChange={(e) => handleVisitInfoChange("visitDay", e.target.value)}
                    className="hd-input"
                  >
                    <option value="">اختر اليوم...</option>
                    {DAYS_AR.map(day => <option key={day} value={day}>{day}</option>)}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="hd-label">الحصة</label>
                  <select
                    value={visitInfo.period}
                    onChange={(e) => handleVisitInfoChange("period", e.target.value)}
                    className="hd-input"
                  >
                    <option value="">اختر الحصة...</option>
                    {PERIODS.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="hd-label">الصف</label>
                  <select
                    value={visitInfo.grade}
                    onChange={(e) => handleVisitInfoChange("grade", e.target.value)}
                    className="hd-input"
                  >
                    <option value="">اختر الصف...</option>
                    {GRADES_AR.map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="hd-label">الفصل</label>
                  <select
                    value={visitInfo.section}
                    onChange={(e) => handleVisitInfoChange("section", e.target.value)}
                    className="hd-input"
                  >
                    <option value="">اختر الرقم...</option>
                    {Array.from({length: 25}, (_, i) => i + 1).map(f => (
                      <option key={f} value={f}>{f}</option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-3 space-y-2">
                  <label className="hd-label">عنوان الدرس</label>
                  <input
                    type="text"
                    placeholder="أدخل عنوان الدرس بالتفصيل"
                    value={visitInfo.lessonTitle}
                    onChange={(e) => handleVisitInfoChange("lessonTitle", e.target.value)}
                    className="hd-input"
                  />
                </div>

                <div className="md:col-span-3 flex justify-center mt-6">
                  <button
                    disabled={!isStep1Valid}
                    onClick={() => setStep(2)}
                    className={`hd-btn-primary ${!isStep1Valid && 'opacity-50 cursor-not-allowed'}`}
                  >
                    <span>الانتقال إلى بنود التقييم</span>
                    <ChevronLeft size={18} />
                  </button>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="p-6 md:p-10 space-y-8"
              >
                {Array.from(new Set(INDICATORS.map(i => i.domain))).map(domain => (
                  <div key={domain} className="border border-border-theme rounded-xl overflow-hidden bg-[#fafbfc]">
                    <div className="bg-primary/5 px-6 py-4 border-b border-border-theme">
                      <h3 className="text-primary font-bold text-lg flex items-center gap-2">
                        <Award size={20} />
                        المجال: {domain}
                      </h3>
                    </div>
                    <div className="divide-y divide-border-theme bg-white">
                      {INDICATORS.filter(i => i.domain === domain).map(ind => (
                        <div key={ind.id} className="p-6 space-y-4">
                          <div className="flex items-start gap-4">
                            <span className="bg-primary text-white w-7 h-7 rounded-md flex items-center justify-center font-bold text-xs shrink-0 shadow-sm">
                              {ind.id}
                            </span>
                            <div>
                              <p className="text-[10px] uppercase tracking-wider font-bold text-accent/70 mb-1">المعيار: {ind.standard}</p>
                              <p className="text-sm md:text-base font-semibold text-text leading-relaxed">{ind.text}</p>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                            <div className="md:col-span-3 space-y-2">
                              <div className="flex items-center justify-between">
                                <label className="hd-label text-xs opacity-60">وصف الانتشار</label>
                                {ind.hint && (
                                  <button 
                                    onClick={() => setActiveHint(activeHint === ind.id ? null : ind.id)}
                                    className={`p-1 rounded-full transition-colors ${activeHint === ind.id ? 'bg-primary text-white' : 'text-primary hover:bg-primary/10'}`}
                                    title="توضيح وصف الانتشار"
                                  >
                                    <Info size={14} />
                                  </button>
                                )}
                              </div>
                              <select
                                value={ratings[ind.id] || ""}
                                onChange={(e) => handleRatingChange(ind.id, parseInt(e.target.value))}
                                className="hd-input text-xs md:text-sm"
                              >
                                <option value="" disabled>اختر وصف الانتشار...</option>
                                {ind.options.map(opt => (
                                  <option key={opt.value} value={opt.value}>{opt.text}</option>
                                ))}
                              </select>

                              {/* Dynamic Option-based Hint */}
                              {ratings[ind.id] && ind.options.find(o => o.value === ratings[ind.id])?.hint && (
                                <motion.div 
                                  initial={{ opacity: 0, y: -5 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  className="mt-2 p-3 bg-emerald-50 border border-emerald-100 rounded-lg text-[11px] text-emerald-800 leading-relaxed shadow-sm"
                                >
                                  <div className="flex gap-2">
                                    <div className="shrink-0 w-1 h-auto bg-emerald-400 rounded-full" />
                                    <p className="font-medium">{ind.options.find(o => o.value === ratings[ind.id])?.hint}</p>
                                  </div>
                                </motion.div>
                              )}

                              <AnimatePresence>
                                {activeHint === ind.id && (
                                  <motion.div 
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="overflow-hidden"
                                  >
                                    <div className="mt-4 p-4 bg-primary/5 border border-primary/20 rounded-xl space-y-3">
                                      <div className="flex items-center gap-2 mb-2 pb-2 border-b border-primary/10">
                                        <Info size={16} className="text-primary" />
                                        <span className="text-xs font-bold text-primary italic">دليل التمييز بين مستويات وصف الانتشار:</span>
                                      </div>
                                      <div className="grid gap-2">
                                        {ind.options.map((opt) => (
                                          <div key={opt.value} className="flex gap-3 text-[11px] bg-white/50 p-2 rounded-lg border border-transparent hover:border-primary/20 transition-all">
                                            <div className={`w-16 shrink-0 font-bold flex items-center justify-center rounded px-1 text-center text-[10px] ${getRatingColor(opt.value)}`}>
                                              {getRatingLabel(opt.value)}
                                            </div>
                                            <div className="text-text leading-relaxed">
                                              {opt.hint || opt.text}
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                      {ind.hint && (
                                        <div className="pt-2 mt-2 border-t border-primary/10 text-[10px] text-primary/70 font-medium text-center">
                                          {ind.hint}
                                        </div>
                                      )}
                                    </div>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                            <div className="space-y-2">
                              <label className="hd-label text-xs opacity-60 text-center">التقدير</label>
                              <div className={`hd-input border-2 font-bold text-xs h-[42px] flex items-center justify-center transition-all ${getRatingColor(ratings[ind.id] || 0)}`}>
                                {getRatingLabel(ratings[ind.id] || 0)}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}

                <div className="flex justify-between items-center pt-6 border-t border-border-theme gap-4">
                  <button
                    onClick={() => setStep(1)}
                    className="px-8 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-all flex items-center gap-2"
                  >
                    <ChevronRight size={18} />
                    السابق
                  </button>
                  <button
                    disabled={!isStep2Valid}
                    onClick={handleGenerateReport}
                    className={`hd-btn-primary ${!isStep2Valid && 'opacity-50 cursor-not-allowed'}`}
                  >
                    توليد التقرير الذكي (AI)
                    <ChevronLeft size={18} />
                  </button>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-6 md:p-10 space-y-8"
              >
                {isGenerating ? (
                   <div className="bg-primary/5 border-2 border-primary/10 rounded-2xl p-12 text-center space-y-6">
                      <motion.div 
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                        className="inline-block p-4 bg-primary/10 rounded-full text-primary"
                      >
                        <RotateCcw size={40} />
                      </motion.div>
                      <div>
                        <h3 className="text-xl font-bold text-primary mb-2">جاري تحليل البيانات وصياغة التقرير...</h3>
                        <p className="text-sm text-gray-500">يقوم الذكاء الاصطناعي الآن بكتابة توصيات ودعم مهني مخصص للمعلم</p>
                      </div>
                      <div className="flex justify-center gap-1">
                        {[0, 1, 2].map(i => (
                          <motion.div 
                            key={i}
                            animate={{ scale: [1, 1.5, 1], opacity: [0.3, 1, 0.3] }}
                            transition={{ repeat: Infinity, duration: 1, delay: i * 0.2 }}
                            className="w-2 h-2 bg-primary rounded-full"
                          />
                        ))}
                      </div>
                   </div>
                ) : (
                  <div className="bg-primary/5 border-2 border-primary/10 rounded-2xl p-6 md:p-8 space-y-8">
                    <div className="flex items-center justify-between gap-3 text-primary mb-2">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <Sparkles size={24} />
                        </div>
                        <h3 className="text-xl font-bold">التقرير التحليلي الذكي (AI)</h3>
                      </div>
                      <button 
                        onClick={() => { setGeneratedReport(null); handleGenerateReport(); }}
                        className="text-xs font-bold bg-white px-3 py-1.5 rounded-lg border border-primary/20 hover:bg-primary/5 transition-all flex items-center gap-2 no-print"
                      >
                        <RotateCcw size={14} />
                        توليد نسخة أخرى
                      </button>
                    </div>

                    <div className="space-y-4">
                      <label className="hd-label text-primary">جوانب الإجادة وأدلتها (من واقع الممارسة)</label>
                      <textarea
                        readOnly
                        value={staticReport.excellence}
                        className="w-full p-5 h-48 bg-white border border-border-theme rounded-xl shadow-inner outline-none text-text leading-relaxed resize-none text-sm md:text-base font-medium"
                      />
                    </div>

                    {staticReport.improvement && (
                      <div className="space-y-4">
                        <label className="hd-label text-rose-600">الجوانب التي تحتاج إلى تطوير وأدلتها (من واقع الممارسة)</label>
                        <textarea
                          readOnly
                          value={staticReport.improvement}
                          className="w-full p-5 h-48 bg-white border border-border-theme rounded-xl shadow-inner outline-none text-text leading-relaxed resize-none text-sm md:text-base font-medium"
                        />
                      </div>
                    )}

                    <div className="space-y-4">
                      <label className="hd-label text-emerald-600">التوصيات الإجرائية (AI)</label>
                      <textarea
                        readOnly
                        value={generatedReport?.recommendations || ""}
                        className="w-full p-5 h-40 bg-white border border-border-theme rounded-xl shadow-inner outline-none text-text leading-relaxed resize-none text-sm md:text-base font-medium"
                      />
                    </div>

                    <div className="space-y-4">
                      <label className="hd-label text-blue-600">الدعم المهني المقترح (AI)</label>
                      <textarea
                        readOnly
                        value={generatedReport?.support || ""}
                        className="w-full p-5 h-40 bg-white border border-border-theme rounded-xl shadow-inner outline-none text-text leading-relaxed resize-none text-sm md:text-base font-medium"
                      />
                    </div>

                    <div className="pt-6 border-t border-border-theme flex flex-wrap gap-4 no-print">
                      <button 
                        onClick={() => {
                          window.focus();
                          window.print();
                        }}
                        className="flex-1 min-w-[150px] py-3.5 bg-primary text-white font-bold rounded-xl hover:bg-secondary transition-all flex items-center justify-center gap-2 shadow-lg active:scale-95"
                      >
                        <Printer size={18} />
                        طباعة التقرير الشامل
                      </button>
                      {!showResetConfirm ? (
                        <button 
                          onClick={() => setShowResetConfirm(true)}
                          className="flex-1 min-w-[150px] py-3.5 bg-rose-600 text-white font-bold rounded-xl hover:bg-rose-700 transition-all flex items-center justify-center gap-2 shadow-lg active:scale-95"
                        >
                          <RotateCcw size={18} />
                          زيارة جديدة (إفراغ الحقول)
                        </button>
                      ) : (
                        <div className="flex-1 flex gap-2">
                          <button 
                            onClick={resetForm}
                            className="flex-1 py-3.5 bg-rose-600 text-white font-bold rounded-xl hover:bg-rose-700 transition-all text-xs"
                          >
                            تأكيد المسح؟
                          </button>
                          <button 
                            onClick={() => setShowResetConfirm(false)}
                            className="flex-1 py-3.5 bg-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-300 transition-all text-xs"
                          >
                            إلغاء
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex justify-center no-print">
                  <button
                    disabled={isGenerating}
                    onClick={() => setStep(2)}
                    className={`px-8 py-3 text-gray-400 hover:text-gray-600 font-bold transition-all flex items-center gap-2 ${isGenerating && 'opacity-20'}`}
                  >
                    <ChevronRight size={18} />
                    الرجوع لتعديل التقييم
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>

      <div className="hd-footer no-print">
        تصميم وتطوير <b>أ. سعود المعولي</b><br />
        saud22@moe.om
      </div>
    </div>
      
      {/* Printable Report Content (Hidden on screen) */}
      <div className="hidden print:block p-8 space-y-10 bg-white" id="printable-area">
        <header className="text-center border-b-2 border-primary pb-6">
          <h1 className="text-3xl font-bold text-primary mb-2">استمارة الزيارة الإشرافية</h1>
          <p className="text-gray-600">تقرير زيارة معلم مادة / مجال</p>
        </header>

        {/* 1. Visit Details Table */}
        <section>
          <h2 className="text-xl font-bold text-primary mb-4 flex items-center gap-2 border-r-4 border-primary pr-3">
            <User size={20} />
            البيانات الأساسية
          </h2>
          <div className="grid grid-cols-2 border border-gray-300 rounded-lg overflow-hidden text-sm">
            <div className="p-3 bg-gray-50 font-bold border-b border-l border-gray-300">صفة الزائر</div>
            <div className="p-3 border-b border-gray-300">{visitInfo.visitorRole}</div>

            <div className="p-3 bg-gray-50 font-bold border-b border-l border-gray-300">اسم الزائر</div>
            <div className="p-3 border-b border-gray-300">{visitInfo.visitorName}</div>
            
            <div className="p-3 bg-gray-50 font-bold border-b border-l border-gray-300">المعلم المزور</div>
            <div className="p-3 border-b border-gray-300">{visitInfo.teacherName}</div>
            
            <div className="p-3 bg-gray-50 font-bold border-b border-l border-gray-300">التاريخ واليوم</div>
            <div className="p-3 border-b border-gray-300">{visitInfo.visitDate} - {visitInfo.visitDay}</div>
            
            <div className="p-3 bg-gray-50 font-bold border-b border-l border-gray-300">المادة / المجال</div>
            <div className="p-3 border-b border-gray-300">{visitInfo.subject}</div>

            <div className="p-3 bg-gray-50 font-bold border-b border-l border-gray-300">الحصة</div>
            <div className="p-3 border-b border-gray-300">{visitInfo.period}</div>

            <div className="p-3 bg-gray-50 font-bold border-b border-l border-gray-300">الصف والفصل</div>
            <div className="p-3 border-b border-gray-300">{visitInfo.grade} - فصل {visitInfo.section}</div>

            <div className="p-3 bg-gray-50 font-bold border-l border-gray-300">عنوان الدرس</div>
            <div className="p-3">{visitInfo.lessonTitle}</div>
          </div>
        </section>

        {/* 2. Evaluation Items */}
        <section>
          <h2 className="text-xl font-bold text-primary mb-4 flex items-center gap-2 border-r-4 border-primary pr-3">
            <Award size={20} />
            تقديرات بنود التقييم
          </h2>
          <table className="w-full border-collapse border border-gray-300 text-xs">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 p-2 text-right">رقم البند</th>
                <th className="border border-gray-300 p-2 text-right">المجال / المعيار</th>
                <th className="border border-gray-300 p-2 text-right">تقدير الأداء</th>
              </tr>
            </thead>
            <tbody>
              {INDICATORS.map(ind => (
                <tr key={ind.id}>
                  <td className="border border-gray-300 p-2 text-center font-bold">{ind.id}</td>
                  <td className="border border-gray-300 p-2">
                    <span className="font-bold text-xs text-primary">{ind.domain}</span><br />
                    {ind.text}
                  </td>
                  <td className="border border-gray-300 p-2 text-center font-bold">
                    {getRatingLabel(ratings[ind.id] || 0)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        {/* 3. Final Report Summary */}
        <section className="space-y-6">
          <h2 className="text-xl font-bold text-primary mb-4 flex items-center gap-2 border-r-4 border-primary pr-3">
            <FileText size={20} />
            التقرير الفني والتوصيات (مدعوم بالذكاء الاصطناعي)
          </h2>
          
          <div className="space-y-4">
            <div className="p-4 border-r-4 border-emerald-500 bg-emerald-50/30">
              <h4 className="font-bold text-emerald-800 mb-1">جوانب الإجادة وأدلتها (وصف ممارسات):</h4>
              <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{staticReport.excellence}</p>
            </div>

            {staticReport.improvement && (
              <div className="p-4 border-r-4 border-rose-500 bg-rose-50/30">
                <h4 className="font-bold text-rose-800 mb-1">الجوانب التي تحتاج إلى تطوير وأدلتها (وصف ممارسات):</h4>
                <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{staticReport.improvement}</p>
              </div>
            )}

            <div className="p-4 border-r-4 border-amber-500 bg-amber-50/30">
              <h4 className="font-bold text-amber-800 mb-1">التوصيات الإجرائية (AI):</h4>
              <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{generatedReport?.recommendations}</p>
            </div>

            <div className="p-4 border-r-4 border-blue-500 bg-blue-50/30">
              <h4 className="font-bold text-blue-800 mb-1">الدعم المهني المقترح (AI):</h4>
              <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{generatedReport?.support}</p>
            </div>
          </div>
        </section>

        {/* Footer Signature */}
        <footer className="mt-12 pt-8 border-t flex justify-between items-center text-sm">
          <div>
            توقيع المعلم: ...............................
          </div>
          <div className="text-left">
            توقيع الزائر: ...............................
          </div>
        </footer>
      </div>

      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; margin: 0; padding: 0; }
          .hd-container { border: none !important; box-shadow: none !important; width: 100% !important; max-width: 100% !important; }
          main { display: none !important; }
          .hd-header { display: none !important; }
          .hd-footer { display: none !important; }
          #printable-area { display: block !important; visibility: visible !important; }
          table { page-break-inside: auto; }
          tr { page-break-inside: avoid; page-break-after: auto; }
          section { page-break-inside: avoid; margin-bottom: 2rem; }
        }
      `}</style>
    </div>
  );
}
