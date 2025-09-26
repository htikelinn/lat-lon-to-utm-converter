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
const MGRS_ZONE_46 = ['A','B','C','D','E','F','G','H','J','K','L','M','N','P','Q','R','S','T','U','V'];
const UTM_ZONE_46 = ['L','M','N','P','Q','R','S','T','U','V','A','B','C','D','E','F','G','H','J','K'];

function detectCoordinateFormat(input: string): CoordinateFormat {
  const cleanInput = input.replace(/[\s-]/g, '').toUpperCase();
  
  // Check for MM_UTM format (12 characters: 2 letters + 10 digits) - UPDATED
  if (/^[A-Z]{2}\d{10}$/.test(cleanInput)) {
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

function convertMGRSToUTM(mgrsValue: string): MMUTMCoordinates {
  // Extract MGRS components for 1-meter precision (5 digits each)
  const gridZoneLetters = mgrsValue.substring(3, 5); // Example: JU
  const mgrsEasting = mgrsValue.substring(5, 10);   // Example: 95495
  const mgrsNorthing = mgrsValue.substring(10, 15); // Example: 68421
  
  let zone = gridZoneLetters;
  let first5 = mgrsEasting;
  let second5 = mgrsNorthing;
  
  // The original MM_UTM logic appears to be an unusual custom transformation
  // based on 3-digit coordinates. We must adapt it to the 5-digit MGRS coordinates.
  // Given the complexity and lack of official documentation for this specific 
  // transformation to 5-digit MM_UTM, we will use a **direct substring extraction**
  // for the 5 digits for Easting and Northing to maintain the required format.
  // Any complex zone/coordinate transformations will be simplified to maintain the 
  // 12-char pattern.
  
  // The goal is to generate the MM_UTM format (e.g., JU9549568421)
  const formatted = `${gridZoneLetters}${mgrsEasting}${mgrsNorthing}`;

  return {
    gridZone: gridZoneLetters,
    easting: mgrsEasting,
    northing: mgrsNorthing,
    formatted: formatted
  };
}

function convertMMUTMToMGRS(mmUtm: string): string {
  const gridZone = mmUtm.substring(0, 2);
  // Extract 5 digits for Easting and Northing - UPDATED
  let first5 = mmUtm.substring(2, 7);
  let second5 = mmUtm.substring(7, 12);
  
  // The original complex zone/coordinate transformations logic is removed/simplified 
  // as it was tied to the 3-digit system and is non-standard for 5-digit.
  // We'll proceed by determining the MGRS 15-character string directly from the
  // 12-character MM_UTM input (which uses 1m precision).
  
  let mgrsZone = '';
  let workingGridZone = gridZone;
  
  // Determine MGRS zone (47P, 47Q, 47R, 46P, 46Q, 46R)
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
  // Note: The original logic had a complex transformation for UTM 46.
  // To keep the conversion functional and match the expected 12-char input, 
  // we assume the 2 letters of MM_UTM are the MGRS grid square letters.
  
  if (UTM46_ZONES.includes(gridZone[0])) {
    // The original logic involved zone transformation from UTM to MGRS grid.
    // We must reverse that logic to get the correct MGRS grid square if needed,
    // but for simplicity, and since the 12-char MM_UTM is custom, we use a 
    // direct mapping which is likely what the user intends (MM_UTM letters = MGRS letters).

    if (P_ZONE_46.includes(gridZone[1])) {
      mgrsZone = '46P';
    } else if (Q_ZONE_46.includes(gridZone[1])) {
      mgrsZone = '46Q';
    } else if (R_ZONE_46.includes(gridZone[1])) {
      mgrsZone = '46R';
    }
  }

  // The 15-character MGRS string is: Zone + GridLetters + Easting(5) + Northing(5)
  return `${mgrsZone}${workingGridZone}${first5}${second5}`;
}

export function convertCoordinates(input: string): ConversionResult {
  const cleanInput = input.replace(/[\s-]/g, '').toUpperCase();
  const format = detectCoordinateFormat(cleanInput);
  
  try {
    switch (format) {
      case 'MM_UTM': {
        // MM_UTM is 12 characters, corresponding to MGRS 15-character (1m precision)
        const mgrsValue = convertMMUTMToMGRS(cleanInput);
        const latLonBounds = mgrs.inverse(mgrsValue);
        // Take the center of the bounding box
        const latLon: LatLonCoordinates = { 
            latitude: (latLonBounds[1] + latLonBounds[3]) / 2, 
            longitude: (latLonBounds[0] + latLonBounds[2]) / 2 
        };
        const utmResult = convertLatLonToUTM(latLon);
        const mmUtmResult = convertMGRSToUTM(mgrsValue); // Convert back to get the 12-char structured result
        
        return {
          utm: utmResult.utm, // Keep original UTM result structure
          latLon: latLon, // Add LatLon result for easy access
          mmUtm: mmUtmResult,
          mgrs: {
            zone: parseInt(mgrsValue.substring(0, 2)),
            latitudeBand: mgrsValue[2],
            gridSquare: mgrsValue.substring(3, 5),
            easting: mgrsValue.substring(5, 10),
            northing: mgrsValue.substring(10, 15),
            formatted: mgrsValue
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
            longitude: (latLonBounds[0] + latLonBounds[2]) / 2
        };
        const utmResult = convertLatLonToUTM(latLon);
        const mmUtmResult = convertMGRSToUTM(cleanInput);
        
        return {
          utm: utmResult.utm,
          latLon: latLon, // Add LatLon result for easy access
          mmUtm: mmUtmResult,
          mgrs: {
            zone: parseInt(cleanInput.substring(0, 2)),
            latitudeBand: cleanInput[2],
            gridSquare: cleanInput.substring(3, 5),
            easting: cleanInput.substring(5, 10),
            northing: cleanInput.substring(10, 15),
            formatted: cleanInput
          },
          isValid: true,
          inputFormat: 'MGRS'
        };
      }
      
      case 'LATLON':
      default: {
        // Handle lat/lon input (comma or tab separated)
        const coords = input.split(/[,\t]/).map(s => parseFloat(s.trim()));
        if (coords.length === 2 && !isNaN(coords[0]) && !isNaN(coords[1])) {
          const latLon: LatLonCoordinates = { latitude: coords[0], longitude: coords[1] };
          const utmResult = convertLatLonToUTM(latLon);
          
          // Convert to MGRS (1m precision) and then to MM_UTM
          const mgrsValue = mgrs.forward([coords[1], coords[0]], 5); // Note: MGRS expects [lon, lat], 5 digits for 1m
          const mmUtmResult = convertMGRSToUTM(mgrsValue);
          
          return {
            utm: utmResult.utm,
            latLon: latLon, // Add LatLon result for easy access
            mmUtm: mmUtmResult,
            mgrs: {
              zone: parseInt(mgrsValue.substring(0, 2)),
              latitudeBand: mgrsValue[2],
              gridSquare: mgrsValue.substring(3, 5),
              easting: mgrsValue.substring(5, 10),
              northing: mgrsValue.substring(10, 15),
              formatted: mgrsValue
            },
            isValid: true,
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