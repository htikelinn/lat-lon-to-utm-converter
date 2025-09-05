import proj4 from 'proj4';
import { LatLonCoordinates, UTMCoordinates, ConversionResult } from '../types/coordinates';

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
