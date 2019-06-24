# Google Maps integration with React.

[![npm version](https://img.shields.io/npm/v/@dc0de/react-google-maps.svg)](https://npmjs.com/@jeremydurnell/react-google-maps)
[![npm minzipped size](https://img.shields.io/bundlephobia/minzip/@dc0de/react-google-maps.svg)](https://bundlephobia.com/result?p=@jeremydurnell/react-google-maps)
[![npm type definitions](https://img.shields.io/npm/types/@dc0de/react-google-maps.svg)](https://npmjs.com/@jeremydurnell/react-google-maps)
[![npm downloads](https://img.shields.io/npm/dm/@dc0de/react-google-maps.svg)](https://npmjs.com/@jeremydurnell/react-google-maps)
[![npm license](https://img.shields.io/npm/l/@dc0de/react-google-maps.svg)](https://npmjs.com/@jeremydurnell/react-google-maps)

Fully declarative render-style components built with latest React features. Checkout [documentation](https://dcodeteam.github.io/react-google-maps/) with examples.

#### Installation

```bash
# With yarn
yarn add @dc0de/react-google-maps

# Or with npm
npm install @dc0de/react-google-maps
```

#### Touch Events not working?

```javascript
if (window.navigator) {
  /**
   * Make mouse work with google maps in Windows touch devices.
   *
   * @link http://stackoverflow.com/a/37611736/1709679
   */
  window.navigator.msPointerEnabled = true;

  /**
   * Make touch/pan/zoom work with google maps work in Windows touch devices.
   *
   * @link https://code.google.com/p/gmaps-api-issues/issues/detail?id=6425
   */
  window.navigator.msMaxTouchPoints = window.navigator.msMaxTouchPoints || 2;
}
```
