// theme-addresses-storefront-fetcher.js – fetch product addresses and provinces via Storefront API
(() => {
  const API_VERSION = '2024-07';
  const ENDPOINT = `/api/${API_VERSION}/graphql.json`;
  const TOKEN = window.STOREFRONT_TOKEN;

  if (!TOKEN) {
    console.error('[address-fetcher] Missing window.STOREFRONT_TOKEN');
    return;
  }

  const QUERY = `
    query FetchProducts($cursor: String) {
      products(first: 250, after: $cursor) {
        pageInfo { hasNextPage }
        edges {
          cursor
          node {
            id
            handle
            title
            productType
            metafieldAddress: metafield(namespace: "custom", key: "address") {
              value
            }
            metafieldProvince: metafield(namespace: "custom", key: "province") {
              value
            }
          }
        }
      }
    }
  `;

  async function storefrontRequest(variables = {}) {
    const res = await fetch(ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Storefront-Access-Token': TOKEN,
      },
      body: JSON.stringify({ query: QUERY, variables }),
    });

    if (!res.ok) throw new Error(`Storefront API error ${res.status}`);
    const json = await res.json();
    if (json.errors) throw new Error(JSON.stringify(json.errors));
    return json.data;
  }

  async function fetchAllProducts() {
    const out = [];
    let cursor = null;
    let hasNext = true;

    while (hasNext) {
      const data = await storefrontRequest({ cursor });
      const { edges, pageInfo } = data.products;
      edges.forEach(({ node, cursor: c }) => {
        out.push({
          id: Number(node.id.split('/').pop()),
          title: node.title,
          handle: node.handle,
          address: node.metafieldAddress?.value || null,
          province: node.metafieldProvince?.value || null,
          type: node.productType || null,
        });
        cursor = c;
      });
      hasNext = pageInfo.hasNextPage;
    }

    return out;
  }

  fetchAllProducts()
    .then((all) => {
      window.productAddresses = all;
      const withAddr = all.filter((p) => p.address);

      console.groupCollapsed(`[address-fetcher] ${withAddr.length} / ${all.length} products with address`);
      withAddr.forEach((p) => console.log(`•${p.title} → ${p.address} [${p.province}] ${p.type} `));
      console.groupEnd();
    })
    .catch((err) => console.error('[address-fetcher]', err));
})();


