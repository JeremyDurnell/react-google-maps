import React, { ReactElement, useEffect } from "react";
import { MarkerClustererPlus } from "./markerclustererplus.js";

import {
  GoogleMapOverlayViewContext,
  useGoogleMap,
} from "../context/GoogleMapsContext";

export interface MarkerClustererProps {
  /**
   * MarkerClusterer locations.
   */
  locations: Array<google.maps.LatLngLiteral>;
  /**
   * MarkerClusterer options.
   */
  options: MarkerClustererOptions;
}

export function MarkerClusterer({
  locations,
  options,
}: MarkerClustererProps): null | ReactElement<object> {
  /**
   * Instantiate Google Map.
   */
  const map = useGoogleMap();

  useEffect(() => {
    if (!map && !locations) {
      return;
    }
    // Generate markers to be clustered.
    const markers = locations.map(function(location) {
      return new google.maps.Marker({
        position: location,
      });
    });

    // Add a marker clusterer to manage the markers.
    const markerClustererPlus = new MarkerClustererPlus(map, markers, options);

    return () => {
      // Clear markers on unmount.
      markerClustererPlus.clearMarkers();
    };
  }, [map, locations]);

  return <GoogleMapOverlayViewContext.Provider value={null} />;
}
