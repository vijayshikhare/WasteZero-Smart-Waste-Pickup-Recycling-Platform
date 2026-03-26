// src/pages/navbar/Contact.jsx
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
    transition: { staggerChildren: 0.12, delayChildren: 0.15 }
  }
};

const inputFocus = {
  rest: { scale: 1, boxShadow: "0 1px 3px rgba(0,0,0,0.1)" },
  focus: {
    scale: 1.02,
    boxShadow: "0 0 0 3px rgba(16, 185, 129, 0.2)",
    transition: { type: "spring", stiffness: 300, damping: 20 }
  }
};

export default function Contact() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-emerald-50/40 to-white pt-16 pb-24 md:pt-24 md:pb-32">
      <div className="mx-auto max-w-6xl px-5 sm:px-8 lg:px-12">
        {/* Header */}
        <motion.div
          className="text-center mb-16 md:mb-20"
          initial="hidden"
          animate={isVisible ? "visible" : "hidden"}
          variants={fadeInUp}
        >
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-gray-900">
            Get in{' '}
            <span className="bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">
              Touch
            </span>
          </h1>
          <p className="mt-5 md:mt-6 text-xl md:text-2xl text-gray-700 max-w-3xl mx-auto leading-relaxed">
            Questions about recycling in Nagpur? Partnership ideas? We're just a message away.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 md:gap-16">
          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="bg-white/70 backdrop-blur-md rounded-2xl md:rounded-3xl p-8 md:p-10 shadow-xl border border-emerald-100/60"
          >
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8">
              Send us a message
            </h2>

            <form className="space-y-7">
              <motion.div variants={inputFocus} initial="rest" whileFocus="focus">
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  id="name"
                  className="block w-full rounded-xl border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 py-3.5 px-5 text-base transition-all duration-200"
                  placeholder="Vijay Patil"
                  required
                />
              </motion.div>

              <motion.div variants={inputFocus} initial="rest" whileFocus="focus">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  className="block w-full rounded-xl border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 py-3.5 px-5 text-base transition-all duration-200"
                  placeholder="vijay@example.com"
                  required
                />
              </motion.div>

              <motion.div variants={inputFocus} initial="rest" whileFocus="focus">
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                  Your Message
                </label>
                <textarea
                  id="message"
                  rows={5}
                  className="block w-full rounded-xl border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 py-3.5 px-5 text-base transition-all duration-200 resize-y min-h-[120px]"
                  placeholder="Tell us how we can help with your waste management needs in Nagpur..."
                  required
                />
              </motion.div>

              <motion.button
                type="submit"
                className="w-full rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 px-8 py-4 text-lg font-bold text-white shadow-lg hover:shadow-emerald-300/50 hover:brightness-110 transition-all duration-300 flex items-center justify-center gap-2"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                Send Message
                <span className="text-xl">→</span>
              </motion.button>
            </form>
          </motion.div>

          {/* Contact Info */}
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate={isVisible ? "visible" : "hidden"}
            className="space-y-10 md:space-y-12"
          >
            {/* Nagpur Support Card */}
            <motion.div
              variants={fadeInUp}
              className="bg-white/70 backdrop-blur-md rounded-2xl md:rounded-3xl p-8 shadow-lg border border-emerald-100/60"
            >
              <div className="flex items-center gap-4 mb-5">
                <span className="text-4xl">📞</span>
                <h3 className="text-2xl font-bold text-gray-900">Nagpur Support</h3>
              </div>
              <p className="text-gray-700 text-lg leading-relaxed">
                We're here Monday–Saturday, 10 AM – 7 PM IST
              </p>
              <div className="mt-5 space-y-3 text-gray-700">
                <p className="flex items-center gap-3">
                  <span className="font-medium">Email:</span>
                  <a href="mailto:support@wastezero.in" className="text-emerald-700 hover:underline">
                    support@wastezero.in
                  </a>
                </p>
                <p className="flex items-center gap-3">
                  <span className="font-medium">Phone:</span>
                  <a href="tel:+917121234567" className="text-emerald-700 hover:underline">
                    +91 712 123 4567
                  </a>
                </p>
              </div>
            </motion.div>

            {/* Address Card */}
            <motion.div
              variants={fadeInUp}
              className="bg-white/70 backdrop-blur-md rounded-2xl md:rounded-3xl p-8 shadow-lg border border-emerald-100/60"
            >
              <div className="flex items-center gap-4 mb-5">
                <span className="text-4xl">📍</span>
                <h3 className="text-2xl font-bold text-gray-900">Our Location</h3>
              </div>
              <p className="text-gray-700 text-lg leading-relaxed">
                WasteZero Operations<br />
                Near VNIT Campus, South Ambazari Road<br />
                Nagpur, Maharashtra 440010
              </p>
              <a
                href="https://maps.google.com/?q=WasteZero+Near+VNIT+South+Ambazari+Road+Nagpur"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-5 inline-flex items-center gap-2 text-emerald-700 font-medium hover:underline"
              >
                Get Directions →
              </a>
            </motion.div>

            {/* Social & Follow */}
            <motion.div
              variants={fadeInUp}
              className="bg-white/70 backdrop-blur-md rounded-2xl md:rounded-3xl p-8 shadow-lg border border-emerald-100/60"
            >
              <div className="flex items-center gap-4 mb-5">
                <span className="text-4xl">🌐</span>
                <h3 className="text-2xl font-bold text-gray-900">Follow & Connect</h3>
              </div>
              <div className="flex flex-wrap gap-6 mt-4">
                {['Instagram', 'Twitter/X', 'LinkedIn'].map((platform) => (
                  <a
                    key={platform}
                    href="#"
                    className="text-gray-700 hover:text-emerald-600 transition-colors text-lg font-medium"
                  >
                    {platform}
                  </a>
                ))}
              </div>
              <p className="mt-6 text-gray-600 text-sm">
                Stay updated on Nagpur's recycling initiatives and rewards
              </p>
            </motion.div>
          </motion.div>
        </div>

        {/* Final Note */}
        <motion.div
          className="mt-16 md:mt-20 text-center"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.8 }}
        >
          <p className="text-lg md:text-xl text-gray-700 font-medium">
            Expect a reply within 24 hours on business days. Thank you for helping make Nagpur cleaner!
          </p>
        </motion.div>
      </div>
    </div>
  );
}