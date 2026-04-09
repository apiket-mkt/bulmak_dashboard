'use client';

import { useState, useEffect, KeyboardEvent } from 'react';

interface ContentItem {
  month: string;
  day: string;
  link: string;
  comment: string;
}

const MONTHS = ['4', '5', '6', '7', '8', '9', '10', '11', '12'];
const ITEMS_PER_PAGE = 10;
const PASSWORD = 'bulmak';

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
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#f0f2f5]">
      <div
        className={`bg-white rounded-2xl shadow-lg p-10 w-full max-w-sm text-center ${
          shake ? 'animate-shake' : ''
        }`}
        style={{ maxWidth: '400px' }}
      >
        {/* 로고/타이틀 */}
        <div className="mb-8">
          <div
            className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4"
            style={{ backgroundColor: '#1a365d' }}
          >
            <span className="text-white text-2xl font-bold">불</span>
          </div>
          <h1 className="text-xl font-bold text-gray-800 leading-tight">
            불막열삼
            <br />
            점주님용 레퍼런스 사이트
          </h1>
        </div>

        {/* 입력 */}
        <div className="mb-4">
          <input
            type="password"
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              setError(false);
            }}
            onKeyDown={handleKey}
            placeholder="비밀번호를 입력하세요"
            className="w-full border-2 border-gray-200 rounded-xl px-4 py-4 text-lg text-center focus:outline-none focus:border-[#1a365d] transition-colors"
            autoFocus
          />
          {error && (
            <p className="mt-2 text-red-500 text-sm font-medium">
              비밀번호가 올바르지 않습니다.
            </p>
          )}
        </div>

        <button
          onClick={handleSubmit}
          className="w-full py-4 rounded-xl text-white text-lg font-bold transition-opacity hover:opacity-90 active:opacity-80"
          style={{ backgroundColor: '#1a365d' }}
        >
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
        .animate-shake { animation: shake 0.4s ease; }
      `}</style>
    </div>
  );
}

// ─── 대시보드 ────────────────────────────────────────────────
function Dashboard() {
  const [data, setData] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetch('/api/data')
      .then((r) => r.json())
      .then((json) => {
        if (Array.isArray(json)) setData(json);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const filtered = selectedMonth
    ? data.filter((item) => item.month === selectedMonth)
    : data;

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const paginated = filtered.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleMonthSelect = (month: string | null) => {
    setSelectedMonth(month);
    setCurrentPage(1);
  };

  // 현재 월 자동 선택 (최초 로드 시)
  useEffect(() => {
    if (data.length > 0 && selectedMonth === null) {
      const nowMonth = String(new Date().getMonth() + 1);
      const hasCurrentMonth = data.some((d) => d.month === nowMonth);
      if (hasCurrentMonth) setSelectedMonth(nowMonth);
    }
  }, [data]);

  return (
    <div className="min-h-screen bg-[#f0f2f5]">
      {/* 헤더 */}
      <header style={{ backgroundColor: '#1a365d' }} className="shadow-md">
        <div className="max-w-4xl mx-auto px-4 py-5">
          <h1 className="text-white text-2xl font-bold text-center tracking-tight">
            불막열삼 점주님용 레퍼런스 사이트
          </h1>
          <p className="text-blue-200 text-center text-sm mt-1">
            참고할 만한 마케팅 컨텐츠 모음
          </p>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6">
        {/* 월별 필터 */}
        <div className="bg-white rounded-2xl shadow-sm p-4 mb-6">
          <p className="text-gray-500 text-sm font-medium mb-3">월별 보기</p>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleMonthSelect(null)}
              className={`px-4 py-2 rounded-xl text-base font-semibold transition-all ${
                selectedMonth === null
                  ? 'text-white shadow-sm'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              style={selectedMonth === null ? { backgroundColor: '#1a365d' } : {}}
            >
              전체
            </button>
            {MONTHS.map((m) => (
              <button
                key={m}
                onClick={() => handleMonthSelect(m)}
                className={`px-4 py-2 rounded-xl text-base font-semibold transition-all ${
                  selectedMonth === m
                    ? 'text-white shadow-sm'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
                style={selectedMonth === m ? { backgroundColor: '#1a365d' } : {}}
              >
                {m}월
              </button>
            ))}
          </div>
        </div>

        {/* 컨텐츠 목록 */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden mb-6">
          {loading ? (
            <div className="py-20 text-center">
              <div
                className="inline-block w-10 h-10 border-4 border-t-transparent rounded-full animate-spin mb-3"
                style={{ borderColor: '#1a365d', borderTopColor: 'transparent' }}
              />
              <p className="text-gray-500 text-lg">데이터를 불러오는 중...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-20 text-center text-gray-400 text-lg">
              {selectedMonth ? `${selectedMonth}월 등록된 컨텐츠가 없습니다.` : '등록된 컨텐츠가 없습니다.'}
            </div>
          ) : (
            <>
              {/* 목록 헤더 */}
              <div
                className="grid px-5 py-3 text-sm font-semibold text-white"
                style={{
                  backgroundColor: '#2d4a7a',
                  gridTemplateColumns: '60px 1fr 2fr',
                }}
              >
                <span>날짜</span>
                <span>코멘트</span>
                <span>링크</span>
              </div>

              {/* 목록 아이템 */}
              {paginated.map((item, idx) => (
                <div
                  key={idx}
                  className={`grid px-5 py-4 items-start gap-3 border-b border-gray-100 hover:bg-blue-50 transition-colors ${
                    idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
                  }`}
                  style={{ gridTemplateColumns: '60px 1fr 2fr' }}
                >
                  {/* 날짜 */}
                  <div className="text-center">
                    <span
                      className="inline-block text-white text-sm font-bold px-2 py-1 rounded-lg"
                      style={{ backgroundColor: '#1a365d' }}
                    >
                      {item.month}/{item.day}
                    </span>
                  </div>

                  {/* 코멘트 */}
                  <p className="text-gray-700 text-base leading-relaxed break-keep">
                    {item.comment || '-'}
                  </p>

                  {/* 링크 */}
                  <a
                    href={item.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-base font-medium break-all hover:underline flex items-center gap-1"
                    style={{ color: '#1a56db' }}
                    title={item.link}
                  >
                    <svg
                      className="flex-shrink-0 w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                      />
                    </svg>
                    <span className="line-clamp-2">{item.link}</span>
                  </a>
                </div>
              ))}
            </>
          )}
        </div>

        {/* 페이지네이션 */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mb-6">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="w-11 h-11 rounded-xl border-2 border-gray-200 flex items-center justify-center text-gray-600 disabled:opacity-30 hover:border-[#1a365d] hover:text-[#1a365d] transition-colors font-bold text-lg"
            >
              ‹
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`w-11 h-11 rounded-xl font-semibold text-base transition-all ${
                  currentPage === page
                    ? 'text-white shadow-sm'
                    : 'border-2 border-gray-200 text-gray-600 hover:border-[#1a365d] hover:text-[#1a365d]'
                }`}
                style={currentPage === page ? { backgroundColor: '#1a365d' } : {}}
              >
                {page}
              </button>
            ))}

            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="w-11 h-11 rounded-xl border-2 border-gray-200 flex items-center justify-center text-gray-600 disabled:opacity-30 hover:border-[#1a365d] hover:text-[#1a365d] transition-colors font-bold text-lg"
            >
              ›
            </button>
          </div>
        )}

        {/* 결과 요약 */}
        {!loading && filtered.length > 0 && (
          <p className="text-center text-gray-400 text-sm pb-6">
            총 {filtered.length}개 • {currentPage}/{totalPages} 페이지
          </p>
        )}
      </main>
    </div>
  );
}

// ─── 메인 페이지 ─────────────────────────────────────────────
export default function Home() {
  const [isAuth, setIsAuth] = useState<boolean | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('bulmak-auth');
    setIsAuth(saved === 'true');
  }, []);

  // 첫 렌더링 전 (하이드레이션 방지)
  if (isAuth === null) return null;

  if (!isAuth) {
    return <PasswordGate onSuccess={() => setIsAuth(true)} />;
  }

  return <Dashboard />;
}
