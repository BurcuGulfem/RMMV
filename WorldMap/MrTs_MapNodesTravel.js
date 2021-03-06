//=============================================================================
// MrTS_MapNodesTravel.js
//=============================================================================

/*:
* @plugindesc Allows to travel to different maps through node selection.
* @author Mr. Trivel
*
* @param Cursor Offset
* @desc Offset for Cursor image. X Y
* Default: 0 -48
* @default 0 -48
*
* @param Info Offset
* @desc Offset for Info image. X Y
* Default: -88 -118
* @default -88 -118
* 
* @help 
* --------------------------------------------------------------------------------
* Terms of Use
* --------------------------------------------------------------------------------
* Don't remove the header or claim that you wrote this plugin.
* Credit Mr. Trivel if using this plugin in your project.
* Free for commercial and non-commercial projects.
* --------------------------------------------------------------------------------
* Version 1.01 - Alpha
* --------------------------------------------------------------------------------
* @author Burcu Arabaci
* 
* What's new:
* Made node images optional
* Added event command to change actor's start location
* Added map scrolling to selected node
*
* TODO:
* Moving mapNodeList to a seperate file, preferably configurable from RVVM
* Improve map scrolling
* 
* --------------------------------------------------------------------------------
* Version 1.0
* --------------------------------------------------------------------------------
*
* --------------------------------------------------------------------------------
* Setting up nodes
* --------------------------------------------------------------------------------
* Open up this plugin in your favorite text editor and scroll down to the part
* where it says EDIT MAP NODES HERE - follow the structure there.
* "keyName": {
*    picture: "pictureName",
*    xMenu: number,
*    yMenu: number,
*    mapID: number,
*    mapX: number,
*    mapY: number    
* },
*
* "keyName" - key name of node that will be used to lock/unlock it - single word.
* picture - picture name to show above the node
* xMenu - X position in meun
* yMenu - Y position in menu
* mapID - map ID to teleport to
* mapX - map X to teleport to
* mapY - map Y to teleport to
* --------------------------------------------------------------------------------
*
* --------------------------------------------------------------------------------
* Plugin Commands
* --------------------------------------------------------------------------------
* MapNode Enter - Enters MapNode scene
* 
* MapNode Show [KEYNAME] - Adds node on the map
* MapNode Hide [KEYNAME] - Removes node from the map
*
* MapNode Lock [KEYNAME] - Locks node on the map
* MapNode Unlock [KEYNAME] - Unlocks node on the map
*
* MapNode SET_START_XY [KEYNAME] [X] [Y] - Changes the map's starting location to X,Y
*
* Examples:
* MapNode Enter
* 
* MapNode Show Forest
* MapNode Hide Forest
*
* MapNode Lock Graveyard
* Mapnode Unlock StoneFarm
* Mapnode SET_START_XY Forest 10 1
* --------------------------------------------------------------------------------
*
* --------------------------------------------------------------------------------
* Pictures
* --------------------------------------------------------------------------------
* All pictures go into img\system folder.
* Default pictures:
* img\system\mapNodeCursor.png
* img\system\mapNodeBackground.png
* img\system\mapNodeLocked.png
* img\system\mapNodeUnlocked.png
* --------------------------------------------------------------------------------
*
* --------------------------------------------------------------------------------
* Version History
* --------------------------------------------------------------------------------
* 1.01 - Improvements Alpha
* 1.00 - Release
*/

