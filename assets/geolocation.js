// console.log("🔍 geolocation.js loaded...");

fetch('https://ipapi.co/json/')
  .then(res => res.json())
  .then(data => {
    //console.log("✅ Location data fetched:", data);

    const country = data.country_name;
    const city = data.city;
    const ip = data.ip;
    /*
    console.log(`🌍 IP: ${ip}`);
    console.log(`📍 Country: ${country}`);
    console.log(`🏙️ City: ${city}`);
    if (country === 'Italy') {
      console.log("🇮🇹 Showing Italy-specific content");
      const italySection = document.getElementById('collection-it');
      if (italySection) italySection.style.display = 'block';
    } else {
      console.log("🌐 Showing default content");
      const defaultSection = document.getElementById('collection-default');
      if (defaultSection) defaultSection.style.display = 'block';
    }
    */
  })
  .catch(err => console.error("❌ Geolocation error:", err));
