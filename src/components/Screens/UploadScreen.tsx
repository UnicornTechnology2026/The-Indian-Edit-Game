import React, { useState } from "react";
import { useGame } from "../../context/GameContext";
import {
  UploadCloud,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Image as ImageIcon,
  FileText,
} from "lucide-react";
import { sound } from "../../utils/audio";

export const UploadScreen: React.FC = () => {
  const { state, setScreenshotUploaded, navigateTo } = useGame();

  const [previewUrl, setPreviewUrl] = useState<string | null>(
    state.uploadedScreenshotUrl,
  );
  const [verifying, setVerifying] = useState(false);
  const [verified, setVerified] = useState(state.screenshotUploaded);
  const [dragOver, setDragOver] = useState(false);

  const handleFile = (file: File) => {
    if (!file.type.startsWith("image/")) return;
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    processVerification(url);
  };

  const processVerification = (url: string) => {
    sound.playClick();
    setVerifying(true);
    setTimeout(() => {
      setVerifying(false);
      setVerified(true);
      setScreenshotUploaded(url);
      sound.playSuccess();
    }, 1500);
  };

  const handleUseDemoProof = () => {
    const demoUrl = "/assets/indian-edit-bottle.svg";
    setPreviewUrl(demoUrl);
    processVerification(demoUrl);
  };

  return (
    <div className="max-w-xl mx-auto py-8 px-4 sm:px-6 animate-fade-in">
      <div className="gold-card p-6 sm:p-8 text-center">
        <div className="w-12 h-12 rounded-full border border-[#d4af37]/60 bg-[#2e1e15] flex items-center justify-center mx-auto mb-3 shadow">
          <UploadCloud className="w-6 h-6 text-[#d4af37]" />
        </div>

        <span className="text-xs font-bold tracking-widest text-[#d4af37] uppercase">
          Privilege Validation
        </span>
        <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#faf6f0] mt-1">
          Share Proof Verification
        </h2>
        <p className="text-xs text-[#a69383] mt-2 max-w-sm mx-auto">
          Upload a screenshot of your Instagram story or post tagging{" "}
          <strong>@TheIndianEdit</strong> to unlock the royal scratch card.
        </p>

        {/* Drag & Drop Upload Zone */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            if (e.dataTransfer.files && e.dataTransfer.files[0]) {
              handleFile(e.dataTransfer.files[0]);
            }
          }}
          className={`mt-6 p-6 rounded-2xl border-2 border-dashed transition-all ${
            dragOver
              ? "border-[#d4af37] bg-[#2e1e15]"
              : verified
                ? "border-green-500/60 bg-green-950/20"
                : "border-[#d4af37]/40 bg-[#170f0a]/60 hover:border-[#d4af37]"
          }`}
        >
          {previewUrl ? (
            <div className="flex flex-col items-center">
              <div className="w-32 h-32 rounded-xl overflow-hidden border border-[#d4af37]/40 mb-3 bg-[#170f0a] shadow">
                <img
                  src={previewUrl}
                  alt="Uploaded proof"
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="text-xs text-green-400 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" />
                <span>Screenshot Attached</span>
              </span>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <ImageIcon className="w-8 h-8 text-[#d4af37] mb-2 opacity-80" />
              <p className="text-xs font-semibold text-[#faf6f0]">
                Drag and drop your screenshot here
              </p>
              <p className="text-[11px] text-[#a69383] mt-1">
                or click below to choose a file from your device
              </p>

              <label className="mt-4 px-4 py-2 rounded-full border border-[#d4af37]/50 bg-[#22160f] text-xs font-bold text-[#f5d77f] hover:bg-[#2e1e15] transition-all cursor-pointer">
                <span>Browse Files</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleFile(e.target.files[0]);
                    }
                  }}
                  className="hidden"
                />
              </label>
            </div>
          )}
        </div>

        {/* Verifying Spinner or Verified Badge */}
        {verifying && (
          <div className="mt-4 p-3 rounded-xl bg-[#22160f] border border-[#d4af37]/40 text-xs text-[#f5d77f] flex items-center justify-center gap-2">
            <div className="w-4 h-4 rounded-full border-2 border-[#d4af37] border-t-transparent animate-spin" />
            <span>Verifying social tag with Zero Mile server...</span>
          </div>
        )}

        {verified && (
          <div className="mt-4 p-4 rounded-xl bg-linear-to-r from-green-950/40 to-[#22160f] border border-green-500/60 text-center space-y-2 animate-fade-in">
            <div className="text-xs font-bold text-green-400 flex items-center justify-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              <span>Share Verified Successfully!</span>
            </div>
            <p className="text-[11px] text-[#warm-beige]">
              Your VIP privilege code is authenticated. The Gold Scratch Card is
              now ready to reveal.
            </p>

            <button
              onClick={() => {
                sound.playSuccess();
                navigateTo("screen-scratch");
              }}
              className="w-full py-3.5 btn-gold text-xs font-bold flex items-center justify-center gap-2 group cursor-pointer shadow-xl"
            >
              <span>Reveal Gold Foil Scratch Card</span>
            </button>
          </div>
        )}

        {/* Quick Demo Verification Button */}
        {!verified && (
          <div className="mt-4">
            <button
              onClick={handleUseDemoProof}
              className="text-xs text-[#f5d77f] hover:underline flex items-center justify-center gap-1 mx-auto cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Quick Verify with Demo Share Proof</span>
            </button>
          </div>
        )}

        <div className="mt-6 pt-4 border-t border-[#3d261a] text-[11px] text-[#8c7766] flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-[#d4af37]" />
          <span>
            Official verification powered by The Indian Edit Brand Protocol
          </span>
        </div>
      </div>
    </div>
  );
};
