var canvas = document.getElementById('renderCanvas')

var startRenderLoop = function (engine, canvas) {
	engine.runRenderLoop(function () {
		if (sceneToRender && sceneToRender.activeCamera) {
			sceneToRender.render()
		}
	})
}

var engine = null
var scene = null
var sceneToRender = null
var createDefaultEngine = function () {
	return new BABYLON.Engine(canvas, true, {
		preserveDrawingBuffer: true,
		stencil: true,
		disableWebGL2Support: false,
	})
}

const loadSceneMock = () => {
	const scene = new BABYLON.Scene(engine)
	scene.clearColor = new BABYLON.Color3.FromHexString('#2d402c')

	const camera = new BABYLON.ArcRotateCamera(
		'Camera',
		0,
		0,
		10,
		new BABYLON.Vector3(11, 20, -6),
		scene
	)
	camera.wheelDeltaPercentage = 0.01
	camera.setTarget(new BABYLON.Vector3(11, 0.2, 13))
	//camera.attachControl(canvas, true)

	const globallight = new BABYLON.HemisphericLight(
		'light',
		new BABYLON.Vector3(0, 0.5, -0.3)
	)
	globallight.intensity = 0.7

	const dirlight = new BABYLON.DirectionalLight(
		'dirlight',
		new BABYLON.Vector3(-6.25, -12.5, 7.8)
	)
	dirlight.intensity = 0.5

	const shadow = new BABYLON.ShadowGenerator(1024, dirlight)
	shadow.usePoissonSampling = true

	const createGrid = function (scene) {
		//var grid = {
		//	h: 21,
		//	w: 21,
		//}

		/*const ground = new BABYLON.MeshBuilder.CreateBox('ground', {
			width: 23,
			height: 1,
			depth: 27,
		})
		ground.position = new BABYLON.Vector3(11, 0, 13)
		const borderLeft = new BABYLON.MeshBuilder.CreateBox('borderleft', {
			width: 1,
			height: 2,
			depth: 27,
		})
		borderLeft.position = new BABYLON.Vector3(-1, 0.5, 13)
		const borderRight = new BABYLON.MeshBuilder.CreateBox('borderright', {
			width: 1,
			height: 2,
			depth: 27,
		})
		borderRight.position = new BABYLON.Vector3(23, 0.5, 13)
		const borderUp = new BABYLON.MeshBuilder.CreateBox('borderup', {
			width: 25,
			height: 2,
			depth: 1,
		})
		borderUp.position = new BABYLON.Vector3(11, 0.5, 27)

		const groundMaterial = new BABYLON.StandardMaterial('groundMat', scene)
		groundMaterial.diffuseColor = new BABYLON.Color3.FromHexString('#8f8f8f')
		const borderMaterial = new BABYLON.StandardMaterial('borderMat', scene)
		borderMaterial.diffuseColor = new BABYLON.Color3(0.3, 0.3, 0.3)

		shadow.getShadowMap().renderList.push(borderLeft)
		shadow.getShadowMap().renderList.push(borderRight)
		shadow.getShadowMap().renderList.push(borderUp)

		borderLeft.material = borderMaterial
		borderRight.material = borderMaterial
		borderUp.material = borderMaterial
		ground.material = groundMaterial
		ground.receiveShadows = true*/

		BABYLON.SceneLoader.ImportMesh(
			'',
			'./Resources/Glb/',
			'Basket_Grid.glb',
			scene,
			function (meshArray) {
				ground1 = meshArray[1]
				ground1.scaling = new BABYLON.Vector3(-5, -5, 5)
				//ground1.rotate.y = (3 * Math.PI) / 2
				ground1.position = new BABYLON.Vector3(-10.5, -2.5, 16.5)
				ground1.receiveShadows = true
				ground1.castShadow = true
				shadow.getShadowMap().renderList.push(ground1)
			}
		)
	}

	const createApple = scene => {
		let apple = BABYLON.MeshBuilder.CreateSphere(
			'apple',
			{ diameter: 1.2, segments: 3 },
			scene
		)
		apple.position.y = 1

		let appleMaterial = new BABYLON.StandardMaterial('red')
		appleMaterial.diffuseColor = new BABYLON.Color3.FromHexString('#ff5510')
		apple.material = appleMaterial
		//shadow.getShadowMap().renderList.push(apple)
	}

	const createSnakeHead = scene => {
		const snakeHead = BABYLON.MeshBuilder.CreateBox(
			'snakeHead',
			{
				width: 1.1,
				height: 1.1,
				depth: 1.1,
			},
			scene
		)
		snakeHead.position.y = 1

		//const snakeHeadMaterial = new BABYLON.StandardMaterial(
		//	'snakeHeadMat',
		//	scene
		//)
		//snakeHeadMaterial.diffuseColor = new BABYLON.Color3.FromHexString('#06819c')
		//snakeHeadMaterial.alpha = 0.5
		//snakeHead.material = snakeHeadMaterial
		//shadow.getShadowMap().renderList.push(snakeHead)
	}

	const createSnakeBody = scene => {
		const snakeBody = BABYLON.MeshBuilder.CreateBox(
			'snakeBody',
			{
				width: 1,
				height: 0.8,
				depth: 1,
			},
			scene
		)
		snakeBody.position.y = 1

		//const snakeCellMaterial = new BABYLON.StandardMaterial(
		//	'snakeCellMat',
		//	scene
		//)
		//snakeCellMaterial.diffuseColor = new BABYLON.Color3.FromHexString('#09b1d6')
		//snakeBody.material = snakeCellMaterial
		//shadow.getShadowMap().renderList.push(snakeBody)
	}

	const createSnakeTail = scene => {
		const snakeTail = new BABYLON.MeshBuilder.CreateBox(
			'snakeTail',
			{
				width: 1,
				height: 0.7,
				depth: 0.8,
			},
			scene
		)
		snakeTail.position.y = 1

		//orangeMaterial = new BABYLON.StandardMaterial('orange', scene)
		//orangeMaterial.diffuseColor = new BABYLON.Color3(0.97, 0.66, 0.09)
		//snakeTail.material = orangeMaterial
		//shadow.getShadowMap().renderList.push(snakeTail)
	}

	const createSnake = scene => {
		createSnakeHead(scene)
		createSnakeBody(scene)
		createSnakeTail(scene)
	}

	createGrid(scene)
	createApple(scene)
	createSnake(scene)

	return scene
}

