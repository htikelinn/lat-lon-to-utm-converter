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

export interface ConversionResult {
  utm: UTMCoordinates;
  isValid: boolean;
  error?: string;
}
