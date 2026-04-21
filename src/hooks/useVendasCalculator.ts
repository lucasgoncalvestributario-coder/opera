import { useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';

export function useVendasCalculator() {
  const { settings, sales } = useAuth();

  const stats = useMemo(() => {
    const totalSales = sales.length;
    const paidSales = sales.filter(s => s.status === 'Pago').length;
    const pendingSales = sales.filter(s => s.status === 'Pendente').length;
    
    // City bonuses
    const activeCitiesCount = Object.values(settings.cities).filter(Boolean).length;
    const cityBonusesTotal = activeCitiesCount * settings.cityTravelBonus;

    // Commission logic: A partir da 11ª venda, cada nova venda adiciona R$150 ao salário
    const commissionSalesCount = Math.max(0, totalSales - 10);
    const commissionsTotal = commissionSalesCount * settings.commissionPerSale;

    // Bonus logic
    const eadSalesCount = sales.filter(s => s.type === 'EAD').length;
    let autoBonuses = 0;

    const hasEAD15Bonus = settings.enableBonusEAD15 && eadSalesCount >= 15;
    const hasTotal25Bonus = settings.enableBonusTotal25 && totalSales >= 25;
    const hasTotal35Bonus = settings.enableBonusTotal35 && totalSales >= 35;

    if (hasEAD15Bonus) autoBonuses += settings.bonusEAD15;
    if (hasTotal25Bonus) autoBonuses += settings.bonusTotal25;
    if (hasTotal35Bonus) autoBonuses += settings.bonusTotal35;

    const totalSalary = settings.baseSalary + cityBonusesTotal + commissionsTotal + autoBonuses;

    const progress = Math.min(100, (totalSales / settings.salesTarget) * 100);
    const missingSales = Math.max(0, settings.salesTarget - totalSales);

    // Projection
    // Estimativa de ganhos no mês mantendo o ritmo atual
    // Simples: se hoje é dia X do mês, projetar para 30 dias.
    // Para simplificar como pedido: apenas estatísticas visuais baseadas na meta.
    const projections = {
       attainable: progress,
       estimatedEnd: totalSalary * (1 + (missingSales / settings.salesTarget)) // Rough projection if they hit target
    };

    return {
      totalSales,
      paidSales,
      pendingSales,
      cityBonusesTotal,
      commissionsTotal,
      autoBonuses,
      totalSalary,
      progress,
      missingSales,
      activeCitiesCount,
      eadSalesCount,
      hasEAD15Bonus,
      hasTotal25Bonus,
      hasTotal35Bonus,
      projections
    };
  }, [settings, sales]);

  return stats;
}