const GameDirectionKeys = Object.freeze({
	Up: 'w',
	Left: 'a',
	Down: 's',
	Right: 'd',
	None: '',
})

class BabylonSnake {
	get scene() {
		return this._scene
	}

	gameStart = () => {
		this._gameId += 1
		this._gameScore = 0
		this._maxGameScore = this._gameScore
		this._gameLoopDelayMs = 100

		// Reset object locations
		this._snake = [
			Math.round(this._gridWidth / 2) -
				1 +
				(Math.round(this._gridHeight / 2) - 1) * this._gridWidth,
		]
		this._updateApple()

		// Reset meshes
		for (let mesh of this._snakeBodyMeshes) {
			mesh.dispose()
			mesh = null
		}
		this._snakeBodyMeshes = []
		this._snakeTailMesh.isVisible = false

		let score = this._gameScore
		let countGame = this._gameId
		var score_draw = document.getElementById('score')
		score_draw.innerHTML = score
		console.log(score)
		var stat_draw = document.getElementById('stat')
		stat_draw.innerHTML = 'Game Start: ' + countGame
		let maxScore = this._maxGameScore
		if (score > maxScore) {
			maxScore = score
			localStorage.setItem(maxScore, score)
		}

		var maxscore_draw = document.getElementById('maxscore')
		maxscore_draw.innerHTML = 'Speed: ' + this._gameLoopDelayMs
		// Reset directions inputs
		this._snakeHeadDirection = GameDirectionKeys.None
		this._lastMoveDirection = this._snakeHeadDirection
		this._snakeHeadDirectionHistory = []

		const snakeHeadMaterial = new BABYLON.StandardMaterial('snakeHeadMat')
		snakeHeadMaterial.diffuseColor = new BABYLON.Color3.FromHexString('#008f5b')
		//snakeHeadMaterial.diffuseTexture = new BABYLON.Texture(
		//	'./Resources/9268160.jpg'
		//)
		this._snakeHeadMesh.material = snakeHeadMaterial
		this._snakeHeadMesh.scaling = new BABYLON.Vector3(1, 1, 1)
		const snakeCellMaterial = new BABYLON.StandardMaterial('snakeCellMat')
		//snakeCellMaterial.diffuseColor = new BABYLON.Color3.FromHexString('#09b1d6')
		snakeCellMaterial.diffuseTexture = new BABYLON.Texture(
			'./Resources/Textures/9268160.jpg'
		)
		this._snakeBodyPrefab.material = snakeCellMaterial
		const orangeMaterial = new BABYLON.StandardMaterial('orange', scene)
		//orangeMaterial.diffuseColor = new BABYLON.Color3(0.97, 0.66, 0.09)
		orangeMaterial.diffuseTexture = new BABYLON.Texture(
			'./Resources/Textures/9268160.jpg'
		)
		this._snakeTailMesh.material = orangeMaterial

		//this._scene = loadSceneMock()

		//this._snakeHeadMesh = this._scene.getMeshByName('snakeHead')
		//this._snakeBodyPrefab = this._scene.getMeshByName('snakeBody')
		//this._snakeBodyPrefab.isVisible = false
		//this._snakeTailMesh = this._scene.getMeshByName('snakeTail')
		//this._snakeTailMesh.isVisible = false

		//this._snakeBodyMeshes = []
		//this._appleMesh = this._scene.getMeshByName('apple')

		// Update objects
		this._moveObjectsToGridPositions()

		// Inputs
		this._setupInputHandling()

		// Remove restart button if present
		this._gameUI.removeControl(this._restartBtn)
		this._gameUI.removeControl(this._gameOverText)

		// Start game
		this._scene.onBeforeRenderObservable.runCoroutineAsync(this._runGameLoop())
	}

