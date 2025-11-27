const API_URL = "http://localhost:3000/medidas";

function alerta(msg) {
    const box = document.getElementById("alerta");
    box.innerText = msg;
    box.style.display = "block";

    setTimeout(() => {
        box.style.display = "none";
    }, 2500);
}

async function carregarDados() {
    try {
        const res = await fetch(API_URL);
        const dados = await res.json();

        alerta("Conectado");

        atualizarMetricas(dados);
        atualizarRegistros(dados);

    } catch (error) {
        console.log(error);
        alerta("Falha na conexão");
    }
}

function atualizarMetricas(dados) {

    const total = dados.length;
    document.getElementById("total-registros").innerText = total;

    if (total > 0) {
        const valores = dados.map(d => Number(d.valor_db));

        const maior = Math.max(...valores);
        const media = (valores.reduce((a, b) => a + b, 0) / valores.length).toFixed(2);

        document.getElementById("maior-ruido").innerText = maior + " dB";
        document.getElementById("media-ruido").innerText = media + " dB";
    }
}

function atualizarRegistros(dados) {
    const lista = document.getElementById("lista-registros");
    lista.innerHTML = "";

    dados.forEach(item => {
        let classe = "baixo";
        if (item.valor_db >= 70) classe = "alto";
        else if (item.valor_db >= 50) classe = "moderado";

        const bloco = `
            <div class="registro">
                <p><strong>Andar:</strong> ${item.andar}</p>
                <p><strong>Ruído:</strong> <span class="${classe}">${item.valor_db} dB</span></p>
                <p><strong>Nível:</strong> ${item.nivel}</p>
                <p><small>${new Date(item.criado_em).toLocaleString()}</small></p>
            </div>
        `;

        lista.innerHTML += bloco;
    });
}

setInterval(carregarDados, 5000);
carregarDados();
