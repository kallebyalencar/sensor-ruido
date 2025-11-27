import express from "express";
import pg from "pg";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

const db = new pg.Client({
    user: "postgres",
    host: "trolley.proxy.rlwy.net",
    database: "monitor-ruido",
    password: "edOpmuFxGkyYzQIALiFNlSbQRQRxupJR",
    port: 58396
});

db.connect()
    .then(() => console.log("Conectado ao PostgreSQL!"))
    .catch(err => console.error("Erro ao conectar no banco:", err));

// POST: Receber dados do sensor
app.post("/medidas", async (req, res) => {
    try {
        const { nome, local, ambiente, nivel_ruido } = req.body;
        if (!nome || !local || !ambiente || !nivel_ruido) {
            return res.status(400).json({ error: "Campos obrigatórios" });
        }
        await db.query(
            "INSERT INTO registros_ruido (nome, local, ambiente, nivel_ruido) VALUES ($1, $2, $3, $4)",
            [nome, local, ambiente, nivel_ruido]
        );
        res.json({ status: "ok", message: "Registro salvo com sucesso!" });
    } catch (err) {
        console.error("Erro ao salvar:", err);
        res.status(500).json({ error: "Erro ao salvar no banco" });
    }
});

// GET: Listar registros (com filtro opcional)
app.get("/medidas", async (req, res) => {
    try {
        const { ambiente } = req.query;
        let query = "SELECT * FROM registros_ruido";
        let params = [];
        if (ambiente) {
            query += " WHERE ambiente = $1";
            params.push(ambiente);
        }
        query += " ORDER BY id DESC LIMIT 50";
        const result = await db.query(query, params);
        res.json(result.rows);
    } catch (err) {
        console.error("Erro ao consultar:", err);
        res.status(500).json({ error: "Erro ao consultar banco" });
    }
});

// GET: Listar todos os ambientes existentes
app.get("/ambientes", async (req, res) => {
    try {
        const result = await db.query("SELECT DISTINCT ambiente FROM registros_ruido ORDER BY ambiente ASC");
        res.json(result.rows.map(r => r.ambiente));
    } catch (err) {
        console.error("Erro ao consultar ambientes:", err);
        res.status(500).json({ error: "Erro ao consultar ambientes" });
    }
});

// DELETE: Excluir registro
app.delete("/medidas/:id", async (req, res) => {
    try {
        const { id } = req.params;
        await db.query("DELETE FROM registros_ruido WHERE id = $1", [id]);
        res.json({ status: "ok", message: "Registro deletado com sucesso!" });
    } catch (err) {
        console.error("Erro ao deletar:", err);
        res.status(500).json({ error: "Erro ao deletar registro" });
    }
});

app.listen(3000, () => console.log("API rodando na porta 3000"));
