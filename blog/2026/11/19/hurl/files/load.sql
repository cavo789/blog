CREATE OR REPLACE TABLE products AS
    SELECT unnest(products, recursive := true)
    FROM read_json_auto('products.json');

SELECT category, count(*) AS items, sum(stock) AS in_stock
FROM products
GROUP BY category
ORDER BY in_stock DESC
LIMIT 5;
