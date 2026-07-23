"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  Bot,
  Ear,
  EarOff,
  Loader2,
  Mic,
  MicOff,
  Send,
  Sparkles,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";

type Msg = { role: "user" | "assistant"; content: string; leads?: any[] };
type Pending = { name: string; args: any } | null;

const SUGGESTIONS = [
  "What's my portal overview?",
  "How many clients do I have?",
  "Open my clients page",
  "Show me my hot leads",
  "Find dental clinics in Manchester",
  "Draft outreach for Old Builders Ltd",
];

const WAKE_RE = /\bshadow\b/i;
const WAKE_PREF_KEY = "shadow_wake_enabled";
const ARM_WINDOW_MS = 8000;

/** Best available "Indian man" voice for spoken replies. */
function pickVoice(voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | null {
  if (!voices.length) return null;
  const byName = (re: RegExp) => voices.find((v) => re.test(v.name));
  return (
    byName(/rishi/i) || // macOS en-IN male
    voices.find((v) => v.lang === "en-IN" && /\b(male|rishi|prabhat|hemant|ravi)\b/i.test(v.name)) ||
    voices.find((v) => v.lang === "en-IN") || // any Indian English (Chrome ships one)
    byName(/\bhindi\b|\bindia\b/i) ||
    voices.find((v) => v.lang?.startsWith("en") && /\b(male|daniel|alex|rishi|arthur|george)\b/i.test(v.name)) ||
    voices.find((v) => v.lang?.startsWith("en")) ||
    voices[0] ||
    null
  );
}

export default function ShadowWidget() {
  const router = useRouter();
  const pathname = usePathname();
  // Not on the pre-login / dead-end screens.
  const hidden = pathname === "/admin/login" || pathname === "/admin/no-access";
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [pending, setPending] = useState<Pending>(null);
  const [listening, setListening] = useState(false);
  const [voiceOn, setVoiceOn] = useState(true);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [wakeEnabled, setWakeEnabled] = useState(false);
  const [wakeArmed, setWakeArmed] = useState(false);
  const [wakeError, setWakeError] = useState<string | null>(null);

  const recRef = useRef<any>(null);
  const wakeRecRef = useRef<any>(null);
  const wakeRunningRef = useRef(false);
  const wakeEnabledRef = useRef(false);
  const armedRef = useRef(false);
  const armTimerRef = useRef<any>(null);
  const speakingRef = useRef(false);
  const voiceRef = useRef<SpeechSynthesisVoice | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // ---- Voice picking (async — voices load lazily) -------------------------
  useEffect(() => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    const load = () => {
      voiceRef.current = pickVoice(window.speechSynthesis.getVoices());
    };
    load();
    window.speechSynthesis.onvoiceschanged = load;
    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, pending, open]);

  const speak = useCallback(
    (text: string) => {
      if (!voiceOn || typeof window === "undefined" || !window.speechSynthesis) return;
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      if (voiceRef.current) {
        u.voice = voiceRef.current;
        u.lang = voiceRef.current.lang;
      } else {
        u.lang = "en-IN";
      }
      u.rate = 1.05; // natural, not sluggish
      u.pitch = 1;
      // Pause wake-word listening while Shadow talks so it doesn't hear itself.
      speakingRef.current = true;
      u.onend = u.onerror = () => {
        speakingRef.current = false;
        if (wakeEnabledRef.current && !wakeRunningRef.current) startWakeListening();
      };
      if (wakeRunningRef.current) {
        try {
          wakeRecRef.current?.stop();
        } catch {}
      }
      window.speechSynthesis.speak(u);
    },
    [voiceOn]
  );

  const send = useCallback(
    async (text: string) => {
      const content = text.trim();
      if (!content || busy) return;
      setOpen(true);
      const next: Msg[] = [...messages, { role: "user", content }];
      setMessages(next);
      setInput("");
      setBusy(true);
      try {
        const res = await fetch("/api/admin/agent", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ messages: next.map((m) => ({ role: m.role, content: m.content })) }),
        });
        const data = await res.json();
        const reply = data.reply || data.error || "Sorry, something went wrong.";
        setMessages((m) => [...m, { role: "assistant", content: reply, leads: data.data?.leads }]);
        speak(reply);
        if (data.pendingAction) setPending(data.pendingAction);
        if (data.data?.navigateTo) router.push(data.data.navigateTo);
      } catch {
        setMessages((m) => [...m, { role: "assistant", content: "Network error — please try again." }]);
      } finally {
        setBusy(false);
      }
    },
    [busy, messages, speak, router]
  );

  const confirmPending = useCallback(async () => {
    if (!pending) return;
    setBusy(true);
    const action = pending;
    setPending(null);
    try {
      const res = await fetch("/api/admin/agent", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ confirm: action }),
      });
      const data = await res.json();
      const reply = data.reply || data.error || "Done.";
      setMessages((m) => [...m, { role: "assistant", content: reply }]);
      speak(reply);
    } catch {
      setMessages((m) => [...m, { role: "assistant", content: "Network error — please try again." }]);
    } finally {
      setBusy(false);
    }
  }, [pending, speak]);

  const cancelPending = () => {
    setPending(null);
    setMessages((m) => [...m, { role: "assistant", content: "Okay, cancelled." }]);
  };

  // ---- Push-to-talk (manual mic tap) --------------------------------------
  const toggleListen = () => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) return;
    if (listening) {
      recRef.current?.stop();
      setListening(false);
      return;
    }
    const rec = new SR();
    rec.lang = "en-IN";
    rec.interimResults = true;
    rec.continuous = false;
    let transcript = "";
    rec.onresult = (e: any) => {
      transcript = Array.from(e.results)
        .map((r: any) => r[0].transcript)
        .join(" ");
      setInput(transcript);
    };
    rec.onerror = () => setListening(false);
    rec.onend = () => {
      setListening(false);
      const finalText = transcript.trim();
      if (finalText) send(finalText);
    };
    recRef.current = rec;
    setListening(true);
    window.speechSynthesis?.cancel();
    if (wakeRunningRef.current) {
      try {
        wakeRecRef.current?.stop();
      } catch {}
    }
    rec.start();
  };

  // ---- Wake-word ("Shadow") continuous listening --------------------------
  const armWindow = () => {
    armedRef.current = true;
    setWakeArmed(true);
    if (armTimerRef.current) clearTimeout(armTimerRef.current);
    armTimerRef.current = setTimeout(() => {
      armedRef.current = false;
      setWakeArmed(false);
    }, ARM_WINDOW_MS);
  };

  const handleWakeTranscript = useCallback(
    (raw: string) => {
      const text = raw.trim();
      if (!text) return;
      if (armedRef.current) {
        armedRef.current = false;
        setWakeArmed(false);
        if (armTimerRef.current) clearTimeout(armTimerRef.current);
        setOpen(true);
        send(text);
        return;
      }
      const match = text.toLowerCase().match(WAKE_RE);
      if (!match) return; // not directed at Shadow — ignore
      const idx = text.toLowerCase().indexOf(match[0]);
      const after = text
        .slice(idx + match[0].length)
        .replace(/^[\s,.\-:]+/, "")
        .trim();
      if (after) {
        setOpen(true);
        send(after);
      } else {
        setOpen(true);
        speak("Yes?");
        armWindow();
      }
    },
    [send, speak]
  );

  function startWakeListening() {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR || wakeRunningRef.current || listening) return;
    const rec = new SR();
    rec.lang = "en-IN";
    rec.interimResults = false;
    rec.continuous = true;
    rec.onresult = (e: any) => {
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const r = e.results[i];
        if (r.isFinal) handleWakeTranscript(r[0].transcript);
      }
    };
    rec.onerror = (e: any) => {
      if (e.error === "not-allowed" || e.error === "audio-capture") {
        wakeEnabledRef.current = false;
        wakeRunningRef.current = false;
        setWakeEnabled(false);
        window.localStorage.setItem(WAKE_PREF_KEY, "0");
        setWakeError(
          e.error === "not-allowed"
            ? "Microphone is blocked. Click the mic to allow Shadow to listen."
            : "No microphone found."
        );
      }
      // no-speech / aborted / network are transient — onend restarts.
    };
    rec.onend = () => {
      wakeRunningRef.current = false;
      if (wakeEnabledRef.current && !speakingRef.current && !listening) {
        setTimeout(() => startWakeListening(), 300);
      }
    };
    try {
      rec.start();
      wakeRecRef.current = rec;
      wakeRunningRef.current = true;
      setWakeError(null);
    } catch {
      wakeRunningRef.current = false;
    }
  }

  const stopWakeListening = () => {
    wakeEnabledRef.current = false;
    wakeRunningRef.current = false;
    armedRef.current = false;
    setWakeArmed(false);
    try {
      wakeRecRef.current?.stop();
    } catch {}
  };

  // Request mic permission (prompts if needed) then enable wake listening.
  const enableWake = useCallback(async () => {
    try {
      if (navigator.mediaDevices?.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach((t) => t.stop()); // SpeechRecognition opens its own capture
      }
      window.localStorage.setItem(WAKE_PREF_KEY, "1");
      setWakeError(null);
      setWakeEnabled(true);
    } catch {
      setWakeEnabled(false);
      setWakeError("Microphone is blocked. Allow it in your browser to let Shadow listen.");
    }
  }, []);

  const toggleWake = () => {
    if (wakeEnabled) {
      setWakeEnabled(false);
      window.localStorage.setItem(WAKE_PREF_KEY, "0");
      stopWakeListening();
    } else {
      enableWake();
    }
  };

  useEffect(() => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    setSpeechSupported(Boolean(SR));
  }, []);

  // Auto-enable for the owner (widget only mounts for owners) once on a real
  // admin page, unless they explicitly turned Shadow off. Re-checks when the
  // route enters/leaves the hidden (login/no-access) screens.
  useEffect(() => {
    if (hidden || !speechSupported) {
      stopWakeListening();
      return;
    }
    const pref = window.localStorage.getItem(WAKE_PREF_KEY);
    if (pref !== "0" && !wakeEnabledRef.current) {
      // If mic is already granted this resolves silently → straight into listening;
      // otherwise it prompts the user once.
      enableWake();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hidden, speechSupported]);

  useEffect(() => {
    wakeEnabledRef.current = wakeEnabled;
    if (wakeEnabled && speechSupported && !hidden) {
      startWakeListening();
    } else if (!wakeEnabled) {
      stopWakeListening();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wakeEnabled, speechSupported, hidden]);

  useEffect(() => {
    if (listening && wakeRunningRef.current) {
      try {
        wakeRecRef.current?.stop();
      } catch {}
    } else if (!listening && wakeEnabledRef.current && !wakeRunningRef.current && !speakingRef.current) {
      startWakeListening();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listening]);

  useEffect(() => stopWakeListening, []);

  const statusLabel = listening
    ? "Listening…"
    : wakeArmed
      ? "Go ahead…"
      : wakeEnabled
        ? "Listening for “Shadow”"
        : "Tap to talk";

  if (hidden) return null;

  return (
    <>
      {/* Launcher bubble */}
      {!open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Open Shadow assistant"
          className="group fixed bottom-5 right-5 z-[60] grid h-14 w-14 place-items-center rounded-full bg-gradient-to-br from-accent-cyan to-violet-500 text-navy-950 shadow-lg shadow-accent-cyan/20 transition hover:scale-105"
        >
          {wakeEnabled && (
            <span className="absolute inset-0 rounded-full ring-2 ring-emerald-400/60 animate-ping" />
          )}
          <Bot size={26} />
        </button>
      )}

      {/* Chat panel */}
      {open && (
        <div className="fixed bottom-5 right-5 z-[60] flex h-[600px] max-h-[calc(100vh-2.5rem)] w-[380px] max-w-[calc(100vw-2.5rem)] flex-col overflow-hidden rounded-2xl border border-navy-700/50 bg-navy-950/95 shadow-2xl shadow-black/40 backdrop-blur-xl">
          {/* Header */}
          <div className="flex items-center justify-between gap-2 border-b border-navy-700/50 bg-navy-900/60 px-4 py-3">
            <div className="flex items-center gap-2.5">
              <span className="relative grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-accent-cyan/30 to-violet-500/30 text-accent-cyan">
                <Bot size={18} />
                {(listening || wakeArmed) && (
                  <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-emerald-400 ring-2 ring-navy-950" />
                )}
              </span>
              <div className="leading-tight">
                <div className="text-sm font-semibold text-white">Shadow</div>
                <div className="text-[11px] text-slate-400">{statusLabel}</div>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setVoiceOn((v) => !v)}
                title={voiceOn ? "Mute voice replies" : "Enable voice replies"}
                className="grid h-8 w-8 place-items-center rounded-full text-slate-400 hover:bg-navy-800/70 hover:text-white"
              >
                {voiceOn ? <Volume2 size={16} /> : <VolumeX size={16} />}
              </button>
              {speechSupported && (
                <button
                  type="button"
                  onClick={toggleWake}
                  title={wakeEnabled ? "Shadow is listening for its name — click to turn off" : "Let Shadow listen for its name"}
                  className={`grid h-8 w-8 place-items-center rounded-full ${
                    wakeEnabled ? "text-emerald-300" : "text-slate-400 hover:bg-navy-800/70 hover:text-white"
                  }`}
                >
                  {wakeEnabled ? <Ear size={16} /> : <EarOff size={16} />}
                </button>
              )}
              <button
                type="button"
                onClick={() => setOpen(false)}
                title="Close"
                className="grid h-8 w-8 place-items-center rounded-full text-slate-400 hover:bg-navy-800/70 hover:text-white"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Conversation */}
          <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto p-4">
            {messages.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center text-center text-slate-500">
                <div className="grid h-14 w-14 place-items-center rounded-full bg-accent-cyan/10 text-accent-cyan">
                  <Sparkles size={24} />
                </div>
                <p className="mt-3 text-sm text-slate-300">Hi, I&apos;m Shadow.</p>
                <p className="mt-1 max-w-[15rem] text-xs">
                  Ask me anything about your portal, or just say &ldquo;Shadow, …&rdquo;.
                </p>
                <div className="mt-4 flex flex-col gap-1.5">
                  {SUGGESTIONS.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => send(s)}
                      className="rounded-lg border border-navy-700/50 bg-navy-900/40 px-3 py-1.5 text-left text-[11px] text-slate-300 hover:border-accent-cyan hover:text-white"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[85%] rounded-2xl px-3.5 py-2 text-sm ${
                      m.role === "user"
                        ? "bg-accent-cyan/15 text-white"
                        : "border border-navy-700/50 bg-navy-900/50 text-slate-200"
                    }`}
                  >
                    {m.content}
                    {m.leads && m.leads.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {m.leads.slice(0, 8).map((l: any, j: number) => (
                          <span key={j} className="rounded-full bg-navy-800/70 px-2 py-0.5 text-[11px] text-slate-300">
                            {l.business}
                            {l.score != null ? ` · ${l.score}` : ""}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}

            {busy && (
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <Loader2 size={13} className="animate-spin" /> Working…
              </div>
            )}

            {pending && (
              <div className="rounded-xl border border-amber-400/30 bg-amber-400/10 p-3">
                <p className="text-xs text-amber-100">
                  {pending.name === "schedule_meeting"
                    ? "Confirm booking this meeting?"
                    : "Confirm sending this email?"}
                </p>
                <div className="mt-2.5 flex gap-2">
                  <button
                    type="button"
                    onClick={confirmPending}
                    disabled={busy}
                    className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/40 bg-emerald-400/10 px-3.5 py-1.5 text-xs font-medium text-emerald-200 disabled:opacity-60"
                  >
                    <Send size={12} /> {pending.name === "schedule_meeting" ? "Confirm" : "Send it"}
                  </button>
                  <button
                    type="button"
                    onClick={cancelPending}
                    className="rounded-full border border-navy-700/70 bg-navy-800/50 px-3.5 py-1.5 text-xs text-slate-200"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Input bar */}
          <div className="border-t border-navy-700/50 bg-navy-900/40 p-3">
            {wakeError && <p className="mb-2 px-1 text-[11px] text-rose-300">{wakeError}</p>}
            <div className="flex items-center gap-2">
              {speechSupported && (
                <button
                  type="button"
                  onClick={toggleListen}
                  title={listening ? "Stop" : "Speak"}
                  className={`grid h-10 w-10 shrink-0 place-items-center rounded-full transition ${
                    listening
                      ? "animate-pulse bg-rose-500/20 text-rose-300"
                      : "bg-accent-cyan/15 text-accent-cyan hover:bg-accent-cyan/25"
                  }`}
                >
                  {listening ? <MicOff size={17} /> : <Mic size={17} />}
                </button>
              )}
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && send(input)}
                placeholder={listening ? "Listening…" : "Ask Shadow anything…"}
                className="flex-1 rounded-full border border-navy-700/70 bg-navy-950/60 px-4 py-2.5 text-sm text-white outline-none placeholder:text-slate-600 focus:border-accent-cyan"
              />
              <button
                type="button"
                onClick={() => send(input)}
                disabled={busy || !input.trim()}
                className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-accent-cyan text-navy-950 disabled:opacity-40"
              >
                <Send size={17} />
              </button>
            </div>
            {!speechSupported && (
              <p className="mt-2 px-1 text-[11px] text-slate-500">
                Voice isn&apos;t supported in this browser — try Chrome or Edge. You can still type.
              </p>
            )}
          </div>
        </div>
      )}
    </>
  );
}
