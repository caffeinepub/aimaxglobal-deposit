import { Toaster } from "@/components/ui/sonner";
import {
  Activity,
  Bot,
  Check,
  Copy,
  ExternalLink,
  Send,
  Shield,
  Star,
  TrendingDown,
  TrendingUp,
  Zap,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

// ─── Types ────────────────────────────────────────────────────────────────────
interface DepositChain {
  id: string;
  name: string;
  symbol: string;
  address: string;
  network: string;
  icon: string;
  accentClass: string;
  borderClass: string;
  glowClass: string;
  bgGradient: string;
  qrColor: string;
  qrBg: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────
const TELEGRAM_BOTS = [
  {
    label: "AimaxGlobalBot",
    url: "https://t.me/AimaxGlobalBot/app?startapp",
    handle: "@AimaxGlobalBot",
  },
  {
    label: "AimxcGlobalBot",
    url: "https://t.me/AimxcGlobalBot/app?startapp",
    handle: "@AimxcGlobalBot",
  },
];

const CHAINS: DepositChain[] = [
  {
    id: "sol",
    name: "Solana",
    symbol: "SOL",
    address: "ASEz7j2FYFZntu2CeHnKs6DiMvPREeBxV6zsPSddbUqm",
    network: "Solana Mainnet",
    icon: "◎",
    accentClass: "text-sol",
    borderClass: "border-sol",
    glowClass: "glow-sol",
    bgGradient:
      "linear-gradient(135deg, oklch(0.68 0.2 195 / 0.07) 0%, oklch(0.65 0.22 290 / 0.05) 100%)",
    qrColor: "#14F195",
    qrBg: "#0d1117",
  },
  {
    id: "bnb",
    name: "BNB Smart Chain",
    symbol: "BNB",
    address: "0xa765a41Cfbb5c9062D19d0Ab1F0f9f81B81A50D5",
    network: "BNB Smart Chain",
    icon: "⬡",
    accentClass: "text-bnb",
    borderClass: "border-bnb",
    glowClass: "glow-bnb",
    bgGradient:
      "linear-gradient(135deg, oklch(0.88 0.18 95 / 0.07) 0%, oklch(0.75 0.165 72 / 0.05) 100%)",
    qrColor: "#F0B90B",
    qrBg: "#0d1117",
  },
];

// ─── QR Code Placeholder ──────────────────────────────────────────────────────
// Generates a deterministic visual pattern from address bytes as a QR stand-in
function AddressQR({
  address,
  fgColor,
  bgColor,
  size = 180,
}: {
  address: string;
  fgColor: string;
  bgColor: string;
  size?: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const GRID = 21;
    const cell = size / GRID;

    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, size, size);

    // Deterministic pattern from address string
    const bytes = Array.from(address).map((c) => c.charCodeAt(0));
    const seed = (i: number) => {
      let v = bytes[i % bytes.length] ^ (i * 37);
      v = (v ^ (v >> 4)) * 0x45d9f3b;
      return ((v ^ (v >> 15)) & 0xff) > 100;
    };

    // Finder patterns (top-left, top-right, bottom-left)
    const drawFinder = (ox: number, oy: number) => {
      for (let r = 0; r < 7; r++) {
        for (let c = 0; c < 7; c++) {
          const inOuter = r === 0 || r === 6 || c === 0 || c === 6;
          const inInner = r >= 2 && r <= 4 && c >= 2 && c <= 4;
          if (inOuter || inInner) {
            ctx.fillStyle = fgColor;
            ctx.fillRect((ox + c) * cell, (oy + r) * cell, cell, cell);
          } else {
            ctx.fillStyle = bgColor;
            ctx.fillRect((ox + c) * cell, (oy + r) * cell, cell, cell);
          }
        }
      }
    };
    drawFinder(0, 0);
    drawFinder(GRID - 7, 0);
    drawFinder(0, GRID - 7);

    // Data modules (skip finder areas)
    for (let r = 0; r < GRID; r++) {
      for (let c = 0; c < GRID; c++) {
        const inTL = r < 8 && c < 8;
        const inTR = r < 8 && c >= GRID - 8;
        const inBL = r >= GRID - 8 && c < 8;
        if (inTL || inTR || inBL) continue;
        if (seed(r * GRID + c)) {
          ctx.fillStyle = fgColor;
          ctx.fillRect(c * cell, r * cell, cell - 0.5, cell - 0.5);
        }
      }
    }
  }, [address, fgColor, bgColor, size]);

  return (
    <canvas
      ref={canvasRef}
      width={size}
      height={size}
      className="block"
      style={{ width: size, height: size }}
    />
  );
}

