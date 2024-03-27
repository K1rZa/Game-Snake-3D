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

const createGrid = function (scene) {
	const ground = new BABYLON.MeshBuilder.CreateBox('ground', {
		width: 21,
		height: 1,
		depth: 21,
	})
	ground.position = new BABYLON.Vector3(10, 0, 10)
	const borderLeft = new BABYLON.MeshBuilder.CreateBox('borderleft', {
		width: 1,
		height: 2,
		depth: 21,
	})
	borderLeft.position = new BABYLON.Vector3(-1, 0.5, 10)
	const borderRight = new BABYLON.MeshBuilder.CreateBox('borderright', {
		width: 1,
		height: 2,
		depth: 21,
	})
	borderRight.position = new BABYLON.Vector3(21, 0.5, 10)
	const borderUp = new BABYLON.MeshBuilder.CreateBox('borderup', {
		width: 23,
		height: 2,
		depth: 1,
	})
	borderUp.position = new BABYLON.Vector3(10, 0.5, 21)

	const groundMaterial = new BABYLON.StandardMaterial('groundMat', scene)
	groundMaterial.diffuseColor = new BABYLON.Color3.FromHexString('#8f8f8f')
	const borderMaterial = new BABYLON.StandardMaterial('borderMat', scene)
	borderMaterial.diffuseColor = new BABYLON.Color3(0.3, 0.3, 0.3)

	borderLeft.material = borderMaterial
	borderRight.material = borderMaterial
	borderUp.material = borderMaterial
	ground.material = groundMaterial
	ground.receiveShadows = true

	return {
		borderLeft,
		borderRight,
		borderUp,
	}
}

var loaded = false

const createScene = async function () {
	const scene = new BABYLON.Scene(engine)
	scene.clearColor = new BABYLON.Color3.FromHexString('#38597d')

	const camera = new BABYLON.ArcRotateCamera(
		'Camera',
		0,
		0,
		10,
		new BABYLON.Vector3(10, 17, -3),
		scene
	)
	camera.wheelDeltaPercentage = 0.01
	camera.setTarget(new BABYLON.Vector3(10, 0.2, 10))
	camera.attachControl(canvas, true)

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

	await BABYLON.SceneLoader.ImportMeshAsync(
		'',
		'./Resources/',
		'snakeHeadV3.glb',
		scene
	)
	//function test(meshArray) {
	//	snakeHead = meshArray[1]
	//	snakeHead.scaling = new BABYLON.Vector3(0.4, 0.4, 0.4)
	//	snakeHead.position = new BABYLON.Vector3(-10, 0.3, 10)
	//	shadow.getShadowMap().renderList.push(snakeHead)
	//}
	//function () {
	//	scene.registerBeforeRender(() => {
	//			snakeHead = scene.getMeshByName('snakeHead')
	//			snakeHead.scaling = new BABYLON.Vector3(0.4, 0.4, 0.4)
	//			snakeHead.position = new BABYLON.Vector3(-10, 0.3, 10)
	//			shadow.getShadowMap().renderList.push(snakeHead)
	//	})
	//}
	//let snake = scene.getMeshByName('snakeHead')
	//snake.position.x = 10

	shadow.getShadowMap().renderList.push(createGrid().borderLeft)
	shadow.getShadowMap().renderList.push(createGrid().borderRight)
	shadow.getShadowMap().renderList.push(createGrid().borderUp)

	createGrid(scene)
	//createSnakeHead(scene)

	snakeHead = scene.getMeshByName('snakeHead')
	snakeHead.scaling = new BABYLON.Vector3(0.4, 0.4, 0.4)
	snakeHead.position = new BABYLON.Vector3(-10, 0.3, 10)
	shadow.getShadowMap().renderList.push(snakeHead)

	return scene
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
	window.scene = await createScene()
}
initFunction().then(() => {
	sceneToRender = scene
})

// Resize
window.addEventListener('resize', function () {
	engine.resize()
})
