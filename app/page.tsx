'use client';

import { useState, useEffect, KeyboardEvent } from 'react';

interface ContentItem {
  month: string;
  day: string;
  link: string;
  comment: string;
}

const PASSWORD = 'bulmak';

function reelId(url: string): string | null {
  const m = url.match(/\/reel\/([A-Za-z0-9_-]+)/);
  return m ? m[1] : null;
}

// ─── 비밀번호 화면 ───────────────────────────────────────────
function PasswordGate({ onSuccess }: { onSuccess: () => void }) {
  const [input, setInput] = useState('');
  const [error, setError] = useState(false);
  const [shake, setShake] = useState(false);

  const handleSubmit = () => {
    if (input === PASSWORD) {
      localStorage.setItem('bulmak-auth', 'true');
      onSuccess();
    } else {
      setError(true);
      setShake(true);
      setInput('');
      setTimeout(() => setShake(false), 500);
    }
  };

  const handleKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleSubmit();
  };

  return (
    <div style={styles.gateWrap}>
      <div style={{ ...styles.gateCard, ...(shake ? styles.shake : {}) }}>
        <div style={styles.gateLogoWrap}>
          <div style={styles.gateLogoIcon}>
            <span style={styles.gateLogoText}>불</span>
          </div>
          <h1 style={styles.gateTitle}>
            불막열삼<br />점주님용 레퍼런스 사이트
          </h1>
        </div>

        <div style={{ marginBottom: '12px' }}>
          <input
            type="password"
            value={input}
            onChange={(e) => { setInput(e.target.value); setError(false); }}
            onKeyDown={handleKey}
            placeholder="비밀번호를 입력하세요"
            style={styles.gateInput}
            autoFocus
          />
          {error && (
            <p style={styles.gateError}>비밀번호가 올바르지 않습니다.</p>
          )}
        </div>

        <button onClick={handleSubmit} style={styles.gateButton}>
          입장하기
        </button>
      </div>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-8px); }
          40% { transform: translateX(8px); }
          60% { transform: translateX(-8px); }
          80% { transform: translateX(8px); }
        }
        .shake-anim { animation: shake 0.4s ease; }
      `}</style>
    </div>
  );
}

// ─── 대시보드 ────────────────────────────────────────────────
function Dashboard() {
  const [data, setData] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/data')
      .then((r) => r.json())
      .then((json) => {
        if (Array.isArray(json)) setData(json);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // 현재 월 자동 선택 (최초 로드 시)
  useEffect(() => {
    if (data.length > 0 && selectedMonth === null) {
      const nowMonth = String(new Date().getMonth() + 1);
      const hasCurrentMonth = data.some((d) => d.month === nowMonth);
      if (hasCurrentMonth) setSelectedMonth(nowMonth);
    }
  }, [data]);

  const months = Array.from(new Set(data.map((d) => d.month)))
    .filter(Boolean)
    .sort((a, b) => Number(a) - Number(b));

  const filtered = selectedMonth
    ? data.filter((item) => item.month === selectedMonth)
    : data;

  return (
    <div style={{ minHeight: '100vh', background: '#f0f0f0' }}>
      {/* 헤더 */}
      <header style={styles.header}>
        <h1 style={styles.headerTitle}>불막열삼 레퍼런스</h1>
        <p style={styles.headerSub}>점주님을 위한 월별 마케팅 컨텐츠 모음</p>
      </header>

      {/* 필터 바 */}
      <div style={styles.filterWrap}>
        <div style={styles.filterInner}>
          <button
            onClick={() => setSelectedMonth(null)}
            style={{
              ...styles.filterBtn,
              ...(selectedMonth === null ? styles.filterBtnActive : {}),
            }}
          >
            전체 <span style={{ opacity: 0.6 }}>{data.length}</span>
          </button>
          {months.map((m) => {
            const cnt = data.filter((d) => d.month === m).length;
            return (
              <button
                key={m}
                onClick={() => setSelectedMonth(m)}
                style={{
                  ...styles.filterBtn,
                  ...(selectedMonth === m ? styles.filterBtnActive : {}),
                }}
              >
                {m}월 <span style={{ opacity: 0.6 }}>{cnt}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 통계 */}
      {!loading && (
        <p style={styles.stats}>{filtered.length}개의 레퍼런스</p>
      )}

      {/* 카드 그리드 */}
      <div style={styles.grid}>
        {loading ? (
          <div style={styles.empty}>
            <div style={styles.spinner} />
            데이터를 불러오는 중...
          </div>
        ) : filtered.length === 0 ? (
          <div style={styles.empty}>
            {selectedMonth
              ? `${selectedMonth}월 등록된 레퍼런스가 없습니다.`
              : '등록된 레퍼런스가 없습니다.'}
          </div>
        ) : (
          filtered.map((item, idx) => {
            const id = reelId(item.link);
            const embedSrc = id
              ? `https://www.instagram.com/reel/${id}/embed/`
              : null;

            return (
              <div key={idx} style={styles.card} className="ref-card">
                {embedSrc && (
                  <div style={styles.embedWrap} className="embed-wrap">
                    <iframe
                      src={embedSrc}
                      scrolling="no"
                      allowFullScreen
                      loading="lazy"
                      style={styles.iframe}
                    />
                  </div>
                )}
                <div style={styles.cardBody}>
                  <div style={styles.cardDate}>
                    {item.month}월 {item.day}일
                  </div>
                  <div style={styles.cardDesc}>
                    {item.comment || '-'}
                  </div>
                  <a
                    href={item.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={styles.cardLink}
                    className="card-link"
                  >
                    <svg
                      width="13"
                      height="13"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      style={{ flexShrink: 0 }}
                    >
                      <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" />
                      <polyline points="15 3 21 3 21 9" />
                      <line x1="10" y1="14" x2="21" y2="3" />
                    </svg>
                    인스타그램에서 보기
                  </a>
                </div>
              </div>
            );
          })
        )}
      </div>

      <style>{`
        .ref-card {
          transition: transform 0.15s, box-shadow 0.15s;
        }
        .ref-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 8px 24px rgba(0,0,0,0.11) !important;
        }
        .embed-wrap::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(90deg, #f0f0f0 25%, #e8e8e8 50%, #f0f0f0 75%);
          background-size: 200% 100%;
          animation: shimmer 1.4s infinite;
          z-index: 0;
        }
        .embed-wrap iframe { position: relative; z-index: 1; }
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        .card-link:hover { color: #111 !important; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (max-width: 600px) {
          .ref-grid { padding: 14px !important; gap: 14px !important; grid-template-columns: 1fr !important; }
          .embed-wrap iframe { height: 420px !important; }
        }
      `}</style>
    </div>
  );
}

