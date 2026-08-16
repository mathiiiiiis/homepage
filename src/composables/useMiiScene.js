import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import LUTShaderMaterial from '@/vendor/LUTShaderMaterial.js'

// ==== rig facts from exported glb ====
// NW4F rotates local bone aces. Build look delta in world space,
// then convert to parent space: q = P^-1 * D * P * R
// This avoids per-bone Euler remapping ;)

const HEAD_BONE = 'Head'
const SPINE_BONE = 'Spine_2'

const MAX_YAW = 0.62 // ~35deg
const MAX_PITCH = 0.43 // ~24deg
const SPINE_FOLLOW = 0.25
const DAMPING = 0.12
const SETTLE_EPSILON = 0.0004

// FFLModulateType per mash, picks specular/fresnel LUT curve
const MODULATE_TYPE = {
  Faceline: 0,
  Nose: 2,
  Hair: 4,
  Mask: 6,
  Noseline: 7,
  clothes_m_ArmsShortsleeve: 9,
  clothes_m_ShirtShortsleeve: 9,
  clothes_m_Shorts: 10,
}

const MODE_CONSTANT = 0
const MODE_TEXTURE_DIRECT = 1

const FOV = 20
const FRAME_MARGIN = 1.12

export function createMiiScene(canvas, { modeUrl, onReady, onError }) {
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
    powerPreference: 'low-power',
  })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(FOV, 1, 0.1, 40)

  //LUT shader writes sRGB and carries own lights
  renderer.outputColorSpace = THREE.LinearSRGBColorSpace

  let model = null
  let head = null
  let spine = null
  let headRest = null
  let spineRest = null
  let headParentWorld = null
  let headParentWorldInv = null

  //reused every frame to avoid allocations
  const tmpQuat = new THREE.Quaternion()
  const tmpEuler = new THREE.Euler(0, 0, 0, 'YXZ')
  const parentWorld = new THREE.Quaternion()

  let targetYaw = 0
  let targetPitch = 0
  let yaw = 0
  let pitch = 0

  let running = false
  let visible = true
  let frame = null
  let needsRender = true
  let disposed = false

  function setLookTarget(nx, ny) {
    targetYaw = (nx - 0.5) * 2 * MAX_YAW
    targetPitch = (ny - 0.5) * 2 * MAX_PITCH
    wake()
  }

  function applyPose() {
    if (!head) return

    if (spine && SPINE_FOLLOW > 0) {
      tmpEuler.set(0, yaw * SPINE_FOLLOW, 0)
      tmpQuat.setFromEuler(tmpEuler)
      spine.parent.getWorldQuaternion(parentWorld)
      spine.quaternion
        .copy(parentWorld)
        .invert()
        .multiply(tmpQuat)
        .multiply(parentWorld)
        .multiply(spineRest)
      //head hangs off spine, its parent world is now stale
      spine.updateMatrixWorld(true)
      head.parent.getWorldQuaternion(parentWorld)
      headParentWorldInv.copy(parentWorld).invert()
    } else {
      parentWorld.copy(headParentWorld)
    }

    tmpEuler.set(pitch, yaw * (1 - SPINE_FOLLOW), 0)
    tmpQuat.setFromEuler(tmpEuler)
    head.quaternion
      .copy(headParentWorldInv)
      .multiply(tmpQuat)
      .multiply(parentWorld)
      .multiply(headRest)
  }

  function tick() {
    frame = null
    if (disposed) return

    const dy = targetYaw - yaw
    const dp = targetPitch - pitch
    const moving = Math.abs(dy) > SETTLE_EPSILON || Math.abs(dp) > SETTLE_EPSILON

    if (moving) {
      yaw += dy * DAMPING
      pitch += dp * DAMPING
      applyPose()
      needsRender = true
    } else if (yaw !== targetYaw || pitch !== targetPitch) {
      yaw = targetYaw
      pitch = targetPitch
      applyPose()
      needsRender = true
    }

    if (needsRender) {
      renderer.render(scene, camera)
      needsRender = false
    }

    //park loop once settles instead of burning a frame on static image
    if (moving && running && visible) {
      frame = requestAnimationFrame(tick)
    } else {
      running = false
    }
  }

  function wake() {
    if (disposed || !visible || running) return
    running = true
    if (frame === null) frame = requestAnimationFrame(tick)
  }

  function setVisible(v) {
    visible = v
    if (v) wake()
  }

  function resize(width, height) {
    if (disposed || width === 0 || height === 0) return
    renderer.setSize(width, height, false)
    camera.aspect = width / height
    camera.updateProjectionMatrix()
    needsRender = true
    wake()
  }

  function prepare(gltf) {
    model = gltf.scene

    model.traverse((o) => {
      if (!o.isMesh) return
      o.frustumCulled = false

      const src = o.material
      const hasMap = Boolean(src.map)

      if (hasMap) {
        //shader samples raw sRGB, supress GPU decode
        src.map.colorSpace = THREE.NoColorSpace
        src.map.generateMipmaps = true
        src.map.minFilter = THREE.LinearMipmapLinearFilter
        src.map.anisotropy = renderer.capabilities.getMaxAnisotropy()
        src.map.needsUpdate = true
      }

      const m = new LUTShaderMaterial({
        modulateMode: hasMap ? MODE_TEXTURE_DIRECT : MODE_CONSTANT,
        modulateType: MODULATE_TYPE[o.name] ?? 0,
        //gltf baseColorFactor is linear, convert to sRGB
        color: src.color.clone().convertLinearToSRGB(),
        map: src.map,
        transparent: src.transparent,
        opacity: src.opacity,
        side: src.side,
      })
      m.name = src.name

      //prevent belded decals from writing depth over eyes
      if (m.transparent) {
        m.depthWrite = false
        o.renderOrder = o.name === 'Noseline' ? 2 : 1
      }

      o.material = m
      src.dispose()
    })

    head = model.getObjectByName(HEAD_BONE)
    spine = model.getObjectByName(SPINE_BONE)
    if (!head) throw new Error(`bone "${HEAD_BONE}" missing from model`)

    model.updateMatrixWorld(true)
    headRest = head.quaternion.clone()
    spineRest = spine ? spine.quaternion.clone() : null
    headParentWorld = new THREE.Quaternion()
    head.parent.getWorldQuaternion(headParentWorld)
    headParentWorldInv = headParentWorld.clone().invert()

    scene.add(model)
    frameModel()
    needsRender = true
  }

  function frameModel() {
    const box = new THREE.Box3().setFromObject(model)
    const size = new THREE.Vector3()
    const centre = new THREE.Vector3()
    box.getSize(size)
    box.getCenter(centre)

    const visibleHeight = size.y * FRAME_MARGIN
    const dist = visibleHeight / 2 / Math.tan((FOV / 2) * (Math.PI / 180))

    camera.position.set(centre.x, centre.y, centre.z + dist)
    camera.lookAt(centre)
    camera.far = dist + size.length() * 2
    camera.updateProjectionMatrix()
  }

  new GLTFLoader().load(
    modeUrl,
    (gltf) => {
      if (disposed) return
      try {
        prepare(gltf)
        onReady?.()
        wake()
      } catch (e) {
        onError?.(e)
      }
    },
    undefined,
    (e) => onError?.(e),
  )

  function dispose() {
    disposed = true
    running = false
    if (frame !== null) cancelAnimationFrame(frame)
    if (model) {
      model.traverse((o) => {
        if (!o.isMesh) return
        o.geometry.dispose()
        for (const m of Array.isArray(o.material) ? o.material : [o.material]) {
          for (const v of Object.values(m)) v?.isTexture && v.dispose()
          m.dispose()
        }
      })
      scene.remove(model)
    }
    renderer.dispose()
  }

  return { setLookTarget, setVisible, resize, dispose }
}
