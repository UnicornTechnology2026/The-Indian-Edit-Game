import React, { useState } from "react";
import { motion, AnimatePresence, type Variants } from "motion/react";
import { useGame } from "../../context/GameContext";
import { Sparkles, ArrowRight, MapPin, User, Phone } from "lucide-react";
import { sound } from "../../utils/audio";

const container: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.12 },
  },
};

const item: Variants = {
  hidden: { opacity: 0, y: 22 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.55,
      ease: [0.16, 1, 0.3, 1] as const,
    },
  },
};

export const LoginScreen: React.FC = () => {
  const { state, setUserName, setUserCity, setUserPhone, navigateTo } =
    useGame();

  const [name, setName] = useState(state.userName || "");
  const [city, setCity] = useState(state.userCity);
  const [customCity, setCustomCity] = useState("");
  const [phone, setPhone] = useState(state.userPhone || "");
  const [isAgeConfirmed, setIsAgeConfirmed] = useState(false);
  const [error, setError] = useState("");
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("Please enter your full name.");
      sound.playWrong();
      return;
    }

    const cleanPhone = phone.replace(/\D/g, "");
    if (cleanPhone.length < 10) {
      setError("Please enter a valid 10-digit mobile number.");
      sound.playWrong();
      return;
    }

    if (!isAgeConfirmed) {
      setError("You must confirm you are of legal drinking age (25).");
      sound.playWrong();
      return;
    }

    const chosenCity = city === "Other" ? customCity.trim() || "Nagpur" : city;

    setUserName(name.trim());
    setUserCity(chosenCity);
    setUserPhone(cleanPhone);
    sound.playSuccess();
    navigateTo("screen-otp");
  };

  const fillDemo = () => {
    setName("Aarav Sharma");
    setCity("Nagpur");
    setPhone("9876543210");
    setIsAgeConfirmed(true);
    sound.playClick();
  };

  return (
    <motion.div
      className="min-h-[calc(100vh-6rem)] flex flex-col items-center justify-center pt-16 pb-10 sm:pt-20 px-4 sm:px-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      <motion.div
        className="w-full max-w-xl"
        variants={container}
        initial="hidden"
        animate="show"
      >
        {/* Card */}
        <motion.div
          variants={item}
          className="gold-card p-6 sm:p-8 relative overflow-hidden"
        >
          {/* Subtle gold shimmer line at top */}
          <motion.div
            className="absolute top-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-[#d4af37] to-transparent"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.4, duration: 0.8, ease: "easeOut" }}
          />

          {/* Header */}
          <motion.div
            variants={item}
            className="flex items-center justify-between pb-4 mb-6 border-b border-[#3d261a]"
          >
            <div>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#faf6f0]">
                Enter the World of{" "}
                <span className="gold-shimmer-text">Luxury</span>
              </h2>
              <p className="text-xs text-[#a69383] mt-1 tracking-wide">
                Complete your profile to begin the experience
              </p>
            </div>

            <motion.button
              type="button"
              onClick={fillDemo}
              className="text-xs px-3 py-1.5 rounded-full border border-[#d4af37]/30 bg-[#22160f] text-[#f5d77f] hover:bg-[#2e1e15] hover:border-[#d4af37] transition-all flex items-center gap-1.5 shrink-0"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              title="Prefill sample credentials"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Quick Autofill</span>
            </motion.button>
          </motion.div>

          {/* Animated Error */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0, y: -8 }}
                animate={{ opacity: 1, height: "auto", y: 0 }}
                exit={{ opacity: 0, height: 0, y: -8 }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] as const }}
                className="mb-4 overflow-hidden"
              >
                <div className="p-3 rounded-xl bg-red-950/60 border border-red-500/50 text-xs text-red-200 flex items-center gap-2">
                  <span>⚠️</span>
                  <span>{error}</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Full Name */}
            <motion.div variants={item}>
              <label className="block text-xs font-semibold text-[#e5d8cb] mb-1.5 tracking-wide">
                Full Name
              </label>
              <div className="relative group">
                <User
                  className={`absolute left-3.5 top-3 w-4 h-4 transition-colors duration-300 ${
                    focusedField === "name"
                      ? "text-[#f7e7a9]"
                      : "text-[#d4af37]"
                  }`}
                />
                <motion.input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onFocus={() => setFocusedField("name")}
                  onBlur={() => setFocusedField(null)}
                  placeholder="Enter your name"
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#170f0a]/90 border border-[#d4af37]/40 focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37]/60 text-sm text-[#faf6f0] placeholder-[#6d5746] outline-none transition-all duration-300"
                  whileFocus={{ scale: 1.01 }}
                />
              </div>
            </motion.div>

            {/* City */}
            <motion.div variants={item}>
              <label className="block text-xs font-semibold text-[#e5d8cb] mb-1.5 tracking-wide">
                Your City of Residence
              </label>
              <div className="relative group">
                <MapPin
                  className={`absolute left-3.5 top-3 w-4 h-4 transition-colors duration-300 ${
                    focusedField === "city"
                      ? "text-[#f7e7a9]"
                      : "text-[#d4af37]"
                  }`}
                />
                <motion.input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  onFocus={() => setFocusedField("city")}
                  onBlur={() => setFocusedField(null)}
                  placeholder="Enter your City"
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#170f0a]/90 border border-[#d4af37]/40 focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37]/60 text-sm text-[#faf6f0] placeholder-[#6d5746] outline-none transition-all duration-300"
                  whileFocus={{ scale: 1.01 }}
                />
              </div>
            </motion.div>

            {/* Mobile */}
            <motion.div variants={item}>
              <label className="block text-xs font-semibold text-[#e5d8cb] mb-1.5 tracking-wide">
                Mobile Number
              </label>
              <div className="relative group">
                <div
                  className={`absolute left-3.5 top-2.5 flex items-center gap-1 text-sm font-semibold border-r border-[#3d261a] pr-2 transition-colors duration-300 ${
                    focusedField === "phone"
                      ? "text-[#f7e7a9]"
                      : "text-[#d4af37]"
                  }`}
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>+91</span>
                </div>
                <motion.input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  onFocus={() => setFocusedField("phone")}
                  onBlur={() => setFocusedField(null)}
                  placeholder="98765 43210"
                  maxLength={10}
                  required
                  className="w-full pl-18 pr-4 py-2.5 rounded-xl bg-[#170f0a]/90 border border-[#d4af37]/40 focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37]/60 text-sm text-[#faf6f0] placeholder-[#6d5746] font-mono outline-none transition-all duration-300"
                  whileFocus={{ scale: 1.01 }}
                />
              </div>
            </motion.div>

            {/* Age checkbox */}
            <motion.div variants={item} className="pt-1">
              <label className="flex items-start gap-3 text-sm leading-relaxed text-[#a69383] cursor-pointer group">
                <motion.input
                  type="checkbox"
                  checked={isAgeConfirmed}
                  onChange={(e) => setIsAgeConfirmed(e.target.checked)}
                  className="mt-1 h-4 w-4 shrink-0 rounded border-[#d4af37]/60 text-[#d4af37] focus:ring-[#d4af37] bg-[#170f0a] accent-[#d4af37]"
                  whileTap={{ scale: 0.9 }}
                />
                <span className="group-hover:text-[#cbb9a8] transition-colors">
                  I confirm that I am 25 years of age or older, and agree to
                  receive my luxury personality report & reward notification.
                </span>
              </label>
            </motion.div>

            {/* Submit */}
            <motion.div variants={item} className="pt-2">
              <motion.button
                type="submit"
                className="w-full py-3.5 px-6 btn-gold normal-case tracking-normal text-sm font-bold flex items-center justify-center gap-2.5 cursor-pointer relative overflow-hidden"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <span>Verify & Unlock the Experience</span>
              </motion.button>
            </motion.div>
          </form>
        </motion.div>

        {/* Soft footer hint */}
        <motion.p
          variants={item}
          className="text-center text-[11px] text-[#6d5746] mt-5 tracking-widest uppercase"
        >
          Your details stay private • Luxury experience only
        </motion.p>
      </motion.div>
    </motion.div>
  );
};
