import React, { ReactElement, useEffect } from "react";
import { hydrate } from 'react-dom';
import { renderToString } from 'react-dom/server'

import { useDeepCompareMemo } from '../internal/useDeepCompareMemo';
import { useMemoOnce } from "../internal/useMemoOnce";

import {
  GoogleMapOverlayViewContext,
  useGoogleMap,
  useGoogleMapsAPI,
} from "../context/GoogleMapsContext";

export interface MarkerOverlayViewProps {
  /**
   * MarkerOverlayView position.
   */
  position: google.maps.LatLngLiteral;

  /**
   * React Element placed in to the MarkerOverlayView.
   */
  children: React.ReactElement<object>;

  /**
   * Pane by default 'overlayMouseTarget'.
   * [overlayMouseTarget contains elements that receive DOM events.]
   */
  pane: keyof google.maps.MapPanes;
}

export function MarkerOverlayView({ position, children, pane = 'overlayMouseTarget' }: MarkerOverlayViewProps): null | ReactElement<object> {

  /**
   * Instantiate Google Map, and the Google Maps API.
   */
  const map = useGoogleMap();
  const maps = useGoogleMapsAPI();

  /**
   * The Lat, Lng coordinate object passed to the OverlayView.
   */
  const options = useDeepCompareMemo(() => ({ position }), [position]);

  /**
   * Instance of the OverlayView object.
   */
  const overlayView = useMemoOnce(() => new maps.OverlayView());

  /**
   * OverlayView div container to be drawn on the map.
   */
  const [container] = React.useState<HTMLDivElement>(document.createElement('div'));

  /**
   * Render the passed React child [JSX] element to its initial HTML Markup.
   */
  const [element] = React.useState<string>(renderToString(children));

  /**
   * Use Effect Hook.
   */
  useEffect(() => {
    if (!maps) {
      return;
    }

    /**
     * OverlayView.onAdd() will be called when the map is ready for the overlayView to be attached.
     */
    overlayView.onAdd = () => {

      /**
       * Insert the HTML markup contained within the child element to the OverlayView Container.
       */
      container.innerHTML = element;

      /**
       * Set the container's position to absolute.
       */
      container.style.position = 'absolute';

      /**
       * Hydrate the container where the inserted HTML markup were rendered.
       * React will attach event listeners to the existing markup.
       */
      hydrate(children, container);

      /**
       * Append the final container to the "overlayMouseTarget" pane.
       */
      overlayView.getPanes()[pane].appendChild(container);

    };

    /**
     * OverlayView.draw() will be called when the object is first displayed.
     */
    overlayView.draw = () => {
      /**
       * Returns the current Projection. [Canvas]
       */
      const overlayViewProjection = overlayView.getProjection();
      console.info('overlayViewProjection => ', overlayViewProjection);

      /**
       * Computes the pixel coordinates of the given geographical location 
       * in the DOM element that holds the draggable map.
       */
      const projectionLocation = overlayViewProjection.fromLatLngToDivPixel(
        new google.maps.LatLng(options.position.lat, options.position.lng)
      );

      /**
       * Set top and left styles of the absolutely positioned container to the computed coordinates.
       */
      container.style.left = projectionLocation.x.toString() + 'px';
      container.style.top = projectionLocation.y.toString() + 'px';
    };

    /**
     * The onRemove() method will be called automatically from the API if
     * we ever set the overlay's map property to 'null'.
     */
    overlayView.onRemove = () => {
      container.parentNode && container.parentNode.removeChild(container);
    };

    /**
     * Explicitly call setMap on this overlay.
     */
    overlayView.setMap(map);
  }, [map]);

  return (
    <GoogleMapOverlayViewContext.Provider value={overlayView} />
  );
}
