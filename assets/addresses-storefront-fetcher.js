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

  // Map Italian province codes to your custom groupings
  const PROVINCE_CODE_MAPPING = {
    // Sardegna (Sardinia)
    'CA': 'Sardegna',  // Cagliari
    'CI': 'Sardegna',  // Carbonia-Iglesias
    'NU': 'Sardegna',  // Nuoro
    'OG': 'Sardegna',  // Ogliastra
    'OT': 'Sardegna',  // Olbia-Tempio
    'SS': 'Sardegna',  // Sassari
    'SU': 'Sardegna',  // Medio Campidano
    'VS': 'Sardegna',  // Villacidro

    // Milano area
    'MI': 'Milano',    // Milano
    'MB': 'Milano',    // Monza e Brianza
    'CO': 'Milano',    // Como
    'BG': 'Milano',    // Bergamo
    'BS': 'Milano',    // Brescia
    'VA': 'Milano',    // Varese
    'LC': 'Milano',    // Lecco
    'CR': 'Milano',    // Cremona
    'MN': 'Milano',    // Mantova
    'PV': 'Milano',    // Pavia
    'SO': 'Milano',    // Sondrio

    // Roma area
    'RM': 'Roma',      // Roma
    'RI': 'Roma',      // Rieti
    'VT': 'Roma',      // Viterbo
    'LT': 'Roma',      // Latina
    'FR': 'Roma',      // Frosinone

    // Firenze area (Tuscany)
    'FI': 'Firenze',   // Firenze
    'AR': 'Firenze',   // Arezzo
    'GR': 'Firenze',   // Grosseto
    'LI': 'Firenze',   // Livorno
    'LU': 'Firenze',   // Lucca
    'MS': 'Firenze',   // Massa-Carrara
    'PI': 'Firenze',   // Pisa
    'PO': 'Firenze',   // Prato
    'PT': 'Firenze',   // Pistoia
    'SI': 'Firenze',   // Siena

    // Torino area (Piemonte)
    'TO': 'Torino',    // Torino
    'AL': 'Torino',    // Alessandria
    'AT': 'Torino',    // Asti
    'BI': 'Torino',    // Biella
    'CN': 'Torino',    // Cuneo
    'NO': 'Torino',    // Novara
    'VB': 'Torino',    // Verbano-Cusio-Ossola
    'VC': 'Torino',    // Vercelli

    // Venezia area
    'VE': 'Venezia',   // Venezia
    'PD': 'Venezia',   // Padova
    'TV': 'Venezia',   // Treviso
    'VR': 'Venezia',   // Verona
    'VI': 'Venezia',   // Vicenza
    'BL': 'Venezia',   // Belluno
    'RO': 'Venezia',   // Rovigo

    // Napoli area
    'NA': 'Napoli',    // Napoli
    'AV': 'Napoli',    // Avellino
    'BN': 'Napoli',    // Benevento
    'CE': 'Napoli',    // Caserta
    'SA': 'Napoli',    // Salerno (includes Amalfi Coast)

    // Cinque Terre area (Liguria)
    'SP': 'Cinque Terre',  // La Spezia
    'GE': 'Cinque Terre',  // Genova
    'IM': 'Cinque Terre',  // Imperia
    'SV': 'Cinque Terre',  // Savona
  };

  // Extract province from address and map to your custom groupings
  function extractAndMapProvince(address, existingProvince) {
    // If there's already a valid province metafield, use it
    if (existingProvince && existingProvince !== '') {
      return existingProvince;
    }

    if (!address) return null;

    // Check for Amalfi Coast specific cities (SA province but should be grouped as "Costiera Amalfitana")
    const amalfiCities = ['Amalfi', 'Positano', 'Ravello', 'Vietri sul Mare', 'Maiori', 'Minori', 'Cetara', 'Furore', 'Conca dei Marini', 'Atrani', 'Praiano'];
    const lowerAddress = address.toLowerCase();
    const isAmalfiCoast = amalfiCities.some(city => lowerAddress.includes(city.toLowerCase()));

    // Try multiple regex patterns to handle different address formats
    let provinceCode = null;

    // Pattern 1: "City, PostalCode CityName, PROVINCE" (e.g., "Via Vittorio Emanuele 18, 09019 Teulada, SU")
    let match = address.match(/,\s*\d{5}\s+[^,]+,\s*([A-Z]{2})(?:\s*,?\s*.*)?$/);
    if (match) {
      provinceCode = match[1];
    } else {
      // Pattern 2: "City, PostalCode CityName, PROVINCE, Country" (e.g., " via del Golf, 07021 Costa Smeralda, SS, Italia")
      match = address.match(/,\s*\d{5}\s+[^,]+,\s*([A-Z]{2})\s*,\s*\w+$/);
      if (match) {
        provinceCode = match[1];
      } else {
        // Pattern 3: "Address, PostalCode CityName PROVINCE" (e.g., "Via Barbagia, 46, 07026 Olbia SS")
        match = address.match(/,\s*\d{5}\s+\w+\s+([A-Z]{2})(?:\s*,?\s*.*)?$/);
        if (match) {
          provinceCode = match[1];
        } else {
          // Pattern 4: Simple fallback - 2-letter code at the end
          match = address.match(/\b([A-Z]{2})(?:\s*,?\s*\w*)?$/);
          if (match) {
            provinceCode = match[1];
          }
        }
      }
    }

    if (provinceCode) {
      // Special case: SA province but in Amalfi Coast area
      if (provinceCode === 'SA' && isAmalfiCoast) {
        return 'Costiera Amalfitana';
      }

      return PROVINCE_CODE_MAPPING[provinceCode] || null;
    }

    return null;
  }

  fetchAllProducts()
    .then((all) => {
      // Process products to ensure they have proper province grouping
      const processed = all.map(product => {
        const extractedProvince = extractAndMapProvince(product.address, product.province);

        return {
          ...product,
          province: extractedProvince
        };
      });

      window.productAddresses = processed;
      const withAddr = processed.filter((p) => p.address);

      console.groupCollapsed(`[address-fetcher] ${withAddr.length} / ${all.length} products with address`);
      withAddr.forEach((p) => console.log(`•${p.title} → ${p.address} [${p.province}] ${p.type} `));
      console.groupEnd();
    })
    .catch((err) => console.error('[address-fetcher]', err));
})();


