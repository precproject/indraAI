import React from 'react';
import { motion } from 'framer-motion';
import { Mic, TrendingUp, Sun, Sprout, ArrowRight, ShieldCheck, Leaf } from 'lucide-react';
import { Link } from 'react-router-dom';

const Landing = () => {
  // Animation rules for smooth sliding effects
  const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2 }
    }
  };

  return (
    <div className="min-h-screen bg-wheat-light font-sans overflow-hidden">
      
      {/* ── TOP NAVIGATION ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-wheat-light/90 backdrop-blur-md border-b border-wheat/30 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🌾</span>
            <div>
              <p className="font-bold text-leaf-dark leading-tight text-lg">शेतकरी मित्र</p>
              <p className="text-xs text-mud">AI Farm Manager</p>
            </div>
          </div>
          
          <div className="hidden md:flex gap-8 items-center">
            <a href="#features" className="text-bark font-semibold hover:text-leaf transition-colors">वैशिष्ट्ये</a>
            <Link to="/dashboard" className="text-bark font-semibold hover:text-leaf transition-colors">Company Dashboard</Link>
          </div>

          <div className="flex gap-3">
            <Link to="/app" className="px-5 py-2.5 rounded-xl font-bold bg-gradient-to-r from-leaf to-leaf-dark text-white shadow-lg shadow-leaf/30 hover:shadow-xl hover:scale-105 transition-all">
              App सुरू करा →
            </Link>
          </div>
        </div>
      </nav>

      {/* ── HERO SECTION ── */}
      <section className="relative pt-32 pb-20 px-6 lg:pt-48 lg:pb-32 flex flex-col items-center justify-center text-center min-h-screen">
        {/* Background decorative circles */}
        <div className="absolute top-20 -right-20 w-96 h-96 bg-leaf/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 -left-20 w-80 h-80 bg-wheat/20 rounded-full blur-3xl pointer-events-none" />

        <motion.div 
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
          className="max-w-4xl relative z-10"
        >
          <motion.div variants={fadeUp} className="inline-flex items-center gap-2 bg-leaf-light/50 border border-leaf/30 text-leaf-dark px-4 py-1.5 rounded-full text-sm font-bold mb-6">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-leaf opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-leaf"></span>
            </span>
            महाराष्ट्र-First · Marathi Voice AI
          </motion.div>

          <motion.h1 variants={fadeUp} className="text-5xl md:text-7xl font-black text-soil leading-tight mb-6">
            तुमचे शेत, तुमची भाषा, <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-leaf-dark to-leaf">तुमचा AI मित्र</span>
          </motion.h1>

          <motion.p variants={fadeUp} className="text-lg md:text-xl text-bark max-w-2xl mx-auto mb-10 font-marathi leading-relaxed">
            कांद्याचा आजचा भाव, सोयाबीनचा हंगाम खर्च, किंवा खतांचा योग्य वापर —
            सगळं मराठीत फक्त बोलून मिळवा. <strong className="text-soil">पूर्णपणे मोफत.</strong>
          </motion.p>

          <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
            <Link to="/app" className="w-full sm:w-auto px-8 py-4 rounded-2xl text-lg font-bold bg-gradient-to-r from-leaf-dark to-leaf text-white shadow-xl shadow-leaf/30 hover:shadow-2xl hover:-translate-y-1 transition-all flex items-center justify-center gap-3">
              <Mic size={24} />
              आत्ता वापरा — मोफत
            </Link>
          </motion.div>

          {/* Quick Features Row */}
          <motion.div variants={fadeUp} className="flex flex-wrap justify-center gap-3">
            {[
              { text: "मराठी आवाज", icon: <Mic size={16}/> },
              { text: "बाजारभाव", icon: <TrendingUp size={16}/> },
              { text: "हवामान", icon: <Sun size={16}/> },
              { text: "सुरक्षित व शाश्वत", icon: <Leaf size={16}/> }
            ].map((tag, idx) => (
              <span key={idx} className="flex items-center gap-1.5 bg-white border border-wheat px-4 py-2 rounded-full text-sm font-bold text-soil shadow-sm">
                <span className="text-leaf">{tag.icon}</span>
                {tag.text}
              </span>
            ))}
          </motion.div>
        </motion.div>
      </section>

      {/* ── FEATURES SECTION ── */}
      <section id="features" className="py-24 px-6 bg-white relative">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-leaf font-bold tracking-widest uppercase text-sm mb-2 block">कसे काम करते?</span>
            <h2 className="text-3xl md:text-5xl font-black text-soil">एक नोंद, ३ सेकंद</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "१. फक्त बोला",
                desc: "मायक्रोफोन दाबा आणि मराठीत सांगा. उदा: 'आज ३ पोते युरिया ₹३०० दराने विकत घेतले.' टायपिंगची गरज नाही.",
                icon: <Mic size={32} />,
                color: "bg-blue-50 text-blue-600 border-blue-100"
              },
              {
                title: "२. AI समजतो",
                desc: "आमचा प्रगत AI तुमचा आवाज समजतो, योग्य पिकाची नोंद घेतो आणि अचूक हिशोब ठेवतो.",
                icon: <ShieldCheck size={32} />,
                color: "bg-green-50 text-green-600 border-green-100"
              },
              {
                title: "३. नफा पहा",
                desc: "पीक लागवडीपासून विक्रीपर्यंतचा प्रत्येक खर्च आणि नफा सुंदर आलेख आणि चार्ट्स मध्ये पहा.",
                icon: <TrendingUp size={32} />,
                color: "bg-orange-50 text-orange-600 border-orange-100"
              }
            ].map((feat, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.2 }}
                className="p-8 rounded-3xl bg-wheat-light border border-wheat/40 hover:border-leaf/50 hover:shadow-2xl transition-all group"
              >
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 ${feat.color}`}>
                  {feat.icon}
                </div>
                <h3 className="text-xl font-bold text-soil mb-3">{feat.title}</h3>
                <p className="text-bark font-marathi leading-relaxed">{feat.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CALL TO ACTION ── */}
      <section className="py-24 px-6 bg-soil text-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto"
        >
          <Sprout size={64} className="mx-auto text-leaf mb-6" />
          <h2 className="text-4xl md:text-5xl font-black text-white mb-6">तुमची शेती स्मार्ट करा</h2>
          <p className="text-lg text-white/70 mb-10 font-marathi">
            कोणतेही फॉर्म भरायची गरज नाही. फक्त बोला आणि सुरू करा.
          </p>
          <Link to="/app" className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl text-lg font-bold bg-white text-soil hover:scale-105 transition-transform">
            App सुरू करा <ArrowRight size={20} />
          </Link>
        </motion.div>
      </section>

    </div>
  );
};

export default Landing;