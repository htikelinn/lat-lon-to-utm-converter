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
  gridZone: string;
  easting: string;
  northing: string;
  formatted: string;
  easting3?: string;   // 3-digit version
  northing3?: string;
  easting5?: string;   // 5-digit version
  northing5?: string;
}


export interface MGRSCoordinates {
  zone: number;
  latitudeBand: string;
  gridSquare: string;
  easting: string;
  northing: string;
  formatted: string;
}

export type CoordinateFormat = 'LATLON' | 'MM_UTM' | 'MGRS' | 'UTM';

export interface ConversionResult {
  utm: UTMCoordinates;
  latLon?: LatLonCoordinates;
  mmUtm?: MMUTMCoordinates;
  mgrs?: MGRSCoordinates;
  isValid: boolean;
  error?: string;
  inputFormat?: CoordinateFormat;
}