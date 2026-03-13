// src/pages/navbar/HowItWorks.jsx
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: 'easeOut' } }
};

const staggerContainer = {
  hidden: { opacity: 1 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.14, delayChildren: 0.2 }
  }
};

const cardVariants = {
  rest: {
    y: 0,
    scale: 1,
    boxShadow: "0 10px 25px -5px rgba(0,0,0,0.06), 0 10px 10px -5px rgba(0,0,0,0.04)"
  },
  hover: {
    y: -12,
    scale: 1.03,
    boxShadow: "0 25px 50px -12px rgba(16, 185, 129, 0.22), 0 10px 10px -5px rgba(0,0,0,0.1)",
    transition: { type: "spring", stiffness: 380, damping: 22 }
  }
};

export default function HowItWorks() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const steps = [
    {
      number: "01",
      title: "Register & Pin Your Location",
      description: "Create account in under 30 seconds. Set your Nagpur area — see nearby pickup & drop points instantly.",
      icon: "📍",
      color: "from-emerald-500 to-teal-500"
    },
    {
      number: "02",
      title: "Book Pickup or Find Drop-off",
      description: "Choose convenient home collection slot or locate the nearest verified collection centre.",
      icon: "🗓️",
      color: "from-teal-500 to-cyan-500"
    },
    {
      number: "03",
      title: "Collection & Live Weighing",
      description: "Our trained partner arrives, sorts waste categories and weighs in front of you — fully transparent.",
      icon: "⚖️",
      color: "from-cyan-500 to-emerald-600"
    },
    {
      number: "04",
      title: "Points Credited Instantly",
      description: "Earn WasteZero points based on weight & type. Redeem for vouchers, trees, kits or direct UPI cash.",
      icon: "🎯",
      color: "from-emerald-600 to-green-700"
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-emerald-50/30 to-white pt-16 pb-24 md:pt-24 md:pb-32 overflow-hidden">
      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-12">
        <motion.div
          className="text-center mb-16 md:mb-20"
          initial="hidden"
          animate={isVisible ? "visible" : "hidden"}
          variants={fadeInUp}
        >
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-gray-900">
            How <span className="bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">WasteZero</span> Works
          </h1>
          <p className="mt-5 md:mt-6 text-xl md:text-2xl text-gray-700 max-w-3xl mx-auto leading-relaxed">
            4 simple steps — designed for fast-paced life in Nagpur
          </p>
        </motion.div>

        {/* Steps */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-7 md:gap-8 lg:gap-10 relative"
          variants={staggerContainer}
          initial="hidden"
          animate={isVisible ? "visible" : "hidden"}
        >
          {steps.map((step, index) => (
            <motion.div
              key={step.number}
              variants={fadeInUp}
              className="relative group"
            >
              <motion.div
                variants={cardVariants}
                initial="rest"
                whileHover="hover"
                className="relative bg-white rounded-2xl md:rounded-3xl p-7 md:p-9 shadow-xl border border-gray-100/80 overflow-hidden h-full flex flex-col"
              >
                {/* Gradient top line */}
                <div className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${step.color} opacity-90`} />

                {/* Number badge */}
                <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-gradient-to-br from-emerald-600 to-teal-600 text-white font-bold text-2xl h-14 w-14 rounded-full flex items-center justify-center shadow-lg ring-4 ring-white z-10">
                  {step.number}
                </div>

                {/* Icon */}
                <div className="text-6xl md:text-7xl mt-8 mb-5 text-center opacity-90 group-hover:scale-110 transition-transform duration-300">
                  {step.icon}
                </div>

                <div className="text-center mt-2 flex-grow flex flex-col">
                  <h3 className="text-xl md:text-2xl font-bold text-gray-900 tracking-tight">
                    {step.title}
                  </h3>
                  <p className="mt-4 md:mt-5 text-gray-600 text-base leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </motion.div>

              {/* Connecting line (except last item) */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 -right-5 w-10 h-0.5 bg-gradient-to-r from-emerald-400 to-teal-400 opacity-60" />
              )}
            </motion.div>
          ))}
        </motion.div>

        {/* Final CTA */}
        <motion.div
          className="mt-20 md:mt-28 text-center"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.9 }}
        >
          <p className="text-xl md:text-2xl text-gray-800 font-medium mb-8">
            Start turning your waste into value today
          </p>

          <motion.a
            href="/register"
            className="inline-flex items-center gap-3 rounded-full bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-600 bg-size-200 bg-pos-0 hover:bg-pos-100 px-10 py-5 md:px-14 md:py-6 text-xl md:text-2xl font-bold text-white shadow-xl shadow-emerald-200/40 hover:shadow-emerald-300/50 transition-all duration-500"
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.97 }}
          >
            Create Free Account
            <span className="text-2xl md:text-3xl">→</span>
          </motion.a>

          <p className="mt-6 text-gray-500 text-base">
            No paperwork • No hidden charges • First pickup usually within 48 hours
          </p>
        </motion.div>
      </div>
    </div>
  );
}