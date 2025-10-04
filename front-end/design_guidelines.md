# Job Search Map Application - Design Guidelines

## Design Approach
**System-Based Approach**: Utility-focused design inspired by modern job platforms (LinkedIn Jobs, Indeed) with emphasis on functionality, scanability, and efficient information hierarchy. No decorative elements—every visual decision serves usability.

## Core Design Elements

### A. Color Palette
**Light Mode:**
- Background: 0 0% 98%
- Surface: 0 0% 100%
- Border: 220 13% 91%
- Primary: 221 83% 53% (functional blue for actions)
- Text Primary: 222 47% 11%
- Text Secondary: 215 16% 47%

**Dark Mode:**
- Background: 222 47% 11%
- Surface: 217 33% 17%
- Border: 217 33% 23%
- Primary: 217 91% 60%
- Text Primary: 210 40% 98%
- Text Secondary: 215 20% 65%

### B. Typography
- **Font**: Inter via Google Fonts CDN
- **Search Input**: text-base (16px) - prevent mobile zoom
- **Job Titles**: font-semibold text-lg
- **Company Names**: text-sm text-muted
- **Job Details**: text-sm regular weight
- **Labels**: text-xs uppercase tracking-wide

### C. Layout System
**Spacing Primitives**: Use Tailwind units of 2, 4, 6, and 8 for consistency
- Component padding: p-4 to p-6
- Section gaps: gap-4 to gap-6
- Margins: m-4, m-6
- Map height: Minimum h-96 on desktop, h-64 on mobile

**Grid Structure**:
- Desktop: Search bar full-width → Map (60%) | List (40%) side-by-side
- Tablet/Mobile: Stack vertically → Search → Map → List

### D. Component Library

**Search Interface:**
- Sticky header with search input, location input, radius selector
- Search button with primary color
- Compact, single-row layout on desktop
- Stack inputs on mobile

**Map Component:**
- OpenStreetMap with minimal controls
- Custom markers for job locations
- Selected state: larger marker with primary color
- Hover state: subtle elevation on markers
- Zoom controls bottom-right

**Job List Cards:**
- White/surface background with subtle border
- Hover state: slight elevation (shadow-sm to shadow-md)
- Selected state: border-l-4 with primary color
- Click-to-highlight on map interaction
- Compact spacing between cards (gap-2)

**Job Card Content Structure:**
- Job title (bold, larger)
- Company name (muted color)
- Location + Distance (text-sm with location icon)
- Salary range (if available)
- Posted date (text-xs, muted)

**Interactive States:**
- Cursor pointer on clickable elements
- Transition-colors duration-200 for smooth state changes
- Focus rings for keyboard navigation

### E. Navigation & Information Architecture
- Fixed search header (sticky top-0)
- No traditional navigation—single-purpose app
- Clear visual connection between map markers and list items using matching colors/states

### F. Responsive Behavior
- Mobile: Full-width single column, collapsible map
- Tablet: Maintain split view but adjust proportions
- Desktop: 60/40 split (map/list) with max-width container

## Icons
Use Heroicons (outline style) via CDN:
- MagnifyingGlass for search
- MapPin for locations
- AdjustmentsHorizontal for filters
- Clock for posted time

## Images
**No hero section needed** - this is a utility application, not a marketing page. The map itself provides visual interest.

## Accessibility
- High contrast ratios for all text
- Keyboard navigation for all interactive elements
- ARIA labels for map markers and list items
- Screen reader announcements for search results count

## Key UX Patterns
- **Bi-directional selection**: Clicking map marker highlights list item and vice versa
- **Auto-scroll**: Selecting a list item scrolls it into view and centers map on marker
- **Loading states**: Skeleton screens for job cards while fetching
- **Empty state**: Clear message with search tips when no results
- **Results count**: Display "X jobs found" prominently