	constructor() {
		// Game props
		this._gameLoopDelayMs = 100
		this._gridHeight = 27
		this._gridWidth = 23
		this._gridSize = this._gridHeight * this._gridWidth

		// Game states
		this._gameId = 0
		this._gameScore = 0
		//this._snake = [
		//	Math.round(this._gridWidth / 2) +
		//		Math.round(this._gridHeight / 2) * this._gridWidth,
		//]
		this._apple = 0
		//this._snakeHeadDirection = GameDirectionKeys.Right
		//this._lastMoveDirection = this._snakeHeadDirection
		//this._snakeHeadDirectionHistory = []

		// Load scene
		this._scene = loadSceneMock()

		this._dirlight = new BABYLON.DirectionalLight(
			'dirlight',
			new BABYLON.Vector3(-6.25, -10, 7.8)
		)
		this._dirlight.intensity = 0.5

		this._shadow = new BABYLON.ShadowGenerator(512, this._dirlight)
		this._shadow.usePoissonSampling = true

		//this._ground = this._scene.getMeshByName('ground')
		//this._borderMaterial = new BABYLON.StandardMaterial('borderMat', scene)
		//this._borderMaterial.diffuseColor = new BABYLON.Color3(0.3, 0.3, 0.3)

		this._snakeHeadMesh = this._scene.getMeshByName('snakeHead')
		this._shadow.getShadowMap().renderList.push(this._snakeHeadMesh)
		this._snakeBodyPrefab = this._scene.getMeshByName('snakeBody')
		this._snakeBodyPrefab.isVisible = false
		this._snakeTailMesh = this._scene.getMeshByName('snakeTail')
		this._shadow.getShadowMap().renderList.push(this._snakeTailMesh)
		this._snakeTailMesh.isVisible = false

		this._snakeBodyMeshes = []
		this._appleMesh = this._scene.getMeshByName('apple')
		this._shadow.getShadowMap().renderList.push(this._appleMesh)

		// Create UI
		this._gameUI = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI(
			'UI',
			true,
			this._scene
		)
		this._restartBtn = BABYLON.GUI.Button.CreateSimpleButton(
			'restartBtn',
			'Restart'
		)
		this._restartBtn.width = '100px'
		this._restartBtn.height = '100px'
		this._restartBtn.thickness = 0
		this._restartBtn.verticalAlignment = 2
		this._restartBtn.horizontalAlignment = 2
		this._restartBtn.top = '2.5%'
		this._restartBtn.fontSize = '2.25%'
		this._restartBtn.color = '#ffffff'
		//this._restartBtn.top = '-16px'
		//when the button is down, make pause menu visable and add control to it
		this._restartBtn.onPointerDownObservable.add(() => {
			this.gameStart()
		})

		this._gameOverText = new BABYLON.GUI.TextBlock('gameOverText')
		this._gameOverText.width = '600px'
		this._gameOverText.height = '100px'
		this._gameOverText.verticalAlignment = 2
		this._gameOverText.horizontalAlignment = 2
		this._gameOverText.textVerticalAlignment = 2
		this._gameOverText.textHorizontalAlignment = 2
		this._gameOverText.top = '-7.5%'
		this._gameOverText.fontSize = '10%'
		this._gameOverText.color = '#ffffff'
		this._gameOverText.text = 'Game Over!'
	}

