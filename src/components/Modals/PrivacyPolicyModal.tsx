import React, { useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "motion/react";
import { X, ShieldCheck } from "lucide-react";
import { sound } from "../../utils/audio";

interface PrivacyPolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAccept?: () => void;
}

const sections = [
  {
    title: "1. Information We Collect",
    body: [
      "When you play The Indian Edit experience, we collect the details you enter: your name, city and mobile number.",
      "We also collect your gameplay data (scores, completion times and level progress) and any photo or post content you choose to upload or share within the experience.",
      "Basic technical data, such as device type, browser and approximate usage statistics, may be collected automatically to keep the experience running smoothly.",
    ],
  },
  {
    title: "2. How We Use Your Information",
    body: [
      "To verify your mobile number with a one-time password (OTP) and let you take part in the experience.",
      "To calculate scores, show leaderboards, and select and notify winners or reward recipients.",
      "To improve the game, prevent misuse or fraud, and respond to your queries.",
      "To send you updates about the promotion or brand communications, only where you have agreed to receive them.",
    ],
  },
  {
    title: "3. Sharing of Information",
    body: [
      "We do not sell your personal information.",
      "We may share it only with trusted service providers who help us run the experience (for example SMS/OTP, hosting and analytics providers), and only as needed for those purposes.",
      "We may also disclose information when required by law or to protect our rights and the safety of users.",
    ],
  },
  {
    title: "4. Data Storage and Security",
    body: [
      "We take reasonable technical and organisational steps to protect your information from unauthorised access, loss or misuse.",
      "No online system is completely secure, so we cannot guarantee absolute security.",
    ],
  },
  {
    title: "5. Data Retention",
    body: [
      "We keep your information only for as long as needed for the purposes described above, including the duration of the campaign and any legal or audit requirements. After that it is deleted or anonymised.",
    ],
  },
  {
    title: "6. Legal Drinking Age",
    body: [
      "This experience is intended only for people who have reached the legal drinking age in their state or region of residence. By continuing, you confirm that you meet this requirement.",
    ],
  },
  {
    title: "7. Your Rights",
    body: [
      "You may request access to, correction of, or deletion of your personal information, and you may withdraw your consent at any time, by contacting us using the details below.",
    ],
  },
  {
    title: "8. Changes to This Policy",
    body: [
      "We may update this Privacy Policy from time to time. The latest version will always be available within the experience.",
    ],
  },
  {
    title: "9. Contact Us",
    body: [
      "For any privacy-related questions or requests, please write to us at [your-email@example.com].",
    ],
  },
];

export const PrivacyPolicyModal: React.FC<PrivacyPolicyModalProps> = ({
  isOpen,
  onClose,
  onAccept,
}) => {
  // Close on Escape + lock background scroll while open
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [isOpen, onClose]);

  const handleClose = () => {
    sound.playClick();
    onClose();
  };

  const handleAccept = () => {
    sound.playClick();
    onAccept?.();
    onClose();
  };

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          onClick={handleClose}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="privacy-policy-title"
            className="gold-card relative w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden"
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.97 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] as const }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between gap-4 px-5 sm:px-6 py-4 border-b border-[#3d261a]">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#1a0c06] border border-[#d4af37]/40 flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5 text-[#d4af37]" />
                </div>
                <h2
                  id="privacy-policy-title"
                  className="font-serif text-xl sm:text-2xl font-bold text-[#faf6f0]"
                >
                  Privacy Policy
                </h2>
              </div>
              <button
                type="button"
                onClick={handleClose}
                aria-label="Close privacy policy"
                className="p-2 rounded-lg text-[#f7e7a9] hover:bg-[#d4af37]/10 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto px-5 sm:px-6 py-5 space-y-5 text-left">
              <p className="text-xs text-[#ab9580]">
                Last updated: September 2026
              </p>
              <p className="text-sm text-[#e5d8cb] leading-relaxed">
                Your privacy matters to us. This policy explains what
                information we collect when you take part in The Indian Edit
                experience, how we use it, and the choices you have.
              </p>

              {sections.map((s) => (
                <section key={s.title}>
                  <h3 className="font-serif text-base font-bold text-[#f7e7a9] mb-2">
                    {s.title}
                  </h3>
                  <div className="space-y-2">
                    {s.body.map((p, i) => (
                      <p
                        key={i}
                        className="text-sm text-[#ab9580] leading-relaxed"
                      >
                        {p}
                      </p>
                    ))}
                  </div>
                </section>
              ))}
            </div>

            {/* Footer */}
            <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 px-5 sm:px-6 py-4 border-t border-[#3d261a]">
              <button
                type="button"
                onClick={handleClose}
                className="px-5 py-2.5 rounded-xl border border-[#d4af37]/40 text-sm text-[#f7e7a9] hover:bg-[#d4af37]/10 transition-colors cursor-pointer"
              >
                Close
              </button>
              {onAccept && (
                <button
                  type="button"
                  onClick={handleAccept}
                  className="px-6 py-2.5 btn-gold normal-case tracking-normal text-sm font-bold cursor-pointer"
                >
                  I Agree
                </button>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
};