(function() {
	var mapNodeList = {
	//--------------------------------------------------------------------------------
	// EDIT MAP NODES HERE v
	//--------------------------------------------------------------------------------
		"forest": {
			picture: "forestNode",
			xMenu: 182,
			yMenu: 302,
			mapId: 3,
			mapX: 24,
			mapY: 20
		},
		"advGuild": {
			picture: "guildNode",
			xMenu: 702,
			yMenu: 192,
			mapId: 5,
			mapX: 10,
			mapY: 17
		},
		"node1": {
			picture: "node",
			xMenu: 1117,
			yMenu: 204,
			mapId: 1,
			mapX: 24,
			mapY: 20
		},
		"node2": {
			picture: "node",
			xMenu: 458,
			yMenu: 624,
			mapId: 2,
			mapX: 24,
			mapY: 20
		},
		"node3": {
			picture: "node",
			xMenu: 991,
			yMenu: 557,
			mapId: 2,
			mapX: 24,
			mapY: 20
		},
		"node4": {
			picture: "node",
			xMenu: 168,
			yMenu: 672,
			mapId: 2,
			mapX: 24,
			mapY: 20
		},
		"node5": {
			picture: "node",
			xMenu: 912,
			yMenu: 312,
			mapId: 2,
			mapX: 24,
			mapY: 20
		}
	//--------------------------------------------------------------------------------
	// EDIT MAP NODES THERE ^
	//--------------------------------------------------------------------------------
	}

	var parameters = PluginManager.parameters('MrTS_MapNodesTravel');
	var paramCursorOffset = String(parameters['Cursor Offset'] || "0 -48");
	var paramCursorOffsetData = paramCursorOffset.split(' ');
	paramCursorOffsetData[0] = Number(paramCursorOffsetData[0]);
	paramCursorOffsetData[1] = Number(paramCursorOffsetData[1]);
	var paramInfoOffset = String(parameters['Info Offset'] || "-88 -118");
	var paramInfoOffsetData = paramInfoOffset.split(' ');
	paramInfoOffsetData[0] = Number(paramInfoOffsetData[0]);
	paramInfoOffsetData[1] = Number(paramInfoOffsetData[1]);

	//--------------------------------------------------------------------------
	// Game_Interpreter
	// 
	
	var _Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;
	Game_Interpreter.prototype.pluginCommand = function(command, args) {
		_Game_Interpreter_pluginCommand.call(this, command, args);
		if (command.toLowerCase() === "mapnode") {
			switch (args[0].toUpperCase())
			{
				case 'ENTER':
				{
					SceneManager.push(Scene_MapNodes);
				} break;
				case 'SHOW':
				{
					$gameSystem.showMapNode(args[1]);
				} break;
				case 'HIDE':
				{
					$gameSystem.hideMapNode(args[1]);
				} break;
				case 'LOCK':
				{
					$gameSystem.lockMapNode(args[1]);
				} break;
				case 'UNLOCK':
				{
					$gameSystem.unlockMapNode(args[1]);
				} break;
				case 'SET_START_XY':
				{
					$gameSystem.setStartLocationForMap(args[1],args[2],args[3]);
				} break;
			}
		}
	};

	//--------------------------------------------------------------------------
	// Game_System
	// 

	_Game_System_initialize = Game_System.prototype.initialize;
	Game_System.prototype.initialize = function() {
		_Game_System_initialize.call(this);
		this._nodesShown = [];
		this._nodesLocked = [];
	};

	Game_System.prototype.showMapNode = function(keyname) {
		if (!mapNodeList[keyname]) {
			console.warn(keyname + " doesn't exist in mapNodeList!");
			return;
		}

		if (!this.mapNodeShown(keyname)) this._nodesShown.push(keyname);
	};

	Game_System.prototype.hideMapNode = function(keyname) {
		if (this.mapNodeShown(keyname)) 
			this._nodesShown.splice(this._nodesShown.indexOf(keyname), 1);
	};

	Game_System.prototype.lockMapNode = function(keyname) {
		if (!mapNodeList[keyname]) {
			console.warn(keyname + " doesn't exist in mapNodeList!");
			return;
		}

		if (!this.mapNodeLocked(keyname)) this._nodesLocked.push(keyname);
	};

	Game_System.prototype.unlockMapNode = function(keyname) {
		if (this.mapNodeLocked(keyname)) 
			this._nodesLocked.splice(this._nodesLocked.indexOf(keyname), 1);
	};

	Game_System.prototype.mapNodeShown = function(keyname) {
		return this._nodesShown.contains(keyname);
	};

	Game_System.prototype.mapNodeLocked = function(keyname) {
		return this._nodesLocked.contains(keyname);
	};

	Game_System.prototype.getMapNodesShown = function() {
		return this._nodesShown;
	};

	Game_System.prototype.setStartLocationForMap = function(keyname,mapX,mapY) {
		if (!mapNodeList[keyname]) {
			console.warn(keyname + " doesn't exist in mapNodeList!");
			return;
		}
		var node = mapNodeList[keyname];
		node.mapX = parseInt(mapX);
		node.mapY = parseInt(mapY);
		mapNodeList[keyname] = node;
	};

	//--------------------------------------------------------------------------
	// Scene_MapNodes
	//
	// Map Nodes scene. For travelling.
	
	function Scene_MapNodes() {
		this.initialize.apply(this, arguments);	
	};
	
	Scene_MapNodes.prototype = Object.create(Scene_Base.prototype);
	Scene_MapNodes.prototype.constructor = Scene_MapNodes;
	
	Scene_MapNodes.prototype.initialize = function() {
		Scene_Base.prototype.initialize.call(this);
	};
	
	Scene_MapNodes.prototype.create = function() {
		Scene_Base.prototype.create.call(this);
		this.createBackground();
		this.createWindowLayer();
		this.createSelectionWindow();
	};

	Scene_MapNodes.prototype.createBackground = function() {
		this._backgroundImage = new Sprite();
		this._backgroundImage.bitmap = ImageManager.loadSystem("mapNodeBackground");
		this.addChild(this._backgroundImage);
	};

	Scene_MapNodes.prototype.createSelectionWindow = function() {
		this._selectWindow = new Window_MapNodes();
		this._selectWindow.setHandler('ok', this.selectOk.bind(this));
		this._selectWindow.setHandler('cancel', this.popScene.bind(this));
		this._selectWindow.select(0);
		this._selectWindow.activate();
		this.addWindow(this._selectWindow);
	};

	Scene_MapNodes.prototype.selectOk = function() {
		var node = mapNodeList[$gameSystem.getMapNodesShown()[this._selectWindow.index()]];
		console.log(node);
		$gamePlayer.reserveTransfer(node.mapId, node.mapX, node.mapY, 2, 0);
		this.popScene();
	};

	//--------------------------------------------------------------------------
	// Window_MapNodes
	//
	// Shows all nodes and allows travelling between them.
	
	function Window_MapNodes() {
		this.initialize.apply(this, arguments);	
	};
	
	Window_MapNodes.prototype = Object.create(Window_Selectable.prototype);
	Window_MapNodes.prototype.constructor = Window_MapNodes;
	
	Window_MapNodes.prototype.initialize = function() {
		var sp = this.standardPadding();
		this._nodes = [];
		this._cursor = new Sprite();
		this._info = new Sprite();
		this._cursor.bitmap = ImageManager.loadSystem("mapNodeCursor");
		this._nodeLockedBitmap = ImageManager.loadSystem("mapNodeLocked");
		this._nodeUnlockedBitmap = ImageManager.loadSystem("mapNodeUnlocked");
		Window_Selectable.prototype.initialize.call(this, -sp, -sp, Graphics.boxWidth+sp, Graphics.boxHeight+sp);
		var nodes = $gameSystem.getMapNodesShown();
		for (var i = 0; i < this.maxItems(); i++) {
			var node = mapNodeList[nodes[i]];
			var tmpSpr = new Sprite();
			tmpSpr.bitmap = $gameSystem.mapNodeLocked(nodes[i]) ? this._nodeLockedBitmap : this._nodeUnlockedBitmap;
			tmpSpr.x = node.xMenu;
			tmpSpr.y = node.yMenu;
			this._nodes.push(tmpSpr);
			this.addChild(tmpSpr);
		}
		var rect = this.itemRect(0);
		this._cursor.x = rect.x;
		this._cursor.y = rect.y;
		var node = mapNodeList[nodes[0]];
		if (node.picture == null){
			this._info.bitmap = ImageManager.loadSystem(node.picture);
		}
		
		this._info.x = node.xMenu + paramInfoOffsetData[0];
		this._info.y = node.yMenu + paramInfoOffsetData[1];
		this.addChild(this._cursor);
		this.addChild(this._info);
		this.opacity = 0;
		this.refresh();
	};

	Window_MapNodes.prototype.maxItems = function() {
		return $gameSystem.getMapNodesShown().length;
	};

	Window_MapNodes.prototype.updateCursor = function() {
        this.setCursorRect(0, 0, 0, 0);
	};

	Window_MapNodes.prototype.itemRect = function(index) {
		var rect = new Rectangle;
		var nodes = $gameSystem.getMapNodesShown();		
		var node = mapNodeList[nodes[index]];
		if ($gameSystem.mapNodeLocked(nodes[index]) && this._nodeLockedBitmap.isReady())
		{
			
			rect.x = node.xMenu;
			rect.y = node.yMenu;
			rect.width = this._nodeLockedBitmap.width;
			rect.height = this._nodeLockedBitmap.height;
		}
		else if (!$gameSystem.mapNodeLocked(nodes[index]) && this._nodeUnlockedBitmap.isReady())
		{
			rect.x = node.xMenu;
			rect.y = node.yMenu;
			rect.width = this._nodeUnlockedBitmap.width;
			rect.height = this._nodeUnlockedBitmap.height;
		}
		else
		{
			rect.x = node.xMenu;
			rect.y = node.yMenu;
			rect.width = 48;
			rect.height = 48;
		}
		rect.x -= this.standardPadding();
		rect.y -= this.standardPadding();
		return rect;
	};

	Window_MapNodes.prototype.update = function() {
		Window_Selectable.prototype.update.call(this);
		var node = mapNodeList[$gameSystem.getMapNodesShown()[this.index()]];
		var tX = node.xMenu + paramCursorOffsetData[0];
		var tY = node.yMenu + paramCursorOffsetData[1];
		var dX = tX - this._cursor.x;
		var dY = tY - this._cursor.y;

		this._cursor.x += dX * 0.08;
		this._cursor.y += dY * 0.08;
	};

	Window_MapNodes.prototype.updateInfoSprite = function() {
		var nodes = $gameSystem.getMapNodesShown();
		var node = mapNodeList[nodes[this.index()]];
		this._info.x = node.xMenu + paramInfoOffsetData[0];
		this._info.y = node.yMenu + paramInfoOffsetData[1];
		if (node.picture == null){
			this._info.bitmap = ImageManager.loadSystem(node.picture);
		}
	};

/**
 *	Moves the screen to show the selected node in the middle if possible
 *	moves background image accordingly
 */
Window_MapNodes.prototype.updateWindowForSelectedNode = function() {
		var nodes = $gameSystem.getMapNodesShown();
		var node = mapNodeList[nodes[this.index()]];

		diffX = node.xMenu - this.width/2;
		diffY = node.yMenu - this.height/2;

		var backgroundImage = SceneManager._scene._backgroundImage;
		if(diffX<0){
			diffX = 0;
		}
		else if((diffX+this.width)>backgroundImage.width){
			diffX = backgroundImage.width - this.width;
		} 
		if(diffY<0){
			diffY = 0;
		}
		else if((diffY+this.height)>backgroundImage.height){
			diffY = backgroundImage.height - this.height;
		}
		diffX = -1*diffX;
		diffY = -1*diffY;

		backgroundImage.move(diffX,diffY);
		this.move(diffX,diffY,this.width,this.height);
	};

	Window_MapNodes.prototype.cursorDown = function(wrap) {
		var lowerWithY = [];
		var index = this.index();
		for (var i = 0; i < this._nodes.length; i++) {
			if (this._nodes[i].y > this._nodes[index].y)
				lowerWithY.push(i);
		}
		var cs = this._nodes;
		var df = this.distance;
		lowerWithY.sort(function(a, b) {
			return df(cs[index].x, cs[index].y, cs[a].x, cs[a].y) - df(cs[index].x, cs[index].y, cs[b].x, cs[b].y)
		});
		if (lowerWithY.length > 0) this.select(lowerWithY[0]);
		this.updateInfoSprite();
		this.updateWindowForSelectedNode();
	};

	Window_MapNodes.prototype.cursorUp = function(wrap) {
		var higherWithY = [];
		var index = this.index();
		for (var i = 0; i < this._nodes.length; i++) {
			if (this._nodes[i].y < this._nodes[index].y)
				higherWithY.push(i);
		}
		var cs = this._nodes;
		var df = this.distance;
		higherWithY.sort(function(a, b) {
			return df(cs[index].x, cs[index].y, cs[a].x, cs[a].y) - df(cs[index].x, cs[index].y, cs[b].x, cs[b].y)
		});
		if (higherWithY.length > 0) this.select(higherWithY[0]);
		this.updateInfoSprite();
		this.updateWindowForSelectedNode();
	};

	Window_MapNodes.prototype.cursorRight = function(wrap) {
	    var higherWithX = [];
		var index = this.index();
		for (var i = 0; i < this._nodes.length; i++) {
			if (this._nodes[i].x > this._nodes[index].x)
				higherWithX.push(i);
		}
		var cs = this._nodes;
		var df = this.distance;
		higherWithX.sort(function(a, b) {
			return df(cs[index].x, cs[index].y, cs[a].x, cs[a].y) - df(cs[index].x, cs[index].y, cs[b].x, cs[b].y)
		});
		if (higherWithX.length > 0) this.select(higherWithX[0]);
		this.updateInfoSprite();
		this.updateWindowForSelectedNode();
	};

	Window_MapNodes.prototype.cursorLeft = function(wrap) {
	    var lowerWithX = [];
		var index = this.index();
		for (var i = 0; i < this._nodes.length; i++) {
			if (this._nodes[i].x < this._nodes[index].x)
				lowerWithX.push(i);
		}
		var cs = this._nodes;
		var df = this.distance;
		lowerWithX.sort(function(a, b) {
			return df(cs[index].x, cs[index].y, cs[a].x, cs[a].y) - df(cs[index].x, cs[index].y, cs[b].x, cs[b].y)
		});
		if (lowerWithX.length > 0) this.select(lowerWithX[0]);
		this.updateInfoSprite();
		this.updateWindowForSelectedNode();
	};

	Window_MapNodes.prototype.distance = function(x1, y1, x2, y2) {
		var a = x1 - x2;
		var b = y1 - y2;
		return Math.abs(a) + Math.abs(b);
	};

	Window_MapNodes.prototype.isCurrentItemEnabled = function() {
	    return !$gameSystem.mapNodeLocked($gameSystem.getMapNodesShown()[this.index()]);
	};

	Window_MapNodes.prototype.onTouch = function(triggered) {
		Window_Selectable.prototype.onTouch.call(this, triggered);
		this.updateInfoSprite();
	};
})();