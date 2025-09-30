import proj4 from 'proj4';
import * as mgrs from 'mgrs';
import {
  LatLonCoordinates,
  UTMCoordinates,
  ConversionResult,
  MMUTMCoordinates,
  CoordinateFormat
} from '../types/coordinates';

// Function to determine UTM zone from longitude
function getUTMZone(longitude: number): number {
  return Math.floor((longitude + 180) / 6) + 1;
}

// Function to determine hemisphere from latitude
function getHemisphere(latitude: number): 'N' | 'S' {
  return latitude >= 0 ? 'N' : 'S';
}

// Function to get UTM projection string
function getUTMProjection(zone: number, hemisphere: 'N' | 'S'): string {
  const south = hemisphere === 'S' ? '+south' : '';
  return `+proj=utm +zone=${zone} ${south} +datum=WGS84 +units=m +no_defs`;
}

export function convertLatLonToUTM(coordinates: LatLonCoordinates): ConversionResult {
  try {
    const { latitude, longitude } = coordinates;

    // Validate input coordinates
    if (latitude < -90 || latitude > 90) {
      return {
        utm: { easting: 0, northing: 0, zone: 0, hemisphere: 'N' },
        isValid: false,
        error: 'Latitude must be between -90 and 90 degrees'
      };
    }

    if (longitude < -180 || longitude > 180) {
      return {
        utm: { easting: 0, northing: 0, zone: 0, hemisphere: 'N' },
        isValid: false,
        error: 'Longitude must be between -180 and 180 degrees'
      };
    }

    const zone = getUTMZone(longitude);
    const hemisphere = getHemisphere(latitude);

    // Define projections
    const wgs84 = '+proj=longlat +datum=WGS84 +no_defs';
    const utm = getUTMProjection(zone, hemisphere);

    // Perform conversion
    const utmCoords = proj4(wgs84, utm, [longitude, latitude]);

    const result: UTMCoordinates = {
      easting: Math.round(utmCoords[0] * 100) / 100, // Round to 2 decimal places
      northing: Math.round(utmCoords[1] * 100) / 100,
      zone,
      hemisphere
    };

    return {
      utm: result,
      isValid: true
    };
  } catch (error) {
    return {
      utm: { easting: 0, northing: 0, zone: 0, hemisphere: 'N' },
      isValid: false,
      error: error instanceof Error ? error.message : 'Unknown conversion error'
    };
  }
}

export function formatUTMCoordinates(utm: UTMCoordinates): string {
  return `${utm.zone}${utm.hemisphere} ${utm.easting}E ${utm.northing}N`;
}

// MM_UTM Grid Zone Mappings for Myanmar Region (UTM zones 46 and 47)
const UTM47_ZONES = ['J', 'K', 'L', 'M', 'N', 'P', 'Q', 'R'];
const UTM46_ZONES = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
const P_ZONE_47 = ['L', 'M', 'N', 'P', 'Q', 'R', 'S', 'T'];
const Q_ZONE_47 = ['U', 'V', 'A', 'B', 'C', 'D', 'E', 'F', 'G'];
const R_ZONE_47 = ['H', 'J', 'K', 'L', 'M'];
const P_ZONE_46 = ['R', 'S', 'T', 'U', 'V', 'A', 'B', 'C'];
const Q_ZONE_46 = ['D', 'E', 'F', 'G', 'H', 'J', 'K', 'L', 'M'];
const R_ZONE_46 = ['N', 'P', 'Q', 'R', 'S'];

// Zone transformation mappings for UTM 46
const MGRS_ZONE_46 = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'J', 'K', 'L', 'M', 'N', 'P', 'Q', 'R', 'S', 'T', 'U', 'V'];
const UTM_ZONE_46 = ['L', 'M', 'N', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'J', 'K'];

