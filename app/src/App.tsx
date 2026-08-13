import { HashRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import OnTap from "./pages/OnTap";
import LuyenCauSai from "./pages/LuyenCauSai";
import ThiThu from "./pages/ThiThu";
import ThiThuLamBai from "./pages/ThiThuLamBai";
import KetQua from "./pages/KetQua";

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/on-tap" element={<OnTap />} />
          <Route path="/luyen-cau-sai" element={<LuyenCauSai />} />
          <Route path="/thi-thu" element={<ThiThu />} />
          <Route path="/thi-thu/lam-bai" element={<ThiThuLamBai />} />
          <Route path="/thi-thu/ket-qua/:id" element={<KetQua />} />
        </Route>
      </Routes>
    </HashRouter>
  );
}
