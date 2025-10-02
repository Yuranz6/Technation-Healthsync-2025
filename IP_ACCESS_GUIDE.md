# 🌐 IP Address Access Guide

## 📍 Current IP Address Configuration

- **Your IP Address**: `192.168.2.105`
- **Port**: `3000`
- **Access URL**: `http://192.168.2.105:3000`

## 🔧 Updated Configuration

### 1. Page Redirect Updates
- All page redirects use IP address
- Use local storage for user authentication

## 🚀 How to Use

### Method 1: Direct Access
```
http://192.168.2.105:3000
```

### Method 2: Access from Other Devices
1. **Ensure devices are on the same network**
2. **Use IP address to access**: `http://192.168.2.105:3000`
3. **Test local login functionality**

## 🔐 User Authentication

### Using local storage for user authentication:
- User login information stored in localStorage
- Supports simple username/password authentication
- No external authentication service required

## 🧪 Testing Steps

1. **Access homepage**: `http://192.168.2.105:3000`
2. **Click "Log In" button**
3. **Use demo account to login** (doctor@healthsync.ai / demo123)
4. **Verify redirect to**: `http://192.168.2.105:3000/test-clinical-notes.html`

## 🔧 Troubleshooting

### If login fails:
1. **Check username and password**
2. **Ensure using correct demo account**
3. **Check network connection**

### If page cannot be accessed:
1. **Check firewall settings**
2. **Ensure port 3000 is open**
3. **Verify IP address is correct**

## 📱 Mobile Device Testing

1. **Connect to same WiFi network**
2. **Access**: `http://192.168.2.105:3000`
3. **Test local login**
4. **Verify functionality works**

## 🔄 Switch Back to localhost

If you need to switch back to localhost, update the following files:
- `app/test-clinical-notes.html`

Replace IP address with:
- `window.location.origin` (auto-detect)
- or `http://localhost:3000`

---

## 🎯 Quick Start

1. **Access**: `http://192.168.2.105:3000`
2. **Click login button**
3. **Use demo account to login**
4. **Start using AI diagnosis features**

Now you can access the system using IP address! 🚀