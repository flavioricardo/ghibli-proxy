const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));

module.exports = async (req, res) => {
  const allowedOrigins = ["https://flavioricardo.github.io"];
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }

  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).send("Método não permitido");
  }

  const replicateApiToken = process.env.REPLICATE_API_TOKEN;

  const replicateRes = await fetch("https://api.replicate.com/v1/predictions", {
    method: "POST",
    headers: {
      Authorization: `Token ${replicateApiToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(req.body),
  });

  const data = await replicateRes.json();
  res.status(200).json(data);
};
