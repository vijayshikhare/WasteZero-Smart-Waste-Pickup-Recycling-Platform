// src/pages/navbar/CollectionPoints.jsx
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

const fadeInUp = {
  hidden: { opacity: 0, y: 35 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: 'easeOut' } }
};

const staggerContainer = {
  hidden: { opacity: 1 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.11, delayChildren: 0.15 }
  }
};

const cardHover = {
  rest: {
    y: 0,
    scale: 1,
    boxShadow: "0 10px 25px -5px rgba(0,0,0,0.07), 0 10px 10px -5px rgba(0,0,0,0.04)"
  },
  hover: {
    y: -10,
    scale: 1.03,
    boxShadow: "0 25px 50px -12px rgba(16, 185, 129, 0.25), 0 10px 10px -5px rgba(0,0,0,0.1)",
    transition: { type: "spring", stiffness: 400, damping: 18 }
  }
};

export default function CollectionPoints() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const points = [
    {
      name: "Sitabuldi Recycling Hub",
      address: "Near Congress Bhavan, Sitabuldi, Nagpur",
      types: ["Dry Waste", "Plastic", "Paper"],
      timing: "8:00 AM – 8:00 PM",
      distance: "2.4 km",
      color: "from-emerald-500 to-teal-500"
    },
    {
      name: "Dharampeth Dry Waste Center",
      address: "Opposite Somalwar High School, Dharampeth",
      types: ["Dry Waste", "E-Waste", "Metal"],
      timing: "7:30 AM – 7:00 PM",
      distance: "4.1 km",
      color: "from-teal-500 to-cyan-500"
    },
    {
      name: "Civil Lines Collection Point",
      address: "Near Reserve Bank Square, Civil Lines",
      types: ["Plastic", "Metal", "Municipal Bin"],
      timing: "24 × 7 Access",
      distance: "3.8 km",
      color: "from-cyan-500 to-emerald-600"
    },
    {
      name: "Wardha Road MRF Centre",
      address: "Near Future Park, Wardha Road",
      types: ["Dry Waste", "Bulk Recyclables"],
      timing: "9:00 AM – 6:00 PM",
      distance: "7.2 km",
      color: "from-emerald-600 to-green-700"
    },
    {
      name: "Bhandewadi Transfer Station",
      address: "Bhandewadi Dumping Zone Area",
      types: ["All Dry Waste", "Bulk Items"],
      timing: "6:00 AM – 10:00 PM",
      distance: "11 km",
      color: "from-green-600 to-emerald-700"
    },
    {
      name: "Amazari Road Eco Point",
      address: "North Ambazari Road, Near Seminary Hills",
      types: ["Paper", "Plastic", "Clothes"],
      timing: "8:00 AM – 7:00 PM",
      distance: "5.6 km",
      color: "from-emerald-500 to-lime-600"
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
            Collection Points{' '}
            <span className="bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">
              Near You
            </span>
          </h1>
          <p className="mt-5 md:mt-6 text-xl md:text-2xl text-gray-700 max-w-4xl mx-auto leading-relaxed">
            Locate verified dry waste, plastic, e-waste, metal buy-back & municipal points across Nagpur
          </p>
        </motion.div>

        {/* Map Section */}
        <motion.div
          className="mt-8 md:mt-12 bg-white rounded-2xl md:rounded-3xl shadow-2xl overflow-hidden border border-emerald-100/60 relative"
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.8 }}
        >
          <div className="h-80 sm:h-96 md:h-[500px] bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_70%,rgba(16,185,129,0.08),transparent_40%)]" />

            <div className="text-center px-6 max-w-xl z-10">
              <div className="text-6xl md:text-8xl mb-5 opacity-70">🗺️</div>
              <h3 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4">
                Interactive Nagpur Map
              </h3>
              <p className="text-lg md:text-xl text-gray-600">
                Showing nearby collection points, distances & types — coming very soon!
              </p>
              <p className="mt-4 text-sm md:text-base text-emerald-700 font-medium">
                (Powered by Google Maps / Leaflet + real-time WasteZero data)
              </p>
            </div>

            {/* Fake pin decorations */}
            <div className="absolute top-1/4 left-1/3 w-5 h-5 bg-emerald-500 rounded-full shadow-lg animate-pulse" />
            <div className="absolute bottom-1/3 right-1/4 w-4 h-4 bg-teal-500 rounded-full shadow-lg animate-pulse delay-300" />
            <div className="absolute top-2/3 left-1/2 w-6 h-6 bg-cyan-500 rounded-full shadow-lg animate-pulse delay-700" />
          </div>
        </motion.div>

        {/* Points Grid */}
        <motion.div
          className="mt-16 md:mt-20 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8"
          variants={staggerContainer}
          initial="hidden"
          animate={isVisible ? "visible" : "hidden"}
        >
          {points.map((point) => (
            <motion.div
              key={point.name}
              variants={fadeInUp}
              initial="rest"
              whileHover="hover"
              className="relative group"
            >
              <motion.div
                variants={cardHover}
                className="bg-white rounded-2xl md:rounded-3xl p-6 md:p-8 shadow-lg border border-gray-100/80 overflow-hidden h-full flex flex-col"
              >
                {/* Gradient top accent */}
                <div className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${point.color}`} />

                <div className="flex items-start justify-between mb-5">
                  <h3 className="text-xl md:text-2xl font-bold text-gray-900 tracking-tight pr-4">
                    {point.name}
                  </h3>
                  <span className="inline-flex items-center px-3 py-1.5 rounded-full bg-emerald-100 text-emerald-800 text-sm font-semibold whitespace-nowrap">
                    {point.distance}
                  </span>
                </div>

                <p className="text-gray-600 mb-4 flex-grow">
                  {point.address}
                </p>

                <div className="flex flex-wrap gap-2 mb-5">
                  {point.types.map((type) => (
                    <span
                      key={type}
                      className="px-3 py-1 bg-gray-100 text-gray-700 text-xs md:text-sm rounded-full font-medium"
                    >
                      {type}
                    </span>
                  ))}
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500 font-medium">Timings:</span>
                  <span className="font-semibold text-emerald-700">{point.timing}</span>
                </div>
              </motion.div>
            </motion.div>
          ))}
        </motion.div>

        {/* CTA */}
        <motion.div
          className="mt-20 md:mt-28 text-center"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.9 }}
        >
          <p className="text-xl md:text-2xl text-gray-800 font-medium mb-8">
            Want home pickup instead? Schedule it in seconds!
          </p>

          <motion.a
            href="/schedule-pickup"
            className="inline-flex items-center gap-3 rounded-full bg-gradient-to-r from-emerald-600 to-teal-500 px-10 py-5 md:px-14 md:py-6 text-xl md:text-2xl font-bold text-white shadow-xl shadow-emerald-200/50 hover:shadow-emerald-300/60 hover:brightness-110 transition-all duration-300"
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.97 }}
          >
            Schedule Free Pickup
            <span className="text-2xl md:text-3xl">→</span>
          </motion.a>

          <p className="mt-6 text-gray-500 text-base">
            Or use the map (coming soon) to find the nearest drop-off point
          </p>
        </motion.div>
      </div>
    </div>
  );
}