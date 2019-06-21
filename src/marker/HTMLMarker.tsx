import React, { ReactElement, useEffect, useRef } from "react";
import ReactDOM from 'react-dom';

import { useDeepCompareMemo } from '../internal/useDeepCompareMemo';
import { useMemoOnce } from "../internal/useMemoOnce";

import ReactDOMServer from "react-dom/server";
import { renderToStaticMarkup } from 'react-dom/server'



import {
  GoogleMapOverlayViewContext,
  useGoogleMap,
  useGoogleMapsAPI,
} from "../context/GoogleMapsContext";

// import { createLatLng } from "../internal/MapsUtils";
// import { useChangedProps } from "../internal/useChangedProps";
// import { useEventHandlers } from "../internal/useEventHandlers";
// import { useMemoOnce } from "../internal/useMemoOnce";
// import { MarkerEvent } from "./MarkerEvent";

export interface HTMLMarkerProps {
  /**
   * Marker position.
   */
  position: google.maps.LatLngLiteral;

  /**
   * React Element passed to the overlay.
   */
  children: React.ReactElement<object>;

  /**
   * Rollover text.
   */
  title?: string;

  /**
   * If `true`, the marker is visible.
   */
  visible?: boolean;

  /**
   * If `true`, the marker receives mouse and touch events.
   */
  clickable?: boolean;

  /**
   * If `true`, the marker can be dragged.
   */
  draggable?: boolean;

  //
  // Style
  //

  /**
   * Which animation to play when marker is added to a map.
   */
  animation?: "BOUNCE" | "DROP";

  /**
   * Mouse cursor to show on hover.
   */
  cursor?: string;

  /**
   * Icon for the foreground.
   */
  icon?: string | React.ReactElement<object>;

  /**
   * Adds a label to the marker.
   *
   * The label can either be a `string`, or a [google.maps.MarkerLabel](https://developers.google.com/maps/documentation/javascript/3.exp/reference#MarkerLabel) object.
   */
  label?: string | google.maps.MarkerLabel;

  /**
   * The marker's opacity between 0.0 and 1.0.
   */
  opacity?: number;

  /**
   * Optimization renders many markers as a single static element.
   *
   * Disable optimized rendering for animated GIFs or PNGs,
   * or when each marker must be rendered as a separate DOM element
   * (advanced usage only).
   */
  optimized?: boolean;

  /**
   * Image map region definition used for drag/click.
   *
   * See also: [google.maps.MarkerShape](https://developers.google.com/maps/documentation/javascript/3.exp/reference#MarkerShape)
   */
  shape?: google.maps.MarkerShape;

  /**
   * All markers are displayed on the map in order of their zIndex,
   * with higher values displaying in front of markers with lower values.
   * By default, markers are displayed according to their vertical position on screen,
   * with lower markers appearing in front of markers further up the screen.
   */
  zIndex?: number;

  /**
   * This handlers is called when the marker icon was clicked.
   */
  onClick?(): void;
  /**
   * This handlers is called when the marker icon was double clicked.
   */
  onDoubleClick?(): void;
  /**
   * This handlers is called when the marker icon was clicked.
   */
  onRightClick?(): void;

  /**
   * This handlers is called for a mouse down on the marker.
   */
  onMouseDown?(): void;
  /**
   * This handlers is called when the mouse leaves the area of the marker icon.
   */
  onMouseOut?(): void;
  /**
   * This handlers is called when the mouse enters the area of the marker icon.
   */
  onMouseOver?(): void;
  /**
   * This handlers is called when for a mouse up on the marker.
   */
  onMouseUp?(): void;

  /**
   * This handlers is called when the marker icon was clicked.
   */
  onDrag?(): void;
  /**
   * This handlers is called when the marker icon was clicked.
   */
  onDragStart?(): void;
  /**
   * This handlers is called when the marker icon was clicked.
   */
  onDragEnd?(): void;

  /**
   * This handlers is called when the marker `position` property changes.
   */
  onPositionChanged?(): void;
}

export function HTMLMarker({
  position,
  children,
  title,
  visible,
  clickable,
  draggable,
  cursor,
  label,
  opacity,
  optimized,
  shape,
  zIndex,

  icon,
  animation,

  onClick,
  onDoubleClick,
  onRightClick,
  onMouseOut,
  onMouseOver,
  onMouseDown,
  onMouseUp,
  onDrag,
  onDragStart,
  onDragEnd,
  onPositionChanged,
}: HTMLMarkerProps): null | ReactElement<object> {
  const map = useGoogleMap();
  const maps = useGoogleMapsAPI();

  const options = useDeepCompareMemo(() => ({ position }), [position]);

  // const changedOptions = useChangedProps(options);
  const overlay = useMemoOnce(() => new maps.OverlayView());

  const [container] = React.useState<HTMLDivElement>(document.createElement('div'));


  useEffect(() => {
    if (!maps) {
      return;
    }
    overlay.onAdd = () => {
      /** 
      container.style.position = "absolute";
      overlay.getPanes()[pane].appendChild(container);
      */


      const targetDiv = document.createElement('div');


      const element = ReactDOM.hydrate(children, targetDiv);
      container.appendChild(element);

      container.className = "overlay_wrapper";

      const panes = overlay.getPanes();
      panes.overlayImage.appendChild(container);


    };
    overlay.draw = () => {

      /** 
      const projection = overlay.getProjection();
      const projectionLocation = projection.fromLatLngToDivPixel(
        new google.maps.LatLng(options.position.lat, options.position.lng)
      );
      container.style.left = JSON.stringify(projectionLocation.x) + "px";
      container.style.top = JSON.stringify(projectionLocation.y) + "px";
      */

      const overlayProjection = overlay.getProjection();
      // var position = overlayProjection.fromLatLngToDivPixel(new google.maps.LatLng(44.73532729516236, 14.806330871582077));

      const projectionLocation = overlayProjection.fromLatLngToDivPixel(
        new google.maps.LatLng(options.position.lat, options.position.lng)
      );

      const panes = overlay.getPanes();
      // console.info('paneszzz', panes);
      panes.overlayImage.style.left = projectionLocation.x + 'px';
      panes.overlayImage.style.top = projectionLocation.y - 30 + 'px';

    };
    overlay.onRemove = () => {

      // container.parentNode && container.parentNode.removeChild(container);
    };

    // overlay.setMap(map);
  }, [map]);


  useEffect(() => {
    overlay.setMap(map);
    return () => {
      overlay.setMap(null);
    };
  });







  return (
    <GoogleMapOverlayViewContext.Provider value={overlay} />
  );
}
