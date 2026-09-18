import { sequelize } from "../config/banco.js";
import { Turma } from "../models/index.js"; // Ajuste o caminho do modelo aqui

const dadosTurmas = [
  // Ensino Fundamental
  {
    id: "6EF-A",
    nome: "6º Ano A - Ensino Fundamental",
    serie: "6º Ano",
    letra: "A",
    categoria: "Fundamental",
    paisKey: "br"
  },
  {
    id: "6EF-B",
    nome: "6º Ano B - Ensino Fundamental",
    serie: "6º Ano",
    letra: "B",
    categoria: "Fundamental",
    paisKey: "ar"
  },
  {
    id: "7EF-A",
    nome: "7º Ano A - Ensino Fundamental",
    serie: "7º Ano",
    letra: "A",
    categoria: "Fundamental",
    paisKey: "us"
  },
  // Exemplo de turmas com junção (conforme sua regra de negócio)
  {
    id: "9EF-A",
    nome: "9º Ano A - Ensino Fundamental",
    serie: "9º Ano",
    letra: "A",
    categoria: "Fundamental",
    paisKey: "fr",
    juncaoCom: "9EF-B",
    juncaoMotivo: "Junção para o projeto de Feira de Ciências"
  },
  {
    id: "9EF-B",
    nome: "9º Ano B - Ensino Fundamental",
    serie: "9º Ano",
    letra: "B",
    categoria: "Fundamental",
    paisKey: "fr",
    juncaoCom: "9EF-A",
    juncaoMotivo: "Junção para o projeto de Feira de Ciências"
  },
  // Ensino Médio
  {
    id: "1EM-A",
    nome: "1º Ano A - Ensino Médio",
    serie: "1º Ano",
    letra: "A",
    categoria: "Medio",
    paisKey: "jp"
  },
  {
    id: "2EM-A",
    nome: "2º Ano A - Ensino Médio",
    serie: "2º Ano",
    letra: "A",
    categoria: "Medio",
    paisKey: "de"
  },
  {
    id: "3EM-A",
    nome: "3º Ano A - Ensino Médio",
    serie: "3º Ano",
    letra: "A",
    categoria: "Medio",
    paisKey: "br"
  }
];

async function popularTabela() {
  try {
    // Certifica-se de que a conexão está ativa e os modelos sincronizados
    await sequelize.authenticate();
    console.log("Conexão com o banco de dados estabelecida com sucesso.");

    // Opcional: Garante que a tabela existe antes de inserir
    await Turma.sync();

    // Insere os dados ignorando duplicados na chave primária (id)
    await Turma.bulkCreate(dadosTurmas, {
      ignoreDuplicates: true 
    });

    console.log("Tabela de Turmas populada com sucesso!");
  } catch (error) {
    console.error("Erro ao popular a tabela de Turmas:", error);
  } 
  // finally {
  //   // Fecha a conexão com o banco de dados
  //   await sequelize.close();
  //   console.log("Conexão com o banco de dados fechada.");
  // }
}

// Executa a função
export { popularTabela }
