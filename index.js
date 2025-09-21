/**
 * Lightweight 2D Game Framework for JavaScript
 * 
 * A modular somvas for creating 2D games that work on both mobile and desktop.
 * Features: Canvas rendering, game objects, game loop, asset loading, input handling,
 * transformations, collision detection, scene management, and extensibility.
 */

// Main Framework object
const Somvas = (function() {
    'use strict';
    
    // somvas version
    const VERSION = '1.0.0';
    
    // Main somvas object
    const somvas = {
        VERSION: VERSION,
        canvas: null,
        ctx: null,
        scenes: {},
        currentScene: null,
        isRunning: false,
        lastTime: 0,
        deltaTime: 0,
        assets: {},
        input: {},
        debugMode: false
    };
    
    // Math utilities
    const MathUtils = {
        // Calculate distance between two points
        distance: function(x1, y1, x2, y2) {
            return Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1));
        },
        
        // Check if two rectangles overlap
        rectOverlap: function(rect1, rect2) {
            return (rect1.x < rect2.x + rect2.width &&
                    rect1.x + rect1.width > rect2.x &&
                    rect1.y < rect2.y + rect2.height &&
                    rect1.y + rect1.height > rect2.y);
        },
        
        // Check if two circles overlap
        circleOverlap: function(circle1, circle2) {
            const distance = this.distance(circle1.x, circle1.y, circle2.x, circle2.y);
            return distance < circle1.radius + circle2.radius;
        },
        
        // Check if a point is inside a rectangle
        pointInRect: function(point, rect) {
            return (point.x >= rect.x && 
                    point.x <= rect.x + rect.width &&
                    point.y >= rect.y && 
                    point.y <= rect.y + rect.height);
        },
        
        // Linear interpolation
        lerp: function(a, b, t) {
            return a + (b - a) * t;
        },
        
        // Clamp a value between min and max
        clamp: function(value, min, max) {
            return Math.min(Math.max(value, min), max);
        },
        
        // Generate a random number between min and max
        random: function(min, max) {
            return Math.random() * (max - min) + min;
        },
        
        // Generate a random integer between min and max
        randomInt: function(min, max) {
            return Math.floor(Math.random() * (max - min + 1)) + min;
        }
    };
    
    // Asset loader
    const AssetLoader = {
        // Load an image
        loadImage: function(name, src) {
            return new Promise((resolve, reject) => {
                const img = new Image();
                img.onload = () => {
                    somvas.assets[name] = img;
                    resolve(img);
                };
                img.onerror = () => {
                    reject(`Failed to load image: ${src}`);
                };
                img.src = src;
            });
        },
        
        // Load multiple images
        loadImages: function(images) {
            const promises = [];
            for (const name in images) {
                promises.push(this.loadImage(name, images[name]));
            }
            return Promise.all(promises);
        },
        
        // Load audio
        loadAudio: function(name, src) {
            return new Promise((resolve, reject) => {
                const audio = new Audio();
                audio.addEventListener('canplaythrough', () => {
                    somvas.assets[name] = audio;
                    resolve(audio);
                });
                audio.onerror = () => {
                    reject(`Failed to load audio: ${src}`);
                };
                audio.src = src;
            });
        },
        
        // Load multiple audio files
        loadAudios: function(audios) {
            const promises = [];
            for (const name in audios) {
                promises.push(this.loadAudio(name, audios[name]));
            }
            return Promise.all(promises);
        },
        
        // Get a loaded asset
        get: function(name) {
            return somvas.assets[name];
        }
    };
    
    // Input handler
    const Input = {
        // Initialize input handling
        init: function() {
            somvas.input = {
                keys: {},
                mouse: {
                    x: 0,
                    y: 0,
                    pressed: false
                },
                touch: {
                    x: 0,
                    y: 0,
                    pressed: false
                }
            };
            
            // Keyboard events
            window.addEventListener('keydown', (e) => {
                somvas.input.keys[e.key] = true;
            });
            
            window.addEventListener('keyup', (e) => {
                somvas.input.keys[e.key] = false;
            });
            
            // Mouse events
            somvas.canvas.addEventListener('mousemove', (e) => {
                const rect = somvas.canvas.getBoundingClientRect();
                somvas.input.mouse.x = e.clientX - rect.left;
                somvas.input.mouse.y = e.clientY - rect.top;
            });
            
            somvas.canvas.addEventListener('mousedown', () => {
                somvas.input.mouse.pressed = true;
            });
            
            somvas.canvas.addEventListener('mouseup', () => {
                somvas.input.mouse.pressed = false;
            });
            
            // Touch events
            somvas.canvas.addEventListener('touchstart', (e) => {
                e.preventDefault();
                const rect = somvas.canvas.getBoundingClientRect();
                somvas.input.touch.x = e.touches[0].clientX - rect.left;
                somvas.input.touch.y = e.touches[0].clientY - rect.top;
                somvas.input.touch.pressed = true;
            });
            
            somvas.canvas.addEventListener('touchmove', (e) => {
                e.preventDefault();
                const rect = somvas.canvas.getBoundingClientRect();
                somvas.input.touch.x = e.touches[0].clientX - rect.left;
                somvas.input.touch.y = e.touches[0].clientY - rect.top;
            });
            
            somvas.canvas.addEventListener('touchend', () => {
                somvas.input.touch.pressed = false;
            });
        },
        
        // Check if a key is pressed
        isKeyPressed: function(key) {
            return somvas.input.keys[key] || false;
        },
        
        // Check if mouse is pressed
        isMousePressed: function() {
            return somvas.input.mouse.pressed;
        },
        
        // Check if touch is active
        isTouchPressed: function() {
            return somvas.input.touch.pressed;
        },
        
        // Get mouse position
        getMousePosition: function() {
            return {
                x: somvas.input.mouse.x,
                y: somvas.input.mouse.y
            };
        },
        
        // Get touch position
        getTouchPosition: function() {
            return {
                x: somvas.input.touch.x,
                y: somvas.input.touch.y
            };
        }
    };
    
    // Base GameObject class
    class GameObject {
        constructor(x, y, layer = 0) {
            this.x = x || 0;
            this.y = y || 0;
            this.width = 0;
            this.height = 0;
            this.rotation = 0;
            this.scaleX = 1;
            this.scaleY = 1;
            this.visible = true;
            this.components = [];
            this.collider = null;
            this.layer = layer;
        }
        
        // Add a component to the game object
        addComponent(component) {
            this.components.push(component);
            component.gameObject = this;
            if (component.start) {
                component.start();
            }
            return this;
        }
        
        // Get a component by type
        getComponent(type) {
            return this.components.find(component => component instanceof type);
        }
        
        // Update the game object and its components
        update(deltaTime) {
            if (!this.visible) return;
            
            for (const component of this.components) {
                if (component.update) {
                    component.update(deltaTime);
                }
            }
        }
        
        // Draw the game object and its components
        draw(ctx) {
            if (!this.visible) return;
            
            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.rotate(this.rotation);
            ctx.scale(this.scaleX, this.scaleY);
            
            for (const component of this.components) {
                if (component.draw) {
                    component.draw(ctx);
                }
            }
            
            // Draw collider in debug mode
            if (somvas.debugMode && this.collider) {
                this.collider.draw(ctx);
            }
            
            ctx.restore();
        }
        
        // Set a collider for this game object
        setCollider(type, ...args) {
            this.collider = new type(this, ...args);
            return this.collider;
        }
        
        // Check collision with another game object
        checkCollision(other) {
            if (!this.collider || !other.collider) return false;
            return this.collider.checkCollision(other.collider);
        }
        
        // Set the layer (z-index) for this game object
        setLayer(layer) {
            this.layer = layer;
            // If this object is in a scene, sort the scene's objects by layer
            if (this.scene) {
                this.scene.sortObjectsByLayer();
            }
            return this;
        }
        
        // Get the layer of this game object
        getLayer() {
            return this.layer;
        }
    }
    
    // Sprite component
    class Sprite {
        constructor(image, width, height) {
            this.image = image;
            this.width = width;
            this.height = height;
            this.opacity = 1;
        }
        
        // Draw the sprite
        draw(ctx) {
            if (this.image) {
                ctx.globalAlpha = this.opacity;
                ctx.drawImage(
                    this.image, 
                    -this.width / 2, 
                    -this.height / 2, 
                    this.width, 
                    this.height
                );
                ctx.globalAlpha = 1;
            }
        }
    }
    
    // Text component
    class Text {
        constructor(text, style) {
            this.text = text;
            this.style = style || {
                font: '16px Arial',
                fill: 'white',
                align: 'center',
                baseline: 'middle'
            };
        }
        
        // Draw the text
        draw(ctx) {
            ctx.font = this.style.font;
            ctx.fillStyle = this.style.fill;
            ctx.textAlign = this.style.align;
            ctx.textBaseline = this.style.baseline;
            ctx.fillText(this.text, 0, 0);
        }
    }
    
    // Shape component (rectangle)
    class Rectangle {
        constructor(width, height, color) {
            this.width = width;
            this.height = height;
            this.color = color || 'white';
            this.fill = true;
            this.stroke = false;
            this.strokeColor = 'black';
            this.strokeWidth = 1;
        }
        
        // Draw the rectangle
        draw(ctx) {
            if (this.fill) {
                ctx.fillStyle = this.color;
                ctx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);
            }
            
            if (this.stroke) {
                ctx.strokeStyle = this.strokeColor;
                ctx.lineWidth = this.strokeWidth;
                ctx.strokeRect(-this.width / 2, -this.height / 2, this.width, this.height);
            }
        }
    }
    
    // Shape component (circle)
    class Circle {
        constructor(radius, color) {
            this.radius = radius;
            this.color = color || 'white';
            this.fill = true;
            this.stroke = false;
            this.strokeColor = 'black';
            this.strokeWidth = 1;
        }
        
        // Draw the circle
        draw(ctx) {
            ctx.beginPath();
            ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
            
            if (this.fill) {
                ctx.fillStyle = this.color;
                ctx.fill();
            }
            
            if (this.stroke) {
                ctx.strokeStyle = this.strokeColor;
                ctx.lineWidth = this.strokeWidth;
                ctx.stroke();
            }
        }
    }
    
    // Colliders
    class Collider {
        constructor(gameObject) {
            this.gameObject = gameObject;
        }
        
        checkCollision(other) {
            return false;
        }
        
        draw(ctx) {
            // To be implemented by specific colliders
        }
    }
    
    class BoxCollider extends Collider {
        constructor(gameObject, width, height, offsetX = 0, offsetY = 0) {
            super(gameObject);
            this.width = width;
            this.height = height;
            this.offsetX = offsetX;
            this.offsetY = offsetY;
        }
        
        checkCollision(other) {
            if (other instanceof BoxCollider) {
                return MathUtils.rectOverlap(
                    {
                        x: this.gameObject.x + this.offsetX - this.width / 2,
                        y: this.gameObject.y + this.offsetY - this.height / 2,
                        width: this.width,
                        height: this.height
                    },
                    {
                        x: other.gameObject.x + other.offsetX - other.width / 2,
                        y: other.gameObject.y + other.offsetY - other.height / 2,
                        width: other.width,
                        height: other.height
                    }
                );
            } else if (other instanceof CircleCollider) {
                // Box vs Circle collision
                const closestX = MathUtils.clamp(
                    other.gameObject.x + other.offsetX,
                    this.gameObject.x + this.offsetX - this.width / 2,
                    this.gameObject.x + this.offsetX + this.width / 2
                );
                
                const closestY = MathUtils.clamp(
                    other.gameObject.y + other.offsetY,
                    this.gameObject.y + this.offsetY - this.height / 2,
                    this.gameObject.y + this.offsetY + this.height / 2
                );
                
                const distance = MathUtils.distance(
                    other.gameObject.x + other.offsetX,
                    other.gameObject.y + other.offsetY,
                    closestX,
                    closestY
                );
                
                return distance < other.radius;
            }
            return false;
        }
        
        draw(ctx) {
            ctx.strokeStyle = 'red';
            ctx.lineWidth = 1;
            ctx.strokeRect(
                this.offsetX - this.width / 2,
                this.offsetY - this.height / 2,
                this.width,
                this.height
            );
        }
    }
    
    class CircleCollider extends Collider {
        constructor(gameObject, radius, offsetX = 0, offsetY = 0) {
            super(gameObject);
            this.radius = radius;
            this.offsetX = offsetX;
            this.offsetY = offsetY;
        }
        
        checkCollision(other) {
            if (other instanceof CircleCollider) {
                return MathUtils.circleOverlap(
                    {
                        x: this.gameObject.x + this.offsetX,
                        y: this.gameObject.y + this.offsetY,
                        radius: this.radius
                    },
                    {
                        x: other.gameObject.x + other.offsetX,
                        y: other.gameObject.y + other.offsetY,
                        radius: other.radius
                    }
                );
            } else if (other instanceof BoxCollider) {
                return other.checkCollision(this);
            }
            return false;
        }
        
        draw(ctx) {
            ctx.strokeStyle = 'red';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.arc(this.offsetX, this.offsetY, this.radius, 0, Math.PI * 2);
            ctx.stroke();
        }
    }
    
    // Scene class
    class Scene {
        constructor(name) {
            this.name = name;
            this.gameObjects = [];
            this.background = null;
        }
        
        // Add a game object to the scene
        add(gameObject) {
            this.gameObjects.push(gameObject);
            gameObject.scene = this;
            // Sort objects by layer after adding
            this.sortObjectsByLayer();
            return gameObject;
        }
        
        // Remove a game object from the scene
        remove(gameObject) {
            const index = this.gameObjects.indexOf(gameObject);
            if (index !== -1) {
                this.gameObjects.splice(index, 1);
                gameObject.scene = null;
            }
        }
        
        // Find game objects by tag
        find(tag) {
            return this.gameObjects.filter(obj => obj.tag === tag);
        }
        
        // Find first game object by tag
        findOne(tag) {
            return this.gameObjects.find(obj => obj.tag === tag);
        }
        
        // Sort game objects by layer (z-index)
        sortObjectsByLayer() {
            this.gameObjects.sort((a, b) => a.layer - b.layer);
        }
        
        // Update all game objects in the scene
        update(deltaTime) {
            for (const gameObject of this.gameObjects) {
                gameObject.update(deltaTime);
            }
        }
        
        // Draw all game objects in the scene (sorted by layer)
        draw(ctx) {
            // Draw background if set
            if (this.background) {
                ctx.fillStyle = this.background;
                ctx.fillRect(0, 0, somvas.canvas.width, somvas.canvas.height);
            }
            
            // Draw all game objects (already sorted by layer)
            for (const gameObject of this.gameObjects) {
                gameObject.draw(ctx);
            }
        }
    }
    
    // Initialize the somvas
    somvas.init = function(canvasId, width, height) {
        // Get or create canvas
        if (canvasId) {
            this.canvas = document.getElementById(canvasId);
            if (!this.canvas) {
                throw new Error(`Canvas with id '${canvasId}' not found`);
            }
        } else {
            this.canvas = document.createElement('canvas');
            document.body.appendChild(this.canvas);
        }
        
        // Set canvas dimensions
        this.canvas.width = width || window.innerWidth;
        this.canvas.height = height || window.innerHeight;
        
        // Get 2D context
        this.ctx = this.canvas.getContext('2d');
        
        // Initialize input handling
        Input.init();
        
        console.log(`Game somvas v${VERSION} initialized`);
    };
    
    // Start the game loop
    somvas.start = function() {
        if (!this.ctx) {
            throw new Error('somvas not initialized. Call init() first.');
        }
        
        this.isRunning = true;
        this.lastTime = performance.now();
        
        const gameLoop = (currentTime) => {
            // Calculate delta time
            this.deltaTime = (currentTime - this.lastTime) / 1000;
            this.lastTime = currentTime;
            
            // Clear canvas
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            
            // Update and draw current scene
            if (this.currentScene) {
                this.currentScene.update(this.deltaTime);
                this.currentScene.draw(this.ctx);
            }
            
            // Continue game loop if running
            if (this.isRunning) {
                requestAnimationFrame(gameLoop);
            }
        };
        
        requestAnimationFrame(gameLoop);
    };
    
    // Stop the game loop
    somvas.stop = function() {
        this.isRunning = false;
    };
    
    // Create a new scene
    somvas.createScene = function(name) {
        const scene = new Scene(name);
        this.scenes[name] = scene;
        return scene;
    };
    
    // Set the current scene
    somvas.setScene = function(name) {
        if (this.scenes[name]) {
            this.currentScene = this.scenes[name];
        } else {
            throw new Error(`Scene '${name}' not found`);
        }
    };
    
    // Toggle debug mode
    somvas.toggleDebug = function() {
        this.debugMode = !this.debugMode;
    };
    
    // Expose classes and utilities
    somvas.GameObject = GameObject;
    somvas.Sprite = Sprite;
    somvas.Text = Text;
    somvas.Rectangle = Rectangle;
    somvas.Circle = Circle;
    somvas.BoxCollider = BoxCollider;
    somvas.CircleCollider = CircleCollider;
    somvas.MathUtils = MathUtils;
    somvas.AssetLoader = AssetLoader;
    somvas.Input = Input;
    
    return somvas;
})();