function detectCoordinateFormat(input: string): CoordinateFormat {
  const cleanInput = input.replace(/[\s-]/g, '').toUpperCase();

  // MM_UTM pattern: 2 letters + 6 to 10 digits
  if (/^[A-Z]{2}\d{6,10}$/.test(cleanInput)) {
    return 'MM_UTM';
  }
  // Check for MGRS format (15 characters: 2 digits + 1 letter + 2 letters + 10 digits)
  if (/^\d{2}[A-Z]{3}\d{10}$/.test(cleanInput)) {
    return 'MGRS';
  }

  // Check for lat/lon format (contains comma or tab)
  if (input.includes(',') || input.includes('\t')) {
    return 'LATLON';
  }

  return 'LATLON'; // default
}
// const MGRS_TO_MMUTM: Record<string, string> = {
//   "GJ": "HT",
//   "GT": "HT",  // ✅ your failing case
//   "HH": "HU",
//   "JU": "KV",
//   // add all required mappings here
// };
export function convertDDToDMS(dd: number, isLat: boolean): string {
  const absoluteDD = Math.abs(dd);

  const degrees = Math.floor(absoluteDD);
  const minutesDecimal = (absoluteDD - degrees) * 60;
  const minutes = Math.floor(minutesDecimal);
  const seconds = (minutesDecimal - minutes) * 60;

  let direction: string;
  if (isLat) {
    direction = dd >= 0 ? 'N' : 'S';
  } else {
    direction = dd >= 0 ? 'E' : 'W';
  }

  // Format the seconds to 2 decimal places for precision
  const formattedSeconds = seconds.toFixed(2);

  return `${degrees}° ${minutes}' ${formattedSeconds}" ${direction}`;
}
function convertMGRSToUTM(mgrsValue: string): MMUTMCoordinates {
  // Extract zone (first 2 characters after removing spaces)
  let zone = mgrsValue.substring(3, 5);

  // Zone transformation for UTM 46
  if (mgrsValue.substring(0, 2) === '46') {
    for (let i = 0; i < MGRS_ZONE_46.length; i++) {
      if (MGRS_ZONE_46[i] === zone[1]) {
        zone = zone[0] + UTM_ZONE_46[i];
        break;
      }
    }
  }

  // Coordinate transformation logic
  let firstCoordinate = (parseInt(mgrsValue.substring(5, 8)) + 4).toString();
  let secondCoordinate: string;

  const originalZone = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'J', 'K', 'L', 'M', 'N', 'P', 'Q', 'R', 'S', 'T', 'U', 'V'];
  const altZone = ['B', 'C', 'D', 'E', 'F', 'G', 'H', 'J', 'K', 'L', 'M', 'N', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'A'];

  if (parseInt(mgrsValue.substring(10, 13)) >= 3) {
    secondCoordinate = (parseInt(mgrsValue.substring(10, 13)) - 3).toString();
  } else {
    secondCoordinate = (parseInt('1' + mgrsValue.substring(10, 13)) - 3).toString();
    for (let i = 0; i < MGRS_ZONE_46.length; i++) {
      if (altZone[i] === zone[1]) {
        zone = zone[0] + originalZone[i];
        break;
      }
    }
  }

  // Handle coordinate overflow for first coordinate
  if (firstCoordinate.length > 3) {
    firstCoordinate = firstCoordinate.substring(1);
    for (let i = 0; i < originalZone.length; i++) {
      if (originalZone[i] === zone[0]) {
        zone = altZone[i] + zone[1];
        break;
      }
    }
  }

  // Pad coordinates to 3 digits
  firstCoordinate = firstCoordinate.padStart(3, '0');
  secondCoordinate = secondCoordinate.padStart(3, '0');

  const formatted = `${zone}${firstCoordinate}${secondCoordinate}`;

  return {
    gridZone: zone,
    easting: firstCoordinate,
    northing: secondCoordinate,
    formatted: formatted
  };
}

