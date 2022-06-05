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

export function computed(strings, ...dependencies) {
  const value = new Value(undefined);

  function update() {
    // Build up a return string
    let result = "";

    // Loop through `strings`
    for (let i = 0; i < strings.length; i++) {
      result += strings[i];

      // Based on the tagged templates API, we'll
      // have `i` strings and `i-1` dependencies.
      if (i < strings.length - 1) {
        result += dependencies[i].get();
      }
    }

    value.set(result);
  }

  // Establish listeners on all the dependencies
  dependencies.forEach((dep) => {
    dep.addListener(update);
  });

  // Call update
  update();

  return value;
}

const title = new Value("");
const body = new Value("");
const article = computed`
  <article>
    <h1>${title}</h1>
    ${body}
  </article>
`;

article.addListener((data) => console.log("New article:", data));

title.set("My cool post");
// New article:
//     <article>
//       <h1>My cool post</h1>

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
