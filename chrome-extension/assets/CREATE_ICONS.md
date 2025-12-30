# Create Extension Icons

Extension c?n 3 icon files ?? ho?t ??ng:

## Required Icons

- `icon16.png` - 16x16 pixels
- `icon48.png` - 48x48 pixels  
- `icon128.png` - 128x128 pixels

## Quick Solutions

### Option 1: Use Online Tool (2 minutes)

1. Visit: <https://www.favicon-generator.org/>
2. Upload b?t k? logo/image nào (recommend: microphone icon)
3. Generate và download multiple sizes
4. Rename thành icon16.png, icon48.png, icon128.png
5. Copy vào folder này

### Option 2: Download Free Icon (3 minutes)

1. Visit: <https://www.flaticon.com/free-icon/microphone>
2. Search "microphone" ho?c "meeting"
3. Download PNG (Free)
4. Use online resizer: <https://imageresizer.com/>
5. Create 3 sizes: 16x16, 48x48, 128x128
6. Save as icon16.png, icon48.png, icon128.png

### Option 3: Use Emoji as Icon (1 minute)

1. Visit: <https://favicon.io/emoji-favicons/microphone/>
2. Download emoji as PNG
3. Resize to 3 sizes
4. Or just use same image for all 3 sizes (quick hack)

### Option 4: Create Simple Colored Square (Fastest)

Use any image editor ho?c online tool:

```
1. Create 16x16 red square ? Save as icon16.png
2. Create 48x48 red square ? Save as icon48.png
3. Create 128x128 red square ? Save as icon128.png
```

Mac: Use Preview app
Windows: Use Paint
Online: <https://www.photopea.com/>

## Recommended Design

**Theme:** Microphone / Meeting / AI

**Colors:**

- Purple gradient (match overlay): #667eea ? #764ba2
- Or blue: #3b82f6
- Or red: #ef4444 (recording indicator)

**Style:**

- Simple and recognizable
- Clear at small sizes (16x16)
- Professional looking

## Example Icons

Search for these terms:

- ??? Microphone
- ?? Mic recording
- ??? Voice
- ?? Speech bubble
- ?? AI assistant
- ?? Notes

## Test Icons

After creating icons:

1. Place trong folder này (chrome-extension/assets/)
2. Reload extension: chrome://extensions/ ? Click reload (??)
3. Check extension toolbar - icon should appear
4. Check chrome://extensions/ page - should see icon

## File Format

- **Format**: PNG (required)
- **Transparency**: Yes (recommended)
- **Color space**: RGB
- **Max file size**: < 1MB each

## Verification

```bash
# Check files exist
ls -lh icon*.png

# Should see:
# icon16.png  (~1-10KB)
# icon48.png  (~2-20KB)
# icon128.png (~5-50KB)
```

## Temporary Solution

?? test extension ngay:

```bash
# Copy b?t k? .png file nào 3 l?n
cp ~/Downloads/any-image.png icon16.png
cp ~/Downloads/any-image.png icon48.png
cp ~/Downloads/any-image.png icon128.png
```

Extension s? ch?y ???c, có th? design icons ??p sau!

## Professional Icons (Future)

N?u mu?n professional icons:

1. Hire designer trên Fiverr ($5-20)
2. Use Figma ?? design
3. Export correct sizes
4. Test in multiple contexts

---

**For now:** Any 3 PNG files named correctly s? work! ??