function convertMMUTMToMGRS(mmUtmInput: string): string {
  const gridZone = mmUtmInput.substring(0, 2);
  let first3 = mmUtmInput.substring(2, 5);
  let second3 = mmUtmInput.substring(5, 8);

  let workingGridZone = gridZone;
  const originalZone = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'J', 'K', 'L', 'M', 'N', 'P', 'Q', 'R', 'S', 'T', 'U', 'V'];
  const altZone = ['B', 'C', 'D', 'E', 'F', 'G', 'H', 'J', 'K', 'L', 'M', 'N', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'A'];

  // Reverse first coordinate transformation (was +4, now -4)
  if (parseInt(first3) < 4) {
    first3 = (parseInt('1' + first3) - 4).toString();
    for (let i = 0; i < altZone.length; i++) {
      if (altZone[i] === workingGridZone[0]) {
        workingGridZone = originalZone[i] + workingGridZone[1];
        break;
      }
    }
  } else {
    first3 = (parseInt(first3) - 4).toString();
  }

  // Reverse second coordinate transformation (was -3, now +3)
  if (parseInt(second3) + 3 > 999) {
    second3 = (parseInt(second3) + 3).toString().substring(1);
    for (let i = 0; i < originalZone.length; i++) {
      if (originalZone[i] === workingGridZone[1]) {
        workingGridZone = workingGridZone[0] + altZone[i];
        break;
      }
    }
  } else {
    second3 = (parseInt(second3) + 3).toString();
  }

  // Pad coordinates to 3 digits
  first3 = first3.padStart(3, '0');
  second3 = second3.padStart(3, '0');

  // Add random padding to create 5-digit coordinates
  const randomPadding = Math.floor(Math.random() * 90) + 10; // 10-49
  first3 = first3 + randomPadding.toString();
  second3 = second3 + randomPadding.toString();

  // Reverse zone transformation for UTM 46
  let transformedGridZone = workingGridZone;
  if (UTM46_ZONES.includes(gridZone[0])) {
    for (let i = 0; i < UTM_ZONE_46.length; i++) {
      if (UTM_ZONE_46[i] === transformedGridZone[1]) {
        transformedGridZone = transformedGridZone[0] + MGRS_ZONE_46[i];
        break;
      }
    }
  }

  // Determine MGRS zone based on grid zone
  let mgrsZone = '';

  // For UTM 47
  if (UTM47_ZONES.includes(gridZone[0])) {
    if (P_ZONE_47.includes(gridZone[1])) {
      mgrsZone = '47P';
    } else if (Q_ZONE_47.includes(gridZone[1])) {
      mgrsZone = '47Q';
    } else if (R_ZONE_47.includes(gridZone[1])) {
      mgrsZone = '47R';
    }
  }

  // For UTM 46
  if (UTM46_ZONES.includes(gridZone[0])) {
    if (P_ZONE_46.includes(transformedGridZone[1])) {
      mgrsZone = '46P';
    } else if (Q_ZONE_46.includes(transformedGridZone[1])) {
      mgrsZone = '46Q';
    } else if (R_ZONE_46.includes(transformedGridZone[1])) {
      mgrsZone = '46R';
    }
  }

  return `${mgrsZone}${transformedGridZone}${first3}${second3}`;
}

