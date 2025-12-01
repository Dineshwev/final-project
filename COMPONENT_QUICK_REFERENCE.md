# Component Quick Reference Guide

## 🚀 Quick Start - How to Use the New Components

### Basic Page Template

```tsx
import PageContainer from "../components/PageContainer";
import Card from "../components/Card";
import Button from "../components/Button";
import { IconName } from "@heroicons/react/24/outline";

const MyPage: React.FC = () => {
  return (
    <PageContainer
      title="Page Title"
      subtitle="Page description"
      icon={<IconName className="w-8 h-8" />}
      maxWidth="lg"
    >
      <Card variant="glass" padding="lg">
        {/* Your content here */}
      </Card>
    </PageContainer>
  );
};
```

---

## 📦 Component API Reference

### PageContainer

**Props:**

- `children` - Page content
- `title?` - Main heading
- `subtitle?` - Subheading text
- `icon?` - Icon element
- `maxWidth?` - "sm" | "md" | "lg" | "xl" | "2xl" | "7xl" | "full"
- `showBackground?` - Show animated background (default: true)
- `className?` - Additional CSS classes

**Example:**

```tsx
<PageContainer title="Dashboard" maxWidth="xl">
  <div>Content</div>
</PageContainer>
```

---

### Card

**Props:**

- `children` - Card content
- `variant?` - "glass" | "gradient" | "standard" (default: "standard")
- `padding?` - "none" | "sm" | "md" | "lg" | "xl" (default: "md")
- `hover?` - Enable hover lift effect (default: false)
- `onClick?` - Click handler
- `className?` - Additional CSS classes
- `delay?` - Animation delay in seconds (default: 0)

**Examples:**

```tsx
// Glass card with hover effect
<Card variant="glass" padding="xl" hover>
  <h3>Title</h3>
  <p>Content</p>
</Card>

// Gradient card
<Card variant="gradient" padding="lg">
  <div>Gradient background</div>
</Card>

// Clickable card
<Card onClick={() => navigate("/details")} hover>
  <p>Click me</p>
</Card>
```

---

### Button

**Props:**

- `children` - Button text/content
- `variant?` - "primary" | "secondary" | "success" | "danger" | "outline" | "ghost"
- `size?` - "sm" | "md" | "lg" | "xl" (default: "md")
- `loading?` - Show loading spinner (default: false)
- `disabled?` - Disable button (default: false)
- `fullWidth?` - Full width button (default: false)
- `icon?` - Icon element
- `iconPosition?` - "left" | "right" (default: "right")
- `type?` - "button" | "submit" | "reset" (default: "button")
- `onClick?` - Click handler

**Examples:**

```tsx
// Primary button with icon
<Button variant="primary" icon={<CheckIcon />} onClick={handleSave}>
  Save Changes
</Button>

// Loading button
<Button variant="success" loading={isSaving} disabled>
  Saving...
</Button>

// Full width submit button
<Button type="submit" variant="primary" fullWidth>
  Sign In
</Button>

// Small outline button
<Button variant="outline" size="sm">
  Cancel
</Button>
```

---

### Input

**Props:**

- `label` - Input label text
- `type?` - HTML input type (default: "text")
- `name?` - Input name
- `value` - Input value (controlled)
- `onChange` - Change handler
- `placeholder?` - Placeholder text
- `icon?` - Icon element
- `iconPosition?` - "left" | "right" (default: "left")
- `error?` - Error message
- `helperText?` - Helper text below input
- `required?` - Mark as required (default: false)
- `disabled?` - Disable input (default: false)
- `autoComplete?` - Autocomplete attribute
- `className?` - Additional CSS classes

**Examples:**

```tsx
// Email input with icon
<Input
  label="Email Address"
  type="email"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
  icon={<EnvelopeIcon />}
  placeholder="you@example.com"
  required
/>

// Password with error
<Input
  label="Password"
  type="password"
  value={password}
  onChange={(e) => setPassword(e.target.value)}
  icon={<LockIcon />}
  error="Password must be at least 8 characters"
  required
/>

// Input with helper text
<Input
  label="Username"
  value={username}
  onChange={(e) => setUsername(e.target.value)}
  helperText="Choose a unique username"
/>
```

---

### Alert

**Props:**

- `message` - Alert message (required)
- `type?` - "success" | "error" | "warning" | "info" (default: "info")
- `title?` - Alert title
- `onClose?` - Close handler (shows X button if provided)
- `showIcon?` - Show type icon (default: true)
- `className?` - Additional CSS classes

**Examples:**

```tsx
// Success alert with close button
<Alert
  type="success"
  title="Success!"
  message="Your changes have been saved."
  onClose={() => setShowAlert(false)}
/>

// Error alert
<Alert
  type="error"
  title="Error"
  message="Failed to load data. Please try again."
/>

// Info alert without icon
<Alert
  type="info"
  message="Your session will expire in 5 minutes."
  showIcon={false}
/>
```

---

### Loading

**Props:**

- `size?` - "sm" | "md" | "lg" | "xl" (default: "md")
- `text?` - Loading text (default: "Loading...")
- `fullScreen?` - Show as fullscreen overlay (default: false)
- `variant?` - "spinner" | "dots" | "pulse" | "bars" (default: "spinner")

**Examples:**

```tsx
// Spinner with text
<Loading text="Loading data..." />

// Fullscreen loading
<Loading fullScreen variant="pulse" text="Please wait..." />

// Dots animation
<Loading variant="dots" size="lg" />

// Inline small spinner
<Loading size="sm" text="Saving..." />
```

---

### Badge

**Props:**

