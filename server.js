const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json()); // Necesario para parsear el body en POST

// --- 1. BASE DE DATOS DE JUGADORAS (Con OVR Estático) ---
const rawPlayers = [
 ["Ava Koxxx", 191, "Reino Unido", 75, "POR"],
 ["Rocky Emerson", 190, "EE.UU.", 76, "POR"],
 ["Elena Koshka", 183, "Rusia / EE.UU.", 78, "POR"],
 ["Alison Tyler", 183, "EE.UU.", 79, "POR"],
 ["Nicolette Shea", 180, "EE.UU.", 80, "POR"],
 ["Paige Turnah", 180, "Reino Unido", 76, "POR"],
 ["Skylar Vox", 178, "EE.UU.", 84, "POR"],
 ["Elly Clutch", 178, "EE.UU.", 88, "POR"],
 ["Chloe Foxxe", 178, "EE.UU.", 74, "POR"],
 ["Alura Jenson", 175, "EE.UU.", 64, "POR"],
 ["Julia Ann", 175, "EE.UU.", 84, "POR"],
 ["Tera Patrick", 175, "EE.UU.", 83, "POR"],
 ["Briana Banks", 175, "EE.UU.", 80, "POR"],
 ["Tori Black", 175, "EE.UU.", 86, "POR"],
 ["Eliza Ibarra", 175, "EE.UU.", 80, "POR"],
 ["Alexis Texas", 173, "EE.UU.", 87, "POR"],
 ["Bridgette B", 173, "España", 82, "POR"],
 ["Brandi Love", 170, "EE.UU.", 87, "POR"],
 ["Savannah Bond", 170, "Australia", 83, "POR"],
 ["Vero Buffone", 170, "Argentina", 74, "POR"],
 ["Siri", 175, "EE.UU.", 63, "POR"],
 ["Angela White", 160, "Australia", 97, "DEF"],
 ["Sofia Rose", 170, "EE.UU.", 62, "DEF"],
 ["Sara Jay", 160, "EE.UU.", 65, "DEF"],
 ["Lena Paul", 163, "EE.UU.", 86, "DEF"],
 ["Kendra Lust", 163, "EE.UU.", 86, "DEF"],
 ["Cherie DeVille", 163, "EE.UU.", 88, "DEF"],
 ["Ryan Conner", 163, "EE.UU.", 58, "DEF"],
 ["Dee Williams", 163, "EE.UU.", 59, "DEF"],
 ["Gabbie Carter", 165, "EE.UU.", 82, "DEF"],
 ["Lexi Luna", 165, "EE.UU.", 85, "DEF"],
 ["Alexis Fawx", 165, "EE.UU.", 82, "DEF"],
 ["Cory Chase", 163, "EE.UU.", 87, "DEF"],
 ["Natasha Nice", 163, "Francia / EE.UU.", 84, "DEF"],
 ["Valentina Nappi", 165, "Italia", 85, "DEF"],
 ["Jessa Rhodes", 165, "EE.UU.", 80, "DEF"],
 ["Blake Blossom", 163, "EE.UU.", 84, "DEF"],
 ["Gianna Dior", 163, "EE.UU.", 82, "DEF"],
 ["Violet Myers", 160, "EE.UU.", 93, "DEF"],
 ["Emily Willis", 165, "Argentina / EE.UU.", 86, "DEF"],
 ["Eva Elfie", 163, "Rusia", 91, "DEF"],
 ["Mia Malkova", 170, "EE.UU.", 90, "DEF"],
 ["Abella Danger", 163, "EE.UU.", 92, "DEF"],
 ["Nicole Aniston", 165, "EE.UU.", 84, "DEF"],
 ["Dani Daniels", 170, "EE.UU.", 85, "DEF"],
 ["Ariella Ferrera", 165, "Colombia", 81, "DEF"],
 ["Luna Star", 163, "Cuba / EE.UU.", 83, "DEF"],
 ["Esperanza Gómez", 170, "Colombia", 80, "DEF"],
 ["Franceska Jaimes", 170, "Colombia", 79, "DEF"],
 ["Susy Gala", 163, "España", 76, "DEF"],
 ["Erica Fontes", 165, "Portugal", 75, "DEF"],
 ["Tiffany Tatum", 163, "Hungría", 77, "DEF"],
 ["Amirah Adara", 163, "Hungría", 76, "DEF"],
 ["Anna de Ville", 165, "Hungría", 78, "DEF"],
 ["Agatha Vega", 165, "Venezuela", 74, "DEF"],
 ["Eve Sweet", 163, "Europa", 82, "DEF"],
 ["Sara Diamante", 165, "Italia", 82, "DEF"],
 ["Catherine Knight", 163, "Chile", 71, "DEF"],
 ["Syren De Mer", 163, "EE.UU.", 60, "DEF"],
 ["Andi James", 165, "EE.UU.", 53, "DEF"],
 ["Vicky Vette", 168, "Noruega / EE.UU.", 61, "DEF"],
 ["Darla Crane", 165, "EE.UU.", 58, "DEF"],
 ["Deauxma", 165, "EE.UU.", 54, "DEF"],
 ["Persia Monir", 165, "EE.UU.", 53, "DEF"],
 ["Nina Hartley", 163, "EE.UU.", 85, "DEF"],
 ["Alina Lopez", 168, "EE.UU.", 80, "DEF"],
 ["Victoria June", 163, "EE.UU.", 76, "DEF"],
 ["Ella Knox", 165, "EE.UU.", 76, "DEF"],
 ["Mariana Martix", 165, "Colombia", 83, "DEF"],
 ["Leah Gotti", 163, "EE.UU.", 77, "DEF"],
 ["Riley Reid", 163, "EE.UU.", 95, "MC"],
 ["Lana Rhoades", 160, "EE.UU.", 94, "MC"],
 ["Sasha Grey", 168, "EE.UU.", 94, "MC"],
 ["Jenna Jameson", 170, "EE.UU.", 96, "MC"],
 ["Asa Akira", 157, "EE.UU.", 84, "MC"],
 ["Stoya", 168, "EE.UU.", 80, "MC"],
 ["Belladonna", 163, "EE.UU.", 82, "MC"],
 ["Katsuni", 163, "Francia", 78, "MC"],
 ["Silvia Saint", 165, "Rep. Checa", 76, "MC"],
 ["Jesse Jane", 160, "EE.UU.", 81, "MC"],
 ["Janine Lindemulder", 170, "EE.UU.", 81, "MC"],
 ["Stormy Daniels", 163, "EE.UU.", 85, "MC"],
 ["Bree Olson", 163, "EE.UU.", 78, "MC"],
 ["Teagan Presley", 157, "EE.UU.", 77, "MC"],
 ["Savanna Samson", 165, "EE.UU.", 75, "MC"],
 ["Kylie Ireland", 163, "EE.UU.", 76, "MC"],
 ["Jewel De'Nyle", 165, "EE.UU.", 77, "MC"],
 ["Asia Carrera", 163, "EE.UU.", 78, "MC"],
 ["Devon", 170, "EE.UU.", 79, "MC"],
 ["Nikki Benz", 163, "Canadá / EE.UU.", 81, "MC"],
 ["Gal Ritchie", 165, "Reino Unido", 78, "MC"],
 ["Chanel Camryn", 160, "EE.UU.", 76, "MC"],
 ["Cheerleader Kait", 165, "EE.UU.", 82, "MC"],
 ["Aubree Valentine", 163, "EE.UU.", 73, "MC"],
 ["Amber Moore", 160, "EE.UU.", 76, "MC"],
 ["Madison Wilde", 163, "EE.UU.", 73, "MC"],
 ["Brianna Arson", 165, "EE.UU.", 72, "MC"],
 ["Kelsey Kane", 163, "EE.UU.", 71, "MC"],
 ["Hayley Davies", 165, "Australia", 75, "MC"],
 ["Jasmine Sherni", 163, "EE.UU.", 74, "MC"],
 ["Violet Voss", 160, "EE.UU.", 72, "MC"],
 ["Sky Wonderland", 163, "EE.UU.", 71, "MC"],
 ["Ashby Winter", 165, "Rusia", 82, "MC"],
 ["Beca Barbie", 165, "EE.UU.", 70, "MC"],
 ["Alexa Chains", 163, "EE.UU.", 71, "MC"],
 ["Rissa May", 160, "EE.UU.", 72, "MC"],
 ["Willow Ryder", 163, "EE.UU.", 82, "MC"],
 ["Leilani Li", 160, "EE.UU.", 72, "MC"],
 ["Lily Starfire", 160, "EE.UU.", 71, "MC"],
 ["Eva Generosi", 165, "Italia", 74, "MC"],
 ["Comatozze", 162, "Rusia", 84, "MC"],
 ["Sweetie Fox", 165, "Rusia", 86, "MC"],
 ["Veronica Leal", 162, "Colombia", 78, "MC"],
 ["Canela Skin", 160, "Colombia", 75, "MC"],
 ["Giselle Montes", 160, "México", 73, "MC"],
 ["Little Caprice", 160, "Rep. Checa", 80, "MC"],
 ["Hitomi Tanaka", 155, "Japón", 84, "MC"],
 ["Piper Perri", 150, "EE.UU.", 79, "EXT"],
 ["Elsa Jean", 152, "EE.UU.", 82, "EXT"],
 ["Kimmy Granger", 157, "EE.UU.", 80, "EXT"],
 ["Eva Lovia", 157, "EE.UU.", 81, "EXT"],
 ["Adriana Chechik", 157, "EE.UU.", 88, "EXT"],
 ["Jynx Maze", 155, "EE.UU.", 78, "EXT"],
 ["LaSirena69", 152, "Venezuela", 81, "EXT"],
 ["Cubbi Thompson", 150, "EE.UU.", 77, "EXT"],
 ["Sheridan Love", 150, "EE.UU.", 50, "EXT"],
 ["April Flores", 157, "EE.UU.", 49, "EXT"],
 ["Bunny De La Cruz", 157, "EE.UU.", 50, "EXT"],
 ["Karla Lane", 157, "EE.UU.", 51, "EXT"],
 ["Lulu Chu", 150, "EE.UU.", 81, "EXT"],
 ["Kenzie Reeves", 152, "EE.UU.", 83, "EXT"],
 ["Rae Lil Black", 157, "EE.UU.", 85, "EXT"],
 ["Autumn Falls", 157, "EE.UU.", 81, "EXT"],
 ["Melody Marks", 157, "EE.UU.", 79, "EXT"],
 ["Gina Valentina", 155, "Brasil", 78, "EXT"],
 ["Chloe Cherry", 160, "EE.UU.", 79, "EXT"],
 ["Emma Fiore", 157, "Argentina", 70, "EXT"],
 ["Marina Gold", 157, "Perú", 75, "EXT"],
 ["Xxlayna Marie", 152, "EE.UU.", 73, "EXT"],
 ["Sophia Leone", 157, "EE.UU.", 75, "EXT"],
 ["Mia Khalifa", 157, "Líbano / EE.UU.", 93, "DC"],
 ["Lisa Ann", 157, "EE.UU.", 88, "DC"],
 ["Jenna Haze", 157, "EE.UU.", 83, "DC"],
 ["Ginger Lynn", 157, "EE.UU.", 80, "DC"],
 ["Christy Canyon", 163, "EE.UU.", 79, "DC"],
 ["Ava Addams", 160, "EE.UU.", 82, "DC"],
 ["Julie Cash", 168, "EE.UU.", 55, "DC"],
 ["Lila Lovely", 170, "EE.UU.", 54, "DC"],
 ["Mazzaratie Monica", 165, "EE.UU.", 49, "DC"],
 ["Lexxxi Luxe", 168, "EE.UU.", 57, "DC"],
 ["Samantha 38G", 163, "EE.UU.", 51, "DC"],
 ["Kimmie Kaboom", 165, "EE.UU.", 55, "DC"],
 ["Eliza Allure", 165, "EE.UU.", 56, "DC"],
 ["Victoria Cakes", 170, "EE.UU.", 60, "DC"],
 ["Marilyn Mayson", 165, "EE.UU.", 56, "DC"],
 ["Angelina Castro", 168, "Cuba / EE.UU.", 62, "DC"],
 ["Rita Daniels", 165, "EE.UU.", 52, "DC"],
 ["Sally D'Angelo", 155, "EE.UU.", 48, "DC"],
 ["Bea Cummins", 160, "EE.UU.", 47, "DC"],
 ["Candy Samples", 163, "EE.UU.", 46, "DC"],
 ["Erica Lauren", 165, "EE.UU.", 52, "DC"],
 ["Klaudia Kelly", 163, "EE.UU.", 48, "DC"],
 ["Alexxxis Allure", 161, "EE.UU.", 47, "DC"],
 ["Lela Star", 157, "EE.UU.", 80, "DC"]
];

