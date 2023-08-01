export default [
  {
    url: "/api/nr-documents",
    method: "get",
    rawResponse: async (req, res) => {
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify(await import("./res1.json")));
    },
  },
];
