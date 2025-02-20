const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

const getAzureToken = async () => {
    try {
        const response = await axios.post(
            'https://login.microsoftonline.com/c4047ea2-d3da-44e9-9938-a732a6f96b47/oauth2/v2.0/token',
            new URLSearchParams({
                scope: 'https://api.businesscentral.dynamics.com/.default',
                client_id: 'd5131a6c-2017-4190-ba08-e7d3027c0e2f',
                client_secret: '1QT8Q~fh6YOodrWpMEtiJP8JuG1YcDuWP8vz8b~T',
                grant_type: 'client_credentials'
            }),
            {
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            }
        );

        console.log('Token obtenido:', response.data.access_token);
        return response.data.access_token;
    } catch (error) {
        console.error('Error obteniendo el token:', error.response ? error.response.data : error.message);
    }
};

app.post('/getAzureToken', async (req, res) => {
    try {
        const token = await getAzureToken();
        res.json({ token });
    } catch (error) {
        res.status(500).json({ error: 'Error obteniendo el token' });
    }
});

app.listen(port, () => {
    console.log(`Servidor escuchando en http://localhost:${port}`);
});
