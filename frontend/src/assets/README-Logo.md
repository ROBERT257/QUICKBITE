# QuickBite Logo Design System

## Overview
A modern, sleek logo system for QuickBite with multiple variants and responsive design.

## Logo Variants

### 1. Neon Lightning (logo-quickbite-neon.svg)
- **Style**: Futuristic with neon glow effects
- **Colors**: Electric blue (#00D9FF) to magenta (#FF00FF) to orange (#FF6B35)
- **Icon**: Lightning bolt with energy ring
- **Best For**: Tech-focused, modern, vibrant branding

### 2. Modern Fork (logo-quickbite-modern.svg)
- **Style**: Clean, minimalist with food elements
- **Colors**: Orange (#FF6B35) to warm red (#F7931E)
- **Icon**: Fork and knife crossed design
- **Best For**: Professional, food industry, clean aesthetic

### 3. Delivery Lightning (logo-quickbite-delivery.svg)
- **Style**: Delivery-focused with speed elements
- **Colors**: Electric blue (#00D4FF) with orange accents
- **Icon**: Lightning bolt in delivery circle
- **Best For**: Delivery apps, speed, logistics

### 4. Burger Icon (logo-quickbite-burger.svg)
- **Style**: Playful with food icon
- **Colors**: Green (#10B981) with orange accents
- **Icon**: Detailed burger with sesame seeds
- **Best For**: Casual, friendly, food delivery

## Design Features

### Color Palette
- **Primary**: Electric Blue (#00D4FF, #00D9FF)
- **Accent**: Vibrant Orange (#FF6B35, #F59E0B)
- **Secondary**: Warm Red (#F7931E, #D97706)
- **Neutral**: White (#FFFFFF, #E8E8E8)
- **Dark Mode**: Dark gradients with bright accents

### Typography
- **Font**: Inter (modern sans-serif)
- **Weights**: 800 (Quick), 300 (Bite)
- **Style**: Clean, rounded, professional
- **Fallback**: System fonts for compatibility

### Effects
- **Glow**: Subtle neon lighting
- **Shadows**: Soft drop shadows
- **Animations**: Gentle pulsing and floating elements
- **Hover**: Scale and shadow enhancement
- **Transitions**: Smooth 0.3s ease

### Responsive Design
- **Small**: 120x36px (mobile)
- **Medium**: 200x60px (default)
- **Large**: 280x84px (header)
- **Scalable**: Vector-based for all sizes

### Accessibility
- **High Contrast**: Enhanced outlines for visibility
- **Reduced Motion**: Animations disabled when preferred
- **Focus States**: Clear keyboard navigation
- **Screen Readers**: Proper alt text
- **Color Blind**: Multiple visual cues beyond color

## Usage

### React Component
```jsx
import QuickBiteLogo from './components/QuickBiteLogo';

// Basic usage
<QuickBiteLogo />

// With variant
<QuickBiteLogo variant="neon" />

// With size
<QuickBiteLogo size="large" />

// With custom class
<QuickBiteLogo className="header-logo" />
```

### CSS Integration
```css
/* Import styles */
@import './components/QuickBiteLogo.css';

/* Custom styling */
.custom-logo {
  filter: drop-shadow(0 4px 12px rgba(0, 212, 255, 0.3));
}

.custom-logo:hover {
  transform: scale(1.1);
}
```

### File Structure
```
frontend/src/assets/
├── logo-quickbite-neon.svg      # Lightning variant
├── logo-quickbite-modern.svg    # Fork variant
├── logo-quickbite-delivery.svg  # Delivery variant
└── logo-quickbite-burger.svg    # Burger variant

frontend/src/components/
├── QuickBiteLogo.jsx            # React component
└── QuickBiteLogo.css           # Component styles
```

## Brand Guidelines

### Do's
- ✅ Use on both light and dark backgrounds
- ✅ Maintain clear space around logo
- ✅ Use appropriate variant for context
- ✅ Keep animations subtle and professional
- ✅ Ensure accessibility compliance

### Don'ts
- ❌ Modify logo proportions
- ❌ Add additional text or elements
- ❌ Use busy animations
- ❌ Change colors from brand palette
- ❌ Overcrowd with effects

## Technical Specifications

### Vector Format
- **Type**: SVG (Scalable Vector Graphics)
- **ViewBox**: 0 0 200 60 (2:3 aspect ratio)
- **Resolution**: Infinite scalability
- **File Size**: Optimized for web (2-4KB each)

### Browser Support
- **Modern**: Full SVG support with effects
- **Legacy**: Graceful degradation to static logo
- **Mobile**: Optimized for small screens
- **Print**: High contrast version available

### Performance
- **Load Time**: < 100ms for all variants
- **Animation**: 60fps smooth transitions
- **Memory**: Minimal footprint
- **CDN Ready**: Can be served from CDN

## Implementation Notes

### In React Components
```jsx
// Import the component
import QuickBiteLogo from './QuickBiteLogo';

// Use in navigation
<QuickBiteLogo variant="neon" size="medium" />

// Use in footer
<QuickBiteLogo variant="burger" size="small" />
```

### In CSS
```css
/* Logo container */
.logo-container {
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Logo image */
.logo-image {
  max-width: 100%;
  height: auto;
  transition: all 0.3s ease;
}
```

This logo system provides a modern, scalable, and visually striking identity for QuickBite that works across all platforms and use cases.
