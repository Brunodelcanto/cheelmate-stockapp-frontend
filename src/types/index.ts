export type UserRole = 'admin' | 'vendedor'

export interface User {
    _id: string;
    name: string;
    email: string;
    password: string;
}

export interface Category {
    _id: string;
    name: string;
    isActive: boolean;
}

export interface Color {
    _id: string;
    name: string;
    hex: string;
    isActive: boolean;
}

export interface ColorVariant {
    _id: string;
    color: string | Color;
    amount: number;
    priceCost: number;
    priceSell: number;
}

export interface Product {
    _id: string;
    name: string;
    category: string | Category;
    variants: ColorVariant[];
    minStockAlert: number;
    image: {
        url: string;
        public_id: string;
    };
    totalProfit?: number;
}

export interface SaleItem {
    productId: string;
    variantId: string;
    name: string;
    quantity: number;
    priceAtSale: number;
    priceCostAtSale: number;
}

export interface Sale {
    _id: string;
    items: SaleItem[];
    totalAmount: number;
    totalProfit: number;
    comment?: string;
    createdAt: string;
}

export interface CartItem {
    productId: string;
    variantId: string;
    name: string;
    quantity: number;
    price: number;
    maxStock: number;
}
    