import React, { ReactElement, useEffect, useState } from "react";
import { createPortal } from 'react-dom';
import { useDeepCompareMemo } from '../internal/useDeepCompareMemo';
import { useMemoOnce } from "../internal/useMemoOnce";
import {
  GoogleMapOverlayViewContext,
  useGoogleMap,
  useGoogleMapsAPI,
} from "../context/GoogleMapsContext";

export enum ContainerAttributes {
  ID = 'infoWindow',
  STYLE = 'position: absolute; touch-action: pan-x pan-y;'
}

export interface Attributes {
  [key: string]: string;
};

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
   * Optinal React Element placed in to the MarkerOverlayView.
   */
  infoWindow?: React.ReactElement<object> | null;

  /**
   * Optional Pane by default 'overlayMouseTarget'.
   * [overlayMouseTarget contains elements that receive DOM events.]
   */
  pane?: keyof google.maps.MapPanes;
}

export function MarkerOverlayView({ position, children, infoWindow = null, pane = 'overlayMouseTarget' }: MarkerOverlayViewProps): null | ReactElement<object> {

  /**
   * Instantiate Google Map, and the Google Maps API.
   */
  const map = useGoogleMap();
  const maps = useGoogleMapsAPI();

  /**
   * Div container generator.
   */
  const generateDivContainer = (attributes: Attributes): HTMLDivElement => {
    const divElement = document.createElement('div');
    Object.entries(attributes).forEach(entry => {
      const key = entry[0];
      const value = entry[1];
      divElement.setAttribute(key, value);
    });
    return divElement;
  };

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
  const [overlayViewContainer] = useState<HTMLDivElement>(generateDivContainer({ style: ContainerAttributes.STYLE }));

  /**
   * infoWindowContainer div container to be drawn above the overlayView.
   */
  const [infoWindowContainer] = useState<HTMLDivElement>(generateDivContainer({ style: ContainerAttributes.STYLE, id: ContainerAttributes.ID }));

  /**
   * Removes the info window from the DOM. Assigned to mouseleave.
   */
  function hideInfoWindow(event: MouseEvent): void {
    const { parentNode } = overlayViewContainer;
    const overlayMouseTarget = (event.relatedTarget as Element).parentNode || (event.toElement as Element).parentNode;
    const InfoWindowNode = (overlayMouseTarget as Element).id === ContainerAttributes.ID;
    if (parentNode && !InfoWindowNode) {
      parentNode.contains(infoWindowContainer) && parentNode.removeChild(infoWindowContainer);
    }
  };

  /**
   * Appends the info window to the DOM. Assigned to mouseenter.
   */
  function showInfoWindow(event: MouseEvent): void {
    const parentNode = event && overlayViewContainer.parentNode;
    if (parentNode) {
      parentNode.appendChild(infoWindowContainer);
    }
  };

  /**
   * Use Effect Hook for the containers' events.
   */
  useEffect(() => {
    overlayViewContainer.addEventListener("mouseenter", showInfoWindow);
    overlayViewContainer.addEventListener("mouseleave", hideInfoWindow);
    infoWindowContainer.addEventListener("mouseleave", hideInfoWindow);

    return () => {
      overlayViewContainer.removeEventListener("mouseenter", showInfoWindow);
      overlayViewContainer.removeEventListener("mouseleave", hideInfoWindow);
      infoWindowContainer.removeEventListener("mouseleave", hideInfoWindow);
    };
  }, [infoWindowContainer, overlayViewContainer]);

  /**
   * Use Effect Hook for Google Maps OverlayView API events.
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
       * Append the overlayViewContainerto the "overlayMouseTarget" pane.
       */
      overlayView.getPanes()[pane].appendChild(overlayViewContainer);
    };

    /**
     * OverlayView.draw() will be called when the object is first displayed.
     */
    overlayView.draw = () => {
      /**
       * Returns the current Projection. [Canvas]
       */
      const overlayViewProjection = overlayView.getProjection();

      /**
       * Computes the pixel coordinates of the given geographical location 
       * in the DOM element that holds the draggable map.
       */
      const projectionLocation = overlayViewProjection.fromLatLngToDivPixel(
        new google.maps.LatLng(options.position.lat, options.position.lng)
      );

      /**
       * Set top and left styles of the absolutely positioned infoWindowContainer to the computed coordinates.
       */
      infoWindowContainer.style.left = projectionLocation.x.toString() + 'px';
      infoWindowContainer.style.top = projectionLocation.y.toString() + 'px';

      /**
       * Set top and left styles of the absolutely positioned overlayViewContainer to the computed coordinates.
       */
      overlayViewContainer.style.left = projectionLocation.x.toString() + 'px';
      overlayViewContainer.style.top = projectionLocation.y.toString() + 'px';
    };

    /**
     * The onRemove() method will be called automatically from the API if
     * we ever set the overlay's map property to 'null'.
     */
    overlayView.onRemove = () => {
      overlayViewContainer.parentNode && overlayViewContainer.parentNode.removeChild(overlayViewContainer);
    };

    /**
     * Explicitly call setMap on this overlay.
     */
    overlayView.setMap(map);
  }, [map]);

  return (
    <GoogleMapOverlayViewContext.Provider value={overlayView}>
      {children ? createPortal(children, overlayViewContainer) : null}
      {infoWindow ? createPortal(infoWindow, infoWindowContainer) : null}
    </GoogleMapOverlayViewContext.Provider>
  );
}
