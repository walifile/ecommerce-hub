export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      ai_generations: {
        Row: {
          created_at: string;
          faq: Json;
          id: string;
          long_description: string | null;
          meta_description: string | null;
          meta_title: string | null;
          product_name: string;
          product_title: string | null;
          short_description: string | null;
        };
      };
      categories: {
        Row: {
          created_at: string;
          description: string | null;
          id: string;
          image_url: string | null;
          name: string;
          slug: string;
        };
      };
      customers: {
        Row: {
          address: string | null;
          city: string | null;
          created_at: string;
          email: string | null;
          id: string;
          lifetime_value: number;
          name: string;
          phone: string | null;
          total_orders: number;
          total_revenue: number;
        };
      };
      expenses: {
        Row: {
          amount: number;
          created_at: string;
          expense_date: string;
          expense_type: string;
          id: string;
          title: string;
        };
      };
      order_items: {
        Row: {
          id: string;
          order_id: string;
          product_cost: number;
          product_id: string | null;
          product_name: string;
          quantity: number;
          unit_price: number;
        };
      };
      orders: {
        Row: {
          ad_cost: number;
          created_at: string;
          customer_id: string | null;
          discount_amount: number;
          id: string;
          notes: string | null;
          order_number: string;
          payment_method: string;
          revenue: number;
          shipping_cost: number;
          status: string;
          total: number;
        };
      };
      product_images: {
        Row: {
          id: string;
          image_url: string;
          product_id: string;
          sort_order: number;
        };
      };
      products: {
        Row: {
          best_seller: boolean;
          category_id: string | null;
          compare_price: number | null;
          cost_price: number;
          created_at: string;
          description: string | null;
          featured: boolean;
          id: string;
          image_url: string | null;
          is_new: boolean;
          low_stock_limit: number;
          meta_description: string | null;
          meta_title: string | null;
          name: string;
          rating: number;
          reviews_count: number;
          selling_price: number;
          short_description: string | null;
          sku: string;
          slug: string;
          specifications: Json;
          status: string;
          stock_quantity: number;
        };
      };
      settings: {
        Row: {
          created_at: string;
          hero_subtitle: string | null;
          hero_title: string | null;
          id: string;
          store_name: string;
          support_email: string | null;
          support_phone: string | null;
          whatsapp_template_order_confirmed: string | null;
          whatsapp_template_order_created: string | null;
          whatsapp_template_order_delivered: string | null;
          whatsapp_template_order_shipped: string | null;
        };
      };
      whatsapp_logs: {
        Row: {
          created_at: string;
          id: string;
          order_id: string | null;
          phone: string | null;
          sent_at: string | null;
          status: string;
          template_name: string;
        };
      };
    };
  };
};
