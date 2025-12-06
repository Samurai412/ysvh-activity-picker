# YSVH Activity Picker

🎲 An interactive, visually stunning activity picker for YSVH Voice Chat sessions!

## Features

- **Slot Machine Spinner**: Dramatic slot-machine style randomization with smooth animations
- **50+ Activities**: Curated list of games and interactive activities perfect for voice chat
- **Category Filtering**: Filter activities by type (Music, Strategy, Puzzle, etc.)
- **Confetti Celebration**: Celebratory confetti explosion when an activity is selected
- **Responsive Design**: Works great on desktop and mobile
- **Keyboard Support**: Press Space to spin!

## Live Demo

Visit: [https://YOUR_USERNAME.github.io/ysvh-activity-picker](https://YOUR_USERNAME.github.io/ysvh-activity-picker)

## Deploying to GitHub Pages

### Option 1: Quick Setup

1. Create a new repository on GitHub named `ysvh-activity-picker`
2. Push this code to the repository:
   ```bash
   git init
   git add .
   git commit -m "Initial commit: YSVH Activity Picker"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/ysvh-activity-picker.git
   git push -u origin main
   ```
3. Go to your repository Settings → Pages
4. Under "Source", select "Deploy from a branch"
5. Select "main" branch and "/ (root)" folder
6. Click Save

Your site will be live at `https://YOUR_USERNAME.github.io/ysvh-activity-picker` in a few minutes!

### Option 2: Using GitHub Actions (Already Configured)

This repository includes a GitHub Actions workflow that automatically deploys to GitHub Pages whenever you push to the main branch.

1. Push to GitHub as shown above
2. Go to Settings → Pages
3. Under "Source", select "GitHub Actions"
4. The site will deploy automatically!

## Local Development

Simply open `index.html` in your browser - no build step required!

## Adding New Activities

Edit `activities.js` and add new entries to the `activities` array:

```javascript
{
    name: "Activity Name",
    url: "https://example.com",
    category: "Category",
    description: "Brief description of the activity"
}
```

## Color Scheme

- **Lemon Yellow** (`#fff44f`): Primary background
- **Sky Blue** (`#87ceeb`): Accent color
- Dark text for excellent readability

## License

MIT License - Feel free to use and modify!

---

Made with 💛 for YSVH Voice Chat
