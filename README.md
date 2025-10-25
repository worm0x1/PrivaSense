# PrivaSense

**A lightweight, modular JavaScript library for detecting incognito mode, user activity, and device storage.**

---

## ✨ Features

- 🕵️ **Incognito Mode Detection** - Works across Chrome, Brave, Firefox, Safari, Edge, and Opera
- 🚶 **Activity Detection** - Real-time user activity monitoring (Standing, Sitting, Walking, Lying down)
- 💾 **Storage Information** - Device storage usage and capacity
- 🎯 **Modular Design** - Enable only what you need for optimal performance
- ⚡ **Lightweight** - Only ~8KB minified
- 🔧 **Zero Dependencies** - No external libraries required
- 📱 **Mobile Friendly** - Full support for iOS and Android devices

---

## 📦 Installation

Add the library to your HTML file:

```html
<script src="https://cdn.jsdelivr.net/gh/worm0x1/PrivaSense/PrivaSense.js"></script>
```

That's it! The library will automatically load all required dependencies.

---

## 🚀 Quick Start

```javascript
// Enable only the features you need
const ps = new PrivaSense({ 
    incognito: true,   // ✅ Enable incognito detection
    activity: false,   // ❌ Disable activity detection
    storage: true      // ✅ Enable storage detection
});

// Get all enabled information
const info = await ps.getInfo();
console.log(info);
// Output: { incognito: '✅', storage: '32 GB / 128 GB' }
```

---

## 📖 Documentation

* Constructor Options

```javascript
new PrivaSense({
    incognito: boolean,       // Enable incognito detection (default: true)
    activity: boolean,        // Enable activity detection (default: true)
    storage: boolean,         // Enable storage detection (default: true)
    historyLength: number,    // Motion history buffer (default: 100)
    walkingThreshold: number  // Walking detection threshold (default: 2.0)
})
```
---

### Main Methods

* `getInfo()`
Returns all enabled features' information.

```javascript
const info = await ps.getInfo();
// Returns object with only enabled features
```

* `detectIncognito()`
Detects incognito/private mode. *Requires: `incognito: true`*

```javascript
const result = await ps.detectIncognito();
// Returns: '✅' (Normal) or '❌' (Incognito)
```

* `getActivity()`
Gets current user activity. *Requires: `activity: true`*

```javascript
const activity = await ps.getActivity();
// Returns: 'Standing or Sitting' | 'Walking or riding' | 'Lying down'
```

* `getStorage()`
Gets device storage info. *Requires: `storage: true`*

```javascript
const storage = await ps.getStorage();
// Returns: '32 GB / 128 GB' or 'Unknown'
```

## 💡 Examples

### Example 1: Only Incognito Detection

Perfect for privacy-focused websites.

```javascript
const ps = new PrivaSense({ incognito: true });
const info = await ps.getInfo();

if (info.incognito === '❌') {
    alert('Please disable incognito mode for full functionality');
}
```

### Example 2: Only Activity Detection

Great for fitness or health apps.

```html
<div id="activity">Detecting...</div>

<script src="https://cdn.jsdelivr.net/gh/worm0x1/PrivaSense/PrivaSense.js"></script>
<script>
    const ps = new PrivaSense({ activity: true });
    
    setInterval(async () => {
        const info = await ps.getInfo();
        document.getElementById('activity').textContent = info.activity;
    }, 2000);
</script>
```

### Example 3: Only Storage Detection

Useful for storage management apps.

```javascript
const ps = new PrivaSense({ storage: true });
const info = await ps.getInfo();

console.log('Available storage:', info.storage);
```

### Example 4: Incognito + Storage

```javascript
const ps = new PrivaSense({ 
    incognito: true, 
    storage: true 
});

const info = await ps.getInfo();
console.log(info);
// { incognito: '✅', storage: '32 GB / 128 GB' }
```

### Example 5: All Features - Complete Dashboard

