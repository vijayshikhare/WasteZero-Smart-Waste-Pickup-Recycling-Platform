// src/pages/navbar/Rewards.jsx
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: 'easeOut' } }
};

const staggerChildren = {
  hidden: { opacity: 1 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12 }
  }
};

const scaleOnHover = {
  rest: { scale: 1, y: 0, boxShadow: "0 10px 25px -5px rgba(0,0,0,0.07)" },
  hover: {
    scale: 1.04,
    y: -8,
    boxShadow: "0 20px 35px -5px rgba(16, 185, 129, 0.25)",
    transition: { type: "spring", stiffness: 400, damping: 17 }
  }
};

export default function Rewards() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const rewards = [
    {
      points: 500,
      title: "₹100 Amazon Voucher",
      desc: "Redeem after recycling 50 kg dry waste",
      icon: "🎁",
      color: "from-emerald-500 to-teal-500"
    },
    {
      points: 1200,
      title: "Plant a Tree Certificate",
      desc: "Your name + photo on real tree planting certificate",
      icon: "🌱",
      color: "from-green-500 to-emerald-600"
    },
    {
      points: 2500,
      title: "Eco-friendly Starter Kit",
      desc: "Bamboo toothbrush, straws, pouch & more (~₹500 value)",
      icon: "🧼",
      color: "from-teal-500 to-cyan-500"
    },
    {
      points: 8000,
      title: "₹800 UPI Cashback",
      desc: "Direct bank/UPI transfer – no strings attached",
      icon: "💸",
      color: "from-emerald-600 to-green-700"
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-emerald-50/40 to-white pt-16 pb-24 md:pt-24 md:pb-32">
      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-12">
        <motion.div
          className="text-center mb-16 md:mb-20"
          initial="hidden"
          animate={isVisible ? "visible" : "hidden"}
          variants={fadeInUp}
        >
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-gray-900">
            Earn Rewards.{' '}
            <span className="bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">
              Save the Planet.
            </span>
          </h1>
          <p className="mt-6 text-xl md:text-2xl text-gray-700 max-w-3xl mx-auto leading-relaxed">
            Turn every kilogram of waste you recycle into real value — vouchers, trees, kits & cash.
          </p>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8"
          variants={staggerChildren}
          initial="hidden"
          animate={isVisible ? "visible" : "hidden"}
        >
          {rewards.map((reward) => (
            <motion.div
              key={reward.title}
              variants={fadeInUp}
              initial="rest"
              whileHover="hover"
              animate="rest"
              className="relative group"
            >
              <motion.div
                variants={scaleOnHover}
                className="relative bg-white rounded-2xl md:rounded-3xl p-7 md:p-9 shadow-lg border border-gray-100 overflow-hidden"
              >
                {/* Gradient accent bar */}
                <div className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${reward.color} opacity-90`} />

                <div className="text-center">
                  <div className="text-5xl md:text-6xl mb-4 md:mb-5 transform transition-transform group-hover:scale-110 duration-300">
                    {reward.icon}
                  </div>

                  <div className="text-4xl md:text-5xl font-extrabold text-emerald-700 tracking-tight">
                    {reward.points}
                  </div>
                  <div className="text-sm md:text-base font-semibold text-emerald-600/90 mt-1 tracking-wide">
                    POINTS
                  </div>

                  <h3 className="mt-5 md:mt-6 text-xl md:text-2xl font-bold text-gray-900">
                    {reward.title}
                  </h3>

                  <p className="mt-3 md:mt-4 text-gray-600 text-base leading-relaxed">
                    {reward.desc}
                  </p>
                </div>
              </motion.div>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          className="mt-20 md:mt-28 text-center"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.8 }}
        >
          <p className="text-xl md:text-2xl text-gray-800 font-medium mb-8">
            Ready to turn your waste into rewards?
          </p>

          <motion.a
            href="/register"
            className="inline-flex items-center gap-3 rounded-full bg-gradient-to-r from-emerald-600 to-teal-500 px-10 py-5 md:px-14 md:py-6 text-xl md:text-2xl font-bold text-white shadow-lg shadow-emerald-200/50 hover:shadow-emerald-300/60 hover:from-emerald-700 hover:to-teal-600 transition-all duration-300"
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.96 }}
          >
            Start Earning Now
            <span className="text-2xl md:text-3xl">→</span>
          </motion.a>

          <p className="mt-6 text-gray-500 text-sm md:text-base">
            Join thousands already earning rewards through responsible recycling
          </p>
        </motion.div>
      </div>
    </div>
  );
}