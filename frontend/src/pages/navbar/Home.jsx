// src/pages/navbar/Home.jsx
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Recycle,
  MapPin,
  Award,
  Truck,
  ChevronRight,
  Leaf,
  ShieldCheck,
  Scale,
  Zap,
  Gift,
  TreePine,
  IndianRupee,
} from 'lucide-react';
import { useEffect, useState } from 'react';

const fadeInUp = {
  hidden: { opacity: 0, y: 60 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.9, ease: 'easeOut' } }
};

const staggerChildren = {
  hidden: { opacity: 1 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.14, delayChildren: 0.3 }
  }
};

const cardHover = {
  rest: { y: 0, scale: 1 },
  hover: { y: -12, scale: 1.03, transition: { type: 'spring', stiffness: 400, damping: 18 } }
};

export default function Home() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(true);
  }, []);

  return (
    <div className="bg-white">
      {/* HERO – Clean, Modern & Professional */}
      <section className="relative min-h-[90vh] md:min-h-screen flex items-center bg-gradient-to-br from-emerald-50 via-white to-teal-50/70 overflow-hidden pt-16 md:pt-0">
        {/* Decorative blurred shapes */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-emerald-100/30 rounded-full blur-3xl" />
          <div className="absolute bottom-[-15%] right-[-15%] w-[70%] h-[70%] bg-teal-100/20 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-12 w-full">
          <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
            {/* Left – Text */}
            <div className="text-center lg:text-left">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="inline-flex items-center gap-3 px-6 py-3 bg-white/80 backdrop-blur-sm rounded-full border border-emerald-200 shadow-sm mb-8"
              >
                <Leaf className="h-5 w-5 text-emerald-600" />
                <span className="font-semibold text-emerald-800">Nagpur's Responsible Recycling Platform</span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 80 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 1 }}
                className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-extrabold tracking-tight leading-none"
              >
                <span className="text-gray-900">Zero Waste.</span><br />
                <span className="bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-600 bg-clip-text text-transparent">
                  Real Rewards.
                </span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 1 }}
                className="mt-8 text-xl md:text-2xl lg:text-3xl text-gray-700 max-w-3xl mx-auto lg:mx-0 leading-relaxed"
              >
                Turn everyday waste into meaningful value — vouchers, trees planted, cashback & eco-kits.
              </motion.p>

              <motion.p
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="mt-5 text-lg md:text-xl text-gray-600 font-medium"
              >
                Built with love for Nagpur families and residential societies.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8, duration: 0.9 }}
                className="mt-12 flex flex-col sm:flex-row gap-6 justify-center lg:justify-start"
              >
                <Link
                  to="/register"
                  className="group relative inline-flex items-center justify-center gap-3 rounded-full bg-emerald-600 px-10 py-5 text-xl font-bold text-white shadow-xl hover:shadow-emerald-300/50 hover:bg-emerald-700 transition-all duration-300"
                >
                  <span>Start Earning Now</span>
                  <ChevronRight className="group-hover:translate-x-1.5 transition-transform" />
                </Link>

                <Link
                  to="/how-it-works"
                  className="inline-flex items-center justify-center rounded-full border-2 border-emerald-600/70 px-10 py-5 text-xl font-semibold text-emerald-700 hover:bg-emerald-50 hover:border-emerald-700 transition-all duration-300"
                >
                  See How It Works
                </Link>
              </motion.div>
            </div>

            {/* Right – Visual + Trust badges */}
            <motion.div
              initial={{ opacity: 0, x: 60, scale: 0.92 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              transition={{ delay: 0.5, duration: 1.1 }}
              className="hidden lg:block relative"
            >
              <div className="relative w-full max-w-xl">
                <div className="aspect-square rounded-3xl bg-gradient-to-br from-emerald-50 to-teal-50/40 flex items-center justify-center shadow-2xl border border-emerald-100/50">
                  <Recycle className="h-64 w-64 text-emerald-600/70" />
                </div>

                {/* Floating trust elements */}
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.9 }}
                  className="absolute -top-10 -right-8 bg-white p-6 rounded-2xl shadow-xl border border-emerald-100 text-center"
                >
                  <div className="text-5xl font-bold text-emerald-700">500+</div>
                  <div className="text-sm text-gray-600 mt-1 font-medium">Active Households</div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.1 }}
                  className="absolute -bottom-12 -left-10 bg-white p-6 rounded-2xl shadow-xl border border-emerald-100 text-center"
                >
                  <div className="text-5xl font-bold text-emerald-700">₹1.2L+</div>
                  <div className="text-sm text-gray-600 mt-1 font-medium">Rewards Distributed</div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ====================== HOW IT WORKS ====================== */}
      <section className="py-24 md:py-32 bg-white">
        <div className="mx-auto max-w-7xl px-6 lg:px-12">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="text-center mb-20"
          >
            <h2 className="text-5xl md:text-6xl font-bold tracking-tight text-gray-900">
              How <span className="text-emerald-600">WasteZero</span> Works
            </h2>
            <p className="mt-6 text-2xl text-gray-700 max-w-4xl mx-auto">
              Four simple steps — designed for real Nagpur families and apartments
            </p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10"
            variants={staggerChildren}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {[
              { num: '01', title: 'Register & Pin Location', desc: 'Create account in 30 seconds. Add your Nagpur address.', icon: <MapPin className="h-12 w-12 text-emerald-600" /> },
              { num: '02', title: 'Schedule Pickup', desc: 'Choose convenient home collection or nearest drop point.', icon: <Truck className="h-12 w-12 text-emerald-600" /> },
              { num: '03', title: 'We Collect & Weigh', desc: 'Verified partner arrives, weighs transparently on-site.', icon: <Scale className="h-12 w-12 text-emerald-600" /> },
              { num: '04', title: 'Earn Points Instantly', desc: 'Points credited immediately — redeem anytime.', icon: <Zap className="h-12 w-12 text-emerald-600" /> },
            ].map((step) => (
              <motion.div
                key={step.num}
                variants={fadeInUp}
                whileHover="hover"
                initial="rest"
                className="relative group"
              >
                <motion.div variants={cardHover} className="bg-white rounded-3xl p-10 shadow-xl border border-gray-100 h-full flex flex-col items-center text-center">
                  <div className="mb-8 transform group-hover:scale-110 transition-transform duration-300">
                    {step.icon}
                  </div>
                  <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-emerald-600 text-white font-bold text-2xl h-14 w-14 rounded-full flex items-center justify-center shadow-lg ring-4 ring-white z-10">
                    {step.num}
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">{step.title}</h3>
                  <p className="text-gray-600 text-lg leading-relaxed">{step.desc}</p>
                </motion.div>
              </motion.div>
            ))}
          </motion.div>

          <div className="mt-20 text-center">
            <Link
              to="/how-it-works"
              className="inline-flex items-center gap-3 text-xl font-semibold text-emerald-700 hover:text-emerald-800 transition-colors"
            >
              See full detailed guide <ChevronRight />
            </Link>
          </div>
        </div>
      </section>

      {/* ====================== REWARDS ====================== */}
      <section className="py-24 md:py-32 bg-gradient-to-b from-white to-emerald-50/50">
        <div className="mx-auto max-w-7xl px-6 lg:px-12">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="text-center mb-20"
          >
            <h2 className="text-5xl md:text-6xl font-bold text-gray-900">
              Earn While You Help the Planet
            </h2>
            <p className="mt-6 text-2xl text-gray-700 max-w-4xl mx-auto">
              Every kilogram recycled = real points → real rewards
            </p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8"
            variants={staggerChildren}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {[
              { points: 500, title: '₹100 Amazon Voucher', desc: '50 kg dry waste', icon: <Gift />, color: 'emerald' },
              { points: 1200, title: 'Plant a Tree', desc: 'Name + photo on certificate', icon: <TreePine />, color: 'teal' },
              { points: 2500, title: 'Eco Starter Kit', desc: 'Bamboo products ~₹500 value', icon: <Award />, color: 'emerald' },
              { points: 8000, title: '₹800 UPI Cashback', desc: 'Direct bank transfer', icon: <IndianRupee />, color: 'teal' },
            ].map((reward) => (
              <motion.div
                key={reward.title}
                variants={fadeInUp}
                whileHover="hover"
                initial="rest"
                className="relative group"
              >
                <motion.div
                  variants={cardHover}
                  className="bg-white rounded-3xl p-10 shadow-xl border border-gray-100 text-center h-full flex flex-col"
                >
                  <div className={`text-7xl mb-8 text-${reward.color}-600 group-hover:scale-110 transition-transform duration-300`}>
                    {reward.icon}
                  </div>
                  <div className="text-5xl font-extrabold text-emerald-700 mb-2">{reward.points}</div>
                  <div className="text-base font-semibold text-emerald-600 tracking-wide mb-6">POINTS</div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">{reward.title}</h3>
                  <p className="text-gray-600 text-lg">{reward.desc}</p>
                </motion.div>
              </motion.div>
            ))}
          </motion.div>

          <div className="mt-20 text-center">
            <Link
              to="/rewards"
              className="inline-flex items-center gap-3 text-xl font-semibold text-emerald-700 hover:text-emerald-800 transition-colors"
            >
              Explore all rewards <ChevronRight />
            </Link>
          </div>
        </div>
      </section>

      {/* ====================== FINAL STRONG CTA ====================== */}
      <section className="py-32 md:py-40 bg-gradient-to-br from-emerald-700 via-emerald-800 to-teal-900 text-white text-center">
        <div className="mx-auto max-w-5xl px-6">
          <motion.h2
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-5xl md:text-6xl lg:text-7xl font-extrabold leading-tight"
          >
            Ready to Start Earning<br />While Cleaning Nagpur?
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="mt-10 text-2xl md:text-3xl max-w-4xl mx-auto text-emerald-100/90 font-light"
          >
            Join hundreds of Nagpur families already turning waste into real value — no hassle, no hidden fees.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="mt-16"
          >
            <Link
              to="/register"
              className="group inline-flex items-center gap-4 rounded-full bg-white px-16 py-7 text-3xl md:text-4xl font-bold text-emerald-900 shadow-2xl hover:bg-emerald-50 hover:shadow-emerald-300/60 transition-all duration-300"
            >
              Get Started Free
              <Recycle className="h-10 w-10 text-emerald-700 group-hover:rotate-12 transition-transform" />
            </Link>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.8 }}
            className="mt-12 text-xl text-emerald-200"
          >
            First pickup usually within 48 hours • Completely transparent • Zero spam
          </motion.p>
        </div>
      </section>
    </div>
  );
}