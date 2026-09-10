import { useMemo, useState } from 'react';
import { Tag } from 'lucide-react';
import { Card } from '@ui/components/ui/Card';
import { Input } from '@ui/components/ui/Input';
import { Dropdown } from '@ui/components/ui/Dropdown';
import { ToggleSwitch } from '@ui/components/ui/ToggleSwitch';
import { EmptyState } from '@ui/components/ui/EmptyState';
import { container } from '@composition/container';
import { SUPPORTED_CURRENCIES } from '@core/currency/domain/Currency';
import { Money } from '@core/shared/Money';

const CURRENCY_OPTIONS = SUPPORTED_CURRENCIES.map((currency) => ({
  value: currency.code,
  label: `${currency.code}`,
  icon: currency.flag,
}));

/** Calculadora de descuentos con impuesto opcional y desglose paso a paso. */
export function DiscountPage() {
  const [price, setPrice] = useState('80');
  const [discount, setDiscount] = useState('25');
  const [tax, setTax] = useState('16');
  const [taxEnabled, setTaxEnabled] = useState(true);
  const [currency, setCurrency] = useState('USD');

  const outcome = useMemo(() => {
    return container.calculateDiscount.execute({
      originalPrice: parseFloat(price.replace(',', '.')) || 0,
      discountPercentage: parseFloat(discount.replace(',', '.')) || 0,
      taxPercentage: parseFloat(tax.replace(',', '.')) || 0,
      taxEnabled,
      currency,
    });
  }, [price, discount, tax, taxEnabled, currency]);

  const money = (amount: number) => Money.of(amount, currency).format();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-ink">Calculadora de descuentos</h1>
        <p className="mt-1 text-muted">Aplica un descuento y, si quieres, un impuesto sobre el subtotal.</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.1fr_1fr]">
        <Card className="flex flex-col gap-5">
          <Dropdown label="Moneda" options={CURRENCY_OPTIONS} value={currency} onChange={setCurrency} />
          <Input
            label="Precio original"
            inputMode="decimal"
            value={price}
            onChange={(event) => setPrice(event.target.value)}
          />
          <Input
            label="Descuento"
            inputMode="decimal"
            suffix="%"
            value={discount}
            onChange={(event) => setDiscount(event.target.value)}
          />
          <ToggleSwitch checked={taxEnabled} onChange={setTaxEnabled} label="Aplicar impuesto" />
          {taxEnabled && (
            <Input
              label="Impuesto (IVA)"
              inputMode="decimal"
              suffix="%"
              value={tax}
              onChange={(event) => setTax(event.target.value)}
            />
          )}
        </Card>

        <Card>
          {outcome.ok ? (
            <div key={outcome.value.total} className="flex animate-fade-slide-up flex-col gap-3">
              <Row label="Precio original" value={money(outcome.value.originalPrice)} />
              <Row
                label={`Descuento ${outcome.value.discountPercentage}%`}
                value={`-${money(outcome.value.discountAmount)}`}
                tone="danger"
              />
              <div className="h-px bg-border" />
              <Row label="Subtotal" value={money(outcome.value.subtotal)} />
              {taxEnabled && (
                <Row label={`IVA ${outcome.value.taxPercentage}%`} value={money(outcome.value.taxAmount)} />
              )}
              <div className="h-px bg-border" />
              <Row label="TOTAL" value={money(outcome.value.total)} emphasis />

              <div className="mt-2 rounded-xl bg-brand-50 px-4 py-3 text-sm font-semibold text-brand-600 dark:bg-brand-500/15 dark:text-brand-400">
                Ahorras {money(outcome.value.savedAmount)}
              </div>
            </div>
          ) : (
            <EmptyState icon={Tag} title="Revisa los datos" description={outcome.error} />
          )}
        </Card>
      </div>
    </div>
  );
}

function Row({
  label,
  value,
  tone,
  emphasis,
}: {
  label: string;
  value: string;
  tone?: 'danger';
  emphasis?: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className={emphasis ? 'font-bold text-ink' : 'text-sm text-muted'}>{label}</span>
      <span
        className={
          emphasis
            ? 'text-xl font-extrabold text-ink'
            : tone === 'danger'
              ? 'font-semibold text-danger'
              : 'font-semibold text-ink'
        }
      >
        {value}
      </span>
    </div>
  );
}