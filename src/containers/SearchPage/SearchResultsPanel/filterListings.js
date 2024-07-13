const filterListings = (listings, px) => {
  let filteredListings = listings;

  if (px !== null) {
    if (px === 'true') {
      filteredListings = listings.filter(l => parseInt(l.attributes.publicData?.min, 10) > 8);
    } else if (px === 'false') {
      filteredListings = listings.filter(l => parseInt(l.attributes.publicData?.min, 10) < 8);
    }
  }

  return filteredListings;
};

export default filterListings;

/*
const filterListings = (listings, pubJoy, px) => {
  let filteredListings = listings;
  console.log('OI',listings)
  if (px !== null) {
    if (px === 'true') {
      filteredListings = listings.filter(
        l => parseInt(l.attributes.publicData?.min, 10) > 8
      );
    } else if (px === 'false') {
      filteredListings = listings.filter(
        l => parseInt(l.attributes.publicData?.min, 10) < 8
      );
    }
  }


  if (!pubJoy) return filteredListings;

  const pubJoyValues = pubJoy.replace('has_all:', '').split(',');

  
  if (pubJoyValues.length > 1) {
    // If searching for multiple values, return filtered listings
    return filteredListings;
  }

  /*
  return filteredListings.filter(l => {
    const listingJoy = l.attributes.publicData?.joy;
    if (!listingJoy) return false;

    // Exact match when there's only one value in pub_joy
    return listingJoy.length === 1 && listingJoy[0] === pubJoyValues[0];
  });
 
};

export default filterListings;
 */
