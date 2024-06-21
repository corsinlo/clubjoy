const filterListings = (listings, pubJoy, px) => {
  if (px === 'true') {
    return listings.filter(
      l => parseInt(l.attributes.publicData?.min, 10) > 8
    );
  } else {
    if (!pubJoy) {
      return listings.filter(
        l => parseInt(l.attributes.publicData?.min, 10) < 8
      );
    }

    const pubJoyValues = pubJoy.replace('has_all:', '').split(',');
    return listings.filter(
      l =>
        parseInt(l.attributes.publicData?.min, 10) < 8 &&
        l.attributes.publicData?.joy?.length === pubJoyValues.length &&
        l.attributes.publicData.joy.every(joyValue => pubJoyValues.includes(joyValue))
    );
  }
};

export default filterListings;
