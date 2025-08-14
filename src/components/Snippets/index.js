import React, { useState, useRef, useEffect, useCallback } from "react";
import "./Snippets.css";

export default function Snippets({ filename, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);
  const contentRef = useRef(null);
  const [height, setHeight] = useState("0px");

  useEffect(() => {
  if (contentRef.current) {
    setHeight(open ? `${contentRef.current.scrollHeight}px` : "0px");
  }
}, [open, children]);

  const handleToggle = useCallback(() => {
    setOpen((prev) => !prev);
  }, []);

  const contentId = useRef(
    `snippet-content-${Math.random().toString(36).substr(2, 9)}`
  ).current;

  return (
  <div className="snippet-block alert alert--info">
    <button className="snippet-summary" onClick={handleToggle} aria-expanded={open} aria-controls={contentId}>
      <span className="">{filename}</span>
      <span className={`chevron ${open ? "rotate" : ""}`}>&#9662;</span>
    </button>
    <div ref={contentRef} id={contentId} className="snippet-content" style={{ maxHeight: height }} >
      <div className="snippet-inner">{children}</div>
    </div>
  </div>
);
}