// Transformar rawPlayers a objetos (con OVR estático)
const playersDB = rawPlayers.map((p, index) => {
    return {
        id: index + 1,
        name: p[0],
        height: p[1],
        nation: p[2],
        ovr: p[3], // TOMA EL NÚMERO OVR DIRECTAMENTE DEL ARRAY
        pos: p[4]
    };
});

// --- 2. ESTADO DEL JUEGO (Simulación de base de datos) ---
let userCoins = 50000;
let userTeam = []; // Cartas en mi club
let marketCards = []; // Cartas a la venta
let myLineup = []; // Plantilla activa (max 11)

// --- 3. RUTAS DEL SERVIDOR ---

// Obtener todas las jugadoras disponibles en el juego
app.get('/api/players', (req, res) => {
    res.json(playersDB);
});

// Obtener estado del usuario (Monedas y Equipo)
app.get('/api/user', (req, res) => {
    res.json({ coins: userCoins, team: userTeam });
});

// Obtener alineación
app.get('/api/lineup', (req, res) => {
    res.json(myLineup);
});

// Guardar alineación
app.post('/api/lineup', (req, res) => {
    const { lineup } = req.body;
    if (!Array.isArray(lineup)) return res.status(400).json({ error: "Formato inválido" });
    myLineup = lineup;
    res.json({ message: "Alineación guardada", lineup: myLineup });
});

