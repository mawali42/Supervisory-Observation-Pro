import { useState, useMemo } from "react";
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
  FileText
} from "lucide-react";
import { 
  INDICATORS, 
  VISITOR_ROLES, 
  DAYS_AR, 
  PERIODS, 
  GRADES_AR 
} from "./constants";
import { VisitInfo, EvaluationState } from "./types";

export default function App() {
  const [step, setStep] = useState(1);
  const [visitInfo, setVisitInfo] = useState<VisitInfo>({
    visitorRole: "",
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

  const handleVisitInfoChange = (field: keyof VisitInfo, value: string) => {
    setVisitInfo((prev) => ({ ...prev, [field]: value }));
  };

  const handleRatingChange = (indicatorId: number, value: number) => {
    setRatings((prev) => ({ ...prev, [indicatorId]: value }));
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

  const report = useMemo(() => {
    if (step !== 3) return { excellence: "", improvement: "", recommendations: "", support: "" };

    const excellenceItems = INDICATORS.filter(ind => ratings[ind.id] !== undefined && (ratings[ind.id] === 1 || ratings[ind.id] === 2))
      .slice(0, 3);
    
    const improvementItems = INDICATORS.filter(ind => ratings[ind.id] !== undefined && ratings[ind.id] >= 3)
      .slice(0, 3);

    const excellenceText = excellenceItems.map((ind) => {
      const optionText = ind.options.find(opt => opt.value === ratings[ind.id])?.text || "";
      return `${optionText} وثبت ذلك من خلال ${ind.goodEvidence}`;
    }).join(" و");

    const improvementText = improvementItems.length > 0 ? improvementItems.map((ind) => {
      const optionText = ind.options.find(opt => opt.value === ratings[ind.id])?.text || "";
      return `${optionText}. وثبت ذلك من خلال ${ind.improvementEvidence}`;
    }).join(" و") : "";

    // Recommendations derived from indicators
    const recs = [
      ...excellenceItems.map(i => i.recommendation),
      ...improvementItems.map(i => i.recommendation)
    ].filter((v, i, a) => a.indexOf(v) === i).slice(0, 3).join("، و");

    // Support derived from indicators
    const supportTxt = [
      ...excellenceItems.map(i => i.support),
      ...improvementItems.map(i => i.support)
    ].filter((v, i, a) => a.indexOf(v) === i).slice(0, 3).join("، و");

    return { 
      excellence: excellenceText, 
      improvement: improvementText,
      recommendations: recs,
      support: supportTxt
    };
  }, [ratings, step]);

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
                              <label className="hd-label text-xs opacity-60">وصف الانتشار</label>
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
                    onClick={() => setStep(3)}
                    className={`hd-btn-primary ${!isStep2Valid && 'opacity-50 cursor-not-allowed'}`}
                  >
                    توليد التقرير النهائي
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
                <div className="bg-primary/5 border-2 border-primary/10 rounded-2xl p-6 md:p-8 space-y-8">
                  <div className="flex items-center gap-3 text-primary mb-2">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <MessageSquare size={24} />
                    </div>
                    <h3 className="text-xl font-bold">التقرير التحليلي الذكي</h3>
                  </div>

                  <div className="space-y-4">
                    <label className="hd-label text-primary">جوانب الإجادة وأدلتها</label>
                    <textarea
                      readOnly
                      value={report.excellence}
                      className="w-full p-5 h-48 bg-white border border-border-theme rounded-xl shadow-inner outline-none text-text leading-relaxed resize-none text-sm md:text-base font-medium"
                    />
                  </div>

                  {report.improvement && (
                    <div className="space-y-4">
                      <label className="hd-label text-rose-600">الجوانب التي تحتاج إلى تطوير وأدلتها</label>
                      <textarea
                        readOnly
                        value={report.improvement}
                        className="w-full p-5 h-48 bg-white border border-border-theme rounded-xl shadow-inner outline-none text-text leading-relaxed resize-none text-sm md:text-base font-medium"
                      />
                    </div>
                  )}

                  <div className="space-y-4">
                    <label className="hd-label text-emerald-600">التوصيات</label>
                    <textarea
                      readOnly
                      value={report.recommendations}
                      className="w-full p-5 h-40 bg-white border border-border-theme rounded-xl shadow-inner outline-none text-text leading-relaxed resize-none text-sm md:text-base font-medium"
                    />
                  </div>

                  <div className="space-y-4">
                    <label className="hd-label text-blue-600">الدعم المقدم</label>
                    <textarea
                      readOnly
                      value={report.support}
                      className="w-full p-5 h-40 bg-white border border-border-theme rounded-xl shadow-inner outline-none text-text leading-relaxed resize-none text-sm md:text-base font-medium"
                    />
                  </div>

                  <div className="pt-6 border-t border-border-theme flex flex-wrap gap-4 no-print">
                    <button 
                      onClick={() => window.print()}
                      className="flex-1 min-w-[150px] py-3.5 bg-primary text-white font-bold rounded-xl hover:bg-secondary transition-all flex items-center justify-center gap-2 shadow-lg active:scale-95"
                    >
                      <Printer size={18} />
                      طباعة التقرير الشامل
                    </button>
                  </div>
                </div>

                <div className="flex justify-center no-print">
                  <button
                    onClick={() => setStep(2)}
                    className="px-8 py-3 text-gray-400 hover:text-gray-600 font-bold transition-all flex items-center gap-2"
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
            
            <div className="p-3 bg-gray-50 font-bold border-b border-l border-gray-300">المعلم المزور</div>
            <div className="p-3 border-b border-gray-300">{visitInfo.teacherName}</div>
            
            <div className="p-3 bg-gray-50 font-bold border-b border-l border-gray-300">التاريخ واليوم</div>
            <div className="p-3 border-b border-gray-300">{visitInfo.visitDate} - {visitInfo.visitDay}</div>
            
            <div className="p-3 bg-gray-50 font-bold border-b border-l border-gray-300">المادة / المجال</div>
            <div className="p-3 border-b border-gray-300">{visitInfo.subject}</div>

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

        {/* 3. AI Generated Report */}
        <section className="space-y-6">
          <h2 className="text-xl font-bold text-primary mb-4 flex items-center gap-2 border-r-4 border-primary pr-3">
            <FileText size={20} />
            التقرير الفني والمقترحات
          </h2>
          
          <div className="space-y-4">
            <div className="p-4 border-r-4 border-emerald-500 bg-emerald-50/30">
              <h4 className="font-bold text-emerald-800 mb-1">جوانب الإجادة وأدلتها:</h4>
              <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{report.excellence}</p>
            </div>

            {report.improvement && (
              <div className="p-4 border-r-4 border-rose-500 bg-rose-50/30">
                <h4 className="font-bold text-rose-800 mb-1">الجوانب التي تحتاج إلى تطوير وأدلتها:</h4>
                <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{report.improvement}</p>
              </div>
            )}

            <div className="p-4 border-r-4 border-amber-500 bg-amber-50/30">
              <h4 className="font-bold text-amber-800 mb-1">التوصيات الإجرائية:</h4>
              <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{report.recommendations}</p>
            </div>

            <div className="p-4 border-r-4 border-blue-500 bg-blue-50/30">
              <h4 className="font-bold text-blue-800 mb-1">الدعم المقدم للمعلم:</h4>
              <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{report.support}</p>
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
