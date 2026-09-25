import { FetchExchangeRateApi } from '@infrastructure/http/FetchExchangeRateApi';
import { LocalStorageRateCache } from '@infrastructure/storage/LocalStorageRateCache';
import { LocalStorageCalculatorHistory } from '@infrastructure/storage/LocalStorageCalculatorHistory';
import { LocalStorageAdderEntries } from '@infrastructure/storage/LocalStorageAdderEntries';

import { RefreshExchangeRatesUseCase } from '@core/currency/application/RefreshExchangeRatesUseCase';
import { ConvertCurrencyUseCase } from '@core/currency/application/ConvertCurrencyUseCase';
import { CalculatePercentageUseCase } from '@core/percentage/application/PercentageUseCases';
import { CalculateDiscountUseCase } from '@core/discount/application/CalculateDiscountUseCase';
import { CalculateSavingsPlanUseCase } from '@core/savings/application/CalculateSavingsPlanUseCase';
import { CalculatorHistoryUseCase } from '@core/calculator/application/CalculatorHistoryUseCase';
import { CalculatorEngine } from '@core/calculator/domain/CalculatorEngine';
import { RecordAdderEntryUseCase } from '@core/adder/application/RecordAdderEntryUseCase';
import { AdderSessionUseCase } from '@core/adder/application/AdderSessionUseCase';

/**
 * Raíz de composición (composition root).
 *
 * Este es el ÚNICO archivo de todo el proyecto donde se instancian
 * adaptadores concretos (infraestructura) y se inyectan en los casos de
 * uso (aplicación). La UI (componentes, hooks) solo importa desde aquí y
 * nunca desde `@infrastructure/*` directamente, cumpliendo el Principio
 * de Inversión de Dependencias: las capas internas no conocen las
 * externas, y las externas se "enchufan" en un único punto.
 *
 * Sustituir la API de tasas (por ejemplo, a otro proveedor) o cambiar
 * `localStorage` por IndexedDB solo requiere tocar este archivo.
 */
function buildContainer() {
  // --- Adaptadores (infraestructura) ---
  const exchangeRateApi = new FetchExchangeRateApi();
  const rateCache = new LocalStorageRateCache();
  const calculatorHistoryRepository = new LocalStorageCalculatorHistory();
  const adderEntriesRepository = new LocalStorageAdderEntries();

  // --- Casos de uso (aplicación) ---
  const refreshExchangeRates = new RefreshExchangeRatesUseCase(exchangeRateApi, rateCache);
  const convertCurrency = new ConvertCurrencyUseCase();
  const calculatePercentage = new CalculatePercentageUseCase();
  const calculateDiscount = new CalculateDiscountUseCase();
  const calculateSavingsPlan = new CalculateSavingsPlanUseCase();
  const calculatorHistory = new CalculatorHistoryUseCase(calculatorHistoryRepository);
  const calculatorEngine = new CalculatorEngine();
  const recordAdderEntry = new RecordAdderEntryUseCase();
  const adderSession = new AdderSessionUseCase(adderEntriesRepository);

  return {
    refreshExchangeRates,
    convertCurrency,
    calculatePercentage,
    calculateDiscount,
    calculateSavingsPlan,
    calculatorHistory,
    calculatorEngine,
    recordAdderEntry,
    adderSession,
  };
}

export type AppContainer = ReturnType<typeof buildContainer>;

/** Instancia única compartida por toda la aplicación (no hay estado por request en un SPA). */
export const container: AppContainer = buildContainer();