// --- SISTEMA DE SOBRES ---
function openPack(cost, numPlayers) {
    if (userCoins < cost) return { error: "No tienes suficientes monedas" };

    userCoins -= cost;
    let newCards = [];

    // Lógica simple: Escoger jugadoras al azar de la DB
    for (let i = 0; i < numPlayers; i++) {
        let randomIndex = Math.floor(Math.random() * playersDB.length);
        let playerTemplate = playersDB[randomIndex];

        // Crear una instancia única de la carta para el usuario
        let card = {
            instanceId: Date.now() + Math.random().toString(36).substr(2, 9), // ID único
            ...playerTemplate
        };
        
        newCards.push(card);
        userTeam.push(card);
    }

    return { coins: userCoins, cards: newCards };
}

app.post('/api/pack/bronce', (req, res) => {
    let result = openPack(500, 3);
    if (result.error) return res.status(400).json(result);
    res.json(result);
});

app.post('/api/pack/plata', (req, res) => {
    let result = openPack(2500, 3);
    if (result.error) return res.status(400).json(result);
    res.json(result);
});

app.post('/api/pack/oro', (req, res) => {
    let result = openPack(7500, 3);
    if (result.error) return res.status(400).json(result);
    res.json(result);
});

// --- MERCADO DE FICHAJES ---

