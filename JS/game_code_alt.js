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

const createMaterial = scene => {
	const groundMaterial = new BABYLON.StandardMaterial('groundMat')
	groundMaterial.diffuseColor = new BABYLON.Color3.FromHexString('#8f8f8f')

	const borderMaterial = new BABYLON.StandardMaterial('borderMat')
	borderMaterial.diffuseColor = new BABYLON.Color3(0.3, 0.3, 0.3)

	const snakeHeadMaterial = new BABYLON.StandardMaterial('snakeHMat')
	snakeHeadMaterial.diffuseColor = new BABYLON.Color3.FromHexString('#06819c')
	const snakeCellMaterial = new BABYLON.StandardMaterial('snakeCMat')
	snakeCellMaterial.diffuseColor = new BABYLON.Color3.FromHexString('#09b1d6')
	const snakeEndMaterial = new BABYLON.StandardMaterial('snakeEMat')
	snakeEndMaterial.diffuseColor = new BABYLON.Color3.FromHexString('#06819c')

	const foodMaterial = new BABYLON.StandardMaterial('foodMat')
	foodMaterial.diffuseColor = new BABYLON.Color3.FromHexString('#ff0000')

	return {
		groundMaterial,
		borderMaterial,
		snakeHeadMaterial,
		snakeCellMaterial,
		snakeEndMaterial,
		foodMaterial,
	}
}

const createLevel = scene => {
	const groundMesh = BABYLON.MeshBuilder.CreateBox('groundMesh', {
		width: 21,
		height: 1,
		depth: 21,
	})

	const borderLeftMesh = BABYLON.MeshBuilder.CreateBox('bLeftMesh', {
		width: 1,
		height: 2,
		depth: 21,
	})
	const borderRightMesh = BABYLON.MeshBuilder.CreateBox('bRightMesh', {
		width: 1,
		height: 2,
		depth: 21,
	})
	const borderUpMesh = BABYLON.MeshBuilder.CreateBox('bUpMesh', {
		width: 23,
		height: 2,
		depth: 1,
	})

	groundMesh.position = new BABYLON.Vector3(0, 0, 0)
	borderLeftMesh.position = new BABYLON.Vector3(11, 0.5, 0)
	borderRightMesh.position = new BABYLON.Vector3(-11, 0.5, 0)
	borderUpMesh.position = new BABYLON.Vector3(0, 0.5, 11)

	groundMesh.material = createMaterial(scene).groundMaterial

	borderLeftMesh.material = createMaterial(scene).borderMaterial
	borderRightMesh.material = createMaterial(scene).borderMaterial
	borderUpMesh.material = createMaterial(scene).borderMaterial
}

const createFood = scene => {
	const foodMesh = BABYLON.MeshBuilder.CreateSphere('foodMesh', {
		diameter: 1.2,
		segments: 32,
	})
	foodMesh.material = createMaterial(scene).foodMaterial
	foodMesh.position.y = 1
}

const createSnake = scene => {
	createSnakeHead = () => {
		const snakeHeadMesh = BABYLON.MeshBuilder.CreateBox('snakeHMesh', {
			width: 1,
			height: 1,
			depth: 1,
		})
		snakeHeadMesh.material = createMaterial(scene).snakeHeadMaterial
		snakeHeadMesh.position.y = 1
	}

	createSnakeCell = () => {
		const snakeCellMesh = BABYLON.MeshBuilder.CreateBox('snakeCMesh', {
			width: 0.9,
			height: 0.8,
			depth: 0.6,
		})
		snakeCellMesh.material = createMaterial(scene).snakeCellMaterial
		snakeCellMesh.position.y = 1
	}

	createSnakeEnd = () => {
		const snakeEndMesh = BABYLON.MeshBuilder.CreateBox('snakeEMesh', {
			width: 0.7,
			height: 0.6,
			depth: 0.6,
		})
		snakeEndMesh.material = createMaterial(scene).snakeEndMaterial
		snakeEndMesh.position.y = 1
	}

	createSnakeHead()
	createSnakeCell()
	createSnakeEnd()
}

const createViewScene = () => {
	const scene = new BABYLON.Scene(engine)
	scene.clearColor = new BABYLON.Color3.FromHexString('#38597d')

	const camera = new BABYLON.ArcRotateCamera(
		'Camera',
		0,
		0,
		10,
		new BABYLON.Vector3(0, 17, -25),
		scene
	)
	camera.wheelDeltaPercentage = 0.01
	camera.setTarget(new BABYLON.Vector3(0, 0.2, 0))

	const globallight = new BABYLON.HemisphericLight(
		'light',
		new BABYLON.Vector3(0, 0.5, -0.3)
	)
	globallight.intensity = 0.8

	const dirlight = new BABYLON.DirectionalLight(
		'dirlight',
		new BABYLON.Vector3(-6.25, -12.5, 7.8)
	)
	dirlight.intensity = 0.4

	const shadow = new BABYLON.ShadowGenerator(1024, dirlight)
	shadow.usePoissonSampling = true

	createLevel(scene)
	//createFood(scene)
	createSnake(scene)

	return scene
}

const DirKey = Object.freeze({
	Up: 'w',
	Left: 'a',
	Down: 's',
	Right: 'd',
})

class Snake {
	get scene() {
		return this._scene
	}

