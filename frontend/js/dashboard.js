async function carregarAmbientes() {
    try {
        const resposta = await fetch("http://localhost:3000/ambientes");
        const ambientes = await resposta.json();
        const select = document.getElementById("filtroAmbiente");
        ambientes.forEach(a => {
            const option = document.createElement("option");
            option.value = a;
            option.textContent = a;
            select.appendChild(option);
        });
    } catch (erro) {
        console.error("Erro ao carregar ambientes:", erro);
    }
}

async function carregarDados() {
    try {
        const filtro = document.getElementById("filtroAmbiente").value;
        const url = filtro ? `http://localhost:3000/medidas?ambiente=${filtro}` : "http://localhost:3000/medidas";
        const resposta = await fetch(url);
        const dados = await resposta.json();

        if (!dados || dados.length === 0) {
            document.getElementById("dadosTabela").innerHTML = "<tr><td colspan='6'>Nenhum dado encontrado.</td></tr>";
            document.getElementById("ultimoValor").textContent = "-- dB";
            document.getElementById("ultimoNivel").textContent = "--";
            document.getElementById("ultimoAndar").textContent = "--";
            return;
        }

        const ultima = dados[0];
        document.getElementById("ultimoValor").textContent = `${ultima.nivel_ruido} dB`;
        document.getElementById("ultimoNivel").textContent = ultima.ambiente;
        document.getElementById("ultimoAndar").textContent = ultima.local;

        let tabela = "";
        dados.forEach(item => {
            tabela += `
                <tr>
                    <td>${item.id}</td>
                    <td>${item.local}</td>
                    <td>${item.nivel_ruido} dB</td>
                    <td>${item.ambiente}</td>
                    <td>${new Date(item.criado_em).toLocaleString()}</td>
                    <td><button onclick="deletarRegistro(${item.id})">Excluir</button></td>
                </tr>
            `;
        });

        document.getElementById("dadosTabela").innerHTML = tabela;
    } catch (erro) {
        console.error("Erro ao carregar dashboard:", erro);
    }
}

async function deletarRegistro(id) {
    if (!confirm("Deseja realmente deletar este registro?")) return;
    try {
        await fetch(`http://localhost:3000/medidas/${id}`, { method: "DELETE" });
        carregarDados();
    } catch (erro) {
        console.error("Erro ao deletar registro:", erro);
    }
}

document.getElementById("filtroAmbiente").addEventListener("change", carregarDados);

carregarAmbientes().then(() => carregarDados());
setInterval(carregarDados, 2000);
