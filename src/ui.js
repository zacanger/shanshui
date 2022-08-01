export class UI {
  constructor (MEM, update) {
    this.update = update
    this.MEM = MEM
    this.lastScrollX = 0
    this.pFrame = 0
    this.btnHoverCol = 'rgba(0,0,0,0.1)'
  }

  xcroll (v) {
    this.MEM.cursx += v
    if (this.update.needupdate()) {
      this.update.update()
    } else {
      this.update.viewupdate()
    }
  }

  toggleVisible (id) {
    const v = document.getElementById(id).style.display === 'none'
    document.getElementById(id).style.display = v ? 'block' : 'none'
  }

  toggleText (id, a, b) {
    const v = document.getElementById(id).innerHTML
    document.getElementById(id).innerHTML = v === '' || v === b ? a : b
  }
}