```html
<!DOCTYPE html>
<html>
<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
<head>
    <title>PrivaSense Demo</title>
    <style>
        .info-card {
            padding: 20px;
            margin: 10px 0;
            border: 2px solid #0066cc;
            border-radius: 10px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
        }
        .value { 
            font-size: 28px; 
            font-weight: bold;
            margin-top: 10px;
        }
    </style>
</head>
<body>
    <h1>📱 Device Information Dashboard</h1>
    
    <div class="info-card">
        <h3>🕵️ Browsing Mode</h3>
        <div class="value" id="incognito">Loading...</div>
    </div>
    
    <div class="info-card">
        <h3>🚶 Current Activity</h3>
        <div class="value" id="activity">Loading...</div>
    </div>
    
    <div class="info-card">
        <h3>💾 Storage</h3>
        <div class="value" id="storage">Loading...</div>
    </div>

    <script src="https://cdn.jsdelivr.net/gh/worm0x1/PrivaSense/PrivaSense.js"></script>
    <script>
        const ps = new PrivaSense({ 
            incognito: true, 
            activity: true, 
            storage: true 
        });

        async function updateInfo() {
            const info = await ps.getInfo();
            
            document.getElementById('incognito').textContent = 
                info.incognito === '✅' ? 'Normal Mode ✅' : 'Incognito Mode ❌';
            
            document.getElementById('activity').textContent = info.activity;
            document.getElementById('storage').textContent = info.storage;
        }

        updateInfo();
        setInterval(updateInfo, 3000);
    </script>
</body>
</html>
```

## 🎨 Configuration Examples

```javascript
// 1️⃣ Single Feature
const ps1 = new PrivaSense({ incognito: true });
const ps2 = new PrivaSense({ activity: true });
const ps3 = new PrivaSense({ storage: true });

// 2️⃣ Two Features
const ps4 = new PrivaSense({ incognito: true, storage: true });
const ps5 = new PrivaSense({ activity: true, storage: true });
const ps6 = new PrivaSense({ incognito: true, activity: true });

// 3️⃣ All Features
const ps7 = new PrivaSense({ 
    incognito: true, 
    activity: true, 
    storage: true 
});

// 4️⃣ Custom Configuration
const ps8 = new PrivaSense({ 
    activity: true,
    historyLength: 150,      // Longer motion history
    walkingThreshold: 2.5    // More sensitive walking detection
});
```

## 🔥 Use Cases

| Use Case | Configuration | Best For |
|----------|--------------|----------|
| Privacy Check | `{ incognito: true }` | Banking, E-commerce sites |
| Fitness Tracking | `{ activity: true }` | Health apps, Step counters |
| Storage Manager | `{ storage: true }` | File managers, Cloud storage apps |
| Security Dashboard | `{ incognito: true, storage: true }` | Admin panels, Security tools |
| Complete Monitoring | All three enabled | Device info dashboards |

## ⚡ Performance

PrivaSense only loads what you enable:

| Configuration | Load Time | CPU Usage |
|--------------|-----------|-----------|
| Single feature | < 5ms | Minimal |
| Two features | < 10ms | Low |
| All features | < 15ms | Low |

## 🌐 Browser Compatibility

| Browser | Incognito Detection | Activity Detection | Storage Detection |
|---------|-------------------|-------------------|-------------------|
| Chrome | ✅ | ✅ | ✅ |
| Brave | ✅ | ❌ | ❌ |
| Firefox | ✅ | ✅ | ❌ |
| Safari | ✅ | ✅ | ✅ |
| Edge | ✅ | ✅ | ✅ |
| Opera | ✅ | ✅ | ✅ |

**Note:** Activity detection requires device motion sensors (available on most mobile devices and some laptops).

## 📱 iOS Permissions

For activity detection on iOS 13+, you need to request permission:

```javascript
if (typeof DeviceMotionEvent.requestPermission === 'function') {
    const permission = await DeviceMotionEvent.requestPermission();
    if (permission === 'granted') {
        const ps = new PrivaSense({ activity: true });
        // Now you can use activity detection
    }
} else {
    // Non-iOS device, no permission needed
    const ps = new PrivaSense({ activity: true });
}
```

## 🛡️ Error Handling

If you try to call a method for a disabled feature:

```javascript
const ps = new PrivaSense({ incognito: true }); // Only incognito enabled

try {
    await ps.getActivity(); // This will throw an error
} catch (error) {
    console.error(error.message);
    // "Activity detection is not enabled. Initialize with { activity: true }"
}
```

## 📊 Return Values

### Incognito Detection
- `'✅'` - Normal browsing mode
- `'❌'` - Incognito/Private mode

### Activity Detection
- `"Standing or Sitting"`
- `"Walking or riding"`
- `"Lying down"`
- `"Sensor not supported"`

### Storage Detection
- `"32 GB / 128 GB"` - (Used / Total)
- `"128 GB"` - (Only total if used is 0)
- `"Unknown"` - If API unavailable

---

## ⚙️ static web protection

This project is also built with the same **Js obfuscation library**

> [▶️ Test Site](https://web0x1.vercel.app/)


---

## 📄 License

License - **Free** to use in personal and commercial projects

---
