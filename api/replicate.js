const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));

module.exports = async (req, res) => {
  const origin = req.headers.origin || "*";

  res.setHeader("Access-Control-Allow-Origin", origin);
  res.setHeader("Vary", "Origin");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET,OPTIONS,PATCH,DELETE,POST,PUT"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Access-Control-Allow-Credentials", "true");

  // Trata requisição OPTIONS (preflight)
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).send("Método não permitido");
  }

  const replicateApiToken = process.env.REPLICATE_API_TOKEN;
  if (!replicateApiToken) {
    return res.status(500).send("Token da API Replicate não configurado");
  }

  try {
    const replicateRes = await fetch(
      "https://api.replicate.com/v1/predictions",
      {
        method: "POST",
        headers: {
          Authorization: `Token ${replicateApiToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(req.body),
      }
    );

    const data = await replicateRes.json();

    if (!replicateRes.ok) {
      return res.status(replicateRes.status).json({
        error: data.error || "Erro ao processar a requisição na API Replicate",
      });
    }

    res.status(200).json(data);
  } catch (error) {
    console.error("Erro ao se comunicar com a API Replicate:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
};
