"use client";

import { useEffect, useRef, useState } from "react";

type ApiResult = {
  transcript?: string;
  answer?: string;
  matches?: Array<any>;
  error?: string;
};

export default function Home() {
  const [isListening, setIsListening] = useState(false);
  const [status, setStatus] = useState("พร้อมพูด");
  const [result, setResult] = useState<ApiResult>({});
  const [pulseRing, setPulseRing] = useState(false);

  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setStatus("เบราว์เซอร์นี้ไม่รองรับ Web Speech API (แนะนำ Chrome เท่านั้น)");
      return;
    }

    const rec = new SpeechRecognition();
    rec.lang = "th-TH";
    rec.interimResults = false;
    rec.maxAlternatives = 1;

    rec.onstart = () => {
      setIsListening(true);
      setPulseRing(true);
      setStatus("กำลังฟัง... พูดคำถามได้เลย");
    };

    rec.onend = () => {
      setIsListening(false);
      setPulseRing(false);
      setStatus("หยุดฟังแล้ว");
    };

    rec.onerror = (e: any) => {
      setIsListening(false);
      setPulseRing(false);
      setStatus(`เกิดข้อผิดพลาด: ${e?.error || "unknown"}`);
      setResult({ error: e?.error || "speech error" });
    };

    rec.onresult = async (event: any) => {
      const transcript = event.results?.[0]?.[0]?.transcript || "";
      setStatus("ได้ข้อความแล้ว กำลังส่งไปถามระบบ...");
      setResult({ transcript });

      const resp = await fetch("/api/voice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: transcript }),
      });

      const data: ApiResult = await resp.json();
      setResult(data);
      setStatus(data.error ? "เกิดข้อผิดพลาด" : "เสร็จสิ้น");
    };

    recognitionRef.current = rec;
  }, []);

  function start() {
    setResult({});
    try {
      recognitionRef.current?.start();
    } catch {}
  }

  function stop() {
    recognitionRef.current?.stop();
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Lilita+One&family=Sarabun:wght@400;600&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        body {
          background: #1a0a00;
          font-family: 'Sarabun', sans-serif;
        }

        .wrapper {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #1a0a00;
          padding: 16px;
        }

        .app-frame {
          width: 100%;
          max-width: 900px;
          border-radius: 18px;
          overflow: hidden;
          position: relative;
          background: #fef3d0;
          box-shadow: 0 20px 60px rgba(0,0,0,0.6);
        }

        /* ---- FOOD BORDER DECORATION ---- */
        .food-border {
          position: absolute;
          inset: 0;
          pointer-events: none;
          z-index: 0;
        }

        /* Decorative blobs at corners using radial gradients */
        .food-border::before {
          content: '';
          position: absolute;
          inset: 0;
          background:
            radial-gradient(ellipse 200px 200px at -40px -40px, #e8822060 0%, transparent 70%),
            radial-gradient(ellipse 200px 200px at calc(100% + 40px) -40px, #c0392b50 0%, transparent 70%),
            radial-gradient(ellipse 200px 200px at -40px calc(100% + 40px), #27ae6050 0%, transparent 70%),
            radial-gradient(ellipse 200px 200px at calc(100% + 40px) calc(100% + 40px), #e67e2250 0%, transparent 70%);
          border-radius: 18px;
        }

        /* ---- HEADER ---- */
        .header {
          position: relative;
          z-index: 1;
          text-align: center;
          padding: 28px 24px 16px;
          background: linear-gradient(180deg, #fde8b0 0%, #fef3d0 100%);
        }

        .logo-text {
          font-family: 'Lilita One', cursive;
          font-size: clamp(28px, 5vw, 48px);
          color: #c0392b;
          text-shadow:
            3px 3px 0 #7b1a10,
            -1px -1px 0 #7b1a10,
            1px -1px 0 #7b1a10,
            -1px 1px 0 #7b1a10,
            0 4px 12px rgba(0,0,0,0.3);
          letter-spacing: 1px;
          line-height: 1.1;
        }

        .logo-text span {
          color: #f39c12;
        }

        .tagline {
          margin-top: 6px;
          font-size: 13px;
          color: #8B4513;
          opacity: 0.85;
          font-weight: 600;
        }

        /* ---- MAIN CARD ---- */
        .main-card {
          position: relative;
          z-index: 1;
          margin: 0 24px 24px;
          background: #ffffff;
          border-radius: 14px;
          padding: 24px 28px;
          box-shadow: 0 4px 24px rgba(139,69,19,0.15);
          border: 2px solid #f5c87a;
        }

        /* ---- RESULT AREA ---- */
        .result-box {
          min-height: 160px;
          background: #fafaf8;
          border-radius: 10px;
          padding: 16px;
          border: 1px solid #ede0c0;
          position: relative;
          overflow: hidden;
        }

        .result-box-inner {
          font-size: 15px;
          line-height: 1.7;
          color: #3a2a0a;
        }

        .result-label {
          font-size: 11px;
          font-weight: 600;
          color: #b8822a;
          text-transform: uppercase;
          letter-spacing: 1.5px;
          margin-bottom: 8px;
        }

        .transcript-text {
          color: #555;
          font-size: 14px;
          font-style: italic;
        }

        .answer-text {
          color: #2c1a00;
          font-size: 16px;
          font-weight: 600;
        }

        .placeholder-text {
          color: #c8b89a;
          font-size: 14px;
        }

        /* ---- STATUS BAR ---- */
        .status-bar {
          display: flex;
          align-items: center;
          gap: 8px;
          margin: 14px 0;
          padding: 10px 14px;
          background: linear-gradient(90deg, #fff8ee, #fef3d0);
          border-radius: 8px;
          border-left: 4px solid #f39c12;
        }

        .status-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #2ecc71;
          flex-shrink: 0;
          transition: background 0.3s;
        }

        .status-dot.listening {
          background: #e74c3c;
          animation: blink 0.8s infinite;
        }

        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.2; }
        }

        .status-text {
          font-size: 13px;
          color: #7a5230;
          font-weight: 600;
        }

        /* ---- MIC BUTTON AREA ---- */
        .mic-area {
          display: flex;
          justify-content: flex-end;
          align-items: center;
          gap: 16px;
          margin-top: 6px;
          padding-top: 14px;
          border-top: 1px dashed #e8d5a0;
        }

        .mic-hint {
          font-size: 13px;
          color: #a0845a;
        }

        .mic-btn-wrap {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .mic-btn {
          width: 64px;
          height: 64px;
          border-radius: 50%;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #1a1a1a;
          transition: transform 0.2s, box-shadow 0.2s;
          box-shadow: 0 4px 20px rgba(0,0,0,0.4);
          position: relative;
          z-index: 2;
        }

        .mic-btn:hover {
          transform: scale(1.07);
          box-shadow: 0 6px 28px rgba(0,0,0,0.5);
        }

        .mic-btn.active {
          background: #c0392b;
          box-shadow: 0 4px 20px rgba(192,57,43,0.5);
        }

        .mic-btn svg {
          width: 26px;
          height: 26px;
          fill: white;
        }

        /* Pulse rings when listening */
        .pulse-ring {
          position: absolute;
          width: 64px;
          height: 64px;
          border-radius: 50%;
          border: 2px solid #c0392b;
          opacity: 0;
          animation: none;
          z-index: 1;
        }

        .pulse-ring.active {
          animation: pulse-out 1.5s ease-out infinite;
        }

        .pulse-ring:nth-child(2).active {
          animation-delay: 0.5s;
        }

        .pulse-ring:nth-child(3).active {
          animation-delay: 1s;
        }

        @keyframes pulse-out {
          0% { transform: scale(1); opacity: 0.6; }
          100% { transform: scale(2.2); opacity: 0; }
        }

        /* ---- INPUT FIELD (existing from screenshot) ---- */
        .search-row {
          display: flex;
          justify-content: flex-end;
          margin-bottom: 10px;
        }

        .search-input {
          background: #111;
          color: #fff;
          border: none;
          border-radius: 8px;
          padding: 10px 16px;
          font-size: 14px;
          font-family: 'Sarabun', sans-serif;
          width: 260px;
          outline: none;
        }

        .search-input::placeholder {
          color: #666;
        }

        /* ---- DIVIDER ---- */
        .divider {
          border: none;
          border-top: 1px dashed #e0cfa0;
          margin: 14px 0;
        }

        /* ---- ERROR ---- */
        .error-text {
          color: #c0392b;
          font-size: 13px;
          margin-top: 8px;
        }

        /* Food emoji decorations */
        .food-deco {
          position: absolute;
          font-size: 28px;
          opacity: 0.25;
          pointer-events: none;
          user-select: none;
        }
      `}</style>

      <div className="wrapper">
        <div className="app-frame">
          <div className="food-border" />

          {/* Floating food emojis */}
          <span className="food-deco" style={{ top: 60, left: 10, fontSize: 36, opacity: 0.15 }}>🍜</span>
          <span className="food-deco" style={{ top: 80, right: 12, fontSize: 32, opacity: 0.15 }}>🥘</span>
          <span className="food-deco" style={{ bottom: 40, left: 14, fontSize: 30, opacity: 0.15 }}>🌶️</span>
          <span className="food-deco" style={{ bottom: 50, right: 10, fontSize: 34, opacity: 0.15 }}>🍛</span>

          {/* Header */}
          <div className="header">
            <div className="logo-text">
              UncleSomkid's <span>ThaiStreetFood</span>
            </div>
            <div className="tagline">🌶️ กดแล้วลองพูดเมนูที่ต้องการ 🌶️</div>
          </div>

          {/* Main Card */}
          <div className="main-card">
            {/* Search row (text input as shown in screenshot) */}
            <div className="search-row">
              <input
                className="search-input"
                placeholder="พิมพ์เมนูที่ต้องการ..."
                onKeyDown={async (e) => {
                  if (e.key === "Enter") {
                    const val = (e.target as HTMLInputElement).value.trim();
                    if (!val) return;
                    setStatus("กำลังส่งไปถามระบบ...");
                    setResult({ transcript: val });
                    const resp = await fetch("/api/voice", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ text: val }),
                    });
                    const data: ApiResult = await resp.json();
                    setResult(data);
                    setStatus(data.error ? "เกิดข้อผิดพลาด" : "เสร็จสิ้น");
                  }
                }}
              />
            </div>

            {/* Result box */}
            <div className="result-box">
              {result.transcript && (
                <div style={{ marginBottom: 10 }}>
                  <div className="result-label">ข้อความที่ถอดเสียง</div>
                  <div className="result-box-inner transcript-text">
                    "{result.transcript}"
                  </div>
                </div>
              )}

              {result.answer ? (
                <div>
                  {result.transcript && <hr className="divider" />}
                  <div className="result-label">คำตอบ</div>
                  <div className="result-box-inner answer-text">{result.answer}</div>
                </div>
              ) : !result.transcript ? (
                <div className="placeholder-text">
                  กดปุ่มไมโครโฟนแล้วพูดชื่อเมนู<br />
                  หรือพิมพ์ในช่องค้นหาด้านบน
                </div>
              ) : null}

              {result.error && (
                <div className="error-text">⚠️ {result.error}</div>
              )}
            </div>

            {/* Status + Mic */}
            <div className="status-bar">
              <div className={`status-dot ${isListening ? "listening" : ""}`} />
              <div className="status-text">{status}</div>
            </div>

            <div className="mic-area">
              <div className="mic-hint">
                {isListening ? "กำลังฟัง... กดอีกครั้งเพื่อหยุด" : "กดเพื่อพูด"}
              </div>

              <div className="mic-btn-wrap">
                <div className={`pulse-ring ${pulseRing ? "active" : ""}`} />
                <div className={`pulse-ring ${pulseRing ? "active" : ""}`} />
                <div className={`pulse-ring ${pulseRing ? "active" : ""}`} />

                <button
                  className={`mic-btn ${isListening ? "active" : ""}`}
                  onClick={isListening ? stop : start}
                  aria-label={isListening ? "หยุดฟัง" : "เริ่มฟัง"}
                >
                  {isListening ? (
                    /* Stop icon */
                    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <rect x="6" y="6" width="12" height="12" rx="2" />
                    </svg>
                  ) : (
                    /* Mic icon */
                    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 1a4 4 0 0 1 4 4v6a4 4 0 0 1-8 0V5a4 4 0 0 1 4-4zm-6.5 9.5a.75.75 0 0 1 .75.75 5.75 5.75 0 0 0 11.5 0 .75.75 0 0 1 1.5 0 7.25 7.25 0 0 1-6.5 7.21V21h2.5a.75.75 0 0 1 0 1.5h-6.5a.75.75 0 0 1 0-1.5H11v-2.54A7.25 7.25 0 0 1 4.75 11.25a.75.75 0 0 1 .75-.75z"/>
                    </svg>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}