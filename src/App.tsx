import { Route, Routes } from 'react-router-dom';
import { AppLayout } from '@ui/components/layout/AppLayout';
import { DashboardPage } from '@ui/pages/DashboardPage';
import { ConverterPage } from '@ui/pages/ConverterPage';
import { PercentagePage } from '@ui/pages/PercentagePage';
import { DiscountPage } from '@ui/pages/DiscountPage';
import { SavingsPage } from '@ui/pages/SavingsPage';
import { CalculatorPage } from '@ui/pages/CalculatorPage';
import { NotFoundPage } from '@ui/pages/NotFoundPage';

export default function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<DashboardPage />} />
        <Route path="conversor" element={<ConverterPage />} />
        <Route path="porcentajes" element={<PercentagePage />} />
        <Route path="descuentos" element={<DiscountPage />} />
        <Route path="ahorro" element={<SavingsPage />} />
        <Route path="calculadora" element={<CalculatorPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
