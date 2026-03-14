import React from 'react';
import { motion } from 'framer-motion';
import { User, MapPin, Phone, Award, Sprout, BookText, Settings, LogOut, ChevronRight, Map } from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer, Tooltip } from 'recharts';

const ProfileRoom = () => {
  // The personal details on the ID card
  const user = {
    name: 'राजेश पाटील',
    phone: '+91 98765 43210',
    village: 'लासलगाव',
    taluka: 'निफाड',
    district: 'नाशिक',
    credits: 340,
    nextMilestone: 500
  };

  // The list of actual land parcels the farmer owns
  const farmlands = [
    { id: 1, name: 'घरची शेती', area: 2, soil: 'काळी माती', irrigation: 'ठिबक' },
    { id: 2, name: 'माळरान', area: 1.5, soil: 'लाल माती', irrigation: 'पाऊस' }
  ];

  // The monthly activity points to draw the background chart
  const activityData = [
    { month: 'मे', level: 20 },
    { month: 'जून', level: 50 },
    { month: 'जुलै', level: 80 },
    { month: 'ऑग', level: 60 },
    { month: 'सप्टें', level: 100 },
  ];

  // Figuring out how full the reward progress bar should be
  const creditPercentage = (user.credits / user.nextMilestone) * 100;

  // Animation rules for smoothly sliding the cards onto the screen
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="flex flex-col h-full bg-wheat-light p-4 space-y-4">
      
      {/* ── THE ROOM HEADER ── */}
      <div>
        <h2 className="text-xl font-black text-soil flex items-center gap-2">
          <User className="text-leaf" size={24} />
          माझे प्रोफाइल
        </h2>
      </div>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-4 pb-6"
      >
        {/* ── THE MAIN ID CARD ── */}
        <motion.div variants={itemVariants} className="bg-white rounded-3xl p-5 border border-wheat shadow-sm relative overflow-hidden">
          {/* A soft green glow behind the profile picture */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-leaf-light/30 rounded-full blur-2xl -translate-y-1/2 translate-x-1/4 pointer-events-none" />
          
          <div className="flex items-center gap-4 mb-5 relative z-10">
            <div className="w-16 h-16 bg-gradient-to-br from-leaf-md to-leaf rounded-full flex items-center justify-center text-white text-2xl shadow-lg shadow-leaf/30 border-2 border-white shrink-0">
              👨‍🌾
            </div>
            <div>
              <h3 className="text-xl font-black text-soil leading-tight">{user.name}</h3>
              <p className="text-xs font-bold text-mud flex items-center gap-1 mt-1">
                <Phone size={12} /> {user.phone}
              </p>
              <p className="text-[11px] text-bark flex items-center gap-1 mt-0.5">
                <MapPin size={12} /> {user.village}, {user.taluka}, {user.district}
              </p>
            </div>
          </div>

          <button className="w-full bg-wheat-light text-bark font-bold py-2.5 rounded-xl border border-wheat hover:bg-wheat transition-colors text-sm">
            प्रोफाइल सुधारा (Edit)
          </button>
        </motion.div>

        {/* ── THE REWARDS PASSBOOK (Smart Credits) ── */}
        <motion.div variants={itemVariants} className="bg-gradient-to-br from-leaf-dark to-leaf rounded-3xl p-5 text-white shadow-md shadow-leaf/20">
          <div className="flex justify-between items-center mb-3">
            <div className="flex items-center gap-1.5">
              <Award size={18} className="text-yellow-300" />
              <p className="font-bold uppercase tracking-wider text-xs text-white/90">स्मार्ट क्रेडिट्स</p>
            </div>
            <p className="text-2xl font-black">{user.credits}</p>
          </div>
          
          {/* The Progress Bar */}
          <div className="h-2 w-full bg-black/20 rounded-full overflow-hidden mb-2">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${creditPercentage}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="h-full bg-gradient-to-r from-yellow-300 to-yellow-400 rounded-full"
            />
          </div>
          <p className="text-[10px] text-white/80 font-bold">
            पुढील बक्षीसासाठी {user.nextMilestone - user.credits} क्रेडिट्स आवश्यक · खरेदीत ₹{user.credits} ची सूट
          </p>
        </motion.div>

        {/* ── THE QUICK SUMMARY (Stats Grid & Chart) ── */}
        <motion.div variants={itemVariants} className="bg-white rounded-3xl p-5 border border-wheat shadow-sm">
          <div className="grid grid-cols-3 gap-3 mb-5">
            {[
              { icon: <Sprout size={20}/>, val: 2, label: 'सक्रिय पिके', color: 'text-leaf' },
              { icon: <BookText size={20}/>, val: 15, label: 'एकूण नोंदी', color: 'text-blue-500' },
              { icon: <Map size={20}/>, val: farmlands.length, label: 'शेते', color: 'text-orange-500' }
            ].map((stat, idx) => (
              <div key={idx} className="flex flex-col items-center justify-center text-center">
                <div className={`mb-1 ${stat.color}`}>{stat.icon}</div>
                <p className="text-lg font-black text-soil leading-none">{stat.val}</p>
                <p className="text-[10px] font-bold text-mud uppercase mt-1">{stat.label}</p>
              </div>
            ))}
          </div>

          <div className="h-24 w-full">
            <p className="text-[9px] font-bold text-mud uppercase mb-1">अ‍ॅपचा वापर (मासिक)</p>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={activityData}>
                <defs>
                  <linearGradient id="colorLevel" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4a9e4a" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#4a9e4a" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <Area type="monotone" dataKey="level" stroke="#4a9e4a" strokeWidth={3} fillOpacity={1} fill="url(#colorLevel)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* ── THE PROPERTY DEEDS (Farmlands List) ── */}
        <motion.div variants={itemVariants}>
          <div className="flex justify-between items-center mb-3 px-1">
            <p className="font-bold text-soil flex items-center gap-1.5">
              <Map size={18} className="text-leaf" /> माझी शेते
            </p>
            <button className="text-xs font-bold text-leaf bg-leaf-light px-3 py-1.5 rounded-full hover:bg-leaf hover:text-white transition-colors">
              + जोडा
            </button>
          </div>
          
          <div className="space-y-3">
            {farmlands.map((land) => (
              <div key={land.id} className="bg-white rounded-2xl p-4 border border-wheat shadow-sm flex justify-between items-center">
                <div>
                  <h4 className="font-black text-soil text-sm">{land.name}</h4>
                  <p className="text-[10px] font-bold text-mud mt-0.5">{land.soil} · {land.irrigation}</p>
                </div>
                <div className="bg-wheat-light px-3 py-1.5 rounded-lg border border-wheat text-center">
                  <p className="text-sm font-black text-leaf-dark">{land.area}</p>
                  <p className="text-[9px] font-bold text-mud uppercase">एकर</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* ── THE EXIT DOORS (Settings & Logout) ── */}
        <motion.div variants={itemVariants} className="pt-2 flex flex-col gap-3">
          <button className="w-full bg-white text-bark font-bold py-3.5 px-4 rounded-2xl border border-wheat shadow-sm flex items-center justify-between hover:bg-wheat-light transition-colors">
            <span className="flex items-center gap-2"><Settings size={18} className="text-mud" /> सेटिंग्स (Settings)</span>
            <ChevronRight size={18} className="text-mud" />
          </button>
          <button className="w-full bg-red-50 text-red-600 font-bold py-3.5 px-4 rounded-2xl border border-red-100 shadow-sm flex items-center justify-center gap-2 hover:bg-red-100 transition-colors">
            <LogOut size={18} /> लॉगआउट करा (Logout)
          </button>
        </motion.div>

      </motion.div>
    </div>
  );
};

export default ProfileRoom;