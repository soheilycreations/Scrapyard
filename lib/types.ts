export type Supplier = {
  id: string;
  name: string;
  phone: string | null;
  created_at: string;
};

export type Item = {
  id: string;
  name: string;
  default_rate: number;
  active: boolean;
  created_at: string;
};

export type Load = {
  id: string;
  load_number: number;
  load_date: string;
  supplier_id: string;
  total_amount: number;
  paid_amount: number;
  balance: number;
  notes: string | null;
  created_at: string;
  suppliers?: Supplier;
  load_items?: LoadItem[];
};

export type LoadItem = {
  id: string;
  load_id: string;
  item_id: string;
  weight: number;
  rate: number;
  subtotal: number;
  items?: Item;
};

export type Stock = {
  item_id: string;
  total_weight: number;
  avg_cost_rate: number;
  updated_at: string;
  items?: Item;
};

export type Expense = {
  id: string;
  expense_date: string;
  category: string;
  amount: number;
  note: string | null;
  created_at: string;
};

export type Sale = {
  id: string;
  sale_number: number;
  sale_date: string;
  buyer_name: string;
  buyer_phone: string | null;
  total_amount: number;
  total_profit: number;
  notes: string | null;
  created_at: string;
  sale_items?: SaleItem[];
};

export type SaleItem = {
  id: string;
  sale_id: string;
  item_id: string;
  weight: number;
  rate: number;
  cost_rate: number;
  subtotal: number;
  profit: number;
  items?: Item;
};