// ─── Copy Button ──────────────────────────────────────────────────────────────
function CopyButton({
  text,
  label,
  accentClass,
}: {
  text: string;
  label: string;
  accentClass: string;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success(`${label} address copied!`, {
        description: `${text.slice(0, 12)}...${text.slice(-8)}`,
        duration: 3000,
      });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy. Please copy manually.");
    }
  };

  return (
    <motion.button
      onClick={handleCopy}
      whileTap={{ scale: 0.92 }}
      whileHover={{ scale: 1.05 }}
      className={`
        flex items-center gap-2 px-4 py-2.5 rounded-lg
        border text-sm font-medium transition-colors duration-200
        ${copied ? "border-emerald-500/40 text-emerald-400 bg-emerald-500/10" : `${accentClass} border-current/20 bg-current/5 hover:bg-current/10`}
      `}
      aria-label={`Copy ${label} address`}
    >
      <AnimatePresence mode="wait" initial={false}>
        {copied ? (
          <motion.span
            key="check"
            initial={{ scale: 0, rotate: -10 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0 }}
            transition={{ duration: 0.18 }}
          >
            <Check className="w-4 h-4 text-emerald-400" />
          </motion.span>
        ) : (
          <motion.span
            key="copy"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            transition={{ duration: 0.18 }}
          >
            <Copy className="w-4 h-4" />
          </motion.span>
        )}
      </AnimatePresence>
      {copied ? "Copied!" : "Copy Address"}
    </motion.button>
  );
}

