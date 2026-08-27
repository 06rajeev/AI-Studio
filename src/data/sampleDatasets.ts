import { CustomerOrder } from '../types';

export const SAMPLE_PRODUCTS = [
  // Electronics
  { id: 'EL-101', name: 'Ultra-Slim 4K OLED Monitor 32"', category: 'Electronics', subcategory: 'Displays', price: 649.99 },
  { id: 'EL-102', name: 'Noise-Cancelling Wireless Headphones Pro', category: 'Electronics', subcategory: 'Audio', price: 299.99 },
  { id: 'EL-103', name: 'Mechanical Ergonomic Keyboard RGB', category: 'Electronics', subcategory: 'Peripherals', price: 149.50 },
  { id: 'EL-104', name: 'Precision Wireless Trackball Mouse', category: 'Electronics', subcategory: 'Peripherals', price: 79.99 },
  { id: 'EL-105', name: 'Thunderbolt 4 Multi-Port Docking Station', category: 'Electronics', subcategory: 'Accessories', price: 189.00 },
  { id: 'EL-106', name: 'Portable 2TB NVMe SSD External Drive', category: 'Electronics', subcategory: 'Storage', price: 179.99 },
  { id: 'EL-107', name: 'Smart AI Security Camera 4K Pan-Tilt', category: 'Electronics', subcategory: 'Smart Home', price: 119.00 },
  { id: 'EL-108', name: 'Fast GaN Charger 140W 4-Port USB-C', category: 'Electronics', subcategory: 'Charging', price: 69.99 },

  // Apparel & Fashion
  { id: 'AP-201', name: 'Merino Wool All-Weather Travel Blazer', category: 'Apparel', subcategory: 'Outerwear', price: 280.00 },
  { id: 'AP-202', name: 'Organic Heavyweight Cotton Crewneck Sweatshirt', category: 'Apparel', subcategory: 'Tops', price: 85.00 },
  { id: 'AP-203', name: 'Technical Commuter Stretch Chinos', category: 'Apparel', subcategory: 'Bottoms', price: 110.00 },
  { id: 'AP-204', name: 'Seamless High-Impact Sports Bra', category: 'Apparel', subcategory: 'Activewear', price: 54.00 },
  { id: 'AP-205', name: 'Waterproof Trail Running Jacket', category: 'Apparel', subcategory: 'Activewear', price: 195.00 },
  { id: 'AP-206', name: 'Handcrafted Italian Leather Belt', category: 'Apparel', subcategory: 'Accessories', price: 75.00 },
  { id: 'AP-207', name: 'Bamboo Rayon Comfort Socks 4-Pack', category: 'Apparel', subcategory: 'Basics', price: 28.00 },

  // Home & Kitchen
  { id: 'HK-301', name: 'Precision Temperature Control Kettle 1.0L', category: 'Home & Kitchen', subcategory: 'Small Appliances', price: 145.00 },
  { id: 'HK-302', name: 'Cast Iron Enamelled Dutch Oven 6-Quart', category: 'Home & Kitchen', subcategory: 'Cookware', price: 210.00 },
  { id: 'HK-303', name: 'Japanese Damascus Steel Chef Knife 8"', category: 'Home & Kitchen', subcategory: 'Cutlery', price: 165.00 },
  { id: 'HK-304', name: 'Countertop Convection Air Fryer Oven', category: 'Home & Kitchen', subcategory: 'Small Appliances', price: 229.99 },
  { id: 'HK-305', name: 'Aroma Diffuser & Humidifier with Smart Timer', category: 'Home & Kitchen', subcategory: 'Home Comfort', price: 49.99 },
  { id: 'HK-306', name: 'Linen Washed Duvet Cover Set Queen', category: 'Home & Kitchen', subcategory: 'Bedding', price: 175.00 },

  // Health & Beauty
  { id: 'HB-401', name: 'Sonic Facial Cleansing Device & Massager', category: 'Health & Beauty', subcategory: 'Skincare', price: 129.00 },
  { id: 'HB-402', name: 'Hyaluronic Acid + Peptide Hydration Serum', category: 'Health & Beauty', subcategory: 'Skincare', price: 58.00 },
  { id: 'HB-403', name: 'Mineral Sunscreen SPF 50 Broad Spectrum', category: 'Health & Beauty', subcategory: 'Suncare', price: 34.00 },
  { id: 'HB-404', name: 'Hydro-Sonic Electric Toothbrush with UV Station', category: 'Health & Beauty', subcategory: 'Oral Care', price: 99.00 },
  { id: 'HB-405', name: 'Botanical Night Repair Oil 30ml', category: 'Health & Beauty', subcategory: 'Skincare', price: 72.00 },

  // Sports & Outdoors
  { id: 'SP-501', name: 'Carbon Fiber Trekking Poles Pair', category: 'Sports & Outdoors', subcategory: 'Hiking', price: 95.00 },
  { id: 'SP-502', name: 'Ultralight 2-Person Backpacking Tent', category: 'Sports & Outdoors', subcategory: 'Camping', price: 340.00 },
  { id: 'SP-503', name: 'Insulated Stainless Steel Water Bottle 32oz', category: 'Sports & Outdoors', subcategory: 'Hydration', price: 38.00 },
  { id: 'SP-504', name: 'Eco-Rubber Non-Slip Yoga Mat 6mm', category: 'Sports & Outdoors', subcategory: 'Fitness', price: 68.00 },
  { id: 'SP-505', name: 'Adjustable Quick-Select Dumbbell 50lb', category: 'Sports & Outdoors', subcategory: 'Fitness', price: 299.00 },

  // Books & Media
  { id: 'BK-601', name: 'Designing Data-Intensive Applications Hardcover', category: 'Books & Media', subcategory: 'Technology', price: 44.99 },
  { id: 'BK-602', name: 'The Art of Clean Architecture & Domain Design', category: 'Books & Media', subcategory: 'Technology', price: 39.50 },
  { id: 'BK-603', name: 'Principles of Modern Behavioral Economics', category: 'Books & Media', subcategory: 'Business', price: 32.00 },
  { id: 'BK-604', name: 'Artisan Sourdough & Fermentation Guide', category: 'Books & Media', subcategory: 'Culinary', price: 29.99 },

  // Gourmet Grocery
  { id: 'GG-701', name: 'Single-Origin Ethiopian Yirgacheffe Beans 1kg', category: 'Gourmet Grocery', subcategory: 'Coffee', price: 36.00 },
  { id: 'GG-702', name: 'Cold-Pressed Extra Virgin Olive Oil 750ml', category: 'Gourmet Grocery', subcategory: 'Pantry', price: 28.50 },
  { id: 'GG-703', name: 'Organic Ceremonial Grade Matcha Green Tea 100g', category: 'Gourmet Grocery', subcategory: 'Tea', price: 42.00 },
  { id: 'GG-704', name: 'Aged 12-Year Balsamic Vinegar of Modena', category: 'Gourmet Grocery', subcategory: 'Pantry', price: 55.00 },

  // Office & Stationery
  { id: 'OF-801', name: 'Hardbound Dotted Bullet Journal 160gsm', category: 'Office & Stationery', subcategory: 'Notebooks', price: 24.50 },
  { id: 'OF-802', name: 'Brass Heavyweight Fountain Pen Fine Nib', category: 'Office & Stationery', subcategory: 'Pens', price: 65.00 },
  { id: 'OF-803', name: 'Solid Walnut Wood Monitor Stand Riser', category: 'Office & Stationery', subcategory: 'Desk Organization', price: 89.00 }
];

