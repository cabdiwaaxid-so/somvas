# Somvas - Lightweight 2D Game Framework for JavaScript

A modular framework for creating 2D games that work on both mobile and desktop.  
Features canvas rendering, game objects, game loop, asset loading, input handling, transformations, collision detection, scene management, and extensibility.

---

## Features

- Canvas-based rendering system  
- GameObject component architecture  
- Scene management with layer sorting  
- Asset loading (images and audio)  
- Input handling (keyboard, mouse, touch)  
- Collision detection (box and circle colliders)  
- Math utilities for game development  
- Debug mode with collider visualization  
- Mobile and desktop support  

---

## Installation

Simply include the `index.js` file in your project:

```html
<script src="https://cdn.jsdelivr.net/gh/cabdiwaaxid-so/somvas@main/index.js"></script>
```

---

## Quick Start

```html
<!DOCTYPE html>
<html>
<head>
  <title>Somvas Game</title>
</head>
<body>
  <canvas id="gameCanvas"></canvas>
  <script src="https://cdn.jsdelivr.net/gh/cabdiwaaxid-so/somvas@main/index.js"></script>
  <script>
    // Initialize the framework
    Somvas.init('gameCanvas', 800, 600);
    
    // Create a scene
    const mainScene = Somvas.createScene('main');
    mainScene.background = '#2c3e50';
    
    // Create a rectangle game object
    const player = new Somvas.GameObject(400, 300);
    player.addComponent(new Somvas.Rectangle(50, 50, '#e74c3c'));
    player.setCollider(Somvas.BoxCollider, 50, 50);
    
    // Add to scene
    mainScene.add(player);
    
    // Set current scene and start
    Somvas.setScene('main');
    Somvas.start();
  </script>
</body>
</html>
```

---

## API Reference

### GameEngine (Somvas)
Main framework object that manages the game loop, scenes, and global state.  

**Main Methods:**
- `init(canvasId, width, height)` – Initialize the framework  
- `start()` – Start the game loop  
- `stop()` – Stop the game loop  
- `createScene(name)` – Create a new scene  
- `setScene(name)` – Set the current scene  
- `toggleDebug()` – Toggle debug mode  

---

### Scene
Manages a collection of game objects and provides scene-specific functionality.  

**Main Methods:**
- `add(gameObject)` – Add a game object to the scene  
- `remove(gameObject)` – Remove a game object  
- `find(tag)` – Find objects by tag  
- `findOne(tag)` – Find first object by tag  

---

### GameObject
Base class for all entities in the game world with position, rotation, scale, and components.  

**Main Methods:**
- `addComponent(component)` – Add a component  
- `getComponent(type)` – Get a component by type  
- `setCollider(type, ...args)` – Set a collider  
- `setLayer(layer)` – Set rendering layer  
- `checkCollision(other)` – Check collision with another object  

---

### AssetLoader
Handles loading and management of game assets.  

**Main Methods:**
- `loadImage(name, src)` – Load a single image  
- `loadImages(images)` – Load multiple images  
- `loadAudio(name, src)` – Load a single audio file  
- `loadAudios(audios)` – Load multiple audio files  
- `get(name)` – Get a loaded asset  

---

### Input
Handles user input from keyboard, mouse, and touch.  

**Main Methods:**
- `isKeyPressed(key)` – Check if key is pressed  
- `isMousePressed()` – Check if mouse is pressed  
- `isTouchPressed()` – Check if touch is active  
- `getMousePosition()` – Get mouse coordinates  
- `getTouchPosition()` – Get touch coordinates  

---

## Example

```javascript
// Load assets
Somvas.AssetLoader.loadImages({
  player: 'assets/player.png',
  enemy: 'assets/enemy.png'
}).then(() => {
  // Create scene
  const gameScene = Somvas.createScene('game');
  
  // Create player with sprite
  const player = new Somvas.GameObject(100, 100);
  const playerSprite = new Somvas.Sprite(Somvas.AssetLoader.get('player'), 64, 64);
  player.addComponent(playerSprite);
  player.setCollider(Somvas.BoxCollider, 64, 64);
  
  // Create enemy with sprite
  const enemy = new Somvas.GameObject(300, 200);
  const enemySprite = new Somvas.Sprite(Somvas.AssetLoader.get('enemy'), 48, 48);
  enemy.addComponent(enemySprite);
  enemy.setCollider(Somvas.CircleCollider, 24);
  
  // Add objects to scene
  gameScene.add(player);
  gameScene.add(enemy);
  
  // Set scene and start game
  Somvas.setScene('game');
  Somvas.start();
}).catch(error => {
  console.error('Failed to load assets:', error);
});
```

---

## License

MIT License – feel free to use in your projects.
