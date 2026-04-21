export interface UserSettings {
  baseSalary: number;
  salesTarget: number;
  cityTravelBonus: number;
  commissionPerSale: number;
  bonusEAD15: number;
  bonusTotal25: number;
  bonusTotal35: number;
  cities: {
    Londrina: boolean;
    Curitiba: boolean;
    Maringá: boolean;
    Toledo: boolean;
  };
  enableBonusEAD15: boolean;
  enableBonusTotal25: boolean;
  enableBonusTotal35: boolean;
  name: string;
  photoURL: string;
}

export type SaleType = 'Presencial' | 'EAD';
export type SaleStatus = 'Pendente' | 'Pago';

export interface Sale {
  id: string;
  clientName: string;
  city: string;
  type: SaleType;
  status: SaleStatus;
  createdAt: any;
  userId: string;
}

export const DEFAULT_SETTINGS: UserSettings = {
  baseSalary: 1600,
  salesTarget: 40,
  cityTravelBonus: 400,
  commissionPerSale: 150,
  bonusEAD15: 300,
  bonusTotal25: 400,
  bonusTotal35: 600,
  cities: {
    Londrina: false,
    Curitiba: false,
    Maringá: false,
    Toledo: false,
  },
  enableBonusEAD15: true,
  enableBonusTotal25: true,
  enableBonusTotal35: true,
  name: 'Seu Nome',
  photoURL: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sales',
};