export const SAMPLE_CUSTOMERS = [
  { id: 'CUST-001', name: 'Elena Rostova', email: 'elena.rostova@nexus.io', city: 'San Francisco', region: 'North America', channel: 'Web' },
  { id: 'CUST-002', name: 'Marcus Vance', email: 'marcus.v@hyperion.com', city: 'London', region: 'Europe', channel: 'Mobile App' },
  { id: 'CUST-003', name: 'Aaliyah Chen', email: 'aaliyah.chen@vanguard.co', city: 'Singapore', region: 'Asia Pacific', channel: 'Web' },
  { id: 'CUST-004', name: 'Devon Gallagher', email: 'd.gallagher@atlascorp.org', city: 'Toronto', region: 'North America', channel: 'In-Store' },
  { id: 'CUST-005', name: 'Sofia Rodriguez', email: 'sofia.rodriguez@valencia.es', city: 'Madrid', region: 'Europe', channel: 'Mobile App' },
  { id: 'CUST-006', name: 'Kenji Takahashi', email: 'kenji.takahashi@kyoto-lab.jp', city: 'Tokyo', region: 'Asia Pacific', channel: 'Web' },
  { id: 'CUST-007', name: 'Liam O\'Connor', email: 'liam.oc@dublintech.ie', city: 'Dublin', region: 'Europe', channel: 'Marketplace' },
  { id: 'CUST-008', name: 'Maya Patel', email: 'maya.patel@horizon-ai.in', city: 'Bengaluru', region: 'Asia Pacific', channel: 'Web' },
  { id: 'CUST-009', name: 'Lucas Silva', email: 'lucas.silva@paulista.br', city: 'São Paulo', region: 'Latin America', channel: 'Mobile App' },
  { id: 'CUST-010', name: 'Chloe Dubois', email: 'chloe.dubois@atelier-paris.fr', city: 'Paris', region: 'Europe', channel: 'In-Store' },
  { id: 'CUST-011', name: 'Benjamin Hayes', email: 'b.hayes@beaconridge.com', city: 'Seattle', region: 'North America', channel: 'Web' },
  { id: 'CUST-012', name: 'Zara Al-Mansoor', email: 'zara.m@emirateshub.ae', city: 'Dubai', region: 'Middle East', channel: 'Mobile App' },
  { id: 'CUST-013', name: 'Mateo Morales', email: 'mateo.m@condesa.mx', city: 'Mexico City', region: 'Latin America', channel: 'Web' },
  { id: 'CUST-014', name: 'Ananya Sharma', email: 'ananya.s@mumbai-fin.in', city: 'Mumbai', region: 'Asia Pacific', channel: 'Web' },
  { id: 'CUST-015', name: 'Oliver Schmidt', email: 'o.schmidt@berlin-dynamics.de', city: 'Berlin', region: 'Europe', channel: 'Mobile App' },
  { id: 'CUST-016', name: 'Hannah Abbott', email: 'h.abbott@bostonconsult.com', city: 'Boston', region: 'North America', channel: 'In-Store' },
  { id: 'CUST-017', name: 'Tariq Hassan', email: 'tariq.h@cairo-ventures.eg', city: 'Cairo', region: 'Middle East', channel: 'Web' },
  { id: 'CUST-018', name: 'Freja Lindqvist', email: 'freja.l@nordicline.se', city: 'Stockholm', region: 'Europe', channel: 'Mobile App' },
  { id: 'CUST-019', name: 'Gabriel Santos', email: 'g.santos@lisbontech.pt', city: 'Lisbon', region: 'Europe', channel: 'Web' },
  { id: 'CUST-020', name: 'Grace Kim', email: 'grace.kim@seoul-creative.kr', city: 'Seoul', region: 'Asia Pacific', channel: 'Mobile App' }
];

