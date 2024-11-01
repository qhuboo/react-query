function hashKey(queryKey) {
  return JSON.stringify(queryKey);
}

class QueryClient {
  constructor() {
    this.cache = new Map();
    this.listeners = new Set();
  }

  subscribe(listener) {
    this.listeners.add(listener); // The listener here is a callback function
    return () => this.listeners.delete(listener);
  }

  get(queryKey) {
    const hash = hashKey(queryKey);

    if (!this.cache.has(hash)) {
      this.set(queryKey, {
        status: "pending",
      });
    }

    return this.cache.get(hash);
  }

  set(queryKey, data) {
    const hash = hashKey(queryKey);
    this.cache.set(hash, { ...this.cache.get(hash), ...data });
    this.listeners.forEach((listener) => listener(queryKey)); // Calls the callback for each listerner with the queryKey
  }

  async obtain({ queryKey, queryFn }) {
    try {
      const data = await queryFn(queryKey);
      this.set(queryKey, { status: "success", data });
    } catch (error) {
      this.set(queryKey, { status: error, error });
    }
  }
}

function createObserver(queryClient, options) {
  return {
    subscribe(notify) {
      const unsubscribe = queryClient.subscribe((queryKey) => {
        if (hashKey(options.queryKey) === hashKey(queryKey)) {
          notify();
        }
      });

      queryClient.obtain(options);

      return unsubscribe;
    },

    getSnapshot() {
      return queryClient.get(options.queryKey);
    },
  };
}

const queryClient = new QueryClient();

await queryClient.obtain({
  queryKey: "something",
  queryFn: async () => {
    const response = await fetch("https://api.matemine.shop/games");
    const data = await response.json();
    return data;
  },
});

console.log(queryClient.get(["something"]));
