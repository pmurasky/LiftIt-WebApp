# ADR-0001: Responsive Design for Mobile and Desktop Browsers

## Status

Accepted

## Date

2026-02-21

## Context

LiftIt is a fitness tracking web application that users will access in various contexts:
- **Mobile browsers**: During workouts at the gym, logging exercises on-the-go
- **Desktop browsers**: Planning workouts, reviewing progress, detailed analysis

Users need a consistent, functional experience regardless of device. The application must work well on:
- Mobile phone browsers (iOS Safari, Android Chrome)
- Tablet browsers
- Desktop/laptop browsers (Chrome, Firefox, Safari, Edge)

Key constraints:
- We are building a web application, not native mobile apps
- Users should not need to install anything (progressive web app features are future consideration)
- The same codebase must serve all form factors
- Tailwind CSS and shadcn/ui are already part of our stack

## Decision

**All UI components and pages must be responsive and functional on both mobile and desktop browsers.**

Implementation approach:
1. **Mobile-first design**: Design and implement for mobile viewports first, then enhance for larger screens
2. **Use Tailwind CSS responsive utilities**: Leverage Tailwind's breakpoint system (`sm:`, `md:`, `lg:`, `xl:`)
3. **Touch-friendly targets**: Minimum 44x44px tap targets for interactive elements on mobile
4. **Adaptive layouts**: Use flexbox/grid to adapt layout based on viewport width
5. **Test on real devices**: Test on actual mobile devices, not just browser DevTools
6. **No horizontal scrolling**: Content must fit viewport width without horizontal scroll

### Breakpoint Strategy

Follow Tailwind's default breakpoints:
- `sm`: 640px (small tablets, large phones in landscape)
- `md`: 768px (tablets)
- `lg`: 1024px (small laptops)
- `xl`: 1280px (desktops)
- `2xl`: 1536px (large desktops)

### Component Patterns

**Navigation**:
- Mobile: Hamburger menu or bottom navigation
- Desktop: Horizontal top navigation bar

**Forms**:
- Mobile: Full-width inputs, stacked layout
- Desktop: Multi-column layouts where appropriate

**Data Tables**:
- Mobile: Card-based layout or horizontal scroll with sticky columns
- Desktop: Full table layout

**Modals/Dialogs**:
- Mobile: Full-screen or bottom sheet
- Desktop: Centered modal with max-width

## Alternatives Considered

### Alternative 1: Mobile-only web app with separate desktop version
- **Pros**: Optimized experience for each platform
- **Cons**: Maintain two codebases, inconsistent features, higher development cost
- **Why rejected**: Violates YAGNI; we don't have evidence this complexity is needed

### Alternative 2: Desktop-only, no mobile support
- **Pros**: Simpler implementation, avoid mobile layout complexity
- **Cons**: Users can't log workouts at the gym on their phones
- **Why rejected**: Primary use case (logging during workouts) requires mobile access

### Alternative 3: Native mobile apps + desktop web app
- **Pros**: Best-in-class experience for each platform
- **Cons**: Requires iOS/Android development expertise, 3x codebases to maintain
- **Why rejected**: Team expertise is in web, responsive web can meet initial needs

## Consequences

### Positive
- **Universal access**: Users can access the app from any device with a browser
- **Single codebase**: Maintain one Next.js application for all form factors
- **Progressive enhancement**: Easy to add PWA features later if needed
- **Lower development cost**: No need for separate mobile/desktop implementations
- **Leverages existing stack**: Tailwind CSS has excellent responsive utilities built-in

### Negative
- **Design complexity**: Must consider multiple layouts for every feature
- **Testing overhead**: Must test on multiple devices and screen sizes
- **Performance considerations**: Mobile devices have less CPU/memory than desktop
- **Touch vs mouse**: Must design interactions that work well with both input methods

### Neutral
- **Component library choice**: shadcn/ui components are responsive by default
- **Bundle size**: Must be mindful of JavaScript bundle size for mobile networks

## Implementation Requirements

### For All New Features
1. Design mobile layout first
2. Test on mobile viewport (< 640px) before desktop
3. Ensure touch targets are at least 44x44px
4. Verify no horizontal scroll at any breakpoint
5. Test with real mobile devices before marking feature complete

### Acceptance Criteria Template
Every feature must include:
- ✅ Mobile viewport (320px - 640px) layout tested
- ✅ Tablet viewport (640px - 1024px) layout tested
- ✅ Desktop viewport (>1024px) layout tested
- ✅ Touch interactions work (tap, swipe if applicable)
- ✅ No horizontal scroll at any breakpoint
- ✅ Interactive elements meet minimum 44x44px tap target size

### Documentation
- Component READMEs should document responsive behavior
- Design decisions for complex responsive patterns should be noted in code comments

## References

- Tailwind CSS Responsive Design: https://tailwindcss.com/docs/responsive-design
- Web Content Accessibility Guidelines (WCAG) Touch Target Size: https://www.w3.org/WAI/WCAG21/Understanding/target-size.html
- shadcn/ui responsive components: https://ui.shadcn.com/
- Next.js Image Optimization: https://nextjs.org/docs/app/building-your-application/optimizing/images