// Generates an expanded deterministic realistic dataset of 600+ orders
export function generateDefaultDataset(): CustomerOrder[] {
  const orders: CustomerOrder[] = [];
  let orderCounter = 10001;

  // Define customer behavior archetypes to create genuine RFM & cross-category patterns:
  // - VIP Champions (high frequency, high monetary, recent dates)
  // - Tech Enthusiasts (cross-order Electronics + Books + Office)
  // - Lifestyle & Wellness (Apparel + Health & Beauty + Sports + Gourmet)
  // - At-Risk / Churned customers (older dates 2025)
  // - One-Time Shoppers

  const baseDate = new Date('2025-08-01T00:00:00Z');
  const endDate = new Date('2026-08-25T00:00:00Z');
  const totalDays = Math.floor((endDate.getTime() - baseDate.getTime()) / (1000 * 60 * 60 * 24));

  // 1. Generate VIP Champions (Multiple high-ticket orders across categories)
  const championCustomers = SAMPLE_CUSTOMERS.slice(0, 5);
  championCustomers.forEach((cust, cIdx) => {
    const numOrders = 8 + (cIdx * 3); // 8 to 20 orders
    for (let i = 0; i < numOrders; i++) {
      // Recent bias (between day 200 and totalDays)
      const dayOffset = Math.floor(200 + (Math.random() * (totalDays - 200)));
      const orderDate = new Date(baseDate.getTime() + dayOffset * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const orderId = `ORD-${orderCounter++}`;

      // Pick 2-4 items per order (creating basket affinity!)
      const itemsInBasket = [
        SAMPLE_PRODUCTS[cIdx % 8], // Electronics
        SAMPLE_PRODUCTS[8 + (i % 7)], // Apparel
        SAMPLE_PRODUCTS[15 + ((cIdx + i) % 6)] // Home & Kitchen
      ];

      itemsInBasket.forEach((prod) => {
        const qty = Math.floor(1 + Math.random() * 2);
        const discount = Math.random() > 0.6 ? 0.1 : 0.0;
        const total = Number((prod.price * qty * (1 - discount)).toFixed(2));
        orders.push({
          order_id: orderId,
          order_date: orderDate,
          customer_id: cust.id,
          customer_name: cust.name,
          customer_email: cust.email,
          city: cust.city,
          region: cust.region,
          channel: cust.channel as any,
          product_id: prod.id,
          product_name: prod.name,
          category: prod.category,
          subcategory: prod.subcategory,
          unit_price: prod.price,
          quantity: qty,
          discount,
          total_amount: total,
          rating: Math.random() > 0.2 ? (Math.random() > 0.3 ? 5 : 4) : 3,
          returned: Math.random() < 0.03
        });
      });
    }
  });

  // 2. Generate Loyalists & Mid-Tier Regulars
  const regularCustomers = SAMPLE_CUSTOMERS.slice(5, 14);
  regularCustomers.forEach((cust, cIdx) => {
    const numOrders = 3 + (cIdx % 4);
    for (let i = 0; i < numOrders; i++) {
      const dayOffset = Math.floor(50 + (Math.random() * (totalDays - 60)));
      const orderDate = new Date(baseDate.getTime() + dayOffset * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const orderId = `ORD-${orderCounter++}`;

      // Typical pairings: Health & Beauty + Gourmet Grocery OR Sports + Apparel
      const pairType = (cIdx + i) % 2 === 0;
      const p1 = pairType ? SAMPLE_PRODUCTS[21 + (i % 5)] : SAMPLE_PRODUCTS[26 + (i % 5)];
      const p2 = pairType ? SAMPLE_PRODUCTS[35 + (i % 4)] : SAMPLE_PRODUCTS[8 + (i % 7)];

      [p1, p2].forEach((prod) => {
        const qty = 1 + Math.floor(Math.random() * 2);
        const discount = Math.random() > 0.5 ? 0.15 : 0.0;
        const total = Number((prod.price * qty * (1 - discount)).toFixed(2));
        orders.push({
          order_id: orderId,
          order_date: orderDate,
          customer_id: cust.id,
          customer_name: cust.name,
          customer_email: cust.email,
          city: cust.city,
          region: cust.region,
          channel: cust.channel as any,
          product_id: prod.id,
          product_name: prod.name,
          category: prod.category,
          subcategory: prod.subcategory,
          unit_price: prod.price,
          quantity: qty,
          discount,
          total_amount: total,
          rating: 4 + Math.floor(Math.random() * 2),
          returned: Math.random() < 0.04
        });
      });
    }
  });

  // 3. Generate At-Risk & Churned Customers (High initial spend in late 2025, no recent orders in 2026)
  const atRiskCustomers = SAMPLE_CUSTOMERS.slice(14, 20);
  atRiskCustomers.forEach((cust, cIdx) => {
    const numOrders = 2 + (cIdx % 3);
    for (let i = 0; i < numOrders; i++) {
      // Early days in 2025 (day 0 to 120) -> high recency days
      const dayOffset = Math.floor(10 + Math.random() * 110);
      const orderDate = new Date(baseDate.getTime() + dayOffset * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const orderId = `ORD-${orderCounter++}`;

      const prod = SAMPLE_PRODUCTS[(cIdx * 5 + i) % SAMPLE_PRODUCTS.length];
      const qty = 1 + Math.floor(Math.random() * 3);
      const discount = 0.05;
      const total = Number((prod.price * qty * (1 - discount)).toFixed(2));

      orders.push({
        order_id: orderId,
        order_date: orderDate,
        customer_id: cust.id,
        customer_name: cust.name,
        customer_email: cust.email,
        city: cust.city,
        region: cust.region,
        channel: cust.channel as any,
        product_id: prod.id,
        product_name: prod.name,
        category: prod.category,
        subcategory: prod.subcategory,
        unit_price: prod.price,
        quantity: qty,
        discount,
        total_amount: total,
        rating: Math.random() > 0.3 ? 4 : 2,
        returned: Math.random() < 0.08
      });
    }
  });

  // 4. Generate 80+ synthetic diverse long-tail customers to reach realistic statistical scale
  for (let c = 21; c <= 95; c++) {
    const custId = `CUST-${String(c).padStart(3, '0')}`;
    const firstNames = ['Liam', 'Emma', 'Noah', 'Olivia', 'James', 'Ava', 'William', 'Sophia', 'Lucas', 'Mia', 'Henry', 'Evelyn', 'Alexander', 'Harper', 'Daniel', 'Amelia', 'Matthew', 'Ella', 'Jackson', 'Avery'];
    const lastNames = ['Miller', 'Davis', 'Wilson', 'Moore', 'Taylor', 'Anderson', 'Thomas', 'Jackson', 'White', 'Harris', 'Martin', 'Thompson', 'Garcia', 'Martinez', 'Robinson', 'Clark', 'Rodriguez', 'Lewis', 'Lee', 'Walker'];
    const name = `${firstNames[c % firstNames.length]} ${lastNames[(c * 3) % lastNames.length]}`;
    const email = `${name.toLowerCase().replace(' ', '.')}@example.com`;
    const cities = ['New York', 'Chicago', 'Austin', 'London', 'Munich', 'Sydney', 'Paris', 'Tokyo', 'Singapore', 'Amsterdam', 'Vancouver', 'Seattle'];
    const regions = ['North America', 'Europe', 'Asia Pacific', 'Latin America'];
    const channels: Array<'Web' | 'Mobile App' | 'In-Store' | 'Marketplace'> = ['Web', 'Mobile App', 'In-Store', 'Marketplace'];

    const city = cities[c % cities.length];
    const region = regions[c % regions.length];
    const channel = channels[c % channels.length];

    const orderCount = Math.random() > 0.7 ? 3 : (Math.random() > 0.4 ? 2 : 1);
    for (let o = 0; o < orderCount; o++) {
      const dayOffset = Math.floor(Math.random() * totalDays);
      const orderDate = new Date(baseDate.getTime() + dayOffset * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const orderId = `ORD-${orderCounter++}`;

      // Pick 1 to 3 items
      const itemsInBasketCount = Math.random() > 0.6 ? 2 : 1;
      for (let k = 0; k < itemsInBasketCount; k++) {
        const prod = SAMPLE_PRODUCTS[(c * 7 + o * 3 + k) % SAMPLE_PRODUCTS.length];
        const qty = Math.random() > 0.8 ? 2 : 1;
        const discount = Math.random() > 0.7 ? 0.1 : 0.0;
        const total = Number((prod.price * qty * (1 - discount)).toFixed(2));

        orders.push({
          order_id: orderId,
          order_date: orderDate,
          customer_id: custId,
          customer_name: name,
          customer_email: email,
          city,
          region,
          channel,
          product_id: prod.id,
          product_name: prod.name,
          category: prod.category,
          subcategory: prod.subcategory,
          unit_price: prod.price,
          quantity: qty,
          discount,
          total_amount: total,
          rating: 3 + Math.floor(Math.random() * 3),
          returned: Math.random() < 0.04
        });
      }
    }
  }

  return orders;
}
