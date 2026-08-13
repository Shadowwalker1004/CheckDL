import { NavLink, Outlet } from "react-router-dom";

const NAV = [
  { to: "/", label: "Trang chủ", end: true },
  { to: "/on-tap", label: "Ôn tập" },
  { to: "/luyen-cau-sai", label: "Luyện câu sai" },
  { to: "/thi-thu", label: "Thi thử" },
];

export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-line bg-card/70 backdrop-blur sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
          <NavLink to="/" className="font-serif text-lg font-semibold text-ink shrink-0">
            Điều lệnh CAND
          </NavLink>
          <nav className="grid grid-cols-4 gap-1 text-xs sm:flex sm:text-sm">
            {NAV.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `rounded-full px-2 py-1.5 text-center leading-tight transition-colors sm:whitespace-nowrap sm:px-3 ${
                    isActive
                      ? "bg-pine text-white"
                      : "text-ink-soft hover:bg-pine-soft"
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>
      <main className="flex-1 w-full max-w-3xl mx-auto px-4 py-6">
        <Outlet />
      </main>
      <footer className="text-center text-xs text-ink-faint py-6">
        Tài liệu ôn tập cá nhân · dữ liệu lưu trên trình duyệt của bạn
      </footer>
    </div>
  );
}
