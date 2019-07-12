import React, { ReactElement, useEffect, useState } from "react";
import { createPortal } from "react-dom";

import {
  GoogleMapOverlayViewContext,
  useGoogleMap,
  useGoogleMapsAPI,
} from "../context/GoogleMapsContext";
import { useDeepCompareMemo } from "../internal/useDeepCompareMemo";
import { useMemoOnce } from "../internal/useMemoOnce";
import { MapEnums } from "../map/Map";

export enum ContainerAttributes {
  CLASSNAME = "marker-overlay-view",
  STYLE = "position: absolute; touch-action: pan-x pan-y;",
}

export interface Attributes {
  [key: string]: string;
}

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
   * Optional Pane by default 'floatPane'.
   * [overlayMouseTarget contains elements that receive DOM events.]
   */
  pane?: keyof google.maps.MapPanes;
}

export function MarkerOverlayView({
  position,
  children,
  pane = "overlayMouseTarget",
}: MarkerOverlayViewProps): null | ReactElement<object> {
  /**
   * Instantiate Google Map, and the Google Maps API.
   */
  const map = useGoogleMap();
  const maps = useGoogleMapsAPI();

  /**
   * Div container generator.
   */
  const generateDivContainer = (attributes: Attributes): HTMLDivElement => {
    const divElement = document.createElement("div");

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
  const [overlayViewContainer] = useState<HTMLDivElement>(
    generateDivContainer({
      class: ContainerAttributes.CLASSNAME,
      style: ContainerAttributes.STYLE,
    }),
  );

  /**
   * Map container to be used for click events.
   * [Map Container's id has been set to 'map_canvas'].
   */
  const mapContainer = document.getElementById(MapEnums.ID) as Element;

  /**
   * Use Effect Hook for Google Maps OverlayView API events.
   */
  function mapContainerClickListener(event: MouseEvent): void {
    const pointerTarget =
      (event.target as Element) ||
      (event.relatedTarget as Element) ||
      (event.toElement as Element);

    if (!overlayViewContainer.contains(pointerTarget)) {
      if (overlayViewContainer.classList.contains("selected")) {
        overlayViewContainer.classList.remove("selected");
      }
    }
  }

  /**
   * Adds 'selected' class to the overlayViewContainer when clicked.
   * ['selected' will always be applied before 'active'].
   */
  function mouseDown(): void {
    const selected = overlayViewContainer.classList.contains("selected");
    const active = overlayViewContainer.classList.contains("active");

    if (selected && active) {
      return;
    }
    if (!selected && !active) {
      overlayViewContainer.classList.add("selected");
    } else if (active) {
      overlayViewContainer.classList.replace("active", "selected");
      overlayViewContainer.classList.add("active");
    }
  }

  /**
   * Adds/Removes 'active' class to the overlayViewContainer when hovered/unhovered.
   */
  function activeClassToggle(): void {
    overlayViewContainer.classList.toggle("active");
  }

  /**
   * Use Effect Hook for Container events.
   */
  useEffect(() => {
    const mapContainerClickHandler = maps.event.addDomListener(
      mapContainer,
      "click",
      mapContainerClickListener,
    );

    overlayViewContainer.addEventListener("mouseenter", activeClassToggle);
    overlayViewContainer.addEventListener("mouseleave", activeClassToggle);
    overlayViewContainer.addEventListener("mousedown", mouseDown);

    return () => {
      maps.event.removeListener(mapContainerClickHandler);
      overlayViewContainer.removeEventListener("mouseenter", activeClassToggle);
      overlayViewContainer.removeEventListener("mouseleave", activeClassToggle);
      overlayViewContainer.removeEventListener("mousedown", mouseDown);
    };
  }, [overlayViewContainer, mapContainer, maps]);

  /**
   * Use Effect Hook for Google Maps OverlayView API events.
   */
  useEffect(() => {
    if (!map) {
      return;
    }

    /**
     * OverlayView.onAdd() will be called when the map is ready for the overlayView to be attached.
     */
    overlayView.onAdd = () => {
      /**
       * Append the final container to the "overlayMouseTarget" pane.
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
        new google.maps.LatLng(options.position.lat, options.position.lng),
      );

      /**
       * Set top and left styles of the absolutely positioned overlayViewContainer to the computed coordinates.
       */
      overlayViewContainer.style.left = `${projectionLocation.x.toString()}px`;
      overlayViewContainer.style.top = `${projectionLocation.y.toString()}px`;
    };

    /**
     * The onRemove() method will be called automatically from the API if
     * we ever set the overlay's map property to 'null'.
     */
    overlayView.onRemove = () => {
      if (overlayViewContainer.parentNode) {
        overlayViewContainer.parentNode.removeChild(overlayViewContainer);
      }
    };

    /**
     * Explicitly call setMap on this overlay.
     */
    overlayView.setMap(map);

    return () => {
      overlayView.setMap(null);
    };
  }, [map]);

  return (
    <GoogleMapOverlayViewContext.Provider value={overlayView}>
      {children ? createPortal(children, overlayViewContainer) : null}
    </GoogleMapOverlayViewContext.Provider>
  );
}
