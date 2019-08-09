import React, { ReactElement, useEffect } from "react";
import * as MarkerClustererPlus from "@google/markerclustererplus";

import {
  GoogleMapOverlayViewContext,
  useGoogleMap,
} from "../context/GoogleMapsContext";


export interface MarkerOverlayViewProps {
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
}: MarkerOverlayViewProps): null | ReactElement<object> {
  /**
   * Instantiate Google Map.
   */
  const map = useGoogleMap();

  useEffect(() => {
    if (!map) {
      return;
    }
    // Generate markers to be clustered.
    const markers = locations.map(function(location) {
      return new google.maps.Marker({
        position: location,
      });
    });

    // Add a marker clusterer to manage the markers.
    new MarkerClustererPlus(map, markers, options);
  }, [map]);

  return <GoogleMapOverlayViewContext.Provider value={null} />;
}
