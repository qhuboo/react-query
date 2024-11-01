function hashKey(queryKey) {
  return JSON.stringify(queryKey);
}

class QueryClient {
  constructor() {
    this.cache = new Map();
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
    this.cache.set(hash, data);
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