// Ver mercado
app.get('/api/market', (req, res) => {
    res.json(marketCards);
});

// Vender carta
app.post('/api/market/sell', (req, res) => {
    const { instanceId, price } = req.body;
    
    // Buscar si el usuario tiene esa carta
    const cardIndex = userTeam.findIndex(c => c.instanceId === instanceId);
    if (cardIndex === -1) return res.status(404).json({ error: "Carta no encontrada en tu equipo" });
    if (price <= 0) return res.status(400).json({ error: "Precio inválido" });

    // Quitar del equipo y poner en el mercado
    const card = userTeam.splice(cardIndex, 1)[0];
    const marketItem = {
        ...card,
        price: parseInt(price),
        sellerId: 'me'
    };
    
    marketCards.push(marketItem);
    
    // Si la carta estaba en la alineación, quitarla
    myLineup = myLineup.filter(c => c.instanceId !== instanceId);

    res.json({ message: "Carta puesta a la venta", market: marketCards });
});

// Comprar carta
app.post('/api/market/buy', (req, res) => {
    const { instanceId } = req.body;

    const marketIndex = marketCards.findIndex(c => c.instanceId === instanceId);
    if (marketIndex === -1) return res.status(404).json({ error: "La carta ya no está en el mercado" });

    const cardToBuy = marketCards[marketIndex];

    if (userCoins < cardToBuy.price) return res.status(400).json({ error: "No tienes suficientes monedas" });

    // Restar monedas
    userCoins -= cardToBuy.price;
    
    // Quitar del mercado y añadir al equipo
    marketCards.splice(marketIndex, 1);
    
    // Limpiar campos del mercado antes de guardar
    delete cardToBuy.price;
    delete cardToBuy.sellerId;
    
    userTeam.push(cardToBuy);

    res.json({ message: "Carta comprada", coins: userCoins, card: cardToBuy });
});

// Ruta principal para comprobar que el servidor está vivo
app.get('/', (req, res) => {
    res.send('¡El servidor de Creadores FC está funcionando correctamente! ⚽');
});

// --- INICIAR SERVIDOR ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor de Creadores FC corriendo en el puerto ${PORT}`);
    console.log(`Total jugadoras cargadas en BD: ${playersDB.length}`);
});
