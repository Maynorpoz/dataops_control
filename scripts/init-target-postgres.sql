-- Base de datos objetivo simulada (postgres-target)
CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    price DECIMAL(10,2),
    stock INTEGER DEFAULT 0,
    category VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS orders (
    id SERIAL PRIMARY KEY,
    product_id INTEGER REFERENCES products(id),
    quantity INTEGER NOT NULL,
    total DECIMAL(10,2),
    status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS audit_log (
    id BIGSERIAL PRIMARY KEY,
    table_name VARCHAR(100),
    operation VARCHAR(10),
    old_data JSONB,
    new_data JSONB,
    performed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed data para simulaciones de carga
INSERT INTO products (name, price, stock, category)
SELECT
    'Product_' || i,
    (RANDOM() * 1000)::DECIMAL(10,2),
    (RANDOM() * 500)::INTEGER,
    CASE (i % 5) WHEN 0 THEN 'Electronics' WHEN 1 THEN 'Clothing'
                  WHEN 2 THEN 'Food' WHEN 3 THEN 'Books' ELSE 'Tools' END
FROM generate_series(1, 10000) i;
