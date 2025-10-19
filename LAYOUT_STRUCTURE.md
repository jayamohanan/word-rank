# Fixed Vertical Layout Structure

## Overview
The game now uses a **fixed vertical layout** with dedicated sections that always occupy the same screen space, regardless of which UI elements are visible. This ensures:
- **Consistent positioning** of answer buttons in the lower half of the screen
- **Better ergonomics** for one-handed mobile play
- **No layout shifts** when switching between game modes
- **Professional, stable UI** across all devices

---

## Layout Sections

The game page is divided into **4 main vertical sections**:

### 1. **Top Bar Area** (8% of viewport)
- **Min Height:** 50px
- **Max Height:** 70px
- **Contains:**
  - Home button (left)
  - Sound toggle button (right)
  - Info button (right)

### 2. **Progress Area** (15% of viewport)
- **Min Height:** 80px
- **Max Height:** 120px
- **Contains (depending on game mode):**
  - High Score display (Classic mode)
  - Lives/Hearts display (Classic mode)
  - Level number (Levels mode)
  - Current score (Classic mode)
  - Progress circles (Levels mode)
- **Note:** This area always reserves space, even if empty (Free mode)

### 3. **Main Game Area** (55% minimum, flexible)
- **Flex:** Takes remaining space
- **Contains:**
  - Game instructions
  - Word option buttons (2 buttons)
- **Key Feature:** Vertically centered, ensuring buttons stay in comfortable thumb reach zone

### 4. **Feedback Area** (22% of viewport)
- **Min Height:** 100px
- **Max Height:** 180px
- **Contains:**
  - Feedback message (rank information)
  - Next button
- **Note:** Always at bottom of screen

---

## CSS Implementation

```css
.game-viewport {
    display: flex;
    flex-direction: column;
    height: 100%;
    width: 100%;
    overflow: hidden;
}

.top-bar-area {
    flex: 0 0 8%;
    min-height: 50px;
    max-height: 70px;
}

.progress-area {
    flex: 0 0 15%;
    min-height: 80px;
    max-height: 120px;
}

.main-game-area {
    flex: 1 1 55%;
    display: flex;
    flex-direction: column;
    justify-content: center;
}

.feedback-area {
    flex: 0 0 22%;
    min-height: 100px;
    max-height: 180px;
}
```

---

## Benefits

### ✅ **Consistent User Experience**
- Answer buttons always appear in the same position
- No jarring layout shifts between game modes
- Predictable, learnable interface

### ✅ **Mobile Optimization**
- Buttons positioned in lower half for easy one-handed play
- Optimal thumb reach zone for tap targets
- Comfortable extended play sessions

### ✅ **Scalability**
- Works across different screen sizes
- Min/max heights prevent extreme scaling
- Responsive to both portrait and landscape

### ✅ **Maintainability**
- Clear separation of UI regions
- Easy to modify individual sections
- Isolated component styling

---

## Game Mode Behaviors

### **Levels Mode**
- Top Bar: Home, Sound, Info buttons
- Progress Area: Level number + progress circles
- Main Game: Instructions + 2 word options
- Feedback: Rank info + Next button

### **Classic Mode**
- Top Bar: Home, Sound, Info buttons
- Progress Area: High score + Lives (hearts) + Current score
- Main Game: Instructions + 2 word options
- Feedback: Rank info + Next button

### **Free/Play Mode**
- Top Bar: Home, Sound, Info buttons
- Progress Area: **Empty** (reserves space)
- Main Game: Instructions + 2 word options (stays in lower half!)
- Feedback: Rank info + Next button

---

## Key Design Decisions

1. **Fixed Percentages:** Using `flex: 0 0 X%` ensures sections don't grow/shrink unexpectedly
2. **Min/Max Heights:** Prevents extreme scaling on very small/large devices
3. **Main Game Area Flexible:** Uses `flex: 1 1 55%` to take remaining space
4. **Always Present Containers:** Empty sections still render to preserve layout
5. **Vertical Centering:** Main game area uses `justify-content: center` for optimal button placement

---

## Testing Recommendations

✅ Test all three game modes (Levels, Classic, Free)  
✅ Verify buttons stay in lower half on mobile  
✅ Check layout on different screen sizes  
✅ Confirm no layout shifts when switching modes  
✅ Test one-handed playability on actual mobile device
