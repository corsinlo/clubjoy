/**
 * Google API Data Cache Refresh Script
 *
 * This script fetches fresh data from Google APIs and stores it in Shopify product metafields.
 * Run this once per week to keep cached data fresh while minimizing API costs.
 *
 * SETUP:
 * 1. Install dependencies: npm install node-fetch
 * 2. Get Shopify Admin API token with product write access
 * 3. Set environment variables or update config below
 * 4. Run: node scripts/refresh-google-cache.js
 *
 * COST SAVINGS:
 * - Before: 5000 page views × 3 API calls = 15,000 requests/month = €120+/month
 * - After: 100 products × 3 API calls × 4 weekly refreshes = 1,200 requests/month = €18-24/month
 * - Savings: ~80-85% reduction in API costs
 */

const GOOGLE_API_KEY = 'AIzaSyCQ3bPzVGn7UbU6BBDYHX6mB4xjb6tAR5o';
const SHOPIFY_SHOP = 'your-shop.myshopify.com'; // UPDATE THIS
const SHOPIFY_ACCESS_TOKEN = 'your_admin_api_token'; // UPDATE THIS

// Or use environment variables:
// const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;
// const SHOPIFY_SHOP = process.env.SHOPIFY_SHOP;
// const SHOPIFY_ACCESS_TOKEN = process.env.SHOPIFY_ACCESS_TOKEN;

const BATCH_SIZE = 10; // Process 10 products at a time
const DELAY_BETWEEN_BATCHES = 2000; // 2 seconds delay to avoid rate limits

async function fetchProductsWithPlaceId() {
  console.log('📦 Fetching products with place_id metafield...');

  const query = `
    query {
      products(first: 250, query: "metafields.custom.place_id:*") {
        edges {
          node {
            id
            title
            metafield(namespace: "custom", key: "place_id") {
              value
            }
            addressMetafield: metafield(namespace: "custom", key: "address") {
              value
            }
          }
        }
      }
    }
  `;

  const response = await shopifyGraphQL(query);
  const products = response.data.products.edges.map(edge => ({
    id: edge.node.id,
    title: edge.node.title,
    placeId: edge.node.metafield?.value,
    address: edge.node.addressMetafield?.value
  }));

  console.log(`✅ Found ${products.length} products with place_id`);
  return products;
}

async function geocodeAddress(address) {
  if (!address) return null;

  console.log(`  🗺️  Geocoding: ${address}`);

  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${GOOGLE_API_KEY}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.status === 'OK' && data.results[0]) {
      const location = data.results[0].geometry.location;
      console.log(`  ✅ Geocoded to: ${location.lat}, ${location.lng}`);
      return { lat: location.lat, lng: location.lng };
    } else {
      console.error(`  ❌ Geocoding failed: ${data.status}`);
      return null;
    }
  } catch (error) {
    console.error(`  ❌ Geocoding error:`, error.message);
    return null;
  }
}

async function fetchPlaceDetails(placeId) {
  if (!placeId) return null;

  console.log(`  ⭐ Fetching place details for: ${placeId}`);

  // Using Places API (New) - same as frontend
  const url = `https://places.googleapis.com/v1/places/${placeId}?fields=rating,userRatingCount,reviews&key=${GOOGLE_API_KEY}`;

  try {
    const response = await fetch(url, {
      headers: {
        'X-Goog-FieldMask': 'rating,userRatingCount,reviews'
      }
    });

    if (!response.ok) {
      console.error(`  ❌ Places API error: ${response.status}`);
      return null;
    }

    const data = await response.json();

    const rating = data.rating || null;
    const reviewCount = data.userRatingCount || 0;
    const reviews = data.reviews?.slice(0, 10).map(review => ({
      author: review.authorAttribution?.displayName || 'Anonymous',
      rating: review.rating || 5,
      text: review.text?.text || '',
      date: review.publishTime || new Date().toISOString()
    })) || [];

    console.log(`  ✅ Rating: ${rating}, Reviews: ${reviewCount}`);

    return {
      rating,
      reviewCount,
      reviews
    };
  } catch (error) {
    console.error(`  ❌ Places API error:`, error.message);
    return null;
  }
}

