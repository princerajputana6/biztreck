"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  Bot,
  Loader2,
  Mic,
  MicOff,
  RadioTower,
  Send,
  Sparkles,
  Trash2,
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
];

const WAKE_RE = /\bshadow\b/i;
// Spoken yes/no for confirming a pending action (send email, book meeting…).
const AFFIRM_RE = /^(yes|yeah|yep|yup|sure|ok|okay|send|send it|send them|send all|send those|go ahead|do it|confirm(ed)?|please do|absolutely|correct|right|proceed|go for it|go|yup|haan|haan ji|ji|book it|schedule it)\b/i;
const NEGATE_RE = /^(no|nope|nah|cancel|skip|stop|don'?t|do not|not now|later|nahi|hold on|wait|forget it|never mind|nevermind)\b/i;
const PREFS = { mic: "shadow_mic_enabled", convo: "shadow_convo_mode" };
// Flush an utterance this long after speech stops — long enough to let a full,
// multi-clause sentence finish before we send it.
const SILENCE_MS = 1300;
const MIN_SEND_CHARS = 2;
const ECHO_WINDOW_MS = 4000;

function words(s: string): string[] {
  return s.toLowerCase().replace(/[^a-z0-9\s]/g, " ").split(/\s+/).filter(Boolean);
}

/** Best available "Indian man" voice for spoken replies. */
function pickVoice(voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | null {
  if (!voices.length) return null;
  const byName = (re: RegExp) => voices.find((v) => re.test(v.name));
  return (
    byName(/rishi/i) || // macOS en-IN male
    voices.find((v) => v.lang === "en-IN" && /\b(male|rishi|prabhat|hemant|ravi)\b/i.test(v.name)) ||
    voices.find((v) => v.lang === "en-IN") ||
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
  const hidden = pathname === "/admin/login" || pathname === "/admin/no-access";

  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [pending, setPending] = useState<Pending>(null);
  const [voiceOn, setVoiceOn] = useState(true);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [micEnabled, setMicEnabled] = useState(false);
  const [convoMode, setConvoMode] = useState(true); // always-listen (no wake word) by default
  const [speaking, setSpeaking] = useState(false);
  const [interim, setInterim] = useState("");
  const [micError, setMicError] = useState<string | null>(null);

  const recRef = useRef<any>(null);
  const runningRef = useRef(false);
  const stoppingRef = useRef(false);
  const micEnabledRef = useRef(false);
  const convoModeRef = useRef(true);
  const busyRef = useRef(false);
  const pendingRef = useRef<Pending>(null);
  const speakingRef = useRef(false);
  const bufferRef = useRef("");
  const silenceTimerRef = useRef<any>(null);
  const restartTimerRef = useRef<any>(null);
  const lastSpokenSetRef = useRef<Set<string>>(new Set());
  const lastSpokeAtRef = useRef(0);
  const voiceRef = useRef<SpeechSynthesisVoice | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    convoModeRef.current = convoMode;
  }, [convoMode]);
  useEffect(() => {
    busyRef.current = busy;
  }, [busy]);
  useEffect(() => {
    pendingRef.current = pending;
  }, [pending]);

  // ---- Voice picking (async) ----------------------------------------------
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
  }, [messages, pending, open, interim]);

  // Restore persisted conversation on mount.
  useEffect(() => {
    if (hidden) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/admin/agent");
        const data = await res.json();
        if (!cancelled && data.ok && Array.isArray(data.messages)) {
          setMessages(data.messages);
        }
      } catch {}
    })();
    return () => {
      cancelled = true;
    };
  }, [hidden]);

  const stopSpeaking = useCallback(() => {
    try {
      window.speechSynthesis?.cancel();
    } catch {}
    speakingRef.current = false;
    setSpeaking(false);
  }, []);

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
      u.rate = 1.05;
      u.pitch = 1;
      lastSpokenSetRef.current = new Set(words(text));
      lastSpokeAtRef.current = Date.now();
      speakingRef.current = true;
      setSpeaking(true);
      u.onend = u.onerror = () => {
        speakingRef.current = false;
        lastSpokeAtRef.current = Date.now();
        setSpeaking(false);
      };
      window.speechSynthesis.speak(u);
    },
    [voiceOn]
  );

  const isEcho = useCallback((candidate: string) => {
    const w = words(candidate);
    if (!w.length) return false;
    const set = lastSpokenSetRef.current;
    if (!set.size) return false;
    if (Date.now() - lastSpokeAtRef.current > ECHO_WINDOW_MS) return false;
    const overlap = w.filter((x) => set.has(x)).length;
    return overlap / w.length > 0.55;
  }, []);

  const confirmPending = useCallback(async () => {
    const action = pendingRef.current;
    if (!action) return;
    pendingRef.current = null;
    setPending(null);
    setBusy(true);
    busyRef.current = true;
    stopSpeaking();
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
      if (data.data?.navigateTo) router.push(data.data.navigateTo);
    } catch {
      setMessages((m) => [...m, { role: "assistant", content: "Network error — please try again." }]);
    } finally {
      setBusy(false);
      busyRef.current = false;
    }
  }, [speak, stopSpeaking, router]);

  const cancelPending = useCallback(() => {
    if (!pendingRef.current) return;
    pendingRef.current = null;
    setPending(null);
    setMessages((m) => [...m, { role: "assistant", content: "Okay, cancelled." }]);
  }, []);

  const send = useCallback(
    async (text: string) => {
      const content = text.trim();
      if (!content || busyRef.current) return;

      // If we're waiting on a confirmation, treat a spoken/typed yes/no as the
      // answer instead of a brand-new command (this is what caused the loop).
      if (pendingRef.current) {
        if (AFFIRM_RE.test(content)) {
          setOpen(true);
          setInterim("");
          setInput("");
          setMessages((m) => [...m, { role: "user", content }]);
          confirmPending();
          return;
        }
        if (NEGATE_RE.test(content)) {
          setOpen(true);
          setInterim("");
          setInput("");
          setMessages((m) => [...m, { role: "user", content }]);
          cancelPending();
          return;
        }
        // Anything else is a new instruction — drop the stale pending action.
        pendingRef.current = null;
        setPending(null);
      }

      stopSpeaking();
      setOpen(true);
      setInterim("");
      const next: Msg[] = [...messages, { role: "user", content }];
      setMessages(next);
      setInput("");
      setBusy(true);
      busyRef.current = true;
      try {
        const res = await fetch("/api/admin/agent", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ message: content }),
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
        busyRef.current = false;
      }
    },
    [messages, speak, router, stopSpeaking, confirmPending, cancelPending]
  );

  const clearMemory = useCallback(async () => {
    if (!window.confirm("Clear Shadow's memory of this conversation?")) return;
    try {
      await fetch("/api/admin/agent", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ reset: true }),
      });
    } catch {}
    setMessages([]);
    setPending(null);
  }, []);

  // ---- Continuous recognition engine --------------------------------------
  const flush = useCallback(() => {
    const text = bufferRef.current.trim();
    bufferRef.current = "";
    setInterim("");
    if (!text || text.length < MIN_SEND_CHARS) return;
    if (isEcho(text)) return; // dropped Shadow's own voice
    if (busyRef.current) return; // still answering — ignore stray audio

    if (convoModeRef.current) {
      send(text);
      return;
    }
    // Wake-word mode: only act on "Shadow …".
    const m = text.toLowerCase().match(WAKE_RE);
    if (!m) return;
    const idx = text.toLowerCase().indexOf(m[0]);
    const after = text.slice(idx + m[0].length).replace(/^[\s,.\-:]+/, "").trim();
    if (after) send(after);
    else speak("Yes?");
  }, [isEcho, send, speak]);

  const scheduleFlush = useCallback(() => {
    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    silenceTimerRef.current = setTimeout(flush, SILENCE_MS);
  }, [flush]);

  const startEngine = useCallback(() => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR || runningRef.current || !micEnabledRef.current) return;
    const rec = new SR();
    rec.lang = "en-IN";
    rec.continuous = true;
    rec.interimResults = true;
    rec.maxAlternatives = 1;
    rec.onstart = () => {
      runningRef.current = true;
    };
    rec.onresult = (e: any) => {
      let interimText = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const r = e.results[i];
        if (r.isFinal) bufferRef.current += r[0].transcript + " ";
        else interimText += r[0].transcript;
      }
      const live = (bufferRef.current + " " + interimText).trim();
      setInterim(live);
      // Barge-in: user speaking over Shadow → stop talking and listen.
      if (speakingRef.current && live && !isEcho(live)) stopSpeaking();
      scheduleFlush();
    };
    rec.onerror = (ev: any) => {
      if (ev.error === "not-allowed" || ev.error === "audio-capture") {
        micEnabledRef.current = false;
        runningRef.current = false;
        setMicEnabled(false);
        window.localStorage.setItem(PREFS.mic, "0");
        setMicError(
          ev.error === "not-allowed"
            ? "Microphone is blocked. Allow it in your browser, then click the mic to let Shadow listen."
            : "No microphone found."
        );
      }
      // no-speech / aborted / network are transient — onend restarts.
    };
    rec.onend = () => {
      runningRef.current = false;
      if (micEnabledRef.current && !stoppingRef.current) {
        if (restartTimerRef.current) clearTimeout(restartTimerRef.current);
        restartTimerRef.current = setTimeout(() => startEngine(), 250);
      }
    };
    try {
      rec.start();
      recRef.current = rec;
      runningRef.current = true;
      stoppingRef.current = false;
      setMicError(null);
    } catch {
      runningRef.current = false;
    }
  }, [isEcho, scheduleFlush, stopSpeaking]);

  const stopEngine = useCallback(() => {
    stoppingRef.current = true;
    runningRef.current = false;
    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    if (restartTimerRef.current) clearTimeout(restartTimerRef.current);
    bufferRef.current = "";
    setInterim("");
    try {
      recRef.current?.stop();
    } catch {}
  }, []);

  // Prompt for mic permission (if needed), then turn listening on.
  const enableMic = useCallback(async () => {
    try {
      if (navigator.mediaDevices?.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach((t) => t.stop());
      }
      window.localStorage.setItem(PREFS.mic, "1");
      setMicError(null);
      setMicEnabled(true);
    } catch {
      setMicEnabled(false);
      setMicError("Microphone is blocked. Allow it in your browser to let Shadow listen.");
    }
  }, []);

  const toggleMic = () => {
    if (micEnabled) {
      setMicEnabled(false);
      window.localStorage.setItem(PREFS.mic, "0");
    } else {
      enableMic();
    }
  };

  const toggleConvoMode = () => {
    setConvoMode((v) => {
      const next = !v;
      window.localStorage.setItem(PREFS.convo, next ? "1" : "0");
      return next;
    });
  };

  // Detect support + restore prefs.
  useEffect(() => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    setSpeechSupported(Boolean(SR));
    if (window.localStorage.getItem(PREFS.convo) === "0") setConvoMode(false);
  }, []);

  // Auto-enable listening for the owner on a real admin page (unless turned off).
  useEffect(() => {
    if (hidden || !speechSupported) {
      stopEngine();
      return;
    }
    const pref = window.localStorage.getItem(PREFS.mic);
    if (pref !== "0" && !micEnabledRef.current) enableMic();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hidden, speechSupported]);

  // Start/stop the engine when the enable flag flips.
  useEffect(() => {
    micEnabledRef.current = micEnabled;
    if (micEnabled && speechSupported && !hidden) startEngine();
    else stopEngine();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [micEnabled, speechSupported, hidden]);

  useEffect(() => stopEngine, [stopEngine]);

  if (hidden) return null;

  const status = !micEnabled
    ? "Mic off"
    : speaking
      ? "Speaking… (just talk to interrupt)"
      : interim
        ? "Listening…"
        : convoMode
          ? "Listening — just talk"
          : "Say “Shadow …”";

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
          {micEnabled && (
            <span
              className={`absolute inset-0 rounded-full ring-2 ${speaking ? "ring-accent-cyan/70" : "ring-emerald-400/60"} animate-ping`}
            />
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
                {micEnabled && (
                  <span className={`absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full ${speaking ? "bg-accent-cyan" : "bg-emerald-400"} ring-2 ring-navy-950`} />
                )}
              </span>
              <div className="leading-tight">
                <div className="text-sm font-semibold text-white">Shadow</div>
                <div className="text-[11px] text-slate-400">{status}</div>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={toggleConvoMode}
                title={convoMode ? "Always listening — click for wake-word mode" : "Wake-word mode — click for always-on"}
                className={`grid h-8 w-8 place-items-center rounded-full ${
                  convoMode ? "text-accent-cyan" : "text-slate-400 hover:bg-navy-800/70 hover:text-white"
                }`}
              >
                <RadioTower size={16} />
              </button>
              <button
                type="button"
                onClick={() => (voiceOn ? (setVoiceOn(false), stopSpeaking()) : setVoiceOn(true))}
                title={voiceOn ? "Mute Shadow's voice" : "Unmute Shadow's voice"}
                className="grid h-8 w-8 place-items-center rounded-full text-slate-400 hover:bg-navy-800/70 hover:text-white"
              >
                {voiceOn ? <Volume2 size={16} /> : <VolumeX size={16} />}
              </button>
              {speechSupported && (
                <button
                  type="button"
                  onClick={toggleMic}
                  title={micEnabled ? "Turn Shadow's listening off" : "Turn Shadow's listening on"}
                  className={`grid h-8 w-8 place-items-center rounded-full ${
                    micEnabled ? "text-emerald-300" : "text-slate-400 hover:bg-navy-800/70 hover:text-white"
                  }`}
                >
                  {micEnabled ? <Mic size={16} /> : <MicOff size={16} />}
                </button>
              )}
              <button
                type="button"
                onClick={clearMemory}
                title="Clear conversation & memory"
                className="grid h-8 w-8 place-items-center rounded-full text-slate-400 hover:bg-navy-800/70 hover:text-white"
              >
                <Trash2 size={15} />
              </button>
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
                  {convoMode
                    ? "I'm listening — just start talking, or type below."
                    : "Say “Shadow, …”, or type below."}
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

            {interim && (
              <div className="flex justify-end">
                <div className="max-w-[85%] rounded-2xl border border-accent-cyan/30 bg-accent-cyan/5 px-3.5 py-2 text-sm text-slate-400 italic">
                  {interim}
                </div>
              </div>
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
                    : pending.name === "send_outreach_batch"
                      ? "Confirm sending outreach to these leads?"
                      : "Confirm sending this email?"}
                  <span className="mt-1 block text-amber-200/70">Or just say “yes” / “no”.</span>
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
            {micError && <p className="mb-2 px-1 text-[11px] text-rose-300">{micError}</p>}
            <div className="flex items-center gap-2">
              {speechSupported && (
                <button
                  type="button"
                  onClick={toggleMic}
                  title={micEnabled ? "Listening — click to mute" : "Click to let Shadow listen"}
                  className={`grid h-10 w-10 shrink-0 place-items-center rounded-full transition ${
                    micEnabled
                      ? "bg-emerald-400/15 text-emerald-300"
                      : "bg-navy-800/60 text-slate-300 hover:text-white"
                  }`}
                >
                  {micEnabled ? <Mic size={17} /> : <MicOff size={17} />}
                </button>
              )}
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && send(input)}
                placeholder="Ask Shadow anything…"
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
