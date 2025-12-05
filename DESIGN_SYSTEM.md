# 🎨 UnimusChat - Modern UI Design Guide

## Layout Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         HEADER (Navbar)                          │
├──────────────────────┬──────────────────────────────┬────────────┤
│                      │                              │            │
│ ChatSidebar (w-96)   │  ChatArea (flex-1)          │ StatusPanel│
│  ┌────────────────┐  │  ┌──────────────────────┐   │ (w-96)     │
│  │ HEADER (Navy)  │  │  │ HEADER (Navy)        │   │            │
│  │ gradient       │  │  │ gradient             │   │ ┌────────┐ │
│  │  + profile     │  │  │ + avatar + status    │   │ │HEADER  │ │
│  │  + logout      │  │  │                      │   │ │(Gold)  │ │
│  ├────────────────┤  │  ├──────────────────────┤   │ │        │ │
│  │ TABS           │  │  │                      │   │ ├────────┤ │
│  │ (Chat/BC/Stat) │  │  │  MESSAGES AREA       │   │ │        │ │
│  │  animated      │  │  │  (flex-1, scroll)    │   │ │ + Add  │ │
│  ├────────────────┤  │  │                      │   │ │ Status │ │
│  │ CHAT LIST      │  │  │  sender: orange      │   │ │ Button │ │
│  │ (scroll)       │  │  │  receiver: white     │   │ │        │ │
│  │ + gradient     │  │  │  + animations        │   │ ├────────┤ │
│  │  avatars       │  │  │                      │   │ │        │ │
│  │ + hover        │  │  ├──────────────────────┤   │ │ STATUS │ │
│  │  effects       │  │  │ INPUT (rounded pill) │   │ │ LIST   │ │
│  │ + online dots  │  │  │ + attach/emoji/send  │   │ │ (scroll)   │
│  │                │  │  │                      │   │ │ + cards│ │
│  ├────────────────┤  │  └──────────────────────┘   │ │ + fade │ │
│  │ + ADD CONTACT  │  │                              │ │ anims  │ │
│  │ BUTTON         │  │                              │ │        │ │
│  │ (gradient)     │  │                              │ └────────┘ │
│  └────────────────┘  │                              │            │
│                      │                              │            │
└──────────────────────┴──────────────────────────────┴────────────┘
```

---

## Color Palette

### Primary Colors
```
🟠 Orange (Primary):       #FF6B35
   - Buttons, links, highlights
   - Active states
   - Important CTAs

🔵 Navy Blue (Secondary):  #004E89
   - Sidebar background
   - Header backgrounds
   - Primary text
   - Navigation

⭐ Gold (Accent):          #FFC300
   - Status panel header
   - Secondary highlights
   - Status expiry badges

💎 Teal (Tertiary):        #06BCC1
   - Direct message avatars
   - Alternative accent color
```

### Gradients
```
gradient-to-r from-secondary to-secondary/80
  → Navy sidebar fade effect

gradient-to-br from-primary to-primary/80
  → Orange button hover

gradient-to-br from-primary to-accent
  → Avatar backgrounds

gradient-to-b from-accent to-accent/60
  → Status panel header
```

---

## Component Styles

### ChatSidebar
```tsx
// Container
bg-gradient-to-b from-secondary via-secondary/95 to-secondary
border-secondary/20
text-white

// User Profile Header
bg-gradient-to-br from-secondary to-secondary/80
rounded-b-2xl
border-secondary/30

// Avatar
w-14 h-14 
border-4 border-white/30
shadow-lg
bg-gradient-to-br from-primary to-accent

// Online Indicator
w-2.5 h-2.5 bg-green-400 
animate-pulse-glow

// Navigation Tabs
from-primary to-primary/80 (active state)
text-white/70 (inactive)
hover:text-white
rounded-lg
transition-all duration-200

// Chat Items
bg-white/5 hover:bg-white/10
border border-white/10 hover:border-white/20
rounded-xl
selected: 
  bg-gradient-to-r from-primary/40 to-primary/20
  border-primary/50 
  ring-2 ring-primary/40
  shadow-lg
```

### ChatArea
```tsx
// Header
bg-gradient-to-r from-secondary to-secondary/80
border-secondary/20

// Messages
// Sender (own messages):
  bg-gradient-to-br from-primary to-primary/80
  text-white
  rounded-2xl rounded-br-none
  
// Receiver (others):
  bg-white 
  dark:bg-secondary/30
  border border-gray-200
  dark:border-secondary/40
  rounded-2xl rounded-bl-none

// Message Input
bg-white dark:bg-secondary/40
border border-gray-200 dark:border-secondary/30
rounded-full
focus:ring-2 focus:ring-primary

// Send Button
bg-gradient-to-r from-primary to-primary/80
rounded-full
text-white
shadow-md
```

### StatusPanel
```tsx
// Header
bg-gradient-to-r from-accent/80 to-accent/60
text-white

// Add Status Button
bg-gradient-to-r from-primary to-primary/80
text-white
shadow-lg
w-full
rounded

// Status Cards
bg-white dark:bg-secondary/30
border border-gray-200 dark:border-secondary/40
rounded-2xl
hover:shadow-lg
animate-fade-in

