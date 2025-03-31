const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));

module.exports = async (req, res) => {
  const allowedOrigins = ["https://flavioricardo.github.io"];
  const origin = req.headers.origin;

  // Configuração de CORS
  if (allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  } else {
    res.setHeader("Access-Control-Allow-Origin", "*");
  }

  res.setHeader("Access-Control-Allow-Credentials", true);
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET,OPTIONS,PATCH,DELETE,POST,PUT"
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version"
  );

  // Resposta para requisições OPTIONS
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // Verificação do método HTTP
  if (req.method !== "POST") {
    return res.status(405).send("Método não permitido");
  }

  // Token da API Replicate
  const replicateApiToken = process.env.REPLICATE_API_TOKEN;
  if (!replicateApiToken) {
    return res.status(500).send("Token da API Replicate não configurado");
  }

  try {
    // Requisição para a API da Replicate
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

    // Verifica se a resposta da API contém erro
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