	// Input handling
	_inputHandling = kbInfo => {
		if (kbInfo.type === BABYLON.KeyboardEventTypes.KEYDOWN) {
			switch (kbInfo.event.key) {
				case GameDirectionKeys.Left:
					// If snake is longer than head, prevent eating itself
					// due to mistype in opposite direction
					if (
						this._snake.length === 1 ||
						this._lastMoveDirection !== GameDirectionKeys.Right
					) {
						this._snakeHeadMesh.rotation.y = Math.PI
						this._snakeHeadDirection = GameDirectionKeys.Left
					}
					break
				case GameDirectionKeys.Right:
					if (
						this._snake.length === 1 ||
						this._lastMoveDirection !== GameDirectionKeys.Left
					) {
						this._snakeHeadMesh.rotation.y = 0
						this._snakeHeadDirection = GameDirectionKeys.Right
					}
					break
				case GameDirectionKeys.Up:
					if (
						this._snake.length === 1 ||
						this._lastMoveDirection !== GameDirectionKeys.Down
					) {
						this._snakeHeadMesh.rotation.y = (3 * Math.PI) / 2
						this._snakeHeadDirection = GameDirectionKeys.Up
					}
					break
				case GameDirectionKeys.Down:
					if (
						this._snake.length === 1 ||
						this._lastMoveDirection !== GameDirectionKeys.Up
					) {
						this._snakeHeadMesh.rotation.y = Math.PI / 2
						this._snakeHeadDirection = GameDirectionKeys.Down
					}
				//case GameDirectionKeys.None:
				//	if (this._snake.length === 1) {
				//		this._snakeHeadMesh.rotation.y = Math.PI
				//this._snakeHeadDirection = GameDirectionKeys.None
				//	}
				//	break
				default:
					break
			}
		}
	}

	_setupInputHandling = () => {
		this._scene.onKeyboardObservable.add(this._inputHandling)
	}

	// Game mechanics logic
	_1dGridToWorldPosition = gridPosition => {
		const gridWidth = this._gridWidth
		const gridHeight = this._gridHeight

		const x = gridPosition % gridWidth
		const z = gridHeight - 1 - ((gridPosition / gridWidth) << 0)

		return [x, z]
	}