// ─── Deposit Card ─────────────────────────────────────────────────────────────
function DepositCard({
  chain,
  index,
}: {
  chain: DepositChain;
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.6,
        delay: index * 0.15,
        ease: [0.22, 1, 0.36, 1],
      }}
      className={`
        relative rounded-2xl border overflow-hidden
        ${chain.borderClass}
        ${chain.glowClass}
      `}
      style={{ background: chain.bgGradient }}
    >
      {/* Subtle grid overlay */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(oklch(0.9 0 0) 1px, transparent 1px), linear-gradient(90deg, oklch(0.9 0 0) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />

      <div className="relative p-6 sm:p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div
              className={`
                w-12 h-12 rounded-xl flex items-center justify-center
                text-2xl border ${chain.borderClass}
              `}
              style={{ background: chain.bgGradient }}
            >
              {chain.icon}
            </div>
            <div>
              <h2
                className={`font-display text-xl font-bold ${chain.accentClass}`}
              >
                {chain.symbol}
              </h2>
              <p className="text-muted-foreground text-xs">{chain.network}</p>
            </div>
          </div>

          <div
            className={`
              flex items-center gap-1.5 px-3 py-1.5 rounded-full
              border text-xs font-medium ${chain.borderClass} ${chain.accentClass}
            `}
            style={{ background: "oklch(0.1 0.005 260 / 0.6)" }}
          >
            <Shield className="w-3 h-3" />
            Verified
          </div>
        </div>

        {/* QR Code + Address */}
        <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-start">
          {/* QR Code */}
          <div
            className={`
              flex-shrink-0 p-3 rounded-xl border ${chain.borderClass}
              relative overflow-hidden
            `}
            style={{ background: chain.qrBg }}
          >
            <AddressQR
              address={chain.address}
              fgColor={chain.qrColor}
              bgColor={chain.qrBg}
              size={160}
            />
          </div>

          {/* Address info */}
          <div className="flex-1 w-full space-y-4">
            <div>
              <p className="text-muted-foreground text-xs uppercase tracking-widest mb-2 font-medium">
                Deposit Address
              </p>
              <div
                className={`
                  relative p-3 rounded-lg border ${chain.borderClass}
                  group cursor-text
                `}
                style={{ background: "oklch(0.1 0.005 260 / 0.5)" }}
              >
                <p className="font-mono text-xs sm:text-sm break-all leading-relaxed text-foreground/90 select-all">
                  {chain.address}
                </p>
              </div>
            </div>

            <CopyButton
              text={chain.address}
              label={chain.symbol}
              accentClass={chain.accentClass}
            />

            <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-500/5 border border-amber-500/20">
              <Zap className="w-3.5 h-3.5 text-amber-400 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-amber-200/70 leading-relaxed">
                Only send{" "}
                <strong className="text-amber-300">{chain.symbol}</strong> on{" "}
                <strong className="text-amber-300">{chain.name}</strong>.
                Sending other assets may result in permanent loss.
              </p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Telegram Bot Card ────────────────────────────────────────────────────────
function TelegramBotLinks() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
      className="rounded-2xl border overflow-hidden"
      style={{
        background:
          "linear-gradient(135deg, oklch(0.2 0.04 240 / 0.5) 0%, oklch(0.14 0.02 250 / 0.5) 100%)",
        borderColor: "oklch(0.55 0.15 230 / 0.35)",
        boxShadow:
          "0 0 30px oklch(0.55 0.15 230 / 0.12), 0 0 60px oklch(0.55 0.15 230 / 0.05)",
      }}
    >
      <div className="p-5 sm:p-6">
        <div className="flex items-center gap-3 mb-5">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
            style={{
              background:
                "linear-gradient(135deg, oklch(0.55 0.2 230) 0%, oklch(0.45 0.18 220) 100%)",
            }}
          >
            <Send className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3
              className="font-display font-bold text-base"
              style={{ color: "oklch(0.85 0.12 230)" }}
            >
              Official Telegram Bots
            </h3>
            <p className="text-xs text-muted-foreground">
              Access your account via Telegram
            </p>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-3">
          {TELEGRAM_BOTS.map((bot, i) => (
            <motion.a
              key={bot.url}
              href={bot.url}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 + i * 0.1 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              className="flex items-center justify-between p-4 rounded-xl border group transition-colors duration-200"
              style={{
                background: "oklch(0.12 0.01 250 / 0.6)",
                borderColor: "oklch(0.55 0.15 230 / 0.25)",
              }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: "oklch(0.4 0.15 230 / 0.3)" }}
                >
                  <Send
                    className="w-4 h-4"
                    style={{ color: "oklch(0.75 0.18 230)" }}
                  />
                </div>
                <div>
                  <p className="font-medium text-sm text-foreground">
                    {bot.label}
                  </p>
                  <p
                    className="text-xs"
                    style={{ color: "oklch(0.65 0.12 230)" }}
                  >
                    {bot.handle}
                  </p>
                </div>
              </div>
              <ExternalLink
                className="w-4 h-4 opacity-40 group-hover:opacity-80 transition-opacity flex-shrink-0"
                style={{ color: "oklch(0.75 0.18 230)" }}
              />
            </motion.a>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

// ─── AI Trading Bot Data ──────────────────────────────────────────────────────
const BOT_STATS = [
  {
    label: "Win Rate",
    value: "87.4%",
    icon: TrendingUp,
    color: "text-emerald-400",
    bg: "oklch(0.35 0.12 145 / 0.15)",
    border: "oklch(0.5 0.15 145 / 0.25)",
  },
  {
    label: "Total Trades",
    value: "2,847",
    icon: Activity,
    color: "text-gold",
    bg: "oklch(0.35 0.1 72 / 0.15)",
    border: "oklch(0.55 0.13 72 / 0.25)",
  },
  {
    label: "Daily Profit",
    value: "+3.2%",
    icon: TrendingUp,
    color: "text-emerald-400",
    bg: "oklch(0.35 0.12 145 / 0.15)",
    border: "oklch(0.5 0.15 145 / 0.25)",
  },
  {
    label: "Monthly Return",
    value: "+41.8%",
    icon: TrendingUp,
    color: "text-gold",
    bg: "oklch(0.35 0.1 72 / 0.15)",
    border: "oklch(0.55 0.13 72 / 0.25)",
  },
];

const SIGNALS = [
  {
    pair: "BTC/USDT",
    type: "BUY" as const,
    price: "$67,234.50",
    time: "2 min ago",
  },
  {
    pair: "ETH/USDT",
    type: "SELL" as const,
    price: "$3,412.80",
    time: "5 min ago",
  },
  {
    pair: "SOL/USDT",
    type: "BUY" as const,
    price: "$182.45",
    time: "9 min ago",
  },
  {
    pair: "BNB/USDT",
    type: "BUY" as const,
    price: "$589.12",
    time: "14 min ago",
  },
  {
    pair: "XRP/USDT",
    type: "SELL" as const,
    price: "$0.6234",
    time: "21 min ago",
  },
  {
    pair: "AVAX/USDT",
    type: "BUY" as const,
    price: "$38.76",
    time: "28 min ago",
  },
];

const BOT_FEATURES = [
  { label: "Auto Trade", icon: Zap },
  { label: "Risk Management", icon: Shield },
  { label: "24/7 Active", icon: Activity },
  { label: "Multi-Chain", icon: Bot },
];

// ─── AI Trading Bot Component ─────────────────────────────────────────────────
function AITradingBot() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="rounded-2xl border overflow-hidden"
      style={{
        background:
          "linear-gradient(135deg, oklch(0.15 0.015 160 / 0.5) 0%, oklch(0.12 0.008 260 / 0.8) 50%, oklch(0.14 0.01 72 / 0.3) 100%)",
        borderColor: "oklch(0.45 0.15 145 / 0.3)",
        boxShadow:
          "0 0 30px oklch(0.45 0.2 145 / 0.1), 0 0 60px oklch(0.45 0.2 145 / 0.04)",
      }}
    >
      {/* Grid overlay */}
      <div
        className="absolute inset-0 opacity-[0.025] pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(oklch(0.9 0 0) 1px, transparent 1px), linear-gradient(90deg, oklch(0.9 0 0) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />

      <div className="relative p-5 sm:p-7">
        {/* ── Header ── */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.45 0.2 145) 0%, oklch(0.38 0.17 160) 100%)",
                boxShadow: "0 0 20px oklch(0.45 0.2 145 / 0.35)",
              }}
            >
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2
                className="font-display text-xl font-bold"
                style={{ color: "oklch(0.88 0.12 145)" }}
              >
                AI Trading Bot
              </h2>
              <p className="text-xs text-muted-foreground">
                Powered by AimaxGlobal Engine
              </p>
            </div>
          </div>

          {/* Online pill */}
          <div
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold flex-shrink-0"
            style={{
              background: "oklch(0.2 0.08 145 / 0.4)",
              borderColor: "oklch(0.5 0.18 145 / 0.4)",
              color: "oklch(0.75 0.18 145)",
            }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full animate-pulse"
              style={{ background: "oklch(0.7 0.22 145)" }}
            />
            Bot Online
          </div>
        </div>

        {/* ── Stats Grid ── */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          {BOT_STATS.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6 + i * 0.08, ease: [0.22, 1, 0.36, 1] }}
                className="rounded-xl border p-3.5"
                style={{ background: stat.bg, borderColor: stat.border }}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs text-muted-foreground font-medium">
                    {stat.label}
                  </span>
                  <Icon className={`w-3.5 h-3.5 ${stat.color} opacity-70`} />
                </div>
                <p className={`font-display text-xl font-bold ${stat.color}`}>
                  {stat.value}
                </p>
              </motion.div>
            );
          })}
        </div>

        {/* ── Recent Signals ── */}
        <div className="mb-5">
          <div className="flex items-center gap-2 mb-3">
            <Activity
              className="w-3.5 h-3.5"
              style={{ color: "oklch(0.65 0.15 145)" }}
            />
            <p className="text-xs uppercase tracking-widest font-semibold text-muted-foreground">
              Recent Signals
            </p>
          </div>

          <div
            className="rounded-xl border overflow-hidden"
            style={{
              borderColor: "oklch(0.3 0.01 260)",
              background: "oklch(0.1 0.005 260 / 0.6)",
            }}
          >
            <div
              className="max-h-[220px] overflow-y-auto divide-y"
              style={{ borderColor: "oklch(0.2 0.008 260)" }}
            >
              {SIGNALS.map((signal, i) => (
                <motion.div
                  key={`${signal.pair}-${i}`}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.75 + i * 0.06 }}
                  className="flex items-center justify-between px-4 py-2.5"
                  style={{ borderColor: "oklch(0.2 0.008 260)" }}
                >
                  <div className="flex items-center gap-2.5">
                    {/* Signal direction icon */}
                    {signal.type === "BUY" ? (
                      <TrendingUp
                        className="w-3.5 h-3.5 flex-shrink-0"
                        style={{ color: "oklch(0.65 0.18 145)" }}
                      />
                    ) : (
                      <TrendingDown
                        className="w-3.5 h-3.5 flex-shrink-0"
                        style={{ color: "oklch(0.6 0.22 25)" }}
                      />
                    )}
                    <span className="font-mono text-sm font-semibold text-foreground/90">
                      {signal.pair}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs text-muted-foreground">
                      {signal.price}
                    </span>

                    {/* BUY / SELL badge */}
                    <span
                      className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                      style={
                        signal.type === "BUY"
                          ? {
                              background: "oklch(0.35 0.15 145 / 0.25)",
                              color: "oklch(0.7 0.2 145)",
                              border: "1px solid oklch(0.5 0.18 145 / 0.3)",
                            }
                          : {
                              background: "oklch(0.35 0.18 25 / 0.25)",
                              color: "oklch(0.65 0.22 25)",
                              border: "1px solid oklch(0.55 0.2 25 / 0.3)",
                            }
                      }
                    >
                      {signal.type}
                    </span>

                    <span className="text-xs text-muted-foreground/60 w-16 text-right">
                      {signal.time}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Feature Badges ── */}
        <div className="flex flex-wrap gap-2 mb-5">
          {BOT_FEATURES.map((feat, i) => {
            const Icon = feat.icon;
            return (
              <motion.div
                key={feat.label}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1 + i * 0.07 }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium"
                style={{
                  background: "oklch(0.18 0.01 260 / 0.6)",
                  borderColor: "oklch(0.45 0.12 145 / 0.3)",
                  color: "oklch(0.72 0.14 145)",
                }}
              >
                <Icon className="w-3 h-3" />
                {feat.label}
              </motion.div>
            );
          })}
        </div>

        {/* ── Disclaimer ── */}
        <p className="text-[11px] text-muted-foreground/50 leading-relaxed text-center">
          Simulated performance data. Past results do not guarantee future
          returns.
        </p>
      </div>
    </motion.div>
  );
}

