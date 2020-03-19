# DLUX Starter Pack

Welcome! You're only a few minutes away from building in VR. This software is special... when you remix it, it becomes yours. You can change the interface, the colors, add features... and anybody else can copy from you. Each one of these represents a collaborative envirnoment with built in audio and avatar chat. Anything you can get working here should also run on dlux.io with monetization via the STEEM network and the DLUX sidechain. All you need is a free STEEM acount and the ability to see this webpage. 

Are you ready? Here's what you can do today... Upload 360, normal images & GLTF/GLB models. You can then modify these components via the GUI. Set your blog post/dApp information. Then post the VR dApp to the immutable STEEM blockchain via STEEM KEYCHAIN (Download [Chrome/Brave](https://chrome.google.com/webstore/detail/steem-keychain/lkcjlnjfpbikmcmbachjpdbijejflpcm)
[Firefox](https://addons.mozilla.org/en-US/firefox/addon/steem-keychain/))

<hr>
So! Let's get you up and running.

## 1. Remix 🎤
If you're project name says dlux-vr, click the [remix](https://glitch.com/edit/#!/remix/dlux-vr) button ↗

[Watch a video](https://youtu.be/P2V00ni7Q6g)

## 2. Protect 🔒

← select 🔑.env and set a passcode on line 10:
```
PASS="YourPasscode"
```
[Watch a video](https://youtu.be/ofgEGgnYWmk)

## 3. Create 🚀

↖ Click `Show Live` to open a new tab with your experience. You can test this link on mobile, desktop, and headset as you create, just refresh to see your latest changes*

When you're ready to create: access the inspector by pressing `<ctrl> <alt> i` and select the rocket button.

#### Importing Models
[Watch a video](https://youtu.be/yi1kuOlsVYM)
#### Importing Pictures
[Watch a video](https://youtu.be/oP2AeY_Jh2Y)
#### Cloning Entities
[Watch a video](https://youtu.be/Mqln8VNi9Nk)
#### Deleting Entities
[Watch a video](https://youtu.be/bPgioRiYREE)
#### Houston We Have a Problem
[Watch a video](https://youtu.be/eq24kzNsjVw)

## 4. Advanced

> **Works with Safari on iPhone, Chrome on Android, Firefox & Safari on Mac, Firefox & Chrome on PC & Oculus Rift, Firefox & Browser on Oculus Go.*

## Post with [Steem Keychain](https://steemit.com/utopian-io/@yabapmatt/steem-keychain-update-firefox-version-now-available)

Behind the scenes we'll pin up to 100Mb of content for 6 months. You're free to pin content for longer.

# dlux WebXR Builder (IDE)
<hr>

## Glitch Code Panel (Left Side)
Make changes directly to the code!

'public/post.html' is yours to remix. It loads the same way as the static content that you can post on dlux. Design and create your new reality here then share it on dlux

Scroll down to `<a-scene>` on line 477 to see the A-Frame code. There you'll also see a reference to the Inspector.

## A-Frame & Inspector (Right Side)
*If you don't see A-Frame on the right side, go to:  
`https://your-url.glitch.me/build.html`*

A-Frame is WebVR, click on it to activate. Your mouse becomes your pointer + gaze, while the Arrow and 'WASD' keys move you around the world.

With A-Frame active, press ` <ctrl> + <alt> + i ` to open the inspector.

The left window contains:

* `Back to Scene` returns you to the experience and closes the inspector
* `+` - adds a new entity to the scene, give it an 'ID' immediately to save
* `Add model URL` - coming soon
* `Upload a model` - coming soon
* `Play / Pause` - toggles scene state
* `glTF` - exports the scene to `.glTF` format
* `Save` - synchronizes new changes back to Glitch, based on 'ID'
* `Search` - filters the scene graph
* `Scene Graph` - Contains `<a-scene>` and all other entities within

The middle window is the scene, and the bar at the top controls how you see and interact with the viewport.

* `View Dropdown` - contains Perspective and Orthographic views
* `Translate` - moves selected object(s) around the scene 
* `Rotate` - rotates slected object(s)
* `Scale` - scales selected object(s)
* `local checkbox` - toggles local and worldspace transformations

With an entity in the left panel selected, the right panel will beocme visible.

* `ID` - any new entity must be given an 'ID' first or it will not save. Do not change the ID after you have entered it.
* `Components` - assign 'geometry' or 'gltf-model' to an entity.


Of course all of these test environments are yours to edit and share. Collaboration is the name of the game and dlux is MIT Licensed.

Once you've built and tested your scene, upload to IPFS and make a steem post with the IPFS address. `crtl + alt + s` takes a 360 capture from the game engine and should also be uploaded to make the dynamic links in the feed.

### Resources:

[A-Frame](https://github.com/aframe/aframe), a web framework for building multi-device virtual reality experiences. Works on Vive, Rift, desktop, mobile platforms.

Built with [Networked-A-Frame](https://github.com/haydenjameslee/networked-aframe), a web framework for building multi-user virtual reality experiences.

Click and drag on desktop. Open it on a smartphone and use the device motion sensors. Or [plug in a VR headset](https://webvr.rocks)!

[Join the dlux discord](https://discord.gg/Beeb38j)