import { convertCoordinates, convertLatLonToUTM } from './coordinateConverter';

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

  test('should handle utm(wgs84) correctly', () => {
    const result = convertLatLonToUTM({ latitude: 20.7779105, longitude: 95.8807137 }); // Sydney

    expect(result.isValid).toBe(true);
    expect(result.utm.zone).toBe(46);
    expect(result.utm.hemisphere).toBe('N');
    expect(result.utm.easting).toBe(799924.99);
    expect(result.utm.northing).toBe(2300244.99);
  });
  // Corrected test file
  // Corrected test file

  test('latlon to all formats conversion', () => {
    const result = convertCoordinates("20.7779105,95.2207137");

    expect(result.isValid).toBe(true);
    // Use optional chaining and check for undefined
    expect(result.latLon?.latitude).toBe(20.7779105);
    expect(result.latLon?.longitude).toBe(95.2207137);
    expect(result.mmUtm?.formatted).toBe("HT003999");
    expect(result.mgrs?.formatted).toBe("46QGJ9992500245");
  });

  test('mmutm to all formats conversion', () => {
    const result = convertCoordinates("HT003999");

    expect(result.isValid).toBe(true);
    expect(result.mmUtm?.formatted).toBe("HT003999");
    // These will be approximate due to coordinate transformations
    expect(result.latLon?.latitude).toBeCloseTo(20.7779105, 6);
    expect(result.latLon?.longitude).toBeCloseTo(95.2207137, 6);
  });

  test('mgrs to all formats conversion', () => {
    const result = convertCoordinates("46QGJ9992500245");

    expect(result.isValid).toBe(true);
    expect(result.mgrs?.formatted).toBe("46QGJ9992500245");
    expect(result.mmUtm?.formatted).toBe("HT003999");
    expect(result.latLon?.latitude).toBeCloseTo(20.7779105, 6);
    expect(result.latLon?.longitude).toBeCloseTo(95.2207137, 6);
  });
});
