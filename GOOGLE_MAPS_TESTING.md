# Google Maps Testing Guide

## Quick Test Steps

1. **Start the application:**
   ```bash
   npm start
   ```

2. **Test with different coordinate formats:**

   **For Lat/Lon (easiest to test):**
   - Enter: `16.7967, 96.1610` (Yangon, Myanmar coordinates)
   - Click "📍 Show on Map" button
   - Map should show Yangon with a marker

   **For MM_UTM:**
   - Click "MM_UTM Example" button (loads: KA123456)
   - Click "📍 Show on Map" button
   - Map should show Myanmar location

   **For MGRS:**
   - Click "MGRS Example" button (loads: 46QGJ1234567890)
   - Click "📍 Show on Map" button
   - Map should show Myanmar location

3. **Map Features to Test:**
   - ✅ Map loads with satellite/hybrid view
   - ✅ Marker appears at correct location
   - ✅ Click marker to see info popup with all coordinate formats
   - ✅ "✕ Close Map" button works
   - ✅ Responsive design on mobile

## Expected Results

- **Yangon coordinates (16.7967, 96.1610)** should show downtown Yangon
- **MM_UTM and MGRS examples** should show locations within Myanmar
- **Info popup** should display all coordinate formats when clicking the marker

## Troubleshooting

If the map shows "Error loading Google Maps":
1. Check that `.env` file exists with valid API key
2. Ensure Maps JavaScript API is enabled in Google Cloud Console
3. Check browser console for detailed error messages

If coordinates seem off:
1. MM_UTM format is specific to Myanmar (UTM zones 46/47)
2. MGRS coordinates should be 15 characters long
3. Lat/Lon should be comma or tab separated

## Myanmar Test Coordinates

Here are some real Myanmar coordinates for testing:

- **Yangon:** `16.7967, 96.1610`
- **Mandalay:** `21.9588, 96.0891` 
- **Naypyidaw:** `19.7633, 96.1294`
- **Bagan:** `21.1717, 94.8618`
