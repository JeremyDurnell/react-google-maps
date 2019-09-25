/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { ReactElement, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import debounce from "lodash.debounce";

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
   * OverlayView div container's optional id.
   */
  id?: string;

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
  id = "",
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
      // Add it to container only when the value exist
      if (entry[1]) {
        const key = entry[0];
        const value = entry[1];

        divElement.setAttribute(key, value);
      }
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
   * Map container to be used for click events.
   * [Map Container's id has been set to 'map_canvas'].
   */
  const mapContainer = document.getElementById(MapEnums.ID) as Element;

  /**
   * Pointer to maps.OverlayView.
   * We need this to use preventMapHitsFrom static method from the Google Maps API.
   * There is no type exist for this API as of yet.
   */
  const OverlayView = maps.OverlayView;

  /**
   * OverlayView div container to be drawn on the map.
   */
  const [overlayViewContainer] = useState<HTMLDivElement>(
    generateDivContainer({
      id,
      class: ContainerAttributes.CLASSNAME,
      style: ContainerAttributes.STYLE,
    }),
  );

  /**
   * Call preventMapHitsFrom static function on the OverlayView Api.
   * Stops click or tap on the element from bubbling up to the map.
   * We Use this to prevent the map from triggering "click" events on Markers.
   */
  // @ts-ignore
  OverlayView.preventMapHitsFrom(overlayViewContainer);

  /**
   * Returns to a lodash debounce function to remove 'selected' and 'active' classes from
   * the overlayViewContainer when the map is clicked.
   * The debounced function comes with a cancel method to cancel
   * delayed invocations.
   */
  // @ts-ignore
  const generateDebouncedClickListener = () =>
    debounce(() => {
      if (overlayViewContainer.classList.contains("selected")) {
        overlayViewContainer.classList.remove("selected");
      }

      if (overlayViewContainer.classList.contains("active")) {
        overlayViewContainer.classList.remove("active");
      }
    }, 200);

  /**
   *  mapClickListener to be used for click and double click events.
   */
  const mapClickListener = generateDebouncedClickListener();

  /**
   *  mapContainerClickListener to be used for click events.
   *  If user clicks another marker, we will remove the selected class from the previous one.
   */
  const mapContainerClickListener = (event: MouseEvent): void => {
    const pointerTarget = event.target as HTMLElement;
    const buttonElement = pointerTarget.closest("div > button") as HTMLElement;
    const isMarker = buttonElement && buttonElement.dataset.type === "marker";
    const isMap = pointerTarget.id === "map_canvas";

    if ((isMarker || isMap) && !overlayViewContainer.contains(pointerTarget)) {
      if (overlayViewContainer.classList.contains("selected")) {
        overlayViewContainer.classList.remove("selected");
      }
    }
  };

  /**
   * Adds 'selected' class to the overlayViewContainer when clicked.
   * ['selected' will always be applied before 'active'].
   */
  function mouseDown(): void {
    const selected = overlayViewContainer.classList.contains("selected");
    const active = overlayViewContainer.classList.contains("active");

    if (selected && active) {
      return;
    } else if (!selected) {
      overlayViewContainer.classList.add("selected");
    } else if (active) {
      overlayViewContainer.classList.replace("active", "selected");
      overlayViewContainer.classList.add("active");
    }
  }

  /**
   * Add 'active' class to the overlayViewContainer when hovered.
   */
  function mouseEnter(): void {
    overlayViewContainer.classList.add("active");
  }

  /**
   * Removes 'active' class to the overlayViewContainer when unhovered.
   */
  function mouseLeave(): void {
    overlayViewContainer.classList.remove("active");
  }

  /**
   * Use Effect Hook for OverlayView Container events.
   */
  useEffect(() => {
    const mapClickHandler = map.addListener("click", mapClickListener);
    const mapDoubleClickHandler = map.addListener(
      "dblclick",
      mapClickListener.cancel,
    );

    overlayViewContainer.addEventListener("mouseenter", mouseEnter);
    overlayViewContainer.addEventListener("mouseleave", mouseLeave);
    overlayViewContainer.addEventListener("mousedown", mouseDown);

    return () => {
      maps.event.removeListener(mapClickHandler);
      maps.event.removeListener(mapDoubleClickHandler);
      maps.event.clearInstanceListeners(overlayViewContainer);
    };
  }, [overlayViewContainer]);

  /**
   * Use Effect Hook for Map Container events.
   */
  useEffect(() => {
    const mapContainerClickHandler = maps.event.addDomListener(
      mapContainer,
      "click",
      mapContainerClickListener as EventListener,
    );

    return () => {
      maps.event.removeListener(mapContainerClickHandler);
    };
  }, [mapContainer]);

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
