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
  easting: string;  // 3-digit easting (Updated from 3-digit)
  northing: string; // 3-digit northing (Updated from 3-digit)
  formatted: string; // Full 12-character format (e.g., "KA1234567890") (Updated from 8-char)
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
  latLon?: LatLonCoordinates; // <-- ADD THIS LINE
  isValid: boolean;
  error?: string;
  inputFormat?: CoordinateFormat;
}