	_checkGameOver = nextMove => {
		const snakeHead = this._snake[0]
		const snakeHeadDirection = this._snakeHeadDirection
		const gridSize = this._gridSize
		const gridWidth = this._gridWidth

		const outofBoundsVertical = nextMove < 0 || nextMove >= gridSize
		const outOfBoundsLeft =
			snakeHead % gridWidth === 0 &&
			snakeHeadDirection === GameDirectionKeys.Left
		const outOfBoundsRight =
			snakeHead % gridWidth === gridWidth - 1 &&
			snakeHeadDirection === GameDirectionKeys.Right
		const onItself =
			this._snake.indexOf(nextMove) !== -1 &&
			this._snake.indexOf(nextMove) !== this._snake.length - 1

		return (
			outofBoundsVertical || outOfBoundsLeft || outOfBoundsRight || onItself
		)
	}

	_getNextMove = () => {
		const snakeHeadLocation = this._snake[0]
		const snakeHeadDirection = this._snakeHeadDirection
		const gridWidth = this._gridWidth

		let nextMove = 0
		switch (snakeHeadDirection) {
			case GameDirectionKeys.Up:
				nextMove = snakeHeadLocation - gridWidth
				this._lastMoveDirection = GameDirectionKeys.Up
				break
			case GameDirectionKeys.Down:
				nextMove = snakeHeadLocation + gridWidth
				this._lastMoveDirection = GameDirectionKeys.Down
				break
			case GameDirectionKeys.Left:
				nextMove = snakeHeadLocation - 1
				this._lastMoveDirection = GameDirectionKeys.Left
				break
			case GameDirectionKeys.Right:
				nextMove = snakeHeadLocation + 1
				this._lastMoveDirection = GameDirectionKeys.Right
				break
			case GameDirectionKeys.None:
				nextMove = snakeHeadLocation
				this._lastMoveDirection = GameDirectionKeys.None
				break
			default:
				break
		}
		return nextMove
	}

	_updateApple = () => {
		let appleSpawnLocations = Array.from(
			{ length: this._gridSize },
			(_, i) => i
		)

		appleSpawnLocations = appleSpawnLocations.filter(
			value => !this._snake.includes(value)
		)

		const randomIndex = (Math.random() * appleSpawnLocations.length) << 0
		this._apple = appleSpawnLocations[randomIndex]
	}

	_rotateMesh = (mesh, indexNum) => {
		if (indexNum !== 0) {
			const meshDirection = this._snakeHeadDirectionHistory[indexNum - 1]
			switch (meshDirection) {
				case GameDirectionKeys.Left:
					mesh.rotation.y = Math.PI
					break
				case GameDirectionKeys.Right:
					mesh.rotation.y = 0
					break
				case GameDirectionKeys.Up:
					mesh.rotation.y = (3 * Math.PI) / 2
					break
				case GameDirectionKeys.Down:
					mesh.rotation.y = Math.PI / 2
					break
				default:
					break
			}
		}
	}

	_moveObjectsToGridPositions = () => {
		const [appleX, appleZ] = this._1dGridToWorldPosition(this._apple)
		this._appleMesh.position.x = appleX
		this._appleMesh.position.z = appleZ

		for (let [indexStr, val] of Object.entries(this._snake)) {
			const [posX, posZ] = this._1dGridToWorldPosition(val)
			const indexNum = +indexStr

			let mesh = null
			if (indexNum === 0) {
				mesh = this._snakeHeadMesh
			} else if (indexNum === this._snake.length - 1) {
				mesh = this._snakeTailMesh
				mesh.isVisible = true
			} else {
				mesh = this._snakeBodyMeshes[indexNum - 1]
			}

			mesh.position.x = posX
			mesh.position.z = posZ
			this._rotateMesh(mesh, indexNum)
		}
	}

