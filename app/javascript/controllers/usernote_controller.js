import { Controller } from "@hotwire"

export default class extends Controller {
  static values = { x: Number, y: Number, id: Number }

  connect() {
    this.element.addEventListener("dragend", this.dragend.bind(this))
  }

  dragend(event) {
    const deltaX = event.clientX - event.target.offsetWidth / 2
    const deltaY = event.clientY - event.target.offsetHeight / 2

    this.element.style.left = `${deltaX}px`
    this.element.style.top = `${deltaY}px`

    fetch(`/notes/${this.idValue}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "Accept": "text/vnd.turbo-stream.html",
        "X-CSRF-Token": document.querySelector("meta[name=csrf-token]").content
      },
      body: JSON.stringify({ note: { x: deltaX, y: deltaY } })
    })
  }
}
