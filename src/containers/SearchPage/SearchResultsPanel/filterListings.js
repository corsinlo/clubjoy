const filterListings = (listings, pubJoy) => {
  if (!pubJoy) return listings;

  const pubJoyValues = pubJoy.replace('has_all:', '').split(',');

  if (pubJoyValues.length > 1) {
    // If searching for multiple values, return all listings
    return listings;
  }

  return listings.filter(l => {
    const listingJoy = l.attributes.publicData?.joy;
    if (!listingJoy) return false;

    // Exact match when there's only one value in pub_joy
    return listingJoy.length === 1 && listingJoy[0] === pubJoyValues[0];
  });
};

export default filterListings;
;