// ─── Investment Plans ─────────────────────────────────────────────────────────
const INVESTMENT_PLANS = [
  {
    label: "Starter",
    amount: "$10",
    return: "30%",
    returnLabel: "30% Return",
    popular: false,
    color: "oklch(0.65 0.18 230)",
    bg: "oklch(0.18 0.04 230 / 0.4)",
    border: "oklch(0.45 0.15 230 / 0.35)",
    glow: "oklch(0.55 0.18 230 / 0.1)",
    icon: "◈",
  },
  {
    label: "Growth",
    amount: "$30",
    return: "45%",
    returnLabel: "45% Return",
    popular: true,
    color: "oklch(0.88 0.18 95)",
    bg: "oklch(0.2 0.06 72 / 0.4)",
    border: "oklch(0.6 0.18 72 / 0.4)",
    glow: "oklch(0.65 0.18 72 / 0.12)",
    icon: "◆",
  },
  {
    label: "Elite",
    amount: "$100",
    return: "90%",
    returnLabel: "90% Return",
    popular: false,
    color: "oklch(0.7 0.22 145)",
    bg: "oklch(0.18 0.05 145 / 0.4)",
    border: "oklch(0.5 0.18 145 / 0.35)",
    glow: "oklch(0.55 0.2 145 / 0.1)",
    icon: "◉",
  },
];

