export class CircularBuffer<T> {
  private buffer: (T | null)[];
  private index: number;
  private readonly overlapSize: number;

  constructor(
    private readonly size: number,
    overlap: number,
  ) {
    if (overlap >= size) {
      throw new Error("Overlap size must be smaller than the buffer size.");
    }
    this.buffer = new Array(size).fill(null);
    this.index = 0;
    this.overlapSize = overlap;
  }

  add(data: T): void {
    if (this.index >= this.size) {
      // Shift last `overlapSize` elements to the beginning
      for (let i = 0; i < this.overlapSize; i++) {
        this.buffer[i] = this.buffer[this.size - this.overlapSize + i];
      }
      this.index = this.overlapSize; // Continue filling after overlap
    }
    this.buffer[this.index] = data;
    this.index++;
  }

  getBuffer() {
    return this.buffer;
  }
}