	_updateObjects = nextMove => {
		this._snake.unshift(nextMove)
		this._snakeHeadDirectionHistory.unshift(this._lastMoveDirection)

		const appleEaten = nextMove === this._apple

		if (appleEaten) {
			this._gameScore += 1
			this._updateApple()

			if (this._gameLoopDelayMs > 75) {
				this._gameLoopDelayMs -= 0.25
			}

			//if (this._gameScore > 5) {
			//	this._ground.material = this._borderMaterial
			//}

			let maxScore = this._maxGameScore
			let score = this._gameScore
			//let countGame = this._gameId
			var score_draw = document.getElementById('score')
			score_draw.innerHTML = score
			console.log(score)
			//var stat_draw = document.getElementById('stat')
			//stat_draw.innerHTML = 'Game Over: ' + countGame
			//if (score > maxScore) {
			//	maxScore = score
			//	localStorage.setItem(maxScore, score)
			//}

			var maxscore_draw = document.getElementById('maxscore')
			maxscore_draw.innerHTML = 'Speed: ' + this._gameLoopDelayMs

			// Don't add body for first apple
			// Add tail instead - implicit :(
			if (this._snake.length > 2) {
				const snakeBodyMesh = this._snakeBodyPrefab.createInstance(
					`game${this._gameId}_snakeBody_${this._snakeBodyMeshes.length}`
				)
				this._snakeBodyMeshes.push(snakeBodyMesh)
				this._shadow.getShadowMap().renderList.push(snakeBodyMesh)
			}
		} else {
			this._snake.pop()
			this._snakeHeadDirectionHistory.pop()
		}

		this._moveObjectsToGridPositions()

		//return maxScore
	}

	// Game lifecycle logic
	_gameLoopSleep = async () => {
		await BABYLON.Tools.DelayAsync(this._gameLoopDelayMs)
	}

	_gameLoopUpdate = () => {
		let nextMove = this._getNextMove()
		let isGameOver = this._checkGameOver(nextMove)
		if (isGameOver) {
			this._endGame()
		} else {
			this._updateObjects(nextMove)
		}
	}

	_runGameLoop = function* () {
		while (true) {
			yield this._gameLoopSleep()

			// Every 250ms update game objects
			yield this._gameLoopUpdate()
		}
	}

	_endGame = () => {
		this._scene.onBeforeRenderObservable.cancelAllCoroutines()
		this._scene.onKeyboardObservable.removeCallback(this._inputHandling)
		this._gameUI.addControl(this._restartBtn)
		this._gameUI.addControl(this._gameOverText)
		const snakeDieMaterial = new BABYLON.StandardMaterial('snakeDieMat')
		snakeDieMaterial.diffuseColor = new BABYLON.Color3(1, 1, 1)
		snakeDieMaterial.alpha = 0.5
		this._snakeHeadMesh.material = snakeDieMaterial
		this._snakeHeadMesh.scaling = new BABYLON.Vector3(1.5, 1.5, 1.5)
		this._snakeBodyPrefab.material = snakeDieMaterial
		this._snakeTailMesh.material = snakeDieMaterial
		console.log(`Game over your score is : ${this._gameScore}!`)
	}
}

const createScene = function () {
	game = new BabylonSnake()
	game.gameStart()

	return game.scene
}
window.initFunction = async function () {
	var asyncEngineCreation = async function () {
		try {
			return createDefaultEngine()
		} catch (e) {
			console.log(
				'the available createEngine function failed. Creating the default engine instead'
			)
			return createDefaultEngine()
		}
	}

	window.engine = await asyncEngineCreation()
	if (!engine) throw 'engine should not be null.'
	startRenderLoop(engine, canvas)
	window.scene = createScene()
}
initFunction().then(() => {
	sceneToRender = scene
})

// Resize
window.addEventListener('resize', function () {
	engine.resize()
})
