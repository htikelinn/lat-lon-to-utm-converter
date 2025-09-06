export interface LatLonCoordinates {
  latitude: number;
  longitude: number;
}

export interface UTMCoordinates {
  easting: number;
  northing: number;
  zone: number;
  hemisphere: 'N' | 'S';
}

export interface MMUTMCoordinates {
  gridZone: string; // Two-letter grid zone (e.g., "KA")
  easting: string;  // 3-digit easting
  northing: string; // 3-digit northing
  formatted: string; // Full 8-character format (e.g., "KA123456")
}

export interface MGRSCoordinates {
  zone: number;
  latitudeBand: string;
  gridSquare: string;
  easting: string;
  northing: string;
  formatted: string; // Full MGRS string
}

export type CoordinateFormat = 'LATLON' | 'UTM' | 'MM_UTM' | 'MGRS';

export interface ConversionResult {
  utm: UTMCoordinates;
  mmUtm?: MMUTMCoordinates;
  mgrs?: MGRSCoordinates;
  isValid: boolean;
  error?: string;
  inputFormat?: CoordinateFormat;
}
