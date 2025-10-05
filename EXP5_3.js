/**
 * MongoDB Shell Script: E-commerce Catalog with Nested Documents
 *
 * Task: Design and implement a MongoDB data model using nested documents
 * to represent a product catalog, including product variants.
 *
 * Instructions:
 * 1. Connect to a database (here we use 'nimbusDB').
 * 2. Drop the existing collection for a clean start.
 * 3. Insert sample products with nested 'variants' array.
 * 4. Demonstrate queries and updates on the nested documents.
 */

// 1. Switch to the target database
const dbName = "nimbusDB";
use(dbName);

print(`\n--- 1. Using Database: ${dbName} ---`);

// 2. Drop the collection for a clean start
db.products.drop();
print("Collection 'products' dropped successfully (if it existed).");

// 3. Insert Sample Products with Nested Variants
print("\n--- 2. Inserting Sample Products ---");

const productsData = [
    // Product 1: Smartphone (Demonstrates color/storage variants)
    {
        name: "SuperPhone Pro X",
        price: 899.99,
        category: "Electronics",
        brand: "TechNova",
        description: "A flagship mobile device with a powerful camera and chipset.",
        variants: [
            {
                sku: "SP-X-256-BLUE",
                color: "Cerulean Blue",
                storage: "256GB",
                stock: 15,
                images: ["/img/phone/blue_main.jpg", "/img/phone/blue_detail.jpg"]
            },
            {
                sku: "SP-X-512-GRY",
                color: "Space Gray",
                storage: "512GB",
                stock: 8, // Low stock variant
                images: ["/img/phone/gray_main.jpg"]
            },
            {
                sku: "SP-X-256-RED",
                color: "Product Red",
                storage: "256GB",
                stock: 22,
                images: ["/img/phone/red_main.jpg"]
            }
        ]
    },
    // Product 2: Cotton T-Shirt (Demonstrates size/color variants)
    {
        name: "Premium Cotton Tee",
        price: 35.00,
        category: "Apparel",
        brand: "ComfyWear",
        description: "Soft, breathable cotton t-shirt for everyday comfort.",
        variants: [
            {
                sku: "PCT-WHT-S",
                color: "White",
                size: "Small",
                stock: 45,
                images: ["/img/tee/white_s.jpg"]
            },
            {
                sku: "PCT-BLK-L",
                color: "Black",
                size: "Large",
                stock: 10,
                images: ["/img/tee/black_l.jpg"]
            },
            {
                sku: "PCT-BLK-M",
                color: "Black",
                size: "Medium",
                stock: 6, // Low stock variant
                images: ["/img/tee/black_m.jpg"]
            }
        ]
    }
];

const result = db.products.insertMany(productsData);
print(`Inserted ${result.insertedIds.length} products.`);

// 4. Demonstrate Queries and Manipulation

print("\n--- 3. Query Demonstrations ---");

// A. Find a product by Category
print("\n[A] Find all products in 'Electronics':");
const electronics = db.products.find({ category: "Electronics" }).toArray();
printjson(electronics.map(p => ({ _id: p._id, name: p.name, category: p.category })));


// B. Find products that have a variant with low stock (e.g., stock < 10)
print("\n[B] Find products where ANY variant has stock < 10 (Using dot notation):");
const lowStockProducts = db.products.find({ "variants.stock": { $lt: 10 } }).toArray();
printjson(lowStockProducts.map(p => ({ _id: p._id, name: p.name, lowStockVariants: p.variants.filter(v => v.stock < 10) })));


// C. Update the stock for a SPECIFIC nested variant using the positional operator ($)
const targetSKU = "SP-X-512-GRY";
print(`\n[C] Update stock for SKU '${targetSKU}' from 8 to 18:`);
const updateResult = db.products.updateOne(
    { name: "SuperPhone Pro X", "variants.sku": targetSKU },
    { $set: { "variants.$.stock": 18 } }
);
print(`Matched: ${updateResult.matchedCount}, Modified: ${updateResult.modifiedCount}`);

// Verify the update
print(`Verified new stock for ${targetSKU}:`);
const updatedProduct = db.products.findOne(
    { "variants.sku": targetSKU },
    { "variants.$": 1 } // Project only the matched variant
);
printjson(updatedProduct.variants[0]);


// D. Add a new variant (nested document) to an existing product
print("\n[D] Add a new variant (Small/Black) to 'Premium Cotton Tee' using $push:");
const pushResult = db.products.updateOne(
    { name: "Premium Cotton Tee" },
    {
        $push: {
            variants: {
                sku: "PCT-BLK-S",
                color: "Black",
                size: "Small",
                stock: 12,
                images: ["/img/tee/black_s.jpg"]
            }
        }
    }
);
print(`Matched: ${pushResult.matchedCount}, Modified: ${pushResult.modifiedCount}`);

// Verify the push
print("\nVerified total variants for 'Premium Cotton Tee' (should be 4):");
const finalProduct = db.products.findOne(
    { name: "Premium Cotton Tee" },
    { name: 1, variantCount: { $size: "$variants" } }
);
printjson(finalProduct);

print("\n--- Script Execution Complete ---");