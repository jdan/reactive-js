export class Value {
  constructor(initial) {
    this.state = initial;

    // Maintain a list of subscribers
    this.subscribers = [];
  }

  get() {
    return this.state;
  }

  addListener(fn) {
    this.subscribers.push(fn);
  }

  set(newValue) {
    this.state = newValue;

    // Let our subscribers know
    this.subscribers.forEach((fn) => fn(newValue));
  }
}

export class ComputedValue extends Value {
  constructor(fn, dependencies) {
    super();

    // A function to update our value
    const update = () => this.set(fn());

    // Listen to each of the dependencies
    dependencies.forEach((dep) => {
      dep.addListener(update);
    });
  }
}

const title = new Value("");
const body = new Value("");
const article = new ComputedValue(() => {
  return `
    <article>
      <h1>${title.get()}</h1>
      ${body.get()}
    </article>
  `;
}, [title, body]); // explicit!

// Listen to changes to our ComputedValue
article.addListener((data) => console.log("New article:", data));

title.set("My cool post");
// New article:
//     <article>
//       <h1>My cool post</h1>
//
//     </article>

body.set("Just some cool stuff");
// New article:
//     <article>
//       <h1>My cool post</h1>
//       Just some cool stuff
//     </article>

body.set("Wait...");
// New article:
//     <article>
//       <h1>My cool post</h1>
//       Wait...
//     </article>
