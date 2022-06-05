export class Value {
  constructor(initial) {
    this.state = initial;

    // Maintain a list of subscribers
    this.subscribers = [];
  }

  get() {
    if (
      ComputedValue.GlobalListener &&
      !this.subscribers.find((sub) => sub === ComputedValue.GlobalListener)
    ) {
      this.subscribers.push(ComputedValue.GlobalListener);
    }

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
  constructor(fn) {
    super();

    // Store fn, we'll need it later
    this.fn = fn;

    // Maintain a stable version of `sync`
    // like it's 2014
    this.sync = this.sync.bind(this);

    // Track our dependencies and update
    this.sync();
  }

  sync() {
    // Set up a listener to re-sync
    ComputedValue.GlobalListener = this.sync;

    // Set our value to what `fn` returns
    this.set(this.fn());

    // Clear the listener
    ComputedValue.GlobalListener = undefined;
  }
}

const enabled = new Value(false);
const clicks = new Value(0);

const latch = new ComputedValue(() => {
  if (enabled.get()) {
    return clicks.get();
  } else {
    return "Not enabled";
  }
});

latch.addListener((data) => console.log(`Clicks: ${data}`));

enabled.set(true);
// Clicks: 0

clicks.set(1);
// Clicks: 1

clicks.set(2);
// Clicks: 2

clicks.set(1000);
// Clicks: 1000
