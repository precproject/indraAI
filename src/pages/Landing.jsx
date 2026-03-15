import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Mic, TrendingUp, Sun, Sprout, ArrowRight, ShieldCheck, 
  Database, Building, Smartphone, CheckCircle2, Coins, 
  Lock, ChevronDown, Quote, MapPin, Calendar, Users, BarChart3 
} from 'lucide-react';
import { Link } from 'react-router-dom';

const Landing = () => {
  const [expandedPhase, setExpandedPhase] = useState(0);

  const fadeUp = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.15 } }
  };

  const roadmapData = [
    {
      phase: "Phase 1 — Core MVP",
      status: "✅ पूर्ण",
      color: "bg-green-100 text-green-800",
      items: ["🎤 Marathi Voice AI (Sarvam STT/TTS + AI)", "🌾 Multi Crop Cycle Management", "📒 Geo-tagged Ledger (गाव/तालुका)", "📊 APMC Market Price Intelligence", "🌤️ 7-day Weather + Spray Advisory", "🏆 Credit-for-Data System (+15 credits)"]
    },
    {
      phase: "Phase 2 — Growth",
      status: "🔄 Q1 2025",
      color: "bg-yellow-100 text-yellow-800",
      items: ["🛍️ Retailer Module (QR code redemption)", "✅ Purchase receipt verification", "🔥 Firebase Firestore real backend", "📍 GPS-based farmland boundary mapping", "🔔 Push notifications (price spikes, rain alert)"]
    },
    {
      phase: "Phase 3 — Intelligence",
      status: "📅 Q2 2025",
      color: "bg-blue-100 text-blue-800",
      items: ["🤖 Predictive price forecasting (ML model)", "🦟 Pest/disease photo detection (Vision AI)", "📜 Maharashtra 7/12 land record integration", "🏛️ PM-KISAN + crop insurance linkage"]
    },
    {
      phase: "Phase 4 — Platform",
      status: "🚀 Future Vision",
      color: "bg-purple-100 text-purple-800",
      items: ["🏪 B2B Agri-Input Marketplace", "🌍 Expand to other states (Telangana, MP)", "💰 Micro-credit scoring from ledger data", "🛰️ Satellite imagery + NDVI crop health"]
    }
  ];

  return (
    <div className="min-h-screen bg-[#fdf8f0] font-sans overflow-x-hidden selection:bg-[#4a9e4a] selection:text-white">
      
      {/* ── TOP NAVIGATION ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#fdf8f0]/90 backdrop-blur-xl border-b border-[#d4a853]/20 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group">
            <span className="text-3xl group-hover:scale-110 transition-transform">🌾</span>
            <div>
              <p className="font-black text-[#2d6a2d] leading-tight text-xl tracking-tight">IndraAI</p>
              <p className="text-[10px] text-[#8b5e3c] font-bold uppercase tracking-widest">शेतकरी मित्र</p>
            </div>
          </Link>
          
          <div className="hidden lg:flex gap-8 items-center">
            <a href="#story" className="text-[#5c3317] font-bold hover:text-[#4a9e4a] transition-colors text-sm">यशोगाथा</a>
            <a href="#features" className="text-[#5c3317] font-bold hover:text-[#4a9e4a] transition-colors text-sm">वैशिष्ट्ये</a>
            <a href="#flywheel" className="text-[#5c3317] font-bold hover:text-[#4a9e4a] transition-colors text-sm">क्रेडिट मॉडेल</a>
            <a href="#enterprise" className="text-[#5c3317] font-bold hover:text-[#4a9e4a] transition-colors text-sm">कंपन्यांसाठी</a>
            <a href="#roadmap" className="text-[#5c3317] font-bold hover:text-[#4a9e4a] transition-colors text-sm">रोडमॅप</a>
          </div>

          <div className="flex gap-3 items-center">
            <Link to="/setup" className="hidden md:block text-[#8b5e3c] font-bold text-sm hover:text-[#2d6a2d] transition-colors">
              Setup
            </Link>
            <Link to="/app" className="px-6 py-2.5 rounded-full font-bold bg-gradient-to-r from-[#4a9e4a] to-[#2d6a2d] text-white shadow-lg shadow-[#4a9e4a]/30 hover:shadow-xl hover:scale-105 transition-all text-sm">
              App सुरू करा
            </Link>
          </div>
        </div>
      </nav>

      {/* ── HERO SECTION (FARMER FOCUS) ── */}
      <section className="relative pt-32 pb-20 px-6 lg:pt-40 lg:pb-32 overflow-hidden">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-gradient-to-bl from-[#d4edda] to-transparent rounded-full blur-3xl opacity-60 -translate-y-1/2 translate-x-1/3 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-gradient-to-tr from-[#f5e6c8] to-transparent rounded-full blur-3xl opacity-60 translate-y-1/4 -translate-x-1/4 pointer-events-none" />

        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center relative z-10">
          
          <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="max-w-2xl">
            <motion.div variants={fadeUp} className="inline-flex items-center gap-2 bg-white border border-[#d4a853]/30 text-[#2d6a2d] px-4 py-2 rounded-full text-xs font-bold mb-8 shadow-sm">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#4a9e4a] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#4a9e4a]"></span>
              </span>
              पूर्णपणे मोफत · 100% Voice AI
            </motion.div>

            <motion.h1 variants={fadeUp} className="text-5xl lg:text-7xl font-black text-[#2c1810] leading-[1.1] mb-6">
              तुमचे शेत, तुमची भाषा, <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#4a9e4a] to-[#2d6a2d]">तुमचा AI मित्र.</span>
            </motion.h1>

            <motion.p variants={fadeUp} className="text-lg text-[#5c3317] mb-10 font-marathi leading-relaxed">
              कांद्याचा आजचा भाव, सोयाबीनचा हंगाम खर्च, किंवा हवामानाचा अचूक अंदाज — 
              काहीही टाइप करण्याची गरज नाही. <strong className="text-[#2c1810]">फक्त मायक्रोफोन दाबा आणि मराठीत बोला.</strong>
            </motion.p>

            <motion.div variants={fadeUp} className="flex flex-wrap justify-center gap-3 mb-10">
              {[ '📊 बाजारभाव', '🌾 पीक चक्र', '💰 नफा ट्रॅकिंग', '🌤️ हवामान', '🏆 मोफत क्रेडिट्स'].map((tag, i) => (
                <span key={i} className="bg-white px-4 py-2 rounded-full text-sm font-bold text-[#2c1810] border border-[#d4a853]/30 shadow-sm">{tag}</span>
              ))}
            </motion.div>

            <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-4 mb-12">
              <Link to="/app" className="px-8 py-4 rounded-2xl text-lg font-bold bg-[#2c1810] text-white shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all flex items-center justify-center gap-3">
                <Mic size={24} className="text-[#4a9e4a]" />
                मोफत सुरू करा
              </Link>
              <Link to="/dashboard" className="px-8 py-4 rounded-2xl text-lg font-bold bg-white text-[#2c1810] border border-[#d4a853]/40 shadow-sm hover:bg-[#fdf8f0] transition-all flex items-center justify-center gap-3">
                <Building size={20} />
                कंपनी डॅशबोर्ड
              </Link>
            </motion.div>
          </motion.div>

          {/* Right: Premium Phone Mockup Animation with Extended Examples */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, rotateY: 10 }}
            animate={{ opacity: 1, scale: 1, rotateY: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="relative mx-auto w-full max-w-[320px] perspective-1000"
          >
            <div className="relative bg-[#1c1008] p-3 rounded-[3rem] shadow-2xl border-[6px] border-[#2c1810]/10 ring-1 ring-white/20 transform-gpu rotate-[-2deg] hover:rotate-0 transition-transform duration-500">
              <div className="absolute top-0 inset-x-0 h-6 bg-[#1c1008] rounded-b-3xl w-40 mx-auto z-20"></div>
              
              <div className="bg-[#fdf8f0] h-[650px] rounded-[2.25rem] overflow-hidden relative flex flex-col">
                <div className="bg-gradient-to-br from-[#1a4d1a] to-[#2d6a2d] p-6 pb-8 text-white shrink-0">
                  <p className="text-xs opacity-70 mb-1">नमस्कार 🙏</p>
                  <h3 className="text-xl font-black mb-4">राजेश पाटील</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-white/10 rounded-xl p-2"><p className="text-[10px] opacity-70">उत्पन्न</p><p className="font-black text-green-300">₹1.2L</p></div>
                    <div className="bg-white/10 rounded-xl p-2"><p className="text-[10px] opacity-70">खर्च</p><p className="font-black text-yellow-200">₹45K</p></div>
                  </div>
                </div>
                
                {/* Scrollable Chat Area with 3 different examples */}
                <div className="flex-1 p-4 flex flex-col gap-3 overflow-y-auto scrollbar-hide pb-20">
                  <div className="self-end bg-gradient-to-br from-[#4a9e4a] to-[#2d6a2d] text-white p-2.5 rounded-2xl rounded-tr-sm text-[11px] font-marathi shadow-md w-3/4">
                    लासलगावमध्ये ५ क्विंटल कांदा ₹२१०० ला विकला.
                  </div>
                  <div className="self-start bg-white border border-[#d4a853]/30 p-2.5 rounded-2xl rounded-tl-sm text-[11px] font-marathi shadow-sm w-5/6">
                    ✅ नोंद जतन केली! पिंपळगावमध्ये आज ₹२,२०० दर आहे.
                  </div>
                  
                  <div className="self-end bg-gradient-to-br from-[#4a9e4a] to-[#2d6a2d] text-white p-2.5 rounded-2xl rounded-tr-sm text-[11px] font-marathi shadow-md w-3/4 mt-2">
                    उद्या फवारणी करू का?
                  </div>
                  <div className="self-start bg-white border border-[#d4a853]/30 p-2.5 rounded-2xl rounded-tl-sm text-[11px] font-marathi shadow-sm w-5/6">
                    🌧️ उद्या पावसाची शक्यता आहे. फवारणी परवा करा.
                  </div>

                  <div className="self-end bg-gradient-to-br from-[#4a9e4a] to-[#2d6a2d] text-white p-2.5 rounded-2xl rounded-tr-sm text-[11px] font-marathi shadow-md w-3/4 mt-2">
                    पानांवर पिवळे डाग पडलेत.
                  </div>
                  <div className="self-start bg-white border border-[#d4a853]/30 p-2.5 rounded-2xl rounded-tl-sm text-[11px] font-marathi shadow-sm w-5/6">
                    🌱 हा करपा रोग असू शकतो. औषध फवारा.
                  </div>
                </div>

                <div className="absolute bottom-0 left-0 right-0 p-6 flex justify-center bg-gradient-to-t from-[#fdf8f0] to-transparent">
                  <div className="w-16 h-16 bg-gradient-to-br from-[#4a9e4a] to-[#2d6a2d] rounded-full flex items-center justify-center shadow-[0_0_40px_rgba(74,158,74,0.4)]">
                    <Mic size={28} className="text-white" />
                  </div>
                </div>
              </div>
            </div>
            
            <motion.div animate={{ y: [-10, 10, -10] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }} className="absolute -right-12 top-32 bg-white p-4 rounded-2xl shadow-xl border border-[#d4a853]/20">
              <p className="text-[10px] font-bold text-[#8b5e3c] uppercase">ROI Tracking</p>
              <p className="text-2xl font-black text-[#4a9e4a]">87%</p>
            </motion.div>
            <motion.div animate={{ y: [10, -10, 10] }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }} className="absolute -left-12 bottom-40 bg-white p-4 rounded-2xl shadow-xl border border-[#d4a853]/20">
              <p className="text-[10px] font-bold text-[#8b5e3c] uppercase">Smart Credits</p>
              <p className="text-2xl font-black text-[#d4a853]">+15 Pts</p>
            </motion.div>
          </motion.div>

        </div>
      </section>

      {/* ── HOW IT WORKS (FARMER) ── */}
      <section id="features" className="py-24 px-6 bg-white relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-[#4a9e4a] font-bold tracking-widest uppercase text-sm mb-2 block">कसे काम करते?</span>
            <h2 className="text-3xl md:text-5xl font-black text-[#2c1810]">एक नोंद, ३ सेकंद.</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { title: "१. फक्त बोला", desc: "अ‍ॅप उघडा आणि मराठीत सांगा: 'आज ३ पोते युरिया ₹१५०० ला विकत घेतले.'", icon: <Mic size={32} />, color: "bg-[#e8f5e9] text-[#2d6a2d] border-[#a8d5b0]" },
              { title: "२. IndraAI समजतो", desc: "आमचा AI तुमचा आवाज अचूक ओळखतो, गणित करतो आणि योग्य खात्यात नोंद टाकतो.", icon: <ShieldCheck size={32} />, color: "bg-[#fdf8f0] text-[#d4a853] border-[#d4a853]/40" },
              { title: "३. नफा व सल्ला", desc: "तुमचा एकरी खर्च, नफा आणि पुढील हवामानाचा सल्ला तुम्हाला लगेच स्क्रीनवर दिसतो.", icon: <BarChart3 size={32} />, color: "bg-[#dbeafe] text-[#1e40af] border-[#93c5fd]" }
            ].map((feat, idx) => (
              <motion.div key={idx} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: idx * 0.2 }} className="p-8 rounded-3xl bg-white border border-[#d4a853]/20 shadow-lg hover:shadow-xl transition-all">
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 border ${feat.color}`}>
                  {feat.icon}
                </div>
                <h3 className="text-xl font-bold text-[#2c1810] mb-3">{feat.title}</h3>
                <p className="text-[#5c3317] font-marathi leading-relaxed">{feat.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── STORY SECTION (Rameshji) ── */}
      <section id="story" className="py-20 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-[#4a9e4a] font-bold tracking-widest uppercase text-sm mb-2 block">शेतकऱ्यांसाठी</span>
            <h2 className="text-3xl md:text-5xl font-black text-[#2c1810] mb-4">रमेशजींची गोष्ट</h2>
            <p className="text-lg text-[#5c3317] font-marathi max-w-2xl mx-auto">
              नाशिकचे कांदा शेतकरी — इंग्रजी येत नाही, पण आता <strong>हंगामात ₹३५,००० जास्त नफा</strong> करतात. IndraAI ने त्यांचे आयुष्य कसे बदलले?
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="bg-[#fef2f2] border border-[#fca5a5] rounded-3xl p-8 relative">
              <span className="absolute -top-4 left-8 bg-red-500 text-white px-4 py-1 rounded-full text-xs font-bold tracking-widest">पूर्वीची अडचण</span>
              <p className="text-xl font-bold text-red-900 mb-6 italic font-marathi">"हंगाम संपला की नफा-तोटा कळेल..."</p>
              <div className="space-y-4">
                <div className="flex gap-4 items-start">
                  <div className="w-8 h-8 rounded-full bg-red-200 text-red-700 flex items-center justify-center font-bold shrink-0">1</div>
                  <div><h4 className="font-bold text-red-900">हिशोब नव्हता</h4><p className="text-sm text-red-800/80 font-marathi">दरवर्षी ₹४०,००० खर्च — पण किती नफा? माहीत नाही. फक्त अंदाज.</p></div>
                </div>
                <div className="flex gap-4 items-start">
                  <div className="w-8 h-8 rounded-full bg-red-200 text-red-700 flex items-center justify-center font-bold shrink-0">2</div>
                  <div><h4 className="font-bold text-red-900">बाजारभाव चुकायचे</h4><p className="text-sm text-red-800/80 font-marathi">लासलगावमध्ये ₹२,००० ला विकला — पण त्याच दिवशी पिंपळगावमध्ये ₹२,२०० भाव होता!</p></div>
                </div>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="bg-[#f0fdf4] border border-[#86efac] rounded-3xl p-8 relative shadow-lg shadow-green-900/5">
              <span className="absolute -top-4 left-8 bg-[#2d6a2d] text-white px-4 py-1 rounded-full text-xs font-bold tracking-widest">आता (NOW)</span>
              <p className="text-xl font-bold text-[#1a4d1a] mb-6 italic font-marathi">"माझा फोन माझा हिशोब ठेवतो..."</p>
              <div className="space-y-4">
                <div className="flex gap-4 items-start">
                  <div className="w-8 h-8 rounded-full bg-green-200 text-green-800 flex items-center justify-center font-bold shrink-0">3</div>
                  <div><h4 className="font-bold text-[#1a4d1a]">फक्त बोलतो, नोंद होते</h4><p className="text-sm text-[#1a4d1a]/80 font-marathi">मराठीत सांगितलं "खत विकत घेतलं" — App ने आपोआप पीक चक्राशी जोडलं.</p></div>
                </div>
                <div className="flex gap-4 items-start">
                  <div className="w-8 h-8 rounded-full bg-green-200 text-green-800 flex items-center justify-center font-bold shrink-0">4</div>
                  <div><h4 className="font-bold text-[#1a4d1a]">नफा दिसतो, सल्ला मिळतो</h4><p className="text-sm text-[#1a4d1a]/80 font-marathi">ROI ८७%. AI ने सुचवलं: "उद्या पाऊस आहे, आज फवारणी करू नका." ₹३,५०० वाचले.</p></div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── CREDIT FOR DATA FLYWHEEL ── */}
      <section id="flywheel" className="py-20 px-6 bg-[#2c1810] text-white relative overflow-hidden">
        <div className="max-w-6xl mx-auto text-center relative z-10">
          <span className="text-[#4a9e4a] font-bold tracking-widest uppercase text-sm mb-2 block">Our Business Model</span>
          <h2 className="text-3xl md:text-5xl font-black mb-4">Credit-for-Data Flywheel</h2>
          <p className="text-[#d4a853] mb-12 max-w-2xl mx-auto font-marathi text-lg">तुमचा डेटा तुमचाच आहे. आम्ही सुरक्षिततेची पूर्ण काळजी घेतो.</p>

          <div className="flex flex-col lg:flex-row items-center justify-center gap-4 lg:gap-6">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="bg-white/5 border border-white/10 p-6 rounded-3xl w-full lg:w-64 text-center">
              <Smartphone size={40} className="text-[#4a9e4a] mx-auto mb-4" />
              <h3 className="font-bold text-lg mb-2">शेतकरी नोंद करतो</h3>
              <p className="text-sm text-white/60 font-marathi">खर्च आणि उत्पन्न मोफत अ‍ॅपवर बोलून नोंदवतो.</p>
            </motion.div>
            <ArrowRight size={24} className="text-[#4a9e4a] hidden lg:block" />
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }} className="bg-[#4a9e4a]/20 border border-[#4a9e4a]/50 p-6 rounded-3xl w-full lg:w-64 text-center relative shadow-[0_0_30px_rgba(74,158,74,0.2)]">
              <div className="absolute -top-3 -right-3 bg-red-500 text-white text-[10px] font-bold px-3 py-1 rounded-full flex items-center gap-1"><Lock size={12}/> सुरक्षित</div>
              <Database size={40} className="text-white mx-auto mb-4" />
              <h3 className="font-bold text-lg mb-2">निनावी डेटा</h3>
              <p className="text-sm text-white/80 font-marathi">वैयक्तिक माहिती काढली जाते. फक्त जिल्ह्याचा ट्रेंड तयार होतो.</p>
            </motion.div>
            <ArrowRight size={24} className="text-[#4a9e4a] hidden lg:block" />
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.4 }} className="bg-white/5 border border-white/10 p-6 rounded-3xl w-full lg:w-64 text-center">
              <Building size={40} className="text-[#d4a853] mx-auto mb-4" />
              <h3 className="font-bold text-lg mb-2">कंपन्या Insights घेतात</h3>
              <p className="text-sm text-white/60 font-marathi">खासगी कंपन्या या ट्रेंड्ससाठी (Analytics Dashboard) पैसे देतात.</p>
            </motion.div>
            <ArrowRight size={24} className="text-[#4a9e4a] hidden lg:block" />
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.6 }} className="bg-white border border-[#d4a853] p-6 rounded-3xl w-full lg:w-64 text-center">
              <Coins size={40} className="text-[#d4a853] mx-auto mb-4" />
              <h3 className="font-bold text-[#2c1810] text-lg mb-2">शेतकऱ्याला क्रेडिट्स</h3>
              <p className="text-sm text-[#5c3317] font-marathi">शेतकऱ्याला खत/बियाणे खरेदीत या पैशांतून थेट सूट मिळते.</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── ENTERPRISE SECTION ── */}
      <section id="enterprise" className="py-24 px-6 bg-[#0a1a0e] text-white relative overflow-hidden">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#4a9e4a]/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#d4a853]/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center relative z-10">
          <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
            <span className="inline-block bg-[#4a9e4a]/20 text-[#4ade80] border border-[#4a9e4a]/30 px-4 py-1.5 rounded-full text-xs font-bold mb-6 uppercase tracking-widest">
              अग्री-इनपुट कंपन्यांसाठी
            </span>
            <h2 className="text-4xl lg:text-5xl font-black mb-6 leading-tight">
              महाराष्ट्रामधील शेतकऱ्यांची अचूक माहिती. <span className="text-[#4ade80]">आता एका क्लिकवर.</span>
            </h2>
            <p className="text-lg text-white/70 mb-8 font-marathi leading-relaxed">
              कोणत्या जिल्ह्यात आज खताची मागणी वाढली आहे? किती शेतकऱ्यांनी पेरणी पूर्ण केली आहे? 
              IndraAI च्या Enterprise Dashboard द्वारे महाराष्ट्रभरातील हजारो शेतकऱ्यांचा रियल-टाइम, निनावी (Anonymized) डेटा मिळवा.
            </p>
            <ul className="space-y-4 mb-10">
              {[
                { title: 'Regional Demand Heatmaps', desc: 'जिल्हानिहाय खते व बियाण्यांची आजची मागणी.' },
                { title: 'Natural Language Querying', desc: '"विदर्भात कापसावर कीड समस्या किती शेतकऱ्यांना आहे?" थेट विचारा.' },
                { title: 'Price Gap Analysis', desc: 'शेतकऱ्यांना मिळणारा प्रत्यक्ष भाव vs MSP.' }
              ].map((item, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <CheckCircle2 className="text-[#4ade80] mt-1 shrink-0" size={20} />
                  <div><h4 className="font-bold text-white">{item.title}</h4><p className="text-sm text-white/60 font-marathi">{item.desc}</p></div>
                </li>
              ))}
            </ul>
            <Link to="/dashboard" className="inline-flex px-8 py-4 rounded-2xl text-lg font-bold bg-[#4a9e4a] text-white shadow-xl hover:bg-[#368636] transition-all items-center gap-3">
              <Database size={20} /> Dashboard Demo पहा
            </Link>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="bg-[#0d1f12] rounded-3xl p-6 border border-[#4a9e4a]/20 shadow-[0_0_50px_rgba(74,158,74,0.1)]">
             <div className="flex justify-between items-center mb-6 border-b border-white/10 pb-4">
              <div className="flex items-center gap-2"><span className="text-2xl">📊</span><span className="font-bold">Enterprise Analytics</span></div>
              <span className="text-xs bg-green-500/20 text-green-400 px-3 py-1 rounded-full font-bold animate-pulse">● LIVE DATA</span>
            </div>
            <div className="bg-[#4a9e4a]/10 border border-[#4a9e4a]/30 p-5 rounded-2xl mb-4">
              <p className="text-xs text-[#4ade80] font-bold mb-2 uppercase tracking-widest">Natural Language Query</p>
              <p className="text-white/80 font-marathi italic">"नाशिक जिल्ह्यात या आठवड्यात 8,247 शेतकऱ्यांनी DAP खत विकत घेतले — मागील आठवड्यापेक्षा +23% जास्त."</p>
            </div>
            <div className="flex items-end gap-2 h-40">
              {[60, 30, 80, 45, 90, 55, 75].map((h, i) => (
                <div key={i} className="flex-1 bg-gradient-to-t from-[#2d6a2d] to-[#4ade80] rounded-t-md opacity-80 hover:opacity-100 transition-opacity" style={{ height: `${h}%` }}></div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── ROADMAP SECTION ── */}
      <section id="roadmap" className="py-24 px-6 bg-[#fdf8f0]">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-[#4a9e4a] font-bold tracking-widest uppercase text-sm mb-2 block">Roadmap</span>
            <h2 className="text-3xl md:text-5xl font-black text-[#2c1810]">आम्ही कुठे चाललोय?</h2>
            <p className="text-[#5c3317] mt-4 font-marathi">MVP पासून महाराष्ट्राच्या प्रत्येक शेतकऱ्यापर्यंत — एक टप्प्याने.</p>
          </div>

          <div className="space-y-4">
            {roadmapData.map((phase, idx) => (
              <div key={idx} className="bg-white border border-[#d4a853]/30 rounded-2xl overflow-hidden shadow-sm transition-all hover:shadow-md">
                <button onClick={() => setExpandedPhase(expandedPhase === idx ? null : idx)} className="w-full flex items-center justify-between p-6 text-left">
                  <div className="flex items-center gap-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${phase.color}`}>{phase.status}</span>
                    <h3 className="text-lg font-black text-[#2c1810]">{phase.phase}</h3>
                  </div>
                  <ChevronDown className={`text-[#8b5e3c] transition-transform duration-300 ${expandedPhase === idx ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>
                  {expandedPhase === idx && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                      <div className="p-6 pt-0 border-t border-gray-100">
                        <ul className="grid md:grid-cols-2 gap-3 mt-4">
                          {phase.items.map((item, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm text-[#5c3317] font-marathi">
                              <span className="mt-0.5">•</span> {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="bg-[#1c1008] pt-16 pb-8 px-6 text-white/60 text-center">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center gap-2 mb-6">
            <span className="text-2xl">🌾</span>
            <span className="text-xl font-black text-white tracking-tight">IndraAI</span>
          </div>
          <p className="text-sm mb-8">Maharashtra-First AI Farm Manager · Empowering farmers through voice technology.</p>
          <div className="flex flex-wrap justify-center gap-6 text-sm font-bold mb-12">
            <Link to="/app" className="hover:text-white transition-colors">Farmer App</Link>
            <Link to="/dashboard" className="hover:text-white transition-colors">Enterprise Dashboard</Link>
            <Link to="/setup" className="hover:text-white transition-colors">System Setup</Link>
          </div>
          <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center text-xs">
            <p>© 2026 IndraAI. All rights reserved.</p>
            <p className="mt-2 md:mt-0">Powered by Sarvam AI & Firebase</p>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default Landing;