function InvestmentPlans() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className="rounded-2xl border overflow-hidden"
      style={{
        background:
          "linear-gradient(135deg, oklch(0.16 0.015 260 / 0.7) 0%, oklch(0.12 0.008 260 / 0.9) 100%)",
        borderColor: "oklch(0.4 0.12 72 / 0.3)",
        boxShadow:
          "0 0 30px oklch(0.65 0.18 72 / 0.08), 0 0 60px oklch(0.65 0.18 72 / 0.04)",
      }}
    >
      <div className="p-5 sm:p-7">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{
              background:
                "linear-gradient(135deg, oklch(0.75 0.165 72) 0%, oklch(0.65 0.18 85) 100%)",
              boxShadow: "0 0 20px oklch(0.75 0.165 72 / 0.35)",
            }}
          >
            <TrendingUp className="w-6 h-6 text-black" />
          </div>
          <div>
            <h2
              className="font-display text-xl font-bold"
              style={{ color: "oklch(0.88 0.18 95)" }}
            >
              Investment Plans
            </h2>
            <p className="text-xs text-muted-foreground">
              Invest & earn guaranteed returns
            </p>
          </div>
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {INVESTMENT_PLANS.map((plan, i) => (
            <motion.div
              key={plan.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.55 + i * 0.1, ease: [0.22, 1, 0.36, 1] }}
              className="relative rounded-xl border p-5 flex flex-col items-center text-center gap-3"
              style={{
                background: plan.bg,
                borderColor: plan.border,
                boxShadow: `0 0 24px ${plan.glow}`,
              }}
            >
              {/* Popular badge */}
              {plan.popular && (
                <div
                  className="absolute -top-3 left-1/2 -translate-x-1/2 flex items-center gap-1 px-3 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border"
                  style={{
                    background: "oklch(0.75 0.165 72)",
                    borderColor: "oklch(0.85 0.18 95 / 0.5)",
                    color: "oklch(0.1 0.01 260)",
                  }}
                >
                  <Star className="w-2.5 h-2.5" fill="currentColor" />
                  Most Popular
                </div>
              )}

              {/* Icon */}
              <span className="text-3xl mt-1" style={{ color: plan.color }}>
                {plan.icon}
              </span>

              {/* Label */}
              <p className="text-xs uppercase tracking-widest font-semibold text-muted-foreground">
                {plan.label}
              </p>

              {/* Amount */}
              <div>
                <p
                  className="font-display text-4xl font-extrabold leading-none"
                  style={{ color: plan.color }}
                >
                  {plan.amount}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Deposit Amount
                </p>
              </div>

              {/* Return */}
              <div
                className="w-full rounded-lg py-2 px-3 border"
                style={{
                  background: "oklch(0.1 0.005 260 / 0.6)",
                  borderColor: plan.border,
                }}
              >
                <p
                  className="font-display text-2xl font-bold"
                  style={{ color: plan.color }}
                >
                  {plan.return}
                </p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide font-medium">
                  Guaranteed Return
                </p>
              </div>

              {/* Invest button */}
              <motion.a
                href={TELEGRAM_BOTS[0].url}
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                className="w-full mt-1 py-2.5 rounded-lg text-sm font-bold text-center border transition-all duration-200"
                style={{
                  background: `linear-gradient(135deg, ${plan.color} 0%, oklch(from ${plan.color} calc(l - 0.08) c h) 100%)`,
                  borderColor: plan.border,
                  color: "oklch(0.08 0.01 260)",
                }}
              >
                Invest Now
              </motion.a>
            </motion.div>
          ))}
        </div>

        {/* Note */}
        <p className="text-[11px] text-muted-foreground/50 text-center mt-5 leading-relaxed">
          Returns are credited to your account. Deposit via SOL or BNB address
          above.
        </p>
      </div>
    </motion.div>
  );
}

