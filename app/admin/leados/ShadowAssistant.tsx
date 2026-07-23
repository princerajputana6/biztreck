"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Ear,
  EarOff,
  Loader2,
  Mic,
  MicOff,
  Send,
  Sparkles,
  Volume2,
  VolumeX,
} from "lucide-react";

type Msg = { role: "user" | "assistant"; content: string; leads?: any[] };
type Pending = { name: string; args: any } | null;

const SUGGESTIONS = [
  "Find dental clinics in Manchester",
  "Research the next 10 leads",
  "Show me my hot leads",
  "Audit Old Builders Ltd",
  "Draft outreach for Old Builders Ltd",
  "Book a meeting with Old Builders Ltd tomorrow at 3pm",
  "What's in my pipeline?",
];

const WAKE_RE = /\bshadow\b/i;
const WAKE_PREF_KEY = "shadow_wake_enabled";
const ARM_WINDOW_MS = 8000;

export default function ShadowAssistant() {
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
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    setSpeechSupported(Boolean(SR));
    if (SR && window.localStorage.getItem(WAKE_PREF_KEY) === "1") {
      setWakeEnabled(true);
    }
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, pending]);

  const speak = useCallback(
    (text: string) => {
      if (!voiceOn || typeof window === "undefined" || !window.speechSynthesis) return;
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.rate = 1.02;
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
      } catch {
        setMessages((m) => [...m, { role: "assistant", content: "Network error — please try again." }]);
      } finally {
        setBusy(false);
      }
    },
    [busy, messages, speak]
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
    setMessages((m) => [...m, { role: "assistant", content: "Okay, I won't send it." }]);
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
    rec.lang = "en-US";
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
    // Pause wake-word listening so the two recognition sessions don't collide.
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
        send(after);
      } else {
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
    rec.lang = "en-US";
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
            ? "Microphone permission is blocked — allow it in the browser's site settings to use Shadow's wake word."
            : "No microphone found."
        );
      }
      // Other errors (no-speech, aborted, network) are transient — onend handles restart.
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

  const toggleWake = () => {
    if (wakeEnabled) {
      setWakeEnabled(false);
      window.localStorage.setItem(WAKE_PREF_KEY, "0");
      stopWakeListening();
    } else {
      setWakeEnabled(true);
      window.localStorage.setItem(WAKE_PREF_KEY, "1");
      setWakeError(null);
    }
  };

  useEffect(() => {
    wakeEnabledRef.current = wakeEnabled;
    if (wakeEnabled && speechSupported) {
      startWakeListening();
    } else if (!wakeEnabled) {
      stopWakeListening();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wakeEnabled, speechSupported]);

  useEffect(() => {
    // Manual push-to-talk takes priority — pause wake listening while it's active.
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

  return (
    <div className="mt-8 grid gap-4 lg:grid-cols-[1fr_260px]">
      {/* Conversation */}
      <div className="flex min-h-[60vh] flex-col rounded-2xl border border-navy-700/40 bg-navy-900/40">
        <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto p-5">
          {messages.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center text-slate-500">
              <div className="grid h-16 w-16 place-items-center rounded-full bg-accent-cyan/10 text-accent-cyan">
                <Mic size={28} />
              </div>
              <p className="mt-4 max-w-sm text-sm">
                Tap the mic and speak, type below, or enable Shadow&apos;s wake word and just say
                &ldquo;Shadow, find law firms in Dubai&rdquo;.
              </p>
            </div>
          ) : (
            messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm ${
                    m.role === "user"
                      ? "bg-accent-cyan/15 text-white"
                      : "border border-navy-700/50 bg-navy-950/50 text-slate-200"
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
            <div className="rounded-xl border border-amber-400/30 bg-amber-400/10 p-4">
              <p className="text-sm text-amber-100">
                {pending.name === "schedule_meeting"
                  ? "Confirm booking this meeting? Nothing is booked until you press Confirm."
                  : "Confirm sending this email? Nothing is sent until you press Send."}
              </p>
              <div className="mt-3 flex gap-2">
                <button
                  type="button"
                  onClick={confirmPending}
                  disabled={busy}
                  className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/40 bg-emerald-400/10 px-4 py-1.5 text-xs font-medium text-emerald-200 disabled:opacity-60"
                >
                  <Send size={13} /> {pending.name === "schedule_meeting" ? "Confirm" : "Send it"}
                </button>
                <button
                  type="button"
                  onClick={cancelPending}
                  className="rounded-full border border-navy-700/70 bg-navy-800/50 px-4 py-1.5 text-xs text-slate-200"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Input bar */}
        <div className="border-t border-navy-700/40 p-3">
          {wakeError && <p className="mb-2 px-2 text-[11px] text-rose-300">{wakeError}</p>}
          <div className="flex items-center gap-2">
            {speechSupported && (
              <button
                type="button"
                onClick={toggleListen}
                title={listening ? "Stop listening" : "Speak"}
                className={`grid h-11 w-11 shrink-0 place-items-center rounded-full transition ${
                  listening
                    ? "animate-pulse bg-rose-500/20 text-rose-300"
                    : "bg-accent-cyan/15 text-accent-cyan hover:bg-accent-cyan/25"
                }`}
              >
                {listening ? <MicOff size={18} /> : <Mic size={18} />}
              </button>
            )}
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send(input)}
              placeholder={
                listening
                  ? "Listening…"
                  : wakeArmed
                    ? "Shadow is waiting for your command…"
                    : "Ask or command… e.g. find gyms in Berlin"
              }
              className="flex-1 rounded-full border border-navy-700/70 bg-navy-950/50 px-4 py-2.5 text-sm text-white outline-none placeholder:text-slate-600 focus:border-accent-cyan"
            />
            {speechSupported && (
              <button
                type="button"
                onClick={toggleWake}
                title={wakeEnabled ? "Shadow is always listening for its name — click to disable" : "Enable Shadow's wake word"}
                className={`grid h-11 w-11 shrink-0 place-items-center rounded-full border transition ${
                  wakeEnabled
                    ? `border-emerald-400/40 bg-emerald-400/10 text-emerald-300 ${wakeArmed ? "animate-pulse" : ""}`
                    : "border-navy-700/70 bg-navy-800/50 text-slate-300 hover:text-white"
                }`}
              >
                {wakeEnabled ? <Ear size={18} /> : <EarOff size={18} />}
              </button>
            )}
            <button
              type="button"
              onClick={() => setVoiceOn((v) => !v)}
              title={voiceOn ? "Mute voice replies" : "Enable voice replies"}
              className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-navy-700/70 bg-navy-800/50 text-slate-300 hover:text-white"
            >
              {voiceOn ? <Volume2 size={18} /> : <VolumeX size={18} />}
            </button>
            <button
              type="button"
              onClick={() => send(input)}
              disabled={busy || !input.trim()}
              className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-accent-cyan text-navy-950 disabled:opacity-40"
            >
              <Send size={18} />
            </button>
          </div>
          {!speechSupported && (
            <p className="mt-2 px-2 text-[11px] text-slate-500">
              Voice input isn&apos;t supported in this browser — try Chrome or Edge. You can still type.
            </p>
          )}
          {speechSupported && (
            <p className="mt-2 px-2 text-[11px] text-slate-500">
              {wakeEnabled
                ? "Shadow is listening for its name — just say “Shadow, ...”, no mic tap needed."
                : "Tap the ear icon once to let Shadow listen for its name in the background (needs mic permission)."}
            </p>
          )}
        </div>
      </div>

      {/* Side panel */}
      <div className="space-y-4">
        <div className="rounded-2xl border border-navy-700/40 bg-navy-900/40 p-4">
          <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-white">
            <Sparkles size={15} className="text-accent-cyan" /> Try saying
          </div>
          <div className="flex flex-col gap-2">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => send(s)}
                disabled={busy}
                className="rounded-lg border border-navy-700/50 bg-navy-950/40 px-3 py-2 text-left text-xs text-slate-300 hover:border-accent-cyan hover:text-white disabled:opacity-60"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
        <div className="rounded-2xl border border-navy-700/40 bg-navy-900/40 p-4 text-xs text-slate-500">
          Shadow can search Google Places, research &amp; audit leads, draft outreach, and book
          Google Calendar meetings (once connected in Integrations). It always asks you to confirm
          before sending an email or booking a meeting. Owner-only.
        </div>
      </div>
    </div>
  );
}
