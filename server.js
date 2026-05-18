const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const app = express();
const PORT = process.env.PORT || 3001;
app.use(cors());
app.use(express.json());
const DATA_DIR = path.join(__dirname, '..', 'data');
if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
}
const getProducts = () => {
    const file = path.join(DATA_DIR, 'productos.json');
    if (fs.existsSync(file)) {
        return JSON.parse(fs.readFileSync(file, 'utf-8'));
    }
    return [];
};
const getOrders = () => {
    const file = path.join(DATA_DIR, 'pedidos.json');
    if (fs.existsSync(file)) {
        return JSON.parse(fs.readFileSync(file, 'utf-8'));
    }
    return [];
};
const saveOrders = (orders) => {
    fs.writeFileSync(path.join(DATA_DIR, 'pedidos.json'), JSON.stringify(orders, null, 2));
};
app.get('/api/productos', (req, res) => {
    res.json([{ id: '1', nombre: 'Auriculares', precioVenta: 29.99, precioProveedor: 8.5, imagen: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400', categoria: 'Electronica', ventas: 100 }]);
});
app.get('/api/test', (req, res) => {
    const mensaje = 'NUEVO PEDIDO - Producto: Auriculares - Precio: 29.99';
    
    fetch('https://api.telegram.org/bot8791673183:AAE30XKSjFdLZ5c-lwwqa2tcK_0dGYaSFLo/sendMessage?chat_id=-5299638230&text=' + encodeURIComponent(mensaje))
        .then(() => console.log('Telegram OK'))
        .catch(e => console.log('Error:', e.message));
    
    res.json({ success: true });
});
app.get('/api/stats', (req, res) => {
    res.json({ totalProductos: 1, pedidosTotales: 0 });
});
app.listen(PORT, () => {
    console.log('Server running on port', PORT);
});