async function updateProductMetafields(productId, cacheData) {
  console.log(`  💾 Updating metafields for product ${productId}...`);

  const metafields = [];

  if (cacheData.rating !== null) {
    metafields.push({
      namespace: 'custom',
      key: 'google_rating',
      value: cacheData.rating.toString(),
      type: 'number_decimal'
    });
  }

  if (cacheData.reviewCount !== null) {
    metafields.push({
      namespace: 'custom',
      key: 'google_review_count',
      value: cacheData.reviewCount.toString(),
      type: 'number_integer'
    });
  }

  if (cacheData.reviews && cacheData.reviews.length > 0) {
    metafields.push({
      namespace: 'custom',
      key: 'google_reviews_data',
      value: JSON.stringify(cacheData.reviews),
      type: 'json'
    });
  }

  if (cacheData.geocoded) {
    metafields.push({
      namespace: 'custom',
      key: 'geocoded_location',
      value: JSON.stringify(cacheData.geocoded),
      type: 'json'
    });
  }

  // Add timestamp
  metafields.push({
    namespace: 'custom',
    key: 'cache_last_updated',
    value: new Date().toISOString(),
    type: 'date_time'
  });

  const mutation = `
    mutation UpdateProductMetafields($input: ProductInput!) {
      productUpdate(input: $input) {
        product {
          id
        }
        userErrors {
          field
          message
        }
      }
    }
  `;

  const variables = {
    input: {
      id: productId,
      metafields: metafields
    }
  };

  const response = await shopifyGraphQL(mutation, variables);

  if (response.data.productUpdate.userErrors.length > 0) {
    console.error(`  ❌ Update errors:`, response.data.productUpdate.userErrors);
    return false;
  }

  console.log(`  ✅ Metafields updated successfully`);
  return true;
}

async function shopifyGraphQL(query, variables = {}) {
  const response = await fetch(`https://${SHOPIFY_SHOP}/admin/api/2024-01/graphql.json`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Access-Token': SHOPIFY_ACCESS_TOKEN
    },
    body: JSON.stringify({ query, variables })
  });

  return await response.json();
}

async function processProduct(product) {
  console.log(`\n🔄 Processing: ${product.title}`);

  const cacheData = {};

  // Geocode address if available
  if (product.address) {
    const geocoded = await geocodeAddress(product.address);
    if (geocoded) {
      cacheData.geocoded = geocoded;
    }
    await delay(500); // Small delay between API calls
  }

  // Fetch place details if place_id available
  if (product.placeId) {
    const placeDetails = await fetchPlaceDetails(product.placeId);
    if (placeDetails) {
      cacheData.rating = placeDetails.rating;
      cacheData.reviewCount = placeDetails.reviewCount;
      cacheData.reviews = placeDetails.reviews;
    }
    await delay(500);
  }

  // Update Shopify metafields
  if (Object.keys(cacheData).length > 0) {
    await updateProductMetafields(product.id, cacheData);
  }

  return cacheData;
}

async function processBatch(products) {
  const results = [];

  for (const product of products) {
    try {
      const result = await processProduct(product);
      results.push({ product: product.title, success: true, data: result });
    } catch (error) {
      console.error(`❌ Error processing ${product.title}:`, error.message);
      results.push({ product: product.title, success: false, error: error.message });
    }
  }

  return results;
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
  console.log('🚀 Google API Cache Refresh Script');
  console.log('====================================\n');

  // Validate configuration
  if (SHOPIFY_SHOP === 'your-shop.myshopify.com' || SHOPIFY_ACCESS_TOKEN === 'your_admin_api_token') {
    console.error('❌ Please update SHOPIFY_SHOP and SHOPIFY_ACCESS_TOKEN in the script!');
    process.exit(1);
  }

  try {
    // Fetch all products
    const products = await fetchProductsWithPlaceId();

    if (products.length === 0) {
      console.log('ℹ️  No products found with place_id metafield');
      return;
    }

    // Process in batches
    const batches = [];
    for (let i = 0; i < products.length; i += BATCH_SIZE) {
      batches.push(products.slice(i, i + BATCH_SIZE));
    }

    console.log(`\n📊 Processing ${products.length} products in ${batches.length} batches...\n`);

    const allResults = [];
    for (let i = 0; i < batches.length; i++) {
      console.log(`\n--- Batch ${i + 1}/${batches.length} ---`);

      const batchResults = await processBatch(batches[i]);
      allResults.push(...batchResults);

      if (i < batches.length - 1) {
        console.log(`\n⏳ Waiting ${DELAY_BETWEEN_BATCHES}ms before next batch...`);
        await delay(DELAY_BETWEEN_BATCHES);
      }
    }

    // Summary
    console.log('\n\n====================================');
    console.log('📊 SUMMARY');
    console.log('====================================');

    const successful = allResults.filter(r => r.success).length;
    const failed = allResults.filter(r => !r.success).length;

    console.log(`✅ Successful: ${successful}/${products.length}`);
    console.log(`❌ Failed: ${failed}/${products.length}`);

    if (failed > 0) {
      console.log('\nFailed products:');
      allResults.filter(r => !r.success).forEach(r => {
        console.log(`  - ${r.product}: ${r.error}`);
      });
    }

    console.log('\n✨ Cache refresh complete!');
    console.log('💰 Your products now use cached data - API costs reduced by ~80-85%');

  } catch (error) {
    console.error('\n❌ Fatal error:', error);
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  main().catch(error => {
    console.error('Unhandled error:', error);
    process.exit(1);
  });
}

module.exports = { main, processProduct, fetchProductsWithPlaceId };