// ─── 스타일 객체 ──────────────────────────────────────────────
const styles: Record<string, React.CSSProperties> = {
  // Gate
  gateWrap: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#f0f0f0',
  },
  gateCard: {
    background: '#fff',
    borderRadius: '16px',
    boxShadow: '0 2px 16px rgba(0,0,0,0.08)',
    padding: '40px 36px',
    width: '100%',
    maxWidth: '380px',
    textAlign: 'center',
  },
  shake: {},
  gateLogoWrap: {
    marginBottom: '28px',
  },
  gateLogoIcon: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '56px',
    height: '56px',
    borderRadius: '50%',
    background: '#111',
    marginBottom: '14px',
  },
  gateLogoText: {
    color: '#fff',
    fontSize: '22px',
    fontWeight: '700',
  },
  gateTitle: {
    fontSize: '1.1rem',
    fontWeight: '700',
    color: '#1a1a1a',
    lineHeight: '1.5',
  },
  gateInput: {
    width: '100%',
    border: '1.5px solid #ddd',
    borderRadius: '10px',
    padding: '14px 16px',
    fontSize: '1rem',
    textAlign: 'center',
    outline: 'none',
    transition: 'border-color 0.15s',
  },
  gateError: {
    marginTop: '8px',
    color: '#e53e3e',
    fontSize: '0.82rem',
    fontWeight: '500',
  },
  gateButton: {
    width: '100%',
    padding: '14px',
    borderRadius: '10px',
    background: '#111',
    color: '#fff',
    fontSize: '1rem',
    fontWeight: '700',
    border: 'none',
    cursor: 'pointer',
    transition: 'opacity 0.15s',
  },
  // Dashboard
  header: {
    background: '#111',
    color: '#fff',
    padding: '28px 24px 24px',
    textAlign: 'center',
  },
  headerTitle: {
    fontSize: '1.4rem',
    fontWeight: '700',
    letterSpacing: '-0.02em',
  },
  headerSub: {
    fontSize: '0.82rem',
    color: 'rgba(255,255,255,0.5)',
    marginTop: '6px',
  },
  filterWrap: {
    background: '#fff',
    borderBottom: '1px solid #e0e0e0',
    padding: '14px 20px',
    position: 'sticky',
    top: 0,
    zIndex: 100,
    overflowX: 'auto',
    WebkitOverflowScrolling: 'touch',
  } as React.CSSProperties,
  filterInner: {
    display: 'flex',
    gap: '8px',
    justifyContent: 'center',
    flexWrap: 'wrap',
    maxWidth: '900px',
    margin: '0 auto',
  } as React.CSSProperties,
  filterBtn: {
    padding: '7px 18px',
    borderRadius: '100px',
    border: '1.5px solid #ddd',
    background: '#fff',
    fontSize: '0.83rem',
    fontWeight: '500',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    transition: 'all 0.15s',
    color: '#444',
  } as React.CSSProperties,
  filterBtnActive: {
    background: '#111',
    color: '#fff',
    borderColor: '#111',
  },
  stats: {
    textAlign: 'center',
    fontSize: '0.78rem',
    color: '#999',
    padding: '14px 20px 0',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '20px',
    padding: '20px',
    maxWidth: '1400px',
    margin: '0 auto',
  } as React.CSSProperties,
  card: {
    background: '#fff',
    borderRadius: '14px',
    overflow: 'hidden',
    boxShadow: '0 1px 4px rgba(0,0,0,0.07)',
  },
  embedWrap: {
    position: 'relative',
    width: '100%',
    background: '#fafafa',
    overflow: 'hidden',
  } as React.CSSProperties,
  iframe: {
    display: 'block',
    width: '100%',
    height: '480px',
    border: 'none',
  },
  cardBody: {
    padding: '16px',
    borderTop: '1px solid #f0f0f0',
  },
  cardDate: {
    fontSize: '0.72rem',
    color: '#aaa',
    marginBottom: '8px',
    fontWeight: '500',
  },
  cardDesc: {
    fontSize: '0.875rem',
    lineHeight: '1.65',
    color: '#2a2a2a',
  },
  cardLink: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '5px',
    marginTop: '12px',
    fontSize: '0.78rem',
    color: '#888',
    textDecoration: 'none',
    fontWeight: '500',
  } as React.CSSProperties,
  empty: {
    gridColumn: '1 / -1',
    textAlign: 'center',
    padding: '80px 20px',
    color: '#aaa',
    fontSize: '0.9rem',
  } as React.CSSProperties,
  spinner: {
    width: '28px',
    height: '28px',
    border: '2.5px solid #ddd',
    borderTopColor: '#555',
    borderRadius: '50%',
    animation: 'spin 0.7s linear infinite',
    margin: '0 auto 12px',
  },
};

// ─── 메인 페이지 ─────────────────────────────────────────────
export default function Home() {
  const [isAuth, setIsAuth] = useState<boolean | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('bulmak-auth');
    setIsAuth(saved === 'true');
  }, []);

  if (isAuth === null) return null;

  if (!isAuth) {
    return <PasswordGate onSuccess={() => setIsAuth(true)} />;
  }

  return <Dashboard />;
}
