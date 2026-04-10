/**
 * Common SF Symbol names used by plugins.
 *
 * This is a curated subset — SF Symbols has 5000+ icons.
 * The full enum will be auto-generated from the SF Symbols catalog.
 * Any valid SF Symbol name is accepted at runtime; this type
 * provides autocomplete for the most common ones.
 */
export type SFSymbolName =
  // Documents
  | "doc" | "doc.fill" | "doc.on.doc" | "doc.on.clipboard"
  | "doc.text" | "doc.text.fill" | "doc.richtext"
  // Folders
  | "folder" | "folder.fill" | "folder.badge.plus"
  // Navigation
  | "arrow.left" | "arrow.right" | "arrow.up" | "arrow.down"
  | "arrow.up.forward.app" | "arrow.triangle.branch"
  | "arrow.clockwise" | "arrow.counterclockwise"
  // Actions
  | "plus" | "minus" | "xmark" | "checkmark"
  | "pencil" | "pencil.line" | "trash" | "trash.fill"
  | "square.and.arrow.up" | "square.and.arrow.down"
  // Layout
  | "sidebar.left" | "sidebar.right" | "rectangle.split.2x1"
  | "tray" | "tray.fill" | "tray.2.fill"
  // Symbols
  | "sparkles" | "star" | "star.fill" | "heart" | "heart.fill"
  | "bolt" | "bolt.fill" | "flame" | "flame.fill"
  | "hand.wave" | "puzzlepiece.extension"
  // Media
  | "play" | "play.fill" | "pause" | "pause.fill"
  | "stop" | "stop.fill" | "forward" | "backward"
  // System
  | "gear" | "gearshape" | "terminal" | "hammer"
  | "gauge.medium" | "chart.bar" | "chart.line.uptrend.xyaxis"
  // Communication
  | "envelope" | "message" | "bell" | "bell.fill"
  // Generic string fallback
  | (string & {});
