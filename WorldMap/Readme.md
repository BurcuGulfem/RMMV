# MrTS_MapNodesTravel v1.01
Allows to travel to different maps through node selection.

Original plugin: https://github.com/Trivel/RMMV

### What's new:
* Made node images optional
* Added event command to change actor's start location
* Added map scrolling to selected

### Check out the demo video:

[![IMAGE ALT TEXT](http://img.youtube.com/vi/eg4RBDA5S6o/0.jpg)](http://www.youtube.com/watch?v=eg4RBDA5S6o "Video Title")

## How To
### Setting up nodes

Open up this plugin in your favorite text editor and scroll down to the part
where it says EDIT MAP NODES HERE - follow the structure there.
"keyName": {
   picture: "pictureName",
   xMenu: number,
   yMenu: number,
   mapID: number,
   mapX: number,
   mapY: number    
},

"keyName" - key name of node that will be used to lock/unlock it - single word.
picture - picture name to show above the node
xMenu - X position in meun
yMenu - Y position in menu
mapID - map ID to teleport to
mapX - map X to teleport to
mapY - map Y to teleport to

### Plugin Commands
* MapNode Enter - Enters MapNode scene
* MapNode Show [KEYNAME] - Adds node on the map
* MapNode Hide [KEYNAME] - Removes node from the map
* MapNode Lock [KEYNAME] - Locks node on the map
* MapNode Unlock [KEYNAME] - Unlocks node on the map
* MapNode SET_START_XY [KEYNAME] [X] [Y] - Changes the map's starting location to X,Y

### Examples
* MapNode Enter

* MapNode Show Forest
* MapNode Hide Forest

* MapNode Lock Graveyard
* Mapnode Unlock StoneFarm
* Mapnode SET_START_XY Forest 10 1

### Pictures
All pictures go into img\system folder.
Default pictures:
* img\system\mapNodeCursor.png
* img\system\mapNodeBackground.png
* img\system\mapNodeLocked.png
* img\system\mapNodeUnlocked.png
