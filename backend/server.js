const express = require('express');  // Importando o express
const cors = require('cors');  // Para liberar acesso externo ao servidor
const bodyParser = require('body-parser');
const fetch = require('node-fetch');  // Importando o fetch para Node.js (ou use axios)

const app = express();  // Instância do express

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json('application/json'));

const API_KEY = "264bb09ec4d858065cfb8860838a32ff";
const DNS = "https://api.themoviedb.org/3";

const USERS = [
    { email: 'mario.silva@gmail.com', password: 'senhaSegura2024', age: 35 },
    { email: 'lucas.souza@yahoo.com', password: 'Meusuper123!', age: 28 },
    { email: 'ana.pereira@hotmail.com', password: 'SenhaAna456@', age: 33 },
    { email: 'rafaela.martins@outlook.com', password: 'Rafaela789$', age: 21 },
    { email: 'joao.oliveira@live.com', password: 'JoaoOliveira1!', age: 19 },
    { email: 'carla.santos@aol.com', password: 'Carla1234!', age: 30 },
    { email: 'ju@gmail.com', password: '123', age: 10 },
    { email: 'pedro.almeida@icloud.com', password: 'Pedro2024@!', age: 18 }
];

const categories = [
    {
        name: "trending",
        title: "Em Alta",
        path: "/trending/all/week?api_key="+API_KEY+"&language=pt-BR",
        isLarge: true,
    },
    {
        name: "netflixOriginals",
        title: "Originais Netflix",
        path: "/discover/tv?api_key="+API_KEY+"&with_networks=213",
        isLarge: false,
    },
    {
        name: "topRated",
        title: "Populares",
        path: "/movie/top_rated?api_key="+API_KEY+"&language=pt-BR",
        isLarge: false,
    },
    {
        name: "comedy",
        title: "Comédias",
        path: "/discover/tv?api_key="+API_KEY+"&with_genres=35",
        isLarge: false,
    },  
    {
        name: "romances",
        title: "Romances",
        path: "/discover/tv?api_key="+API_KEY+"&with_genres=10749",
        isLarge: false,
    },                
    {
        name: "documentaries",
        title: "Documentários",
        path: "/discover/tv?api_key="+API_KEY+"&with_genres=99",
        isLarge: false,
    }
];

const getData = async (path) => {
    try {
        let URI = DNS + path;
        let result = await fetch(URI);
        let data = await result.json();
        return data;   
    } catch (error) {
        console.log(error);
        return null;
    }
};

const filterMoviesByAge = (movies, age) => {
    return movies.filter(movie => {
        const certification = movie.certification || 'L'; // Se não houver classificação, assume 'L'

        if (age === 10) {
            // Exibir apenas filmes infantis para usuários de 10 anos
            return certification === 'L' || certification === '10' || certification === 'INF';
        }

        if (age >= 18) return true;
        if (age >= 16 && certification !== '18') return true;
        if (age >= 14 && certification !== '18' && certification !== '16') return true;
        if (age >= 12 && certification !== '18' && certification !== '16' && certification !== '14') return true;
        if (age >= 10 && certification !== '18' && certification !== '16' && certification !== '14' && certification !== '12') return true;
        if (certification === 'L') return true;
        return false;
    });
};

// Endpoint para autenticação de login
app.post('/login', (req, res) => {
    const { email, password } = req.body;
    const user = USERS.find(user => user.email === email && user.password === password);

    if (user) {
        res.status(200).json({ message: 'Login bem-sucedido!' });
    } else {
        res.status(401).json({ message: 'Credenciais inválidas.' });
    }
});

// Endpoint para recuperar dados de filmes filtrados por idade
app.get('/filmes', async (req, res) => {
    const { email } = req.query; // Obtenha o email dos parâmetros de consulta da URL
    console.log("Email recebido:", email); // Adiciona log para verificar o email recebido

    const user = USERS.find(user => user.email === email);

    if (!user) {
        console.log("Usuário não encontrado para o email:", email); // Log se o usuário não for encontrado
        return res.status(401).json({ message: 'Usuário não encontrado.' });
    }

    const data = await getData("/trending/all/week?api_key=" + API_KEY + "&language=pt-BR");
    
    if (data && data.results) {
        const filteredMovies = filterMoviesByAge(data.results, user.age);
        res.send(filteredMovies);
    } else {
        res.status(500).json({ message: 'Erro ao buscar filmes.' });
    }
});

app.listen(8081, () => {
    console.log("Servidor rodando na porta 8081");
});