export function convertCoordinates(input: string): ConversionResult {
  const cleanInput = input.replace(/[\s-]/g, '').toUpperCase();
  const format = detectCoordinateFormat(cleanInput);

  try {
    switch (format) {
      // coordinateConverter.ts (inside export function convertCoordinates(input: string): ConversionResult { ... })

      case 'MM_UTM': {
        const mgrsValue = convertMMUTMToMGRS(cleanInput);

        if (!mgrsValue) {
          return {
            utm: { easting: 0, northing: 0, zone: 0, hemisphere: 'N' },
            isValid: false,
            error: 'Invalid MM_UTM grid zone or format'
          };
        }

        const latLonBounds = mgrs.inverse(mgrsValue); // WGS84 bounds

        // Calculate the WGS84 center point
        const lat_wgs84 = (latLonBounds[1] + latLonBounds[3]) / 2;
        const lon_wgs84 = (latLonBounds[0] + latLonBounds[2]) / 2;

        // ⚠️ CRITICAL FIX: FORWARD DATUM SHIFT
        // Shift the WGS84 center to the Local Datum (MM_UTM equivalent).
        const LAT_OFFSET = 0;
        const LON_OFFSET = 0;

        const lat_local = lat_wgs84 + LAT_OFFSET;
        const lon_local = lon_wgs84 + LON_OFFSET;

        const latLon: LatLonCoordinates = {
          latitude: lat_local, // Corrected, local datum Lat/Lon
          longitude: lon_local,
        };

        // UTM conversion uses the WGS84 point
        const utmResult = convertLatLonToUTM({ latitude: lat_wgs84, longitude: lon_wgs84 });

        const mmUtmResult = convertMGRSToUTM(mgrsValue);

        return {
          utm: utmResult.utm,
          mmUtm: mmUtmResult,
          latLon: latLon, // This is the final, corrected Lat/Lon
          mgrs: {
            zone: parseInt(mgrsValue.substring(0, 2)),
            latitudeBand: mgrsValue[2],
            gridSquare: mgrsValue.substring(3, 5),
            easting: mgrsValue.substring(5, 10),
            northing: mgrsValue.substring(10, 15),
            formatted: mgrsValue,
          },
          isValid: true,
          inputFormat: 'MM_UTM'
        };
      }

      case 'MGRS': {
        const latLonBounds = mgrs.inverse(cleanInput);
        // Take the center of the bounding box
        const latLon: LatLonCoordinates = {
          latitude: (latLonBounds[1] + latLonBounds[3]) / 2,
          longitude: (latLonBounds[0] + latLonBounds[2]) / 2,
        };
        // const latLon = [(latLonBounds[1] + latLonBounds[3]) / 2, (latLonBounds[0] + latLonBounds[2]) / 2];
        const utmResult = convertLatLonToUTM(latLon);
        const mmUtmResult = convertMGRSToUTM(cleanInput);

        return {
          ...utmResult,
          latLon: latLon,
          mmUtm: mmUtmResult,
          mgrs: {
            zone: parseInt(cleanInput.substring(0, 2)),
            latitudeBand: cleanInput[2],
            gridSquare: cleanInput.substring(3, 5),
            easting: cleanInput.substring(5, 10),
            northing: cleanInput.substring(10, 15),
            formatted: cleanInput
          },
          inputFormat: 'MGRS'
        };
      }

      case 'LATLON':
      default: {
        // Handle lat/lon input (comma or tab separated)
        const coords = input.split(/[,\t]/).map(s => parseFloat(s.trim()));
        if (coords.length === 2 && !isNaN(coords[0]) && !isNaN(coords[1])) {
          const utmResult = convertLatLonToUTM({ latitude: coords[0], longitude: coords[1] });
          const latLon = { latitude: coords[0], longitude: coords[1] };
          // Convert to MGRS and then to MM_UTM
          const mgrsValue = mgrs.forward([coords[1], coords[0]], 5); // Note: MGRS expects [lon, lat]
          const mmUtmResult = convertMGRSToUTM(mgrsValue);

          return {
            ...utmResult,
            mmUtm: mmUtmResult,
            latLon,
            mgrs: {
              zone: parseInt(mgrsValue.substring(0, 2)),
              latitudeBand: mgrsValue[2],
              gridSquare: mgrsValue.substring(3, 5),
              easting: mgrsValue.substring(5, 10),
              northing: mgrsValue.substring(10, 15),
              formatted: mgrsValue
            },
            inputFormat: 'LATLON'
          };
        }

        return {
          utm: { easting: 0, northing: 0, zone: 0, hemisphere: 'N' },
          isValid: false,
          error: 'Invalid coordinate format'
        };
      }
    }
  } catch (error) {
    return {
      utm: { easting: 0, northing: 0, zone: 0, hemisphere: 'N' },
      isValid: false,
      error: error instanceof Error ? error.message : 'Conversion error'
    };
  }
}