- `children` - Badge content
- `variant?` - "default" | "success" | "error" | "warning" | "info" | "purple" | "pink"
- `size?` - "sm" | "md" | "lg" (default: "md")
- `withDot?` - Show animated dot (default: false)
- `className?` - Additional CSS classes

**Examples:**

```tsx
// Success badge
<Badge variant="success">Active</Badge>

// Badge with animated dot
<Badge variant="error" withDot>
  Live
</Badge>

// Small badge
<Badge variant="info" size="sm">
  New
</Badge>
```

---

## 🎭 Animation Utilities

### Import Animations

```tsx
import {
  fadeIn,
  slideUp,
  staggerContainer,
  staggerItem,
} from "../utils/animations";
```

### Common Patterns

**Fade In:**

```tsx
<motion.div variants={fadeIn} initial="hidden" animate="visible">
  <p>Content fades in</p>
</motion.div>
```

**Slide Up:**

```tsx
<motion.form variants={slideUp} initial="hidden" animate="visible">
  {/* Form fields */}
</motion.form>
```

**Stagger Children:**

```tsx
<motion.div variants={staggerContainer} initial="hidden" animate="visible">
  {items.map((item, index) => (
    <motion.div key={index} variants={staggerItem}>
      {item}
    </motion.div>
  ))}
</motion.div>
```

**Custom Animation:**

```tsx
<motion.div
  initial={{ opacity: 0, scale: 0.9 }}
  animate={{ opacity: 1, scale: 1 }}
  whileHover={{ scale: 1.05 }}
  transition={{ duration: 0.3 }}
>
  <p>Hover to scale</p>
</motion.div>
```

---

## 🎨 CSS Utility Classes

### Glass Morphism

```tsx
<div className="glass">Glass effect</div>
<div className="glass-strong">Stronger glass</div>
<div className="glass-dark">Dark glass</div>
```

### Gradients

```tsx
<div className="bg-gradient-primary">Primary gradient</div>
<div className="bg-gradient-success">Success gradient</div>
<div className="bg-gradient-premium">Premium gradient</div>
```

### Text Gradients

```tsx
<h1 className="text-gradient-primary">Gradient text</h1>
<span className="text-gradient">Default gradient</span>
```

### Hover Effects

```tsx
<div className="hover-lift">Lifts on hover</div>
<button className="hover-scale">Scales on hover</button>
<div className="hover-glow">Glows on hover</div>
```

### Animations

```tsx
<div className="animate-fade-in">Fades in</div>
<div className="animate-slide-in-right">Slides from right</div>
<div className="animate-shimmer">Shimmer effect</div>
```

---

## 🔄 Migration Checklist

### Converting an Old Page

1. **Import new components:**

```tsx
import PageContainer from "../components/PageContainer";
import Card from "../components/Card";
import Button from "../components/Button";
import Input from "../components/Input";
```

2. **Wrap content in PageContainer:**

```tsx
// Before
<div className="container mx-auto">...</div>

// After
<PageContainer title="Page Title" maxWidth="lg">
  ...
</PageContainer>
```

3. **Replace divs with Cards:**

```tsx
// Before
<div className="bg-white rounded-lg shadow p-6">...</div>

// After
<Card variant="glass" padding="lg">...</Card>
```

4. **Replace buttons:**

```tsx
// Before
<button className="bg-blue-600 text-white px-4 py-2 rounded">
  Submit
</button>

// After
<Button variant="primary">Submit</Button>
```

5. **Replace inputs:**

```tsx
// Before
<input
  type="email"
  className="border rounded px-3 py-2"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
/>

// After
<Input
  type="email"
  label="Email"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
  icon={<EnvelopeIcon />}
/>
```

6. **Add animations:**

```tsx
import { motion } from "framer-motion";
import { fadeIn } from "../utils/animations";

<motion.div variants={fadeIn} initial="hidden" animate="visible">
  {/* Content */}
</motion.div>;
```

---

## ✅ Testing Checklist

After updating a page:

- [ ] Page loads without console errors
- [ ] All buttons work correctly
- [ ] Forms submit properly
- [ ] Loading states display
- [ ] Error messages show correctly
- [ ] Animations are smooth
- [ ] Responsive on mobile
- [ ] Dark mode compatible (if applicable)
- [ ] Keyboard navigation works
- [ ] No TypeScript errors

---

## 🎯 Pro Tips

1. **Consistent Spacing**: Use padding props (sm, md, lg, xl) instead of custom classes
2. **Animation Delays**: Use `delay` prop on Card for stagger effect
3. **Loading States**: Always add loading prop to buttons during async operations
4. **Error Handling**: Use Alert component for user-friendly errors
5. **Icons**: Use Heroicons for consistency (`@heroicons/react/24/outline`)
6. **Variants**: Stick to semantic variants (primary, success, danger, etc.)
7. **Max Width**: Use appropriate maxWidth on PageContainer (lg for forms, xl for dashboards)

---

## 🐛 Common Issues & Solutions

### Issue: Animation not playing

**Solution:** Ensure you have `initial` and `animate` props:

```tsx
<motion.div initial="hidden" animate="visible" variants={fadeIn}>
```

### Issue: Button not full width

**Solution:** Add `fullWidth` prop:

```tsx
<Button fullWidth>Submit</Button>
```

### Issue: Input label not showing

**Solution:** Pass `label` prop (required):

```tsx
<Input label="Email" />
```

### Issue: Card not hovering

**Solution:** Add `hover` prop:

```tsx
<Card hover>Content</Card>
```

### Issue: TypeScript errors

**Solution:** Check all required props are provided and types match

---

**Quick Reference Version:** 1.0  
**Last Updated:** Session completion  
**Maintained By:** Development Team
