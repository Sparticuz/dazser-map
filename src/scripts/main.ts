/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable no-console */
const goToRegion = (region: string): void => {
  // This function will actually do the page redirect
  window.location.href = `/${region}`;
};

const setLocation = (location: string, persist: boolean): void => {
  // This function will set the location
  // And set in cookie storage depending on if the persist checkbox is selected
  if (persist) {
    const d = new Date();
    // Save for 30 days
    // eslint-disable-next-line prettier/prettier
    d.setTime(d.getTime() + (30 * 24 * 60 * 60 * 1000));
    const expires = `expires=${d.toUTCString()}`;
    document.cookie = `location=${location}; ${expires}`;
  }
  console.log(`${location}, ${persist.toString()}`);
  goToRegion(location);
};

const getLocation = (): string => {
  // This function will retrieve the location from the cookie
  const name = "location=";
  const ca = document.cookie.split(";");
  for (let c of ca) {
    while (c.charAt(0) === " ") {
      c = c.slice(1);
    }
    if (c.indexOf(name) === 0) {
      return c.slice(name.length, c.length);
    }
  }
  return "";
};

const deg2rad = (deg: number): number => deg * (Math.PI / 180);

const haversine = (
  originLat: number,
  originLong: number,
  destinationLat: number,
  destinationLong: number
): number => {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(destinationLat - originLat);
  const dLon = deg2rad(destinationLong - originLong);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(originLat)) *
      Math.cos(deg2rad(destinationLat)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in km;
};

const isRemember = (): boolean => {
  const property = document.querySelector("#remember") as HTMLInputElement;
  if (property) {
    return property.checked;
  }
  return false;
};

const nearestRegion = (position: Position): void => {
  const regions = [
    {
      latitude: 39.179,
      longitude: -76.845,
      region: "baltimore",
    },
    {
      latitude: 33.483,
      longitude: -86.702,
      region: "birmingham",
    },
    {
      latitude: 28.565,
      longitude: -81.163,
      region: "orlando",
    },
    {
      latitude: 27.989,
      longitude: -82.736,
      region: "tampa",
    },
  ];

  let mindiff = 99999;
  let closest: string | undefined;

  for (const [_index, region] of Object.entries(regions)) {
    const diff = haversine(
      position.coords.latitude,
      position.coords.longitude,
      region.latitude,
      region.longitude
    );
    if (diff < mindiff) {
      closest = region.region;
      mindiff = diff;
    }
  }
  if (typeof closest === "string") {
    setLocation(closest, isRemember());
  } else {
    throw new TypeError("Failed to getLocation");
  }
};

const getGeoLocation = (): void => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(nearestRegion);
  } else {
    // Geolocation API not supported
    console.log("No location");
  }
};

const clearLocation = (): void => {
  document.cookie = "location=; expires=Thu, 01 Jan 1970 00:00:01 GMT;";
  console.log("Location cleared");
};

const loadRegion = (withGeo: boolean): void => {
  const region = getLocation();
  if (region !== "") {
    goToRegion(region);
    // clearLocation();
  } else if (withGeo) {
    console.log("Getting location");
    getGeoLocation();
  }
};

const setRegionFromClick = (region: string): void => {
  setLocation(region, isRemember());
};

document.addEventListener("DOMContentLoaded", () => {
  // Page load
  if (window.location.search.split("clear=")[1]) {
    // If there is a ?clear=1 in the URL, clear the location
    clearLocation();
  }

  const geoButton = document.querySelector("#geo") as HTMLButtonElement;
  geoButton.addEventListener("click", (event) => {
    event.preventDefault();
    loadRegion(true);
  });

  const regionLinks = document.querySelectorAll(".region-link");
  regionLinks.forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      const target = event.currentTarget as HTMLAnchorElement;
      const splitRegion = target.href.split("/");
      setRegionFromClick(splitRegion[splitRegion.length - 1]);
    });
  });

  loadRegion(false);
});