    gameStart = () => {
        this.gameScore = 0

        this.snakePos = [0]
        this.updateFood()

        for (let mesh of this.snakeBodyArray){
            mesh.dispose()
            mesh = null
        }
        this.snakeBodyArray = []
        this.snakeEndMesh.isVisible = false

        this.snakeHeadDir = DirKey.Right
        this.lastMoveDir = this.snakeHeadDir
        this.snakeHeadDirHistory = []
    }

    constructor() {
        this.gameSpeed = 100
        this.gameScore = 0

        this.levelHeight = 21
        this.levelWidth = 21
        this.levelSize = this.levelHeight * this.levelWidth

        this.foodSpawn = 0

        this.lastMoveDir = this.snakeHeadDir
        this.snakeHeadDirHistory = []

        this._scene = createViewScene()

        this._snakeHeadMesh = this._scene.getMeshByName('snakeHMesh')
        this._snakeCellPrefab = this._scene.getMeshByName('snakeCMesh')
        this._snakeCellPrefab.isVisible = false
        this._snakeEndMesh = this._scene.getMeshByName('snakeEMesh')
        this._snakeEndMesh.isVisible = false
        this.snakeBodyArray = []

        this._foodMesh = this._scene.getMeshByName('foodMesh')
    }

    inputControl = keyInfo => {
        if (keyInfo.type == BABYLON.KeyboardEventTypes.KEYDOWN){
            switch (keyInfo.event.key){
                case DirKey.Left:
                    if (this.snakePos.length === 1 || this.lastMoveDir !== DirKey.Right){
                        this._snakeHeadMesh.rotation.y = Math.PI
                        this.snakeHeadDir = DirKey.Left
                    }
                    break
                case DirKey.Right:
                    if (this.snakePos.length === 1 || this.lastMoveDir !== DirKey.Left){
                        this._snakeHeadMesh.rotation.y = 0
                        this.snakeHeadDir = DirKey.Right
                    }
                    break
                case DirKey.Up:
                    if (this.snakePos.length === 1 || this.lastMoveDir !== DirKey.Down){
                        this._snakeHeadMesh.rotation.y = (3 * Math.PI) / 2
                        this.snakeHeadDir = DirKey.Up
                    }
                    break
                case DirKey.Down:
                    if (this.snakePos.length === 1 || this.lastMoveDir !== DirKey.Up){
                        this._snakeHeadMesh.rotation.y = Math.PI / 2
                        this.snakeHeadDir = DirKey.Down
                    }
                    break
                default:
                    break
            }
        }
    }

	setupInputControl = () => {
		this._scene.onKeyboardObservable.add(this.inputControl)
	}

	gameOver = newMove => {
		const snakeHead = this.snakePos[0]
		const snakeHeadDir = this.snakeHeadDir
		const gridSize = this.gridSize
		const gridWidth = this.gridWidth

		const verticalOver = newMove < 0 || newMove >= gridSize
		const leftOver = snakeHead % gridWidth == 0 && snakeHeadDir == DirKey.Left
		const rightOver = snakeHead % gridWidth == gridWidth - 1 && snakeHeadDir == DirKey.Right
		const onItSelf = this.snakePos.indexOf(newMove) != -1 && this.snakePos.indexOf(newMove) != this.snakePos.length - 1

		return (verticalOver || leftOver || rightOver || onItSelf)
	}

	createNewMove = () => {
		const snakeHeadPos = this.snakePos[0]
		const snakeHeadDir = this.snakeHeadDir
		const gridWidth = this.gridWidth

		let newMove = 0
		switch (snakeHeadDir) {
			case DirKey.Up:
				newMove = snakeHeadPos - gridWidth
				this.lastMoveDir = DirKey.Up
				break
			case DirKey.Down:
				newMove = snakeHeadPos + gridWidth
				this.lastMoveDir = DirKey.Down
				break
			case DirKey.Left:
				newMove = snakeHeadPos - 1
				this.lastMoveDir = DirKey.Up
				break
			case DirKey.Right:
				newMove = snakeHeadPos + 1
				this.lastMoveDir = DirKey.Up
				break
			default:
				break
		}
		return newMove
	}

	updateFood = () => {
		let foodSpawnPos = Array.from({length: this.gridSize}, (_, i) => i)

		foodSpawnPos = foodSpawnPos.filter(value => !this.snakePos.includes(value))

		const randomIndex = (Math.random() * foodSpawnPos.length) << 0
		this.foodSpawn = foodSpawnPos[randomIndex]
	}

	rotateMesh = (mesh, index) => {
		if (index != 0){
			const meshDir = this.snakeHeadDirHistory[index - 1]
			switch (meshDir) {
				case DirKey.Left:
					mesh.rotation.y = Math.PI
					break
				case DirKey.Right:
					mesh.rotation.y = 0
					break
				case DirKey.Up:
					mesh.rotation.y = (3 * Math.PI) / 2
					break
				case DirKey.Left:
					mesh.rotation.y = Math.PI / 2
					break
				default: 
					break
			}
		}
	}
}

const createScene = function () {
	game = new Snake()
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
	window.scene = createViewScene()
}
initFunction().then(() => {
	sceneToRender = scene
})

// Resize
window.addEventListener('resize', function () {
	engine.resize()
})