// ─── Background ───────────────────────────────────────────────────────────────
function BackgroundAtmosphere() {
  return (
    <div
      className="fixed inset-0 pointer-events-none overflow-hidden"
      style={{ zIndex: -1 }}
    >
      {/* Deep base */}
      <div
        className="absolute inset-0"
        style={{ background: "oklch(0.08 0.006 260)" }}
      />
      {/* Gold orb top-right */}
      <div
        className="absolute -top-32 -right-32 w-[600px] h-[600px] rounded-full blur-[120px]"
        style={{ background: "oklch(0.75 0.165 72 / 0.06)" }}
      />
      {/* Teal orb bottom-left */}
      <div
        className="absolute -bottom-32 -left-32 w-[500px] h-[500px] rounded-full blur-[100px]"
        style={{ background: "oklch(0.68 0.2 195 / 0.07)" }}
      />
      {/* Yellow orb center */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] rounded-full blur-[150px]"
        style={{ background: "oklch(0.88 0.18 95 / 0.025)" }}
      />
    </div>
  );
}

// ─── App ──────────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <div className="min-h-screen relative">
      <BackgroundAtmosphere />
      <Toaster
        theme="dark"
        toastOptions={{
          classNames: {
            toast:
              "!bg-[oklch(0.14_0.008_260)] !border-[oklch(0.25_0.01_260)] !text-foreground",
            title: "!font-semibold",
            description: "!text-muted-foreground !font-mono !text-xs",
          },
        }}
      />

      <div className="relative z-10 max-w-2xl mx-auto px-4 py-10 pb-20">
        {/* ── Header ── */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-10"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <img
              src="/assets/generated/aimaxglobal-logo-transparent.dim_120x120.png"
              alt="AimaxGlobal"
              className="w-14 h-14 object-contain"
            />
            <div className="text-left">
              <h1 className="font-display text-2xl sm:text-3xl font-bold text-gold leading-none">
                AimaxGlobal
              </h1>
              <p className="text-xs text-muted-foreground tracking-widest uppercase mt-0.5">
                Crypto Deposit Portal
              </p>
            </div>
          </div>

          <div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border text-xs font-medium"
            style={{
              background: "oklch(0.12 0.01 260 / 0.8)",
              borderColor: "oklch(0.75 0.165 72 / 0.25)",
              color: "oklch(0.75 0.165 72)",
            }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Secure · Verified Addresses
          </div>
        </motion.header>

        {/* ── Telegram Bots ── */}
        <div className="mb-6">
          <TelegramBotLinks />
        </div>

        {/* ── Instructions ── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mb-6 px-1"
        >
          <p className="text-center text-sm text-muted-foreground">
            Send your deposit to the address below. Scan the QR code or copy the
            address directly.
          </p>
        </motion.div>

        {/* ── Deposit Cards ── */}
        <div className="space-y-5">
          {CHAINS.map((chain, i) => (
            <DepositCard key={chain.id} chain={chain} index={i} />
          ))}
        </div>

        {/* ── Investment Plans ── */}
        <div className="mt-6">
          <InvestmentPlans />
        </div>

        {/* ── AI Trading Bot ── */}
        <div className="mt-6 relative">
          <AITradingBot />
        </div>

        {/* ── Security Note ── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="mt-8 p-4 rounded-xl border text-center"
          style={{
            background: "oklch(0.12 0.01 260 / 0.4)",
            borderColor: "oklch(0.25 0.01 260)",
          }}
        >
          <div className="flex items-center justify-center gap-2 mb-1">
            <Shield className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wide">
              Security Notice
            </span>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Always verify the deposit address before sending. AimaxGlobal will
            never ask for your private keys or seed phrase. These are the only
            official deposit addresses.
          </p>
        </motion.div>

        {/* ── Footer ── */}
        <footer className="mt-10 text-center">
          <p className="text-xs text-muted-foreground/50">
            © {new Date().getFullYear()}. Built with{" "}
            <span className="text-red-400/70">♥</span> using{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-muted-foreground transition-colors"
            >
              caffeine.ai
            </a>
          </p>
        </footer>
      </div>
    </div>
  );
}
