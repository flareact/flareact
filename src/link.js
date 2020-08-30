import React, { Children } from "react";
import { useRouter } from "./router";

let prefetched = {};

/**
 * Heavily-inspired by next/link
 *
 * @param {object} props
 */
export default function Link(props) {
  const router = useRouter();
  const child = Children.only(props.children);

  const { href, as } = props;

  const shouldPrefetch = props.prefetch !== false;

  function linkClicked(e) {
    const { nodeName, target } = e.currentTarget;
    if (
      nodeName === "A" &&
      ((target && target !== "_self") ||
        e.metaKey ||
        e.ctrlKey ||
        e.shiftKey ||
        (e.nativeEvent && e.nativeEvent.which === 2))
    ) {
      // ignore click for new tab / new window behavior
      return;
    }

    if (!isLocal(href)) return;

    e.preventDefault();

    router.push(href, as);
  }

  const childProps = {
    // Forward ref if the user has it set
    ref: (el) => {
      if (child && child.ref) {
        if (typeof child.ref === "function") child.ref(el);
        else if (typeof child.ref === "object") {
          child.ref.current = el;
        }
      }
    },
    // Forward onClick handler if the user has it set
    onClick: (e) => {
      if (child.props && typeof child.props.onClick === "function") {
        child.props.onClick(e);
      }

      if (!e.defaultPrevented) {
        linkClicked(e);
      }
    },
  };

  if (shouldPrefetch) {
    childProps.onMouseEnter = (e) => {
      if (child.props && typeof child.props.onMouseEnter === "function") {
        child.props.onMouseEnter(e);
      }

      prefetch(router, href, as, { priority: true });
    };
  }

  // If child is an <a> tag and doesn't have a href attribute, or if the 'passHref' property is
  // defined, we specify the current 'href', so that repetition is not needed by the user
  if (props.passHref || (child.type === "a" && !("href" in child.props))) {
    childProps.href = href;
  }

  return React.cloneElement(child, childProps);
}

/**
 * Detects whether a given url is from the same origin as the current page (browser only).
 */
function isLocal(url) {
  const locationOrigin = getLocationOrigin();
  const resolved = new URL(url, locationOrigin);
  return resolved.origin === locationOrigin;
}

function getLocationOrigin() {
  const { protocol, hostname, port } = window.location;
  return `${protocol}//${hostname}${port ? ":" + port : ""}`;
}

function prefetch(router, href, as, options) {
  if (typeof window === "undefined") return;

  router.prefetch(href, as, options);

  prefetched[href + "%" + as] = true;
}