// Status Avatar
w-10 h-10
border-2 border-primary/30
bg-gradient-to-br from-primary to-accent

// 24h Badge
bg-orange-100 dark:bg-orange-500/20
text-orange-700 dark:text-orange-300
rounded-full
px-2 py-1
```

---

## Animations

### KeyFrames
```css
@keyframes slideIn {
  from { opacity: 0; transform: translateX(-10px); }
  to { opacity: 1; transform: translateX(0); }
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes pulse-glow {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}
```

### Usage
```tsx
// Sidebar chat items
animate-slide-in

// Messages
animate-fade-in

// Online dots
animate-pulse-glow

// Hover effects
transition-all duration-200 hover:shadow-lg

// Typing dots
animate-bounce
  with animationDelay: "0.1s", "0.2s"
```

---

## Responsive Behavior

### Breakpoints (Tailwind default)
```
sm: 640px
md: 768px
lg: 1024px
xl: 1280px
2xl: 1536px
```

### Layout
```
Desktop (1024px+):
  Sidebar (384px) | ChatArea (flex) | StatusPanel (384px)

Tablet (768px-1024px):
  Sidebar (hidden or collapse) | ChatArea (flex) | StatusPanel (hidden)

Mobile (< 768px):
  Full-width ChatArea with tab-based navigation
```

---

## Interactive States

### Buttons
```
Default: 
  Normal colors with shadow-md

Hover:
  Background color opacity +10%
  shadow-lg

Active (pressed):
  shadow-sm
  scale-98 (optional)

Disabled:
  opacity-50
  cursor-not-allowed
```

### Form Inputs
```
Default:
  bg-white dark:bg-secondary/40
  border border-gray-200
  text-foreground

Focus:
  ring-2 ring-primary
  border-transparent

Error:
  border-destructive
  ring-2 ring-destructive/30
```

### Message Bubbles
```
Own messages:
  Right-aligned
  Gradient orange background
  White text
  
Others' messages:
  Left-aligned
  White/secondary background
  Dark text
  
Hover:
  shadow-lg (both)
```

---

## Typography

### Font Family
```
--font-sans: 'Segoe UI', 'Inter', sans-serif
--font-serif: Georgia, serif
--font-mono: 'Fira Code', monospace
```

### Font Sizes
```
h1: text-2xl font-bold
h2: text-xl font-bold
h3: text-lg font-bold
h4: text-base font-semibold
p: text-sm
caption: text-xs
```

### Font Colors
```
Primary text: text-foreground
Secondary text: text-muted-foreground
White text (on colored): text-white
Links: text-primary hover:text-primary/80
Disabled: text-muted-foreground opacity-50
```

---

## Spacing System

### Padding
```
xs: 0.75rem (12px)
sm: 1rem (16px)
md: 1.5rem (24px)
lg: 2rem (32px)
```

### Margins
```
Same as padding (consistent scale)
```

### Gaps (flex/grid)
```
sm: 0.75rem (12px)
md: 1rem (16px)
lg: 1.5rem (24px)
```

---

## Shadows

```
shadow-sm:    0 1px 2px rgba(0,0,0,0.05)
shadow-md:    0 4px 6px rgba(0,0,0,0.1)
shadow-lg:    0 10px 15px rgba(0,0,0,0.1)
shadow-xl:    0 20px 25px rgba(0,0,0,0.1)
```

Usage patterns:
- Cards: `shadow-md`
- On hover: `hover:shadow-lg`
- Heavy elements: `shadow-xl`

---

## Dark Mode

### CSS Variables (`.dark` class)
```css
.dark {
  --background: hsl(220 20% 8%)
  --foreground: hsl(0 0% 95%)
  --card: hsl(220 20% 13%)
  --primary: hsl(13 100% 60%)  /* brighter orange */
  --secondary: hsl(208 100% 52%)  /* brighter navy */
  /* ... etc */
}
```

### Implementation
- Automatic based on system preference (prefers-color-scheme)
- Manual toggle via adding `.dark` class to `<html>`

---

## Design Principles Applied

1. **Modern Gradient Design**
   - Subtle gradients untuk depth
   - Not overwhelming, professional look

2. **Glassmorphism**
   - Translucent elements with backdrop blur
   - White/color with opacity

3. **Micro-interactions**
   - Smooth transitions on all interactive elements
   - Feedback pada user actions

4. **Color Consistency**
   - Brand colors (Unimus orange & navy) throughout
   - Proper contrast untuk accessibility

5. **Whitespace**
   - Ample padding untuk breathing room
   - Not cluttered

6. **Consistency**
   - Same button styles across app
   - Consistent spacing
   - Predictable interactions

---

## Implementation Checklist

- [x] Color variables defined in CSS
- [x] Animations keyframes created
- [x] Components styled dengan gradients
- [x] Dark mode variables configured
- [x] Responsive layouts tested
- [x] Interactive states defined
- [x] TypeScript compilation successful
- [x] Git commit with detailed message
- [x] Documentation created

---

**Status:** ✅ **Complete & Ready for Production**

Desain ini menyediakan modern, cohesive, dan professional experience untuk pengguna UnimusChat.
