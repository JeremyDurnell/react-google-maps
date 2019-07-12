import * as index from "../index";

it("exposes public api", () => {
  expect(index).toMatchInlineSnapshot(
    {
      GoogleMapContext: expect.any(Object),
      GoogleMapsAPIContext: expect.any(Object),
      GoogleMapMarkerContext: expect.any(Object),
      GoogleMapOverlayViewContext: expect.any(Object),
    },
    `
Object {
  "ContainerAttributes": Object {
    "CLASSNAME": "marker-overlay-view",
    "STYLE": "position: absolute; touch-action: pan-x pan-y;",
  },
  "CustomControl": [Function],
  "DataPolygon": [Function],
  "DrawingControl": [Function],
  "FitBounds": [Function],
  "FullscreenControl": [Function],
  "GoogleMapContext": Any<Object>,
  "GoogleMapMarkerContext": Any<Object>,
  "GoogleMapOverlayViewContext": Any<Object>,
  "GoogleMapsAPIContext": Any<Object>,
  "InfoWindow": [Function],
  "Map": [Function],
  "MapEnums": Object {
    "ID": "map_canvas",
  },
  "MapTypeControl": [Function],
  "Marker": [Function],
  "MarkerIcon": [Function],
  "MarkerOverlayView": [Function],
  "MarkerSymbol": [Function],
  "PanBy": [Function],
  "PanTo": [Function],
  "PanToBounds": [Function],
  "Polyline": [Function],
  "RotateControl": [Function],
  "ScaleControl": [Function],
  "StreetViewControl": [Function],
  "ZoomControl": [Function],
  "useGoogleMap": [Function],
  "useGoogleMapMarker": [Function],
  "useGoogleMapOverlayView": [Function],
  "useGoogleMapsAPI": [Function],
  "useGoogleMapsLoader": [Function],
}
`,
  );
});
