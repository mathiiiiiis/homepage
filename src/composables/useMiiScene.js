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
const RESPONSE = 8 // head catchup rate (1/s)
const SPINE_RESPONSE = 3 // torso lags behind head
const LOOK_DEPTH = 2.6 // how far in front cursor plane sits
const MAX_DT = 0.1
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

const BLINK_MIN_MS = 2500
const BLINK_MAX_MS = 6500
const BLINK_FRAMES = [['blink', 165]]
const REACTION_MS = 700

const IDLE_AFTER_MS = 5000
const IDLE_EVERY_MS = 3500
const IDLE_YAW = 0.3
const IDLE_PITCH = 0.16

//tracking hands head over to pose, then takes it back
const TRACK_FADE_OUT = 12 // 1/s
const TRACK_FADE_IN = 5
const POSE_RESPONSE = 9
const POSE_HOLD_MS = 900
const POSE_BONES_TRACKED = ['Head', 'Spine_2']

const FOV = 20
const FRAME_MARGIN = 1.12

const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v))

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
  let spineYaw = 0
  let lastTime = 0

  let poses = null
  let poseBones = null
  let poseRest = null
  let activePose = null
  let poseBlend = 0
  let poseTarget = 0
  let trackWeight = 1
  let trackTarget = 1
  let poseTimer = null

  const poseQuat = new THREE.Quaternion()
  const trackQuat = new THREE.Quaternion()

  const headWorld = new THREE.Vector3()
  const lookNdc = new THREE.Vector2()
  const lookPoint = new THREE.Vector3()
  const lookDir = new THREE.Vector3()
  const lookPlane = new THREE.Plane()
  const raycaster = new THREE.Raycaster()

  let maskMaterial = null
  let neutralMap = null
  const faces = {}
  let blinkTimer = null
  let idleTimer = null
  let reactionTimer = null
  //let reactionFlip = false

  let running = false
  let visible = true
  let frame = null
  let needsRender = true
  let disposed = false

  // ndc is relative to canvas and may fall outside -1..1 when
  // cursor is off element
  function setLookTarget(ndcX, ndcY) {
    if (!head) return

    raycaster.setFromCamera(lookNdc.set(ndcX, ndcY), camera)
    lookPlane.setFromNormalAndCoplanarPoint(
      camera.getWorldDirection(lookDir).negate(),
      lookPoint.copy(headWorld).addScaledVector(lookDir, LOOK_DEPTH),
    )
    if (!raycaster.ray.intersectPlane(lookPlane, lookPoint)) return

    lookDir.subVectors(lookPoint, headWorld).normalize()
    targetYaw = clamp(Math.atan2(lookDir.x, lookDir.z), -MAX_YAW, MAX_YAW)
    targetPitch = clamp(-Math.asin(clamp(lookDir.y, -1, 1)), -MAX_PITCH, MAX_PITCH)
    bumpIdle()
    wake()
  }

  function setExpression(name) {
    if (!maskMaterial) return
    const next = name === 'neutral' ? neutralMap : faces[name]
    if (!next || maskMaterial.map === next) return
    maskMaterial.map = next
    needsRender = true
    wake()
  }

  //TextureLoader defaults differ from glb, mirror sampler setup
  function loadFaces(urls) {
    if (!neutralMap) return
    const ref = neutralMap
    const loader = new THREE.TextureLoader()
    for (const [name, url] of Object.entries(urls)) {
      loader.load(url, (t) => {
        if (disposed) {
          t.dispose()
          return
        }
        t.flipY = ref.flipY
        t.colorSpace = ref.colorSpace
        t.wrapS = ref.wrapS
        t.wrapT = ref.wrapT
        t.minFilter = ref.minFilter
        t.magFilter = ref.magFilter
        t.generateMipmaps = ref.generateMipmaps
        t.anisotropy = ref.anisotropy
        t.needsUpdate = true
        faces[name] = t
        if (name === 'blink') scheduleBlink()
      })
    }
  }

  function scheduleBlink() {
    clearTimeout(blinkTimer)
    if (!visible || reactionTimer || !faces.blink) return
    blinkTimer = setTimeout(runBlink, BLINK_MIN_MS + Math.random() * (BLINK_MAX_MS - BLINK_MIN_MS))
  }

  function runBlink() {
    let i = 0
    const step = () => {
      if (i >= BLINK_FRAMES.length) {
        setExpression('neutral')
        scheduleBlink()
        return
      }
      const [name, ms] = BLINK_FRAMES[i++]
      setExpression(name)
      blinkTimer = setTimeout(step, ms)
    }
    step()
  }

  function react() {
    //reactionFlip = !reactionFlip
    clearTimeout(blinkTimer)
    clearTimeout(reactionTimer)
    //setExpression(reactionFlip ? 'happy' : 'click')
    setExpression('click')
    reactionTimer = setTimeout(() => {
      reactionTimer = null
      setExpression('neutral')
      scheduleBlink()
    }, REACTION_MS)
  }

  function bumpIdle() {
    clearTimeout(idleTimer)
    if (!visible) return
    idleTimer = setTimeout(idleGlance, IDLE_AFTER_MS)
  }

  //glance somewhere nearby instead of freezing dead centre
  function idleGlance() {
    targetYaw = (Math.random() * 2 - 1) * IDLE_YAW
    targetPitch = (Math.random() * 2 - 1) * IDLE_PITCH
    wake()
    idleTimer = setTimeout(idleGlance, IDLE_EVERY_MS + Math.random() * 2000)
  }

  //poses == local rotations on same rig
  function loadPoses(data) {
    if (!model) return
    poses = data
    poseBones = {}
    poseRest = {}
    for (const name of Object.keys(Object.values(data)[0].rotation)) {
      const bone = model.getObjectByName(name)
      if (!bone) continue
      poseBones[name] = bone
      poseRest[name] = bone.quaternion.clone()
    }
  }

  function playPose(name) {
    if (!poses || !poses[name]) return
    clearTimeout(poseTimer)
    activePose = poses[name].rotation
    poseTarget = 1
    trackTarget = 0
    poseTimer = setTimeout(() => {
      poseTimer = null
      poseTarget = 0
      trackTarget = 1
    }, POSE_HOLD_MS)
    wake()
  }

  function applyPose() {
    if (!head) return

    if (spine && SPINE_FOLLOW > 0) {
      tmpEuler.set(0, spineYaw, 0)
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

    tmpEuler.set(pitch, yaw - spineYaw, 0)
    tmpQuat.setFromEuler(tmpEuler)
    head.quaternion
      .copy(headParentWorldInv)
      .multiply(tmpQuat)
      .multiply(parentWorld)
      .multiply(headRest)

    if (poseBlend <= 0.0005 || !activePose) return

    //bones tracking does not touch just belnd from their rest
    for (const name in poseBones) {
      if (POSE_BONES_TRACKED.includes(name)) continue
      const q = activePose[name]
      if (!q) continue
      poseQuat.set(q[0], q[1], q[2], q[3])
      poseBones[name].quaternion.copy(poseRest[name]).slerp(poseQuat, poseBlend)
    }

    //contested bones hand over as trackWeight falls
    const handover = 1 - trackWeight
    for (const name of POSE_BONES_TRACKED) {
      const bone = poseBones[name]
      const q = activePose[name]
      if (!bone || !q) continue
      poseQuat.set(q[0], q[1], q[2], q[3])
      trackQuat.copy(bone.quaternion)
      bone.quaternion.copy(trackQuat).slerp(poseQuat, handover)
    }
  }

  function tick(now) {
    frame = null
    if (disposed) return

    const dt = Math.min((now - lastTime) / 1000, MAX_DT)
    lastTime = now

    const targetSpine = targetYaw * SPINE_FOLLOW
    const dy = targetYaw - yaw
    const dp = targetPitch - pitch
    const ds = targetSpine - spineYaw
    const db = poseTarget - poseBlend
    const dw = trackTarget - trackWeight
    const moving =
      Math.abs(dy) > SETTLE_EPSILON ||
      Math.abs(dp) > SETTLE_EPSILON ||
      Math.abs(ds) > SETTLE_EPSILON ||
      Math.abs(db) > SETTLE_EPSILON ||
      Math.abs(dw) > SETTLE_EPSILON

    if (moving) {
      const a = 1 - Math.exp(-RESPONSE * dt)
      const sa = 1 - Math.exp(-SPINE_RESPONSE * dt)
      const pa = 1 - Math.exp(-POSE_RESPONSE * dt)
      //attention is given up quickly and taken back slowly
      const ta = 1 - Math.exp(-(trackTarget < trackWeight ? TRACK_FADE_OUT : TRACK_FADE_IN) * dt)
      yaw += dy * a
      pitch += dp * a
      spineYaw += ds * sa
      poseBlend += db * pa
      trackWeight += dw * ta
      applyPose()
      needsRender = true
    } else if (
      yaw !== targetYaw ||
      pitch !== targetPitch ||
      spineYaw !== targetSpine ||
      poseBlend !== poseTarget ||
      trackWeight !== trackTarget
    ) {
      yaw = targetYaw
      pitch = targetPitch
      spineYaw = targetSpine
      poseBlend = poseTarget
      trackWeight = trackTarget
      if (poseBlend === 0) activePose = null
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
    lastTime = performance.now()
    if (frame === null) frame = requestAnimationFrame(tick)
  }

  function setVisible(v) {
    visible = v
    if (v) {
      wake()
      scheduleBlink()
      bumpIdle()
    } else {
      clearTimeout(blinkTimer)
      clearTimeout(idleTimer)
      setExpression('neutral')
    }
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

      if (o.name === 'Mask') {
        maskMaterial = m
        neutralMap = src.map
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
    head.getWorldPosition(headWorld)

    scene.add(model)
    frameModel()
    bumpIdle()
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
    clearTimeout(blinkTimer)
    clearTimeout(idleTimer)
    clearTimeout(reactionTimer)
    clearTimeout(poseTimer)
    for (const t of Object.values(faces)) t.dispose()
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

  return {
    setLookTarget,
    setExpression,
    loadFaces,
    react,
    loadPoses,
    playPose,
    setVisible,
    resize,
    dispose,
  }
}
