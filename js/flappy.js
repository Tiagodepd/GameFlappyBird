// Primeira função vai servir para criar um novo elemento.
function newElement(tagName, className) {
  const elem = document.createElement(tagName);
  elem.className = className;
  return elem;
}

// Função Construtora para criar uma 'barreira do jogo':
function Barrier(reverse = false) {
  this.element = newElement("div", "barrier");

  const border = newElement("div", "border");
  const body = newElement("div", "body");
  this.element.appendChild(reverse ? body : border);
  this.element.appendChild(reverse ? border : body);

  this.setStature = (stature) => (body.style.height = `${stature}px`);
}

// Teste:
/* const b = new Barrier(true);
b.setStature(200);
document.querySelector("[wm-flappy]").appendChild(b.element);
 */

function PairOfBarriers(stature, gap, x) {
  this.element = newElement("div", "pair-of-barriers");

  this.higher = new Barrier(true);
  this.under = new Barrier(false);

  this.element.appendChild(this.higher.element); // add in div 'pair-of-barriers' this "higher element".
  this.element.appendChild(this.under.element); // add 'under element'

  this.raffleGap = () => {
    const statureHigher = Math.random() * (stature - gap);
    const statureUnder = stature - gap - statureHigher;
    this.higher.setStature(statureHigher);
    this.under.setStature(statureUnder);
  };

  this.getX = () => parseInt(this.element.style.left.split("px")[0]);
  this.setX = (x) => (this.element.style.left = `${x}px`);
  this.getWidth = () => this.element.clientWidth;

  this.raffleGap();
  this.setX(x);
}

// Teste:
//const b = new PairOfBarriers(700, 200, 800); // (width, gap, position x)
//document.querySelector("[wm-flappy]").appendChild(b.element);

function Barriers(stature, width, gap, space, notifyPoint) {
  this.pairs = [
    new PairOfBarriers(stature, gap, width),
    new PairOfBarriers(stature, gap, width + space),
    new PairOfBarriers(stature, gap, width + space * 2),
    new PairOfBarriers(stature, gap, width + space * 3),
  ];

  const displacement = 3;
  this.liven = () => {
    this.pairs.forEach((pair) => {
      pair.setX(pair.getX() - displacement);

      // quando o elemento sair da área do jogo:
      if (pair.getX() < -pair.getWidth()) {
        pair.setX(pair.getX() + space * this.pairs.length);
        pair.raffleGap();
      }

      const middle = width / 2;
      const crossedMiddle =
        pair.getX() + displacement >= middle && pair.getX() < middle;
      if (crossedMiddle) notifyPoint();
    });
  };
}

function Bird(heightGame) {
  let flying = false;

  this.element = newElement("img", "bird");
  this.element.src = "imgs/bird.png";

  this.getY = () => parseInt(this.element.style.bottom.split("px")[0]);
  this.setY = (y) => (this.element.style.bottom = `${y}px`);

  window.onkeydown = (e) => (flying = true);
  window.onkeyup = (e) => (flying = false);

  this.liven = () => {
    const newY = this.getY() + (flying ? 8 : -5);
    const maximumHeight = heightGame - this.element.clientHeight;

    if (newY <= 0) {
      this.setY(0);
    } else if (newY >= maximumHeight) {
      this.setY(maximumHeight);
    } else {
      this.setY(newY);
    }
  };

  this.setY(heightGame / 2);
}

function Progress() {
  this.element = newElement("span", "progress");
  this.updatePoints = (points) => {
    this.element.innerHTML = points;
  };
  this.updatePoints(0);
}

// Teste:
/* const barriers = new Barriers(700, 1200, 200, 400);
const bird = new Bird(700);
const gameArea = document.querySelector("[wm-flappy]");
gameArea.appendChild(bird.element);
gameArea.appendChild(new Progress().element);
barriers.pairs.forEach((pair) => gameArea.appendChild(pair.element));
setInterval(() => {
  barriers.liven();
  bird.liven();
}, 20); */

function areOverlapping(elementA, elementB) {
  const a = elementA.getBoundingClientRect();
  const b = elementB.getBoundingClientRect();

  const horizontal = a.left + a.width >= b.left && b.left + b.width >= a.left;
  const vertical = a.top + a.height >= b.top && b.top + b.height >= a.top;
  return horizontal && vertical;
}

function collided(bird, barriers) {
  let collided = false;
  barriers.pairs.forEach((PairOfBarriers) => {
    if (!collided) {
      const higher = PairOfBarriers.higher.element;
      const under = PairOfBarriers.under.element;
      collided =
        areOverlapping(bird.element, higher) ||
        areOverlapping(bird.element, under);
    }
  });
  return collided;
}

function FlappyBird() {
  let points = 0;

  const gameArea = document.querySelector("[wm-flappy]");
  const stature = gameArea.clientHeight;
  const width = gameArea.clientWidth;

  const progress = new Progress();
  const barriers = new Barriers(stature, width, 200, 400, () =>
    progress.updatePoints(++points)
  );
  const bird = new Bird(stature);

  gameArea.appendChild(progress.element);
  gameArea.appendChild(bird.element);
  barriers.pairs.forEach((pair) => gameArea.appendChild(pair.element));

  this.start = () => {
    // Loop do jogo
    const timer = setInterval(() => {
      barriers.liven();
      bird.liven();

      if (collided(bird, barriers)) {
        clearInterval(timer);
      }
    }, 20);
  };
}

new FlappyBird().start();
