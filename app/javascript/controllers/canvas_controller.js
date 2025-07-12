import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["canvas"]

  connect() {
    this.scale = 1.0
    this.offsetX = 0
    this.offsetY = 0
    this.isDragging = false
    this.startX = 0
    this.startY = 0

    this.updateTransform()

    this.canvasTarget.addEventListener("wheel", this.onWheel.bind(this), { passive: false })
    this.canvasTarget.addEventListener("pointerdown", this.onPointerDown.bind(this))
    window.addEventListener("pointerup", this.onPointerUp.bind(this))
    window.addEventListener("pointermove", this.onPointerMove.bind(this))
  }

  updateTransform() {
    this.canvasTarget.style.transform = `translate(${this.offsetX}px, ${this.offsetY}px) scale(${this.scale})`
  }

  onWheel(event) {
    event.preventDefault()
    const zoomSpeed = 0.001
    const delta = -event.deltaY * zoomSpeed
    const newScale = Math.min(Math.max(this.scale + delta, 0.2), 5.0)
    this.scale = newScale
    this.updateTransform()
  }

  onPointerDown(event) {
    if (event.button !== 0) return // only left click
    this.isDragging = true
    this.startX = event.clientX
    this.startY = event.clientY
  }

  onPointerUp() {
    this.isDragging = false
  }

  onPointerMove(event) {
    if (!this.isDragging) return
    const dx = event.clientX - this.startX
    const dy = event.clientY - this.startY
    this.offsetX += dx
    this.offsetY += dy
    this.startX = event.clientX
    this.startY = event.clientY
    this.updateTransform()
  }
}

