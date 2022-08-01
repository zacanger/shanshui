export class Memory {
  constructor () {
    this.canv = ''
    this.chunks = []
    this.xmin = 0
    this.xmax = 0
    this.cwid = 512
    this.cursx = 0
    this.lasttick = new Date().getTime()
    this.windx = 3000
    this.windy = 800
    this.planmtx = []
  }
}
