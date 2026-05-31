# 🍬 Mello & Danny: Ride or Die 🍫

A cute, chaotic browser-based game celebrating friendship and adventure!

## 🎮 Game Overview

Help **Mello** (a cool marshmallow in sunglasses) and **Danny** (their chocolate bar best friend) navigate through increasingly ridiculous obstacle courses in a purple convertible!

### Story
Two best friends on the ultimate road trip, facing gummy bears, rogue shopping carts, flying donuts, and more—all while supporting each other through chaos and laughter.

## 🚀 How to Play

### Controls
- **Arrow Keys** or **WASD** - Move the car
- **Space** - Speed boost
- **P** - Pause
- **Esc** - Main menu

### Gameplay Features
- 🌟 Collect Friendship Stars for points
- 💛 Avoid obstacles (they cost you health!)
- 🎯 Reach the finish line to complete each level
- 🛡️ Health bar shows your progress
- 💬 Danny provides hilarious commentary

### Levels
1. **Candy Highway** - Giant gummy bears and rolling jawbreakers
2. **Chaos City** - Rogue shopping carts and vending machines
3. **Purple Sunset Run** - A beautiful neon-lit obstacle course
4. **Friendship Gauntlet** - The ultimate challenge with everything combined!

## 🎨 Visual Style

- Bright, cartoonish graphics
- Purple neon theme
- Emoji-based characters
- Confetti explosions (not violent!)
- Floating hearts and sparkles
- Cute bounce animations

## 📦 Features

✨ **Complete Browser Game** - No installation needed!
✨ **Mobile Responsive** - Play on any device
✨ **Procedural Audio** - Synthwave-inspired sounds
✨ **Multiple Levels** - 4 unique obstacle courses
✨ **Score System** - Track your progress
✨ **Pause Menu** - Play at your own pace
✨ **Ending Cutscene** - Beautiful finale celebrating friendship

## 🛠️ Technical Stack

- **HTML5** - Game structure
- **CSS3** - Beautiful styling with animations
- **JavaScript** - Core game logic
- **Phaser.js** - Game framework (loaded via CDN)
- **Web Audio API** - Procedural sound generation

## 🌐 How to Run

### Option 1: Direct File
1. Download all files to a folder
2. Open `index.html` in your web browser
3. Click "Start Game" and enjoy!

### Option 2: GitHub Pages
This repo is set up for GitHub Pages! Visit:
```
https://suchsosi.github.io/mello-danny-ride-or-die/
```

### Option 3: Local Server
```bash
# Python 3
python -m http.server 8000

# Python 2
python -m SimpleHTTPServer 8000

# Node.js (using http-server)
npm install -g http-server
http-server
```

Then visit `http://localhost:8000`

## 📁 File Structure

```
mello-danny-ride-or-die/
├── index.html      # Game HTML structure
├── styles.css      # All styling and animations
├── game.js         # Main game logic (Phaser.js scenes)
├── sounds.js       # Procedural audio system
└── README.md       # This file
```

## 🎵 Audio

The game features:
- Procedural sound effects (no external files needed!)
- Hit sound when colliding with obstacles
- Collection sound when picking up items
- Boost sound for speed increases

Audio is generated using the **Web Audio API** for a unique synthwave experience.

## 🎯 Game Mechanics

### Scoring
- Collect ⭐ (Friendship Stars) = +10 points
- Collect 🍫 (Chocolate) = +10 points
- Collect 💫 (Sparkles) = +10 points

### Health
- Start with 100 health
- Hit by obstacle = -10 health
- Health reaches 0 = Game Over
- Complete level to progress

### Danny's Dialogue
Danny provides random commentary:
- "Mello, incoming donut!"
- "This feels unsafe."
- "Actually we're doing amazing."
- "Best road trip ever."
- And more!

## 🌟 Ending Scene

After completing all 4 levels, enjoy a beautiful ending where:
- Mello and Danny park their convertible under the stars
- Healing message appears
- Dedication to the power of friendship
- Option to play again

## 💡 Customization

Want to customize the game? Here are some easy modifications:

### Change Colors
Edit `styles.css` and look for hex colors like `#ff69b4` (pink)

### Add More Obstacles
Edit `game.js` in the `spawnObstacle()` function, add more emoji to the array

### Adjust Difficulty
In `game.js`, modify:
- `spawnRate` - How often obstacles appear (lower = harder)
- Speed values in `update()` method
- Health damage in `hitObstacle()` function

### Add New Levels
Edit the `levels` array in `createLevel()` function

## 🐛 Troubleshooting

**Game won't load:**
- Make sure you're using a modern browser (Chrome, Firefox, Safari, Edge)
- Try clearing browser cache
- Check console for errors (F12 > Console tab)

**No sound:**
- Audio requires user interaction first (click/key press)
- Some browsers block audio by default
- Check browser volume and site permissions

**Mobile issues:**
- Ensure your browser supports the page
- Try portrait or landscape orientation
- Mobile controls use arrow keys or WASD

## 📝 License

Created as a celebration of friendship! Feel free to modify and share.

## 🎉 Credits

Made with ❤️ using:
- Phaser 3 - Amazing game framework
- Web Audio API - Procedural sound
- Pure JavaScript - Classic game dev spirit

**Dedicated to all best friends on life's chaotic road trips!** 🍬🍫💜

---

**Have fun, and remember: every journey is better with your best friend beside you!** 🚗✨
