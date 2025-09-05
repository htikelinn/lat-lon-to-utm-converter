import { convertLatLonToUTM } from './coordinateConverter';

describe('Coordinate Converter', () => {
  test('should convert NYC coordinates correctly', () => {
    const result = convertLatLonToUTM({ latitude: 40.7831, longitude: -73.9712 });
    
    expect(result.isValid).toBe(true);
    expect(result.utm.zone).toBe(18);
    expect(result.utm.hemisphere).toBe('N');
    // Use actual values from our conversion
    expect(result.utm.easting).toBeGreaterThan(580000);
    expect(result.utm.easting).toBeLessThan(590000);
    expect(result.utm.northing).toBeGreaterThan(4500000);
    expect(result.utm.northing).toBeLessThan(4520000);
  });

  test('should handle invalid latitude', () => {
    const result = convertLatLonToUTM({ latitude: 95, longitude: -73.9712 });
    
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('Latitude must be between -90 and 90 degrees');
  });

  test('should handle invalid longitude', () => {
    const result = convertLatLonToUTM({ latitude: 40.7831, longitude: 200 });
    
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('Longitude must be between -180 and 180 degrees');
  });

  test('should handle southern hemisphere correctly', () => {
    const result = convertLatLonToUTM({ latitude: -33.8688, longitude: 151.2093 }); // Sydney
    
    expect(result.isValid).toBe(true);
    expect(result.utm.zone).toBe(56);
    expect(result.utm.hemisphere).toBe('S');
  });
});
