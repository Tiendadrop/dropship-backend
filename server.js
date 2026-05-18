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
    return getDefaultProducts();
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
const saveProducts = (products) => {
    fs.writeFileSync(path.join(DATA_DIR, 'productos.json'), JSON.stringify(products, null, 2));
};
function getDefaultProducts() {
    return [
        { id: uuidv4(), nombre: "Auriculares Bluetooth Pro", descripcion: "Auriculares wireless con cancelación de ruido, batería de 30h", precioProveedor: 8.5, precioVenta: 29.99, imagen: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400", categoria: "Electrónica", proveedor: "AliExpress", proveedorId: "1001", stock: 999, ventas: 156, activo: true },
        { id: uuidv4(), nombre: "Lámpara LED Regulable", descripcion: "Lámpara de escritorio LED con touch control, carga USB", precioProveedor: 12, precioVenta: 39.99, imagen: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=400", categoria: "Hogar", proveedor: "AliExpress", proveedorId: "1002", stock: 999, ventas: 89, activo: true },
        { id: uuidv4(), nombre: "Cargador Solar Portátil", descripcion: "Panel solar 20W impermeable para cargar dispositivos outdoor", precioProveedor: 15, precioVenta: 49.99, imagen: "https://images.unsplash.com/photo-1509391366360-2e959784a276?w=400", categoria: "Electrónica", proveedor: "AliExpress", proveedorId: "1003", stock: 999, ventas: 67, activo: true },
        { id: uuidv4(), nombre: "Kit de Maquillaje Profesional", descripcion: "180 colores palette de sombras profesional + pinceles", precioProveedor: 9, precioVenta: 34.99, imagen: "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=400", categoria: "Belleza", proveedor: "AliExpress", proveedorId: "1004", stock: 999, ventas: 203, activo: true },
        { id: uuidv4(), nombre: "Drone Mini Cámara 4K", descripcion: "Drone plegable con cámara 4K, gps, 30min autonomía", precioProveedor: 45, precioVenta: 129.99, imagen: "https://images.unsplash.com/photo-1473968512647-3e447244af8f?w=400", categoria: "Electrónica", proveedor: "AliExpress", proveedorId: "1005", stock: 999, ventas: 45, activo: true },
        { id: uuidv4(), nombre: "Mochila Impermeable USB", descripcion: "Mochila anti-robo con puerto USB integrado, resistente al agua", precioProveedor: 11, precioVenta: 34.99, imagen: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400", categoria: "Moda", proveedor: "AliExpress", proveedorId: "1006", stock: 999, ventas: 112, activo: true },
        { id: uuidv4(), nombre: "Alfombrilla Yoga Premium", descripcion: "Mat de yoga spandex, antideslizante, ejercicio pilates", precioProveedor: 7, precioVenta: 24.99, imagen: "https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=400", categoria: "Deportes", proveedor: "AliExpress", proveedorId: "1007", stock: 999, ventas: 178, activo: true },
        { id: uuidv4(), nombre: "Organizador Inteligente", descripcion: "Caja organizadora modular con carga wireless", precioProveedor: 6, precioVenta: 22.99, imagen: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400", categoria: "Hogar", proveedor: "AliExpress", proveedorId: "1008", stock: 999, ventas: 234, activo: true }
    ];
}
app.get('/api/productos', (req, res) => {
    const productos = getProducts().filter(p => p.activo);
    res.json(productos);
});
app.get('/api/test', (req, res) => {
    const productos = getProducts();
    const producto = productos[0];
    
    const mensaje = `NUEVO PEDIDO - ${producto.nombre} - ${producto.precioVenta}`;
    
    fetch('https://api.telegram.org/bot8791673183:AAE30XKSjFdLZ5c-lwwqa2tcK_0dGYaSFLo/sendMessage?chat_id=-5299638230&text=' + encodeURIComponent(mensaje))
        .then(() => console.log('Telegram OK'))
        .catch(e => console.log('Error:', e.message));
    
    res.json({ success: true, productos: productos.length });
});
app.get('/api/stats', (req, res) => {
    const productos = getProducts();
    res.json({ totalProductos: productos.length, pedidosTotales: 0 });
});
app.listen(PORT, () => {
    console.log('Server running on port', PORT);
});
