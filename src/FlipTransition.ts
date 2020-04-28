export default class FlipTransition {
  private elements: Array<HTMLElement> = [];
  private firsts: Array<DOMRect> = [];

  constructor(elements: HTMLElement | Array<HTMLElement>) {
    if (elements instanceof HTMLElement) {
      this.elements = [elements];
    } else {
      this.elements = elements;
    }
  }

  first() {
    this.firsts = this.elements.map((el) => el.getBoundingClientRect());
  }

  play(duration: string = '1s', ease: string = 'linear'): Promise<void> {
    resetTransition(this.elements);
    if (!this.elements || this.elements.length === 0) {
      console.error("Can't play this transition because it has no elements!");
    }
    const lasts: Array<DOMRect> = this.elements.map((el) => el.getBoundingClientRect());
    const deltas = getDeltas(this.firsts, lasts);
    const transforms: Array<TransferStyle> = deltas.map(
      (delta) =>
        ({
          transform: `translateX(${delta.x}px) translateY(${delta.y}px) scaleX(${delta.w}) scaleY(${delta.h})`, // normal translate and scale do not work in inline style
          transformOrigin: 'top left',
          transition: null,
        } as TransferStyle)
    );
    applyStyles(this.elements, transforms);
    // use a promise to allow chaining logic after transition is done
    return new Promise((resolve) => {
      // wait for two animation frames for firefox
      afterTwoAnimationFrames(() => {
        applyStyleOnAll(this.elements, {
          transition: `transform ${duration} ${ease}, border-radius ${duration} ${ease}`,
          transform: 'none',
          transformOrigin: null,
        });
        for (const element of this.elements) {
          element.addEventListener('transitionend', () => {
            element.style.transition = '';
            resolve();
          });
        }
      });
    });
  }
}

function resetTransition(elements: Array<HTMLElement>) {
  for (const element of elements) {
    element.style.transition = '';
  }
}

interface TransferStyle {
  transform: string | null;
  transformOrigin: string | null;
  transition: string | null;
}

interface Delta {
  x: number;
  y: number;
  w: number;
  h: number;
}

function getDeltas(firsts: Array<DOMRectReadOnly>, lasts: Array<DOMRectReadOnly>): Array<Delta> {
  let i = 0;
  return firsts.map((first) => {
    const last = lasts[i];
    i++;
    return first.x
      ? {
          x: first.x - last.x,
          y: first.y - last.y,
          w: first.width / last.width,
          h: first.height / last.height,
        }
      : {
          // Edge does not provide x and y
          x: first.left - last.left,
          y: first.top - last.top,
          w: first.width / last.width,
          h: first.height / last.height,
        };
  });
}

function applyStyles(elements: Array<HTMLElement>, transforms: Array<TransferStyle>) {
  for (let i = 0; i < elements.length; i++) {
    applyStyle(elements[i], transforms[i]);
  }
}

function applyStyle(element: HTMLElement, newStyle: TransferStyle) {
  const style = element.style as any;
  for (const a in newStyle) {
    const newVal = newStyle[a as keyof TransferStyle];
    if (newVal !== null) style[a] = newVal;
  }
}

function applyStyleOnAll(elements: Array<HTMLElement>, newStyle: TransferStyle) {
  for (let i = 0; i < elements.length; i++) {
    applyStyle(elements[i], newStyle);
  }
}

function afterTwoAnimationFrames(callback: Function): void {
  window.requestAnimationFrame(() => {
    window.requestAnimationFrame(() => {
      callback();
    });
  });
}
