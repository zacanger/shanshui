export class UI {
  constructor (MEM, update) {
    this.update = update
    this.MEM = MEM
    this.lastScrollX = 0
    this.pFrame = 0
    this.btnHoverCol = 'rgba(0,0,0,0.1)'
  }
}
