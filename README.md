# Universal Coordinate Converter

A React-based web application for converting between different coordinate systems, including Latitude/Longitude, UTM, MM_UTM (Myanmar), and MGRS formats.

## Features

- **Multiple Coordinate Systems Support:**
  - Latitude/Longitude (decimal degrees)
  - UTM (Universal Transverse Mercator)
  - MM_UTM (Myanmar UTM - 8-character format for UTM zones 46 and 47)
  - MGRS (Military Grid Reference System)

- **Smart Format Detection:** Automatically detects the input coordinate format
- **Real-time Conversion:** Converts coordinates as you type
- **Multiple Examples:** Pre-loaded examples for each coordinate format
- **Google Maps Integration:** View coordinates on an interactive map with detailed info
- **Responsive Design:** Works on desktop and mobile devices

## Supported Coordinate Formats

### Latitude/Longitude
- Format: `latitude, longitude` (comma or tab separated)
- Example: `40.7831, -73.9712`
- Range: Latitude (-90 to 90), Longitude (-180 to 180)

### UTM (Universal Transverse Mercator)
- Displayed format: `Zone Hemisphere Easting Northing`
- Example: `18N 583960.00E 4507523.00N`

### MM_UTM (Myanmar UTM)
- Format: 8 characters (2 letters + 6 digits)
- Example: `KA123456`
- Specific to Myanmar region (UTM zones 46 and 47)
- Based on grid zone mapping system

### MGRS (Military Grid Reference System)
- Format: 15 characters (2 digits + 1 letter + 2 letters + 10 digits)
- Example: `46QGJ1234567890`
- High precision coordinate system

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Google Maps Setup

To enable the Google Maps feature, you need to:

1. **Get a Google Maps API Key:**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select an existing one
   - Enable the "Maps JavaScript API"
   - Create credentials (API Key)
   - Restrict the API key to your domain for security

2. **Configure the API Key:**
   ```bash
   # Copy the environment example file
   cp .env.example .env
   
   # Edit .env and replace with your actual API key
   REACT_APP_GOOGLE_MAPS_API_KEY=your_actual_api_key_here
   ```

3. **Features:**
   - Click "📍 Show on Map" button after entering coordinates
   - Interactive map with satellite/hybrid view
   - Click markers to see detailed coordinate information
   - Automatic centering and zooming to location

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can’t go back!**

If you aren’t satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you’re on your own.

You don’t have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn’t feel obligated to use this feature. However we understand that this tool wouldn’t be useful if you couldn’